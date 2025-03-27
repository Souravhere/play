import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// here a function to handled the referesh and access tokens
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        // these functions are called from the user model
        const accessToken = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()
        // save the referesh token in the db
        user.refereshToken = refereshToken
        await user.save({validateBeforeSave: false})
        //export the tokens for the cookies 
        return {accessToken, refereshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong to Generate Access and Referesh token!")
    }
}

const registerUser = asyncHandler( async (req, res) =>{
    // res.status(200).json({
    //     message: "ok"
    // });

    const {fullName, email, userName, password} = req.body;
    // here we will check that all fields have data they not empty
    // if (
    //     [fullName, email, userName, password].some((field) => field?.trim() === "")
    // ) { 
    //     throw new ApiError(400, "All fields are required!")
    // }

    // here we check the user will not exist first time 
    const existedUser = await User.findOne({
        $or: [{userName},{email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email and userName all ready exist!")
    }

    // here we handled the Avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // here alternative logic will be added for the cover image
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage > [0]) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!")
    }

    // now file will be upload on the cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if (!avatar) {
        throw new ApiError(400,"Avatar is required!");
    }

    // where we will added the data to the DB
    const user = await User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // here we check the user will be created 
    const createdUser = await User.findById(user._id).select("-password -refreshToken") //with select we will added that we don't want in the response

    // here we check if user not found 
    if (!createdUser) {
        throw new ApiError(500, "Somthing went worng when registering user!")
    }

    // here we return the response from the db
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )
});

// here we will added the login 
const loginUser =  asyncHandler( async(req, res) => {
    // get data from the frontend 
    const {email, userName, password} = req.body;

    // here basic check that email && username is not empty
    if (!email && !userName) {
        throw new ApiError(400,"Email and Username is required!")
    }

    // we will check with both email or userName if we found one we will able to login
    const user = await User.findOne({
        $or: [{userName},{email}]
    })
    // we check if we not find the user
    if (!user){
        throw new ApiError(404,"User dose not exist!")
    }

    // if we find the user 
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(401,"Invalid user Credentials!")
    }

    // here we will genrate Access and Referesh Tokens 
    const {accessToken, refereshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // here we designe a cookie 

    // helped prevent cookies edit in the frontend 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refereshToken",refereshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser, refereshToken, accessToken
            },
            "User Logged in Successfully"
        )
    )
})

// here user will be logout
const logoutUser = asyncHandler( async(req, res) =>{
    // we will replace the refresh token in the db
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        }
    )
    // helped prevent cookies edit in the frontend 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User Logged Out Successfully"
        )
    )
})

// here we will refresh the token
const refreshAccessToken = asyncHandler( async(req, res) =>{
    // take the token from the frontend 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.referesh

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthroized request!")
    }
    
    try {
        // verify with jwt and decode it
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401,"Invalid refresh token!")
        }
        // verify the token
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token is expired or used!")
        }
        // we added options to secure token
        const options = {
            httpOnly: true,
            secure: true
        }
        // refresh token will be generated 
        const {accessToken, newrefereshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken", newrefereshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refereshToken: newrefereshToken},
                "access token refresh successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token!")
    }
})

// here we add func to change the password
const changeCurrentPassword = asyncHandler( async(req, res) =>{
    // here we get the both pass from the frontend
    const { oldPassword, newPassword} = req.body;
    // here we find the user 
    const user = await User.findById(req.user?._id);
    // compaire the old password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password!")
    }
    // replace the old pass with new 
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {},"Password changed successfully"))
})

// here we get the current user 
const getCurrentUser = asyncHandler( async(req, res) =>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully")
})

// here we added logic to update user info 
const updateAccountDetails = asyncHandler( async(req, res) => {
    const {fullName, email} = req.body;

    if(!fullName || !email){
        throw new ApiError(400, "all field are required!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated sucessfully!"))
})

// here we added the logic to update the user media
const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing!")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error file while Avatar Uploading!")
    }
    // save the new avatar url 
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    )

    // here added the logic to delete the old image

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar will be update"))
})

// here will add the function to update the cover image
const coverImageUpdate = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is missing!")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400,"Error file while CoverImage Uploading!")
    }
    // new we update the url in the db
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    )
    
    // here added the logic to delete the old image

    return res
    .status(200)
    .json(new ApiResponse(200, user,"Cover Image will be update"))
})

// get user channel profile 
const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {userName} = req.params // to get the username form the the url
    if (!userName?.trim()) {
        throw new ApiError(400,"userName is missing!")
    }

    // here we will used the aggregate pipline to merge the modles in the db and get the combined data 
    const channel = await User.aggregate([
        // this pipline is added to count the total subs
        {
            // find the username in the db
            $match:{
                userName: userName.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptios", // it will be changed to Subscription => subscriptions auto by db
                localField: "_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        // this pipline is counts we follows to other channels
        {
            $lookup:{
                from:"subscriptios",
                localField:"_id",
                foreignField:"subscriber",
                as: "subscribedTo"
            }
        },
        // here we created new field to calculate the all subscribers and subscriberedTo and added in new field
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers" // use the as from the lookup
                },
                channelSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                // here we check the user will be subscribed the current channel
                isSubscribed: {
                    $cond:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        // $project is used as passed the flags 1 is true
        {
            $project:{
                fullName:1,
                userName:1,
                avatar:1,
                coverImage:1,
                email:1,
                subscriberCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404,"channel dose not exist!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"user channel fetched successfully!"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    coverImageUpdate,
    getUserChannelProfile
}