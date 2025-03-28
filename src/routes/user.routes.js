import { Router } from "express";
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, coverImageUpdate, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails) // patch will be used when we don't update the complete data just update few fiels

// handled the file 
router.route("/change-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/change-coverImage").patch(verifyJWT, upload.single("coverImage"), coverImageUpdate)
router.route("/history").get(verifyJWT, getWatchHistory)

// here we will get the data from the pramps "url"
router.route("/channel/:userName").get(verifyJWT,getUserChannelProfile)

export default router;