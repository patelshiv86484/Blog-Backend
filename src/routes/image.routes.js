import {getAllImages,getImageById,editImage,deleteImage,uploadImage} from "../controllers/image.controller.js"
import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
const router=Router()

//All are secured routes over here.
 router.route("/posts").get(verifyJWT,getAllImages);
 router.route("/get-image/:imageId").get(verifyJWT,getImageById);
 router.route("/edit-image/:imageId").patch(verifyJWT,upload.single("image"),editImage);
 router.route("/delete-image/:imageId").post(verifyJWT,deleteImage);      

 router.route("/upload-image").post(verifyJWT,upload.single("image"),uploadImage);            


export default router;