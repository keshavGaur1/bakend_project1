// require("dotenv").config({path: './env'});

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// approach 1 to connect to db
import app from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

// async code hmesh promise return krta hai
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo DB connection failed !! ", error);
    process.exit(1);
  });

// approach 1 to connect to db
// import express from "express";
// const app=express()

// // if-is
// ;( async ()=> {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error) =>{
//             console.log("Error aagyi : ",error);
//             throw error
//         })

//         app.listen(process.env.PORT , ()=>{
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })

//     } catch (error) {
//         console.error("ERROR",error);
//         throw error;
//     }
// } ) ()
