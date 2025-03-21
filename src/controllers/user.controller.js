import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req, res) =>{
    // res.status(200).json({
    //     message: "ok"
    // });

    const {fullName, email, userName, password} = req.body;
    console.log("email :", email);
    // here we will check that all fields have data they not empty
    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) { 
        throw new ApiError(400, "All fileds are required")
    }

    // here we check the user will not exist first time 
    const existedUser = User.findOne({
        $or: [{userName},{email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email and userName all ready exist!")
    }

    // here we handled the Avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!")
    }

    // now file will be upload on the cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if (!avatar) {
        throw new ApiError(400,"Avatar is required!");
    }
});

export {registerUser}