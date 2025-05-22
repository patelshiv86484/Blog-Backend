 import { Image } from "../models/image.model.js";
 import { asyncHandler } from "../utils/asyncHandler.js";
 import {uploadOnCloudinary,deletefromcloudinary} from  "../utils/cloudinary.js"
 import { ApiError } from "../utils/ApiError.js";
 import { ApiResponse } from "../utils/ApiResponse.js";
 import mongoose from "mongoose";
 const getAllImages=asyncHandler(async (req,res)=>{
      try {
         const images = await Image.find({ status: true })  
                              .select("title description imageFile _id owner") 
                              .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      message: "All images fetched successfully",
      data: images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
 })

 const uploadImage=asyncHandler(async (req, res) => {
    const { title, description} = req.body
    //1.get image path from req.file(multer middleware)
    //2.upload on cloudinary and set it as imageFile.
    //3.Get owner _id and store it in Owner.
    //4.set title and description.
    //5.set status as active.
  const imageLocalPath = req.file?.path
  
      if (!imageLocalPath) {
          throw new ApiError(400, "image file is missing")
      }
  
  
      const imaget = await uploadOnCloudinary(imageLocalPath)
  
      if (!imaget.url) {
          throw new ApiError(400, "Error while uploading on image")
          
      }
    const ownerId=req.user._id;
    if(!ownerId){
        throw new ApiError(401,"Owner id is required");
    }

    const image =await Image.create({
        imageFile:imaget.url,
        owner:ownerId,
        title,
        description,
        status:true,
    })

    const createdimage=await Image.findById(image._id);
    if(!createdimage){
        throw new ApiError(500,"Internal server error")
    }
    return res
    .status(202)
    .json(
        new ApiResponse(202,createdimage,"image uploaded Successfully in MongoDB")
    )
})

 const getImageById=asyncHandler(async (req, res) => {
    const { imageId } = req.params
    //No need to convert in ObjectId by mistake this is done as only in aggregation it is reqired otherwise internally converted.
    const imageid=new mongoose.Types.ObjectId(imageId)
    const image=await Image.findById(imageid);
    if(!image){
        throw new ApiError(401,"image Id invalid");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,image,"image getted successfully")
    )
})

 const editImage=asyncHandler(async (req,res)=>{
 const {title,description}=req.body
 const {imageId} =req.params
   const imageLocalPath = req.file?.path
 if(!title || !description) {
     throw new ApiError(402,"tile and description is required")
 }
  const imageid=new mongoose.Types.ObjectId(imageId);

   const image=await Image.findById(imageid);
  let imaget
      if(imageLocalPath){  imaget = await uploadOnCloudinary(imageLocalPath)}
 
    
     if(image.owner.toString() != req.user?._id.toString()){//this is required as both are of object type so object compares by refrence not by value but string compares by value that's why conversion to string is required.
        throw new ApiError(403,"Invalid user")
    }
  
        const getimage=await Image.findByIdAndUpdate(
        imageid,
        {
           $set:{
               title,
               description,
               imageFile:imaget?.url || image.imageFile,
           }
        },
        {
            new:true,
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,getimage,"image updated successfully")
    )
 })


 const deleteImage=asyncHandler(async (req,res)=>{
    
    const { imageId } = req.params
    const imageid=new mongoose.Types.ObjectId(imageId);
    const image=await Image.findById(imageid);
    const userId=image.owner;

    if(userId!=req.user._id.toString()){
        throw new ApiError(401,"Invalid user to delete the image")
    }
    await deletefromcloudinary(image.imageFile);
    await Image.findByIdAndDelete(imageid)
    
    return res
    .status(202)
    .json(
         new ApiResponse(202," image deleted successfully")
        )
 })


 export {getAllImages,getImageById,editImage,deleteImage,uploadImage}