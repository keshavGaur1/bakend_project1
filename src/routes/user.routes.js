import { registerUser } from '../controllers/user.controller.js';
import { Router } from 'express';
import {upload} from '../middlewares/multer.middleware.js';

const router = Router();

// middleware
router.route("/register").post(
    upload.fields([
        {name : "avatar", maxCount: 1},
        {name : "coverimage", maxCount: 1}
    ]) ,
    registerUser
);

export default router;