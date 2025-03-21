import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { fullname, email, username, password } = req.body;

  // console.log(req.body);

//   ek bhi empty to return true and error throw
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Fullname is required");
  }

//   check user exist or not
  const existingUser = await User.findOne({
    $or : [{ username }, { email }]
  })

  if(existingUser){
    throw new ApiError(409 , "User with email or username already exists");
  }


  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverimageLocalPath = req.files?.coverimage[0]?.path;   ye error de rha tha cant read property of undefined

  let coverimageLocalPath;
  // now check if coverimage is present or not
  // avatar is required to use dusri tarah se check kra hai 
  if( req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
    coverimageLocalPath = req.files.coverimage[0].path;
  }


  if( ! avatarLocalPath){
    throw new ApiError(400, "Avatar is required");
  }

//   upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverimage = await uploadOnCloudinary(coverimageLocalPath);

    if( ! avatar){
        throw new ApiError(400, "Avatar is required");
      }

    //    create user
    const user = await User.create({   
        fullname,
        email,
        username : username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
    })

    // check ki user bna hai ya nhi
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    // password and refreshToken ko hide krne k liye

    if( ! createdUser){
        throw new ApiError(500, "User not created");
    }

    // sending response 
    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
    // res.status(201) achi practice hai aur postman bhi yhi prefer krti hai






  // validation - ya to ek ek karke karo
  // if( fullname === ""){
  // throw new ApiError(400, "Fullname is required");
  // }
});

export { registerUser };
