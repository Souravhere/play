import { Router } from "express";
import { registerUser, logoutUser, loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import  {verifyJWT}  from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(
    //here is the multer middleware to handled the files 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser)

// protected routes
router.route("/logout").post(verifyJWT, logoutUser)

export default router;