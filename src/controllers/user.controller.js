import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"

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
});

export {registerUser}