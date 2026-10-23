import express from "express";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";
import { createCompany, createJob, deleteCompany,  updateJob, } from "../controllers/job.js";
const router = express.Router();


router.post("/company/create", isAuth, uploadFile, createCompany)
router.delete("/company/delete/:companyId", isAuth, deleteCompany)
router.post("/create", isAuth, createJob)
router.put("/update/:jobId", isAuth, updateJob)


export default router;