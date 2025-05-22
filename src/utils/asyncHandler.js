const asyncHandler=(requestHandler)=>{
    return  (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err)=>{
            next(err);// handle errors in asynchronous operations (like database calls, API requests, or file I/O) and forward them to Express's centralized error-handling middleware.
        })
    }
}
export {asyncHandler}