import express from "express"
import { getUserProfile,  myProfile } from "../controllers/user.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router()

router.get("/me", isAuth, myProfile)
router.get("/:userId",isAuth,getUserProfile)

export default router;