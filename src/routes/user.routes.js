import { Router } from "express";
import {userRegister,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router=Router()

    router.route("/register").post(userRegister)//this will seen in url as "/api/v1/users/register" it is like app.post("url",controller(userRegister)).
    router.route("/login").post(loginUser)

    //Secured routes (using verifyJWT)
    router.route("/logout").post(verifyJWT,logoutUser);
    router.route("/refresh-token").post(refreshAccessToken);
    router.route("/change-password").post(verifyJWT,changeCurrentPassword);
    router.route("/current-user").get(verifyJWT,getCurrentUser)//using get method as nothing to send over here(*tokens)
    router.route("/update-account").patch(verifyJWT,updateAccountDetails)//because no validation check is to be done is it correct or not like in change current password as verified already by verifyJWT so use patch otherwise post.
 
    export default router;