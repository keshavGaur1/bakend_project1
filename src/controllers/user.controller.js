import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// method to generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // saving refresh token in DB

    user.refreshToken = refreshToken;
    // setting property in user obj
    await user.save({ validateBeforeSave: false }); // save krne ke liye
    // validateBeforeSave se jo validation lagae h save krne se phele wo nhi chlege

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal server error while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
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
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // console.log("Avatar Path:", avatarLocalPath);
  // const coverimageLocalPath = req.files?.coverimage[0]?.path;   ye error de rha tha cant read property of undefined

  let coverimageLocalPath;
  // now check if coverimage is present or not
  // avatar is required to use dusri tarah se check kra hai
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimageLocalPath = req.files.coverimage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //   upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = await uploadOnCloudinary(coverimageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  //    create user
  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
  });

  // check ki user bna hai ya nhi
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // password and refreshToken ko hide krne k liye

  if (!createdUser) {
    throw new ApiError(500, "User not created");
  }

  // sending response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
  // res.status(201) achi practice hai aur postman bhi yhi prefer krti hai

  // validation - ya to ek ek karke karo
  // if( fullname === ""){
  // throw new ApiError(400, "Fullname is required");
  // }
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  if (!email || !username) {
    throw new ApiError(400, "Email or username are required");
  }

  // ya to email se login kro ya username se
  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // check password
  const isPassValid = await user.isPasswordCorrect(password);

  if (!isPassValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // generating access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // loggedin user
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // sending in cookies

  // mading modifiable from server only
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in sucessfully "
      )
    );
  // api response mai accessToken-refreshToken kyo bhej rhe jabki ise cookie mai bhej chuke hai phele hi ??
  // ans - uss case ke liye jab user khud inn token ko save krna chahta ho ( it is a good practice  )
});

const logOutUser = asyncHandler(async (req, res) => {
  // req.user._id ka access middleware se ayega that we called in router

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },

    // isse nayi value hi milegi ( returned response mai )
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out sucessfully "));
});

// Refresh tokens
const refreshAccessToken = asyncHandler(async (req, res) => {
  // access Refresh token
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request ");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token ");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used ");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token refreshed "
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token ");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // ye confirm password field rakhne ke liye

  // const { oldPassword , newPassword , confirmPassword } = req.body;

  // if( !oldPassword || !newPassword || !confirmPassword ){
  //   throw new ApiError(400 , "All fields are required ")
  // }

  // if( newPassword !== confirmPassword ){
  //   throw new ApiError(400 , "New password and confirm password do not match ")
  // }

  const { oldPassword, newPassword } = req.body;

  // req.user mai user object aya hua hai ( middleware se )
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  // isPasswordCorrect is made inside user model

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newPassword;
  
  await user.save({ validateBeforeSave: false });
  // save is called to save the properties and call the pre save hook

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully "));
});

const getCurrnetUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current user details fetched successfully "
      )
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "Fullname and email are required ");
  }

  const user = User.findByIdAndUpdate(req.user?._id ,
    {
      $set: {
        fullname,
        email,
      },
    }, 
    { new: true }
    // isse updated value milegi
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully "));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  // req.file kyoki single file chiye 
  if( !avatarLocalPath ){
    throw new ApiError(400 , "Avatar is missing ");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  // uploadOnCloudinary ye function hai jo cloudinary mai file upload karega aur url return karega

  if( !avatar.url ){
    throw new ApiError(400 , "Error while uploading on avatar");
  }

  // updating avatar in DB
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : {
        avatar : avatar.url ,
      }
    },
    {new: true}
  )
  .select("-password -refreshToken")

  return res.status(200).json(new ApiResponse(200, {}, "Avatar updated successfully "));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;
  // req.file kyoki single file chiye 
  if( !coverLocalPath ){
    throw new ApiError(400 , "cover Image is missing ");
  }

  const coverimage = await uploadOnCloudinary(coverLocalPath)
  // uploadOnCloudinary ye function hai jo cloudinary mai file upload karega aur url return karega

  if( !coverimage.url ){
    throw new ApiError(400 , "Error while uploading on coverimage");
  }

  // updating avatar in DB
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : {
        coverimage : coverimage.url ,
      }
    },
    {new: true}
  )
  .select("-password -refreshToken")

  return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully "));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrnetUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};
