// require("dotenv").config({path: './env'});

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

connectDB();






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
