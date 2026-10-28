import "dotenv/config";
import express from 'express';

import routes from './routes.js';
import cors from 'cors';
import { v2 as cloudinary } from "cloudinary";
import { startSendMailConsumer } from './consumer.js';





console.log("1. Environment loaded");
console.log("2. PORT:", process.env.PORT);

startSendMailConsumer();
console.log("3. Consumer function called");


// Configuration
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME ,
      api_key: process.env.API_KEY ,
      api_secret: process.env.API_SECRET , 
    });
    



const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/utils", routes);




const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Utils server is running on http://localhost:${PORT}`);
});

export default app;
