import express from "express";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";
import { createCompany, createJob, deleteCompany, updateJob, getAllCompany, getCompanyDetails, getAllActiveJobs, getSingleJob} from "../controllers/job.js";
const router = express.Router();


router.post("/company/create", isAuth, uploadFile, createCompany)
router.delete("/company/delete/:companyId", isAuth, deleteCompany)
router.post("/create", isAuth, createJob)
router.put("/update/:jobId", isAuth, updateJob)
router.get("/company/all", isAuth, getAllCompany)
router.get("/company/:id", isAuth, getCompanyDetails)
router.get("/all", getAllActiveJobs)
router.get("/:jobId", getSingleJob)
export default router;