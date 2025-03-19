const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch( (error) => next(error))
}
}
export default asyncHandler;


// creating a warper function that can be used further




// approach 2 

// creating a middleware function which will take a function as an argument and return a function

// const asyncHandler = ( fn ) => async( req,res,next) => {
//   try{
//     await fn(req,res,next)
//   } catch (error) {
//     res.status( error.code || 500).json({
//         sucess: false,
//         message: error.message || "Internal Server Error"
//   })
// }
// }