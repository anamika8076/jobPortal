
import { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import axios from "axios";








export const createCompany = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Unauthorized");
    }
    if (user.role !== "recruiter") {
        throw new ErrorHandler(403, "Forbidden: Only recruiters can create companies");
    }
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);
    const { name, description, website } = req.body;
    if (!name || !description || !website) {
        throw new ErrorHandler(400, "all fields are required");
    }
    const existingCompanies = await sql` SELECT company_id FROM companies WHERE name=${name}`;
    if (existingCompanies.length > 0) {
        throw new ErrorHandler(409, `Company with this name ${name} already exists`);

    }
    const file= req.file;
    if (!file) {
        throw new ErrorHandler(400, "Company logo file is required");
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        throw new ErrorHandler(500, "failed to create file buffer");

    }
    const {data}=await axios.post(
        `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
        {buffer:fileBuffer.content}
    )
    const [newCompany] = await sql`INSERT INTO companies (name, description, website, logo, logo_public_id, recruiter_id) VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${user.user_id})
    RETURNING *;`;
    res.json({
        message: "Company created successfully",
        company: newCompany,
    });


}
 
    
)


export const deleteCompany = TryCatch(async (req: AuthenticatedRequest, res) => { 
    const user = req.user;
    const { companyId } = req.params;
    const [company] = await sql`SELECT logo_public_id FROM companies WHERE company_id=${companyId} AND recruiter_id =${user?.user_id}`;
    if (!company) {
        throw new ErrorHandler(404, "Company not found or you are not authorized to delete it");
    }
    await sql`DELETE FROM companies WHERE company_id=${companyId} `;
    res.json({
        message: "Company deleted successfully",
        companyId: companyId,
    })
    
})

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => { 
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized");
    }
    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden: Only recruiters can create jobs",
      );
    }
    const { title, description, salary, location, job_type, openings, role, work_location, company_id } = req.body;
    if (!title || !description || !location || !openings || !role ) {
      throw new ErrorHandler(400, "All fields are required");
    }
    const [company] = await sql`SELECT company_id FROM companies WHERE company_id=${company_id} AND recruiter_id=${user.user_id}`;
    if (!company) {
      throw new ErrorHandler(
        404,
        "Company not found or you are not authorized to create a job for this company",
      );
    }
    const [newJob] = await sql`INSERT INTO jobs (title, description, salary, location, job_type, openings, role, work_location, company_id, posted_by_recruiter_id) VALUES (${title}, ${description}, ${salary}, ${location}, ${job_type}, ${openings}, ${role}, ${work_location}, ${company_id}, ${user.user_id}) RETURNING *;`;

    res.json({
      message: "Job created successfully",
      job: newJob,
    });

})
