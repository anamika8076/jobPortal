import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sql } from "../utils/db.js";

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: "jobseeker" | "recruiter";
  bio: string | null;
  resume: string | null;
  resume_public_id: string | null;
  profile_pic: string | null;
  profile_pic_public_id: string | null;
  subscription: string | null;
  skills: string[];
}
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
      const token = authHeader.split(" ")[1];
      const decodedPayload = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;
      if (!decodedPayload || !decodedPayload.id) {
        res.status(401).json({ message: "invalid token" });
        return;
      }
    const users = await sql`SELECT u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,u.profile_pic,u.subscription,ARRAY_AGG(s.name)FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${decodedPayload.id} GROUP BY u.user_id;`;
    if (users.length === 0) {
        res.status(401).json({ message: "user associated with this token no longer exist" });
        return;
      } 
      const user = users[0] as User;
      user.skills = user.skills || [];
      req.user = user;
      next();
    
    
  } catch (error) {
      console.log(error)
    res.status(401).json({ message: "authentication failed. please login again" });
   }
};
