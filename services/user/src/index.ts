import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/user.js"

dotenv.config() 
 
const app = express()
app.use(express.json())
app.use("/api/user",userRoutes)


app.listen(process.env.PORT, () => {
    console.log(`user services is running on port ${process.env.PORT}`)
    
})