import express from "express";
const router = express.Router();
import { loginUser, registerUser, forgotPassword, resetPassword } from "../controller/auth.js";
import uploadFile from "../middleware/multer.js";

router.post("/register", uploadFile, registerUser);
router.post("/login", loginUser);
router.post("/forgot", forgotPassword);
router.post("/reset/:token",resetPassword)


export default router;
