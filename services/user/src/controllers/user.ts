import { AuthenticatedRequest } from "../middleware/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import { uploadServiceUrl } from "../utils/uploadService.js";

export const myProfile = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    res.json(user);
  },
);

export const getUserProfile = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const { userId } = req.params;
    const users =
      await sql`SELECT u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,u.profile_pic,u.subscription,ARRAY_AGG(s.name)FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id
            LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${userId} GROUP BY u.user_id;`;
    if (users.length === 0) {
      throw new ErrorHandler(404, "user not found");
    }
    const user = users[0];
    user.skills = user.skills || [];

    res.json(user);
  },
);

export const updateUserProfile = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized");
    }
    const { name, phoneNumber, bio } = req.body;
    const newName = name || user.name;
    const newPhoneNumber = phoneNumber || user.phone_number;
    const newBio = bio || user.bio;

    const [updatedUser] =
      await sql`UPDATE users SET name=${newName}, phone_number=${newPhoneNumber}, bio=${newBio} WHERE user_id=${user.user_id} RETURNING user_id,name,phone_number,bio;`;
    res.json({
      message: "Profile updated successfully",
      updatedUser,
    });
  },
);

export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized");
    }
    const file = req.file;
    if (!file) {
      throw new ErrorHandler(400, "No file uploaded");
    }
    const oldPublicId = user.profile_pic_public_id;
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "failed to generate buffer");
    }
    const { data: uploadResult } = await axios.post(
      uploadServiceUrl(),
      {
        buffer: fileBuffer.content,
        public_id: oldPublicId,
      },
    );
    const [updatedUser] =
      await sql`UPDATE users SET profile_pic=${uploadResult.url}, profile_pic_public_id=${uploadResult.public_id} WHERE user_id=${user.user_id} RETURNING user_id,name,profile_pic,profile_pic_public_id;`;
    res.json({
      message: "Profile picture updated successfully",
      updatedUser,
    });
  },
);

export const updateResume = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized");
    }
    const file = req.file;
    if (!file) {
      throw new ErrorHandler(400, "No file uploaded");
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "failed to generate buffer");
    }
    // The previous resume is not deleted: past applications still link to it
    const { data: uploadResult } = await axios.post(
      uploadServiceUrl(),
      { buffer: fileBuffer.content },
    );
    const [updatedUser] =
      await sql`UPDATE users SET resume=${uploadResult.url}, resume_public_id=${uploadResult.public_id} WHERE user_id=${user.user_id} RETURNING user_id,name,resume,resume_public_id;`;
    res.json({
      message: "Resume updated successfully",
      updatedUser,
    });
  },
);

export const addSkillToUser = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.user_id;
    const { skillName } = req.body;
    if (!skillName || skillName.trim() === "") {
      throw new ErrorHandler(400, "Skill name is required");
    }
    let wasSkillAdded = false;
    try {
      await sql`BEGIN`;
      const users =
        await sql`SELECT user_id FROM users WHERE user_id=${userId}`;
      if (users.length === 0) {
        throw new ErrorHandler(404, "User not found");
      }
      const [skill] =
        await sql`INSERT INTO skills(name) VALUES(${skillName.trim()}) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING skill_id;`;
      const skillId = skill.skill_id;
      const insertionResult =
        await sql`INSERT INTO user_skills(user_id, skill_id) VALUES(${userId}, ${skillId}) ON CONFLICT (user_id, skill_id) DO NOTHING RETURNING user_id;`;
      if (insertionResult.length > 0) {
        wasSkillAdded = true;
      }
      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
    if (!wasSkillAdded) {
      throw new ErrorHandler(400, "Skill already exists for the user");
    }
    res.json({ message: `Skill ${skillName} added successfully` });
  },
);
export const deleteSkillFromUser = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized");
    }
    const { skillName } = req.body;
    if (!skillName || skillName.trim() === "") {
      throw new ErrorHandler(400, "Skill name is required");
    }
    const result =
      await sql`DELETE FROM user_skills WHERE user_id=${user.user_id} AND skill_id=(SELECT skill_id FROM skills WHERE name=${skillName.trim()}) RETURNING user_id;`;
    if (result.length === 0) {
      throw new ErrorHandler(
        404,
        `Skill ${skillName.trim()} not found for the user`,
      );
    }
    res.json({ message: `Skill ${skillName.trim()} deleted successfully` });
  },
);

export const applyForJob = TryCatch(async (req: AuthenticatedRequest, res) => { 
  const user = req.user;
  if (!user) {
    throw new ErrorHandler(401, "Unauthorized");
  }
  if (user.role !== "jobseeker") {
    throw new ErrorHandler(403,"Forbidden you are not allowed for this api")
  }
  const applicant_id= user.user_id
  const resume = user.resume
  if (!resume) {
    throw new ErrorHandler(400,"u need to add resume in ur profile to apply for this role")
  }
  const { job_id } = req.body
  if (!job_id) {
    throw new ErrorHandler(404, "job id is required")
    
  }

  const [job] = await sql`SELECT is_active FROM jobs WHERE job_id =${job_id}`;
  if (!job) {
    throw new ErrorHandler(404, "no jobs with this id")
    
  }
  if (!job.is_active) {
    throw new ErrorHandler(400, "job is not active")
    
  }
  
  let newApplication;
  try {
    [newApplication]=await sql `INSERT INTO applications (job_id,applicant_id,applicant_email,resume) VALUES (${job_id}, ${applicant_id}, ${user?.email}, ${resume})`
    
  } catch (error: any) {
    if (error.code === "2305") {
      throw new ErrorHandler(409,"you have already applied to this job")
    }
    throw Error
    
  } 
  res.json({
    message: "applied for job successfully",
    application:newApplication,
  })
  


  
    
})


export const getAllapplications = TryCatch(async (req: AuthenticatedRequest, res) => {
  const applications = await sql`
  SELECT a.*, j.title AS job_title,j.salary AS job_salary, j.location AS job_location FROM applications a JOIN jobs j ON a.job_id=j.job_id WHERE a.applicant_id =${req.user?.user_id}
  `;

  res.json(applications)
  
})

