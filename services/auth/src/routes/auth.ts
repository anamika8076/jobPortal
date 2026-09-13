import express from 'express';
const router=express.Router();
import { loginUser, registerUser } from "../controller/auth.js";
import uploadFile from '../middleware/multer.js';

router.post("/register",uploadFile,registerUser);
router.post("/login",loginUser);

export default router;



