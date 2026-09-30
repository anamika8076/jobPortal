import app from "./app.js";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import { createClient } from "redis";
console.log("1. Starting auth service");
dotenv.config();
console.log("2. Env loaded");
export const redisClient = createClient({
    url: process.env.Redis_url,
});
redisClient.connect().then(() => console.log("connected to redis")).catch(console.error);
async function initDb() {
    try {
        console.log("Before SELECT 1");
        const result = await sql `SELECT 1 as test`;
        console.log("After SELECT 1:", result);
        console.log("3. Creating enum");
        await sql `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('jobseeker', 'recruiter');
        END IF;
      END $$;
    `;
        console.log("4. Creating users table");
        await sql `
      CREATE TABLE IF NOT EXISTS users(
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        role user_role NOT NULL,
        bio TEXT,
        resume VARCHAR(255),
        resume_public_id VARCHAR(255),
        profile_pic VARCHAR(255),
        profile_pic_public_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        subscription TIMESTAMPTZ
      )
    `;
        console.log("5. Creating skills table");
        await sql `
      CREATE TABLE IF NOT EXISTS skills(
        skill_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      )
    `;
        console.log("6. Creating user_skills table");
        await sql `
      CREATE TABLE IF NOT EXISTS user_skills(
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        skill_id INT REFERENCES skills(skill_id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, skill_id)
      )
    `;
        console.log("7. Database initialized");
    }
    catch (error) {
        console.log("❌ Error initializing database:", error);
        process.exit(1);
    }
}
initDb().then(() => {
    console.log("8. Starting Express");
    app.listen(process.env.PORT, () => {
        console.log(`Auth service is running on port ${process.env.PORT}`);
    });
});
