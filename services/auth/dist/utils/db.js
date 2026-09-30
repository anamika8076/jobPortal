import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();
console.log("DB URL loaded:", !!process.env.DB_URL);
export const sql = neon(process.env.DB_URL);
