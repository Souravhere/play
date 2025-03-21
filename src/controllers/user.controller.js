import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res) =>{
    // res.status(200).json({
    //     message: "ok"
    // });

    const {fullName, email, userName} = req.body;
    console.log("email :", email);
    
});

export {registerUser}