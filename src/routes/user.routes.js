import { loginUser, logOutUser, registerUser , refreshAccessToken, changeCurrentPassword, getCurrnetUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from '../controllers/user.controller.js';
import { Router } from 'express';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// middleware
router.route("/register").post(
    upload.fields([
        {name : "avatar", maxCount: 1},
        {name : "coverimage", maxCount: 1}
    ]) ,
    registerUser
);


router.route("/login").post(loginUser)

//  secured routes 

//  verifyJWT is a middleware 
router.route("/logout").post(verifyJWT ,   logOutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/currernt-user").get(verifyJWT, getCurrnetUser)

// patch rakhege post nhi 
// post mai sari details update ho jati hai jabki hm kuch hi update karna chahte hai
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar") , updateUserAvatar)

router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage") , updateUserCoverImage)

// new things because i used req.params instead of req.body in getUserChannelProfile method
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)


export default router;