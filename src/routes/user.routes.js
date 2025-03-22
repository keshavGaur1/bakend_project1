import { loginUser, logOutUser, registerUser , refreshAccessToken } from '../controllers/user.controller.js';
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


export default router;