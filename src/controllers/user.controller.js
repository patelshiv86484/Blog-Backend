import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import{User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens=async (user)=>{ 

    try {  
      const accessToken =user.generateAccessToken();
      const refreshToken=user.generateRefreshToken();
      user.refreshToken=refreshToken;
      await user.save({validateBeforeSave:false})//as this save will think multiple attributes is changed so to validate them again before saving but here we know only refresh token is changed. 
      return {accessToken,refreshToken};
}
  catch(err){
      throw new ApiError(500,"Somenthing went wrong while genrating access and refresh token");
  }

}

const userRegister=asyncHandler( async (req,res)=>{ 
      //Algorithm to register user
      //1. Get user details from frontend.
      //2. Validate getted data(not empty).
      //3. Check if user is not registered already using email or username.
      //6. Create user object(json in nosql DB) -create entry in DB.
      //7. Remove password and refresh token when returning response to user.
      //8. Check fo user creation.
      //9. return response.

                                       
      //1
      const {email,userName,password}=req.body  
      //2
      if(
            [email,userName,password].some((field)=>
                  field?.trim()===""
            )
      ){
         throw new ApiError(400,"All fields are required")
} 
      //3
      const existedUser=await User.findOne({
            $or:[{userName},{email}]//this to check if userName is there or email is there then throw error.
      })
      if(existedUser){
            throw new ApiError(409,"User with this userName or Email exist")
      }
     
      //6
      const user=await User.create({    
            email,
            userName,
            password
      })

      const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"//this means not to select(send) password and refreshToken in response.
      )
      if(!createdUser){
            throw new ApiError(543,"Internal server error")//500 status code because all are correctly passed but this not creation of createdUser is due to backend.
      }
      return res
               .status(201)
               .json(
                  new ApiResponse(200,createdUser,"User registered Successfully")
               );
})

const loginUser=asyncHandler(async(req,res)=>{ 
      //Algorithm for Login user
      //1.User data from <-req.body
      //2.Check for email or username exist or not.
      //3.Validate password.
      //4.Access and refresh token.
      //5.Send token in cookies.

      //1.
      const{email,psswrd}=req.body;
      if(!( email)){
            throw new ApiError(400,"Email or Username(anyone) is required");
      }
      
      //2.
      const user=await User.findOne({
            email
      })
      if(!user){
            throw new ApiError(402,"Username or Email not exist");
      }
      const passwordChecker=await user.isPasswordCorrect(psswrd)
      if(!passwordChecker){
            throw new ApiError(401,"Invalid useer credentials");
      }
      
      const {accessToken,refreshToken}=await  generateAccessAndRefereshTokens(user);
      const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

      if(!loggedInUser){
            throw new ApiError(500,"Something went wrong while login user")
      }
      const options={// for telling which one can access this cookie data.
          httpOnly:true,//Prevents access via JavaScript (document.cookie cannot read it).
          secure:true,// Ensures cookies are transmitted only over HTTPS(not http), enhancing security.
          sameSite: "none",//Required for cross-site cookies (Vercel → Render)
      }
      return res.
      status(202).
      cookie("accesstoken",accessToken,options).
      cookie("refreshtoken",refreshToken,options).
      json(    
            new ApiResponse( 202,
             {
                  loggedInUser,accessToken,refreshToken
             },
             "User logged in successfully"
            )
      )
})
 
const logoutUser=asyncHandler(async(req,res)=>{ 
      //Algorithm
      //1.get user data from req.user(auth.middleware.js)
      //2.Remove refreshtoken and accesstoken from user.
      //syntax Model.findByIdAndUpdate(id, update, options)
      console.log("Reached")
      await User.findByIdAndUpdate(
            req.user._id,
            {
              $unset:{
                  refreshToken:1//removes from document structure in mongoDB.
                     }
            },
            {
                  new:true,// MongoDB by default returns the old document before the update. To get the updated document, we use { new: true }.
            }
            )
            const option={
                  httpOnly:true,
                  secure:true,
            }
            res.status(201)
            .clearCookie("refreshtoken",option)//while clearing he cookie attributes (like httpOnly, secure, sameSite, path) exactly match those used when setting the cookie to ensure correct cookies are erased not other.
            .clearCookie("accesstoken",option)
            .json(new ApiResponse(202,{},"Logged out succesfully"));
})

const refreshAccessToken=asyncHandler(async(req,res)=>{  
      
      //Algorithm
      //1.verify incomingrefresh token with DB stored refreshtoken.
      //2.If correct then genrate new access and refresh token and pass it in cookies.
      const incomingRefreshToken=req.cookies.refreshToken  || req.body.refreshToken//If requested from laptop || if trequested from mobile.
      if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request")
      }
      try {
            const decodedRefreshToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
            const user=await User.findById(decodedRefreshToken?._id) 
            if(!user) throw new ApiError(404,"Invalid Refresh Token")
            if(incomingRefreshToken!==user.refreshToken) throw new ApiError(402,"Refresh roken is expired")//is using old refresh token in which user id is stored to verify is refresh toke same as in databse or different.
            const {accessToken,refreshToken} =generateAccessAndRefereshTokens(user)
            const options={
                  httpOnly:true,
                  secure:true,
            }
      
            return res.status(201)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(
                  new ApiResponse(200,{refreshToken,accessToken})
            )
            
      } catch (error) {
            throw new ApiError(401,error.message || "Invalid refreshToken")
      }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
      const {oldPassword, newPassword} = req.body

      const user = await User.findById(req.user?._id)
      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  
      if (!isPasswordCorrect) {
          throw new ApiError(400, "Invalid old password")
      }
  
      user.password = newPassword
      await user.save({validateBeforeSave: false})
  
      return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"))
  })
  
  const getCurrentUser = asyncHandler(async(req, res) => {
      return res
      .status(200)
      .json(new ApiResponse(
          200,
          req.user,
          "User fetched successfully"
      ))
  })
  
  const updateAccountDetails = asyncHandler(async(req, res) => {
      const {userName ,  email} = req.body
  
      if (!userName || !email) {
          throw new ApiError(400, "All fields are required")
      }
  
      const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
              $set: {
                  userName,    //  OR
                  email: email
              }
          },
          {new: true}// MongoDB by default returns the old document before the update. To get the updated document, we use { new: true }
          
      ).select("-password")
  
      return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"))
  });
  
  
  
  export {userRegister,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails}
