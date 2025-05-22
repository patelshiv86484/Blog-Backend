import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

async function  uploadOnCloudinary(filePath){//this filePath comes from our local server storage.
    try {
        if (!filePath) return null
       const response= await cloudinary.uploader.upload(filePath, {
        resource_type:"auto",//.png,.pdf.png,etc...
    })
    fs.unlinkSync(filePath)//if keeping in catch or finally block gives us error
    return response;
    } 
    catch (error) {
        // fs.unlinkSync(filePath)
        return null;
    }
}

async function deletefromcloudinary(fileurl){
    try{
      const parts = fileurl.split("/upload/");
       if (parts.length < 2) return null;
       const path = parts[1];
    const withoutVersion = path.replace(/v\d+\//, ""); // 'ov9pom8vb2tydt6icnit.jpg'
    const publicId = withoutVersion.replace(/\.[^/.]+$/, ""); // 'ov9pom8vb2tydt6icnit'
       const result = await cloudinary.uploader.destroy(publicId);
    }
    catch(error){
     console.log("Error while deleting image from cloudinaryu in utils/cloudinary.js",error)
    }
}
export {uploadOnCloudinary,deletefromcloudinary}