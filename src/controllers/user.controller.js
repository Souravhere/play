import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    // here basic check that email || username is not empty
    if (!email || !userName) {
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

})
export {registerUser}