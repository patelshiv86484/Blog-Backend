import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express();
//parsing req.body data using app.use()  ---> middleware function for setting middleware.
// app.use(cors()) Enable CORS for defined origins.
app.use(cors({
    origin:process.env.CORS_ORIGIN,//limits to specific origins only
    credentials:true,// Allow frontend to send and receive cookies & HTTP authentication
}))

app.use(express.json({limit:"16kb"}));//parse incoming request bodies as JSON(because When a client sends data to the server, even if it's in JSON format, the payload (the body of the HTTP request) is transmitted as a string.), but with a size limit on the body as 16kb.
app.use(express.urlencoded({extended:true,limit:"16kb"}));//express.urlencoded() middleware will parse the incoming URL-encoded data, converting it into a JavaScript object that can be easily accessed using req.body.
app.use(express.static("public"))//store favicon and files folder in public(local storage).
app.use(cookieParser());//this will allow user and server to perform CRUD operation on cookies in user browser and allows to use .cookie().


//routes import
import userRouter from "./routes/user.routes.js"
import imageRouter from "./routes/image.routes.js"
//routes declaration
app.use("/api/users",userRouter);//here instead of app.get(route,controller) this middleware is used because all are in different folders. 
app.use("/api/images",imageRouter);//here instead of app.get(route,controller) this middleware is used because all are in different folders. 
 
export { app }
