import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"

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
});

export {registerUser}