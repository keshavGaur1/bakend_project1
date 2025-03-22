//  ye verify krega ki user hai ya ni 

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";

export const verifyJWT = asyncHandler( async ( req , res , next ) => {
    try {
        // req.header phone ke liye
        const token = req.cookies?.accessToken || req.header("Autherization")?.replace("Bearer " , "")
    
        if( !token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        // token checking ( decoding ) ny verify method 
        const decodeToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user =  await User.findById(decodeToken?._id).select("-password -refreshToken")
    
        if( !user ){
            // discuss on frontend 
            throw new ApiError(401, "Invalid access token ")
        }
    
        req.user = user ;
        next()
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token ")
    }
})

