import { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import axios from "axios";

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized");
    }
    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden: Only recruiters can create companies",
      );
    }
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);
    const { name, description, website } = req.body;
    if (!name || !description || !website) {
      throw new ErrorHandler(400, "all fields are required");
    }
    const existingCompanies =
      await sql` SELECT company_id FROM companies WHERE name=${name}`;
    if (existingCompanies.length > 0) {
      throw new ErrorHandler(
        409,
        `Company with this name ${name} already exists`,
      );
    }
    const file = req.file;
    if (!file) {
      throw new ErrorHandler(400, "Company logo file is required");
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "failed to create file buffer");
    }
    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: fileBuffer.content },
    );
    const [newCompany] =
      await sql`INSERT INTO companies (name, description, website, logo, logo_public_id, recruiter_id) VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${user.user_id})
    RETURNING *;`;
    res.json({
      message: "Company created successfully",
      company: newCompany,
    });
  },
);

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { companyId } = req.params;
    const [company] =
      await sql`SELECT logo_public_id FROM companies WHERE company_id=${companyId} AND recruiter_id =${user?.user_id}`;
    if (!company) {
      throw new ErrorHandler(
        404,
        "Company not found or you are not authorized to delete it",
      );
    }
    await sql`DELETE FROM companies WHERE company_id=${companyId} `;
    res.json({
      message: "Company deleted successfully",
      companyId: companyId,
    });
  },
);

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    throw new ErrorHandler(401, "Unauthorized");
  }
  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Forbidden: Only recruiters can create jobs");
  }
  const {
    title,
    description,
    salary,
    location,
    job_type,
    openings,
    role,
    work_location,
    company_id,
  } = req.body;
  if (!title || !description || !location || !openings || !role) {
    throw new ErrorHandler(400, "All fields are required");
  }
  const [company] =
    await sql`SELECT company_id FROM companies WHERE company_id=${company_id} AND recruiter_id=${user.user_id}`;
  if (!company) {
    throw new ErrorHandler(
      404,
      "Company not found or you are not authorized to create a job for this company",
    );
  }
  const [newJob] =
    await sql`INSERT INTO jobs (title, description, salary, location, job_type, openings, role, work_location, company_id, posted_by_recruiter_id) VALUES (${title}, ${description}, ${salary}, ${location}, ${job_type}, ${openings}, ${role}, ${work_location}, ${company_id}, ${user.user_id}) RETURNING *;`;

  res.json({
    message: "Job created successfully",
    job: newJob,
  });
});

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    throw new ErrorHandler(401, "Unauthorized");
  }
  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Forbidden: Only recruiters can create jobs");
  }
  const {
    title,
    description,
    salary,
    location,
    job_type,
    openings,
    role,
    work_location,
    company_id,
    is_active,
  } = req.body;

  // ADD THESE LOGS HERE
  console.log("JOB ID:", req.params.jobId);
  console.log("IS ACTIVE:", req.body.is_active);
  console.log("BODY:", req.body);

  const [existingJob] =
    await sql`SELECT posted_by_recruiter_id FROM jobs WHERE job_id=${req.params.jobId} `;
  if (!existingJob) {
    throw new ErrorHandler(404, "Job not found");
  }
  if (existingJob.posted_by_recruiter_id !== user.user_id) {
    throw new ErrorHandler(
      403,
      "Forbidden: You are not authorized to update this job",
    );
  }
  const [updatedJob] = await sql`UPDATE jobs SET title=${title},
    description=${description},
    salary=${salary}, 
    location=${location}, 
    job_type=${job_type}, 
    openings=${openings}, 
    role=${role}, 
    company_id=${company_id},
    work_location=${work_location}, 
    is_active=${is_active} 
    WHERE job_id=${req.params.jobId} RETURNING *;`;

  res.json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});

export const getAllCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const companies =
      await sql`SELECT * FROM companies WHERE recruiter_id=${req.user?.user_id}`;
    res.json(companies);
  },
);

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
      throw new ErrorHandler(400, "Company ID is required");
    }
    const [companyData] = await sql`SELECT c.* , COALESCE (
    (
SELECT JSON_AGG(j.*) FROM jobs j WHERE j.company_id = c.company_id
    ),
    '[]'::JSON
    
    ) AS jobs
    FROM companies c WHERE c.company_id=${id} GROUP BY c.company_id;`;
    if (!companyData) {
      throw new ErrorHandler(404, "Company not found");
    }
    res.json(companyData);
  },
);

export const getAllActiveJobs = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        const { title, location } = req.query as {
            title?: string;
            location?: string;
        };
        let querySting = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type,  j.role, j.work_location,j.created_at ,c.name AS company_name, c.logo AS company_logo , c.company_id AS company_id FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;
        const values: string[] = [];
        let parameterIndex = 1;
        if (title) {
            querySting +=` AND j.title ILIKE $${parameterIndex}`;
            values.push(`%${title}%`);
            parameterIndex++;
        }
        if (location) {
            querySting +=` AND j.location ILIKE $${parameterIndex}`;
            values.push(`%${location}%`);
            parameterIndex++;
        }
        querySting += ` ORDER BY j.created_at DESC`;
        const jobs = (await sql.query(querySting,values)) as any[];
        res.json(jobs);

    }
    
        
);
export const getSingleJob = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        const { jobId } = req.params;
        if (!jobId) {
            throw new ErrorHandler(400, "Job ID is required");
        }
        const [job] = await sql`SELECT * FROM  jobs WHERE job_id=${req.params.jobId} `;
        if (!job) {
            throw new ErrorHandler(404, "Job not found");
        }
        res.json(job);
    }
);


export const getAllApplicationForJob=TryCatch(async(req:AuthenticatedRequest,res)=>{
  const user = req.user;
  if (!user) {
    throw new ErrorHandler(401, "Unauthorized");
  }
  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Forbidden: Only recruiters can access ");
  }
  const {jobId}=req.params
  const [job]=await sql `SELECT posted_by_recruiter_id FROM jobs WHERE job_id=${jobId}`;

  if(!job){
    throw new ErrorHandler(404,"job not found")

  }
  if(job.posted_by_recruiter_id !== user.user_id){
    throw new ErrorHandler(403,"forbidden you are not allowed")

  }
  const applications=await sql `SELECT * FROM applications WHERE job_id= ${jobId} ORDER BY  applied_at ASC `;
  res.json(applications)

})