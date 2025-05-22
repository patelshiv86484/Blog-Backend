import connection  from "./db/index.js"
import {app}  from "./app.js"

connection().
then(
    ()=>{
    app.on("error",(err)=>{//this error event listener must be there before app.listen() as both are synchronous operation because if kitchen is not ready then cant open the doors to accept customer.
        console.log("App listens error: ",err)
    })
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at port number: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Error DB connection failed (in src/index) ",err)
})