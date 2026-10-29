
import express from "express";
import cloudinary from "cloudinary";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Gemini API configuration
const apiKey = process.env.API_KEY_GEMINI;

// Without a key only the AI routes are disabled; uploads must keep working
if (!apiKey) {
  console.warn("API_KEY_GEMINI is missing. AI routes will return 503 until it is set in .env.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const requireAi = (res: express.Response) => {
  if (!ai) {
    res.status(503).json({
      message: "AI features are not configured on the server (API_KEY_GEMINI is missing).",
    });
    return null;
  }
  return ai;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type GeminiContents = Parameters<GoogleGenAI["models"]["generateContent"]>[0]["contents"];

// Tried in order; a model that stays overloaded falls through to the next one.
// Override with GEMINI_MODELS=model-a,model-b in .env
const GEMINI_MODELS = (process.env.GEMINI_MODELS || "gemini-3.8-flash,gemini-3.5-flash,gemini-3.7-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const ATTEMPTS_PER_MODEL = 2;
const REQUEST_TIMEOUT_MS = 30_000;
// Stay under the frontend proxy timeout (next.config.mjs proxyTimeout)
const TOTAL_BUDGET_MS = 90_000;

const errorStatus = (error: any) => Number(error?.status ?? error?.code);

// Overload, rate limit, Google-side errors and network failures are worth retrying
const isTransient = (error: any) => {
  const status = errorStatus(error);
  return Number.isNaN(status) || status === 429 || status >= 500;
};

async function generateWithFallback(client: GoogleGenAI, contents: GeminiContents) {
  let lastError: unknown;
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt += 1) {
      if (Date.now() >= deadline) throw lastError ?? new Error("Gemini request budget exhausted");
      try {
        return await client.models.generateContent({
          model,
          contents,
          config: { httpOptions: { timeout: Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now()) } },
        });
      } catch (error: any) {
        lastError = error;
        // Model not available for this key: skip straight to the next one
        if (errorStatus(error) === 404) break;
        if (!isTransient(error)) throw error;
        if (attempt < ATTEMPTS_PER_MODEL) {
          // Back off on temporary overload/rate-limit responses before retrying.
          const delayMs = 1000 * 2 ** (attempt - 1) + Math.random() * 250;
          console.warn(`Gemini ${model} failed (${errorStatus(error) || "network"}); retrying in ${Math.round(delayMs)}ms`);
          await sleep(delayMs);
        }
      }
    }
    console.warn(`Gemini ${model} unavailable; trying next model`);
  }
  throw lastError;
}

// Never forward Google's raw error body to the browser
function sendAiError(res: express.Response, error: any, label: string) {
  console.error(`${label} error:`, error);
  if (isTransient(error)) {
    return res.status(503).json({
      message: "The AI service is busy right now. Please try again in a minute.",
    });
  }
  return res.status(500).json({ message: `${label} failed. Please try again.` });
}

// Cloudinary upload route
router.post("/upload", async (req, res) => {
  try {
    const { buffer, public_id } = req.body;

    if (!buffer) {
      return res.status(400).json({
        message: "Image buffer is required",
      });
    }

    if (public_id) {
      await cloudinary.v2.uploader.destroy(public_id);
    }

    const cloud = await cloudinary.v2.uploader.upload(buffer);

    return res.json({
      url: cloud.secure_url,
      public_id: cloud.public_id,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Career recommendation route
router.post("/career", async (req, res) => {
  try {
    const client = requireAi(res);
    if (!client) return;
    const { skills } = req.body;

    if (!skills) {
      return res.status(400).json({
        message: "Skills are required",
      });
    }

    const prompt = `
Based on the following skills: ${skills}.

Act as a career advisor and generate a career path suggestion.
Return only valid JSON, with no Markdown or extra text.

Use this structure:
{
  "summary": "A brief, encouraging summary of the user's skill set and general job title.",
  "jobOptions": [
    {
      "title": "The job role",
      "responsibilities": "What the user would do in this role.",
      "why": "Why this role fits their skills."
    }
  ],
  "skillsToLearn": [
    {
      "category": "A skill improvement category",
      "skills": [
        {
          "title": "The skill to learn",
          "why": "Why this skill matters.",
          "how": "Specific ways to learn or apply it."
        }
      ]
    }
  ],
  "learningApproach": {
    "title": "How to Approach Learning",
    "points": [
      "Actionable learning advice"
    ]
  }
}

Ensure all required fields are included and the JSON is valid.
`;

    const response = await generateWithFallback(client, prompt);

    const rawText = response.text
      ?.replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    if (!rawText) {
      return res.status(502).json({
        message: "The AI returned an empty response",
      });
    }

    let jsonResponse;

    try {
      jsonResponse = JSON.parse(rawText);
    } catch {
      console.error("Invalid Gemini JSON response:", rawText);

      return res.status(502).json({
        message: "The AI returned an invalid JSON response",
      });
    }

    return res.json(jsonResponse);
  } catch (error: any) {
    return sendAiError(res, error, "Career recommendation");
  }
});




router.post("/resume-analyser",async(req,res)=>{
  try {
    const client = requireAi(res)
    if (!client) return
    const {pdfBase64}=req.body

    if(!pdfBase64){
      return res.status(404).json({
        message:"PDF data is required"
      })
    }

const prompt = `
You are an expert Applicant Tracking System (ATS) resume analyzer.

Analyze the provided resume and evaluate its ATS compatibility. Identify strengths, weaknesses, and actionable improvements.

Return your entire response as valid JSON only. Do not include Markdown formatting, code fences, or additional text outside the JSON object.

Use the following JSON structure:

{
  "atsScore": 85,
  "scoreBreakdown": {
    "formatting": {
      "score": 90,
      "feedback": "Evaluate formatting and ATS parsing compatibility."
    },
    "keywords": {
      "score": 80,
      "feedback": "Evaluate relevant keywords, skills, and terminology."
    },
    "structure": {
      "score": 85,
      "feedback": "Evaluate section headings, organization, and content flow."
    },
    "readability": {
      "score": 88,
      "feedback": "Evaluate clarity, consistency, and ease of reading."
    }
  },
  "suggestions": [
    {
      "category": "Formatting",
      "issue": "Describe a specific issue identified in the resume.",
      "recommendation": "Provide a clear and actionable recommendation.",
      "priority": "high"
    }
  ],
  "strengths": [
    "Describe a specific strength that supports ATS compatibility."
  ],
  "summary": "Provide a concise 2-3 sentence summary of the resume's ATS compatibility and the most important improvements."
}

Evaluation criteria:

1. Formatting and file structure:
   - Assess whether the resume uses an ATS-friendly layout.
   - Identify tables, multiple columns, graphics, icons, text boxes, or unusual characters that may interfere with parsing, when detectable.
   - Evaluate consistency in spacing, fonts, and formatting.

2. Standard sections:
   - Check for clear, conventional headings such as Summary, Skills, Work Experience, Projects, Education, and Certifications, where applicable.
   - Evaluate the order and organization of sections.

3. Keywords:
   - Assess the use of relevant technical skills, tools, qualifications, and industry terminology.
   - Identify missing or underrepresented keywords only when supported by the resume or a specified target job description.
   - Do not invent skills or experience the candidate does not have.

4. Contact information:
   - Check whether essential contact details, such as email, phone number, and professional profile links, are clearly presented and extractable, when provided.

5. Dates and consistency:
   - Check date formats, employment and education timelines, capitalization, punctuation, and consistency.

6. Achievements and impact:
   - Evaluate action verbs, measurable outcomes, and evidence of impact.
   - Recommend adding quantifiable results only when the candidate can substantiate them.

7. Readability and relevance:
   - Assess clarity, concise wording, relevance, and section flow.
   - Identify repetitive, vague, or unnecessarily lengthy content.

Scoring rules:
- Return integer scores from 0 to 100 for atsScore and each scoreBreakdown category.
- Calculate atsScore as the weighted average of the four category scores:
  formatting: 25%, keywords: 30%, structure: 25%, readability: 20%.
- Base every finding on the resume content actually provided.
- Do not assume that a formatting issue exists if the resume's visual layout cannot be inspected.
- If no target job description is provided, evaluate general ATS compatibility rather than job-specific matching.
- Provide specific, useful recommendations instead of generic advice.
- Use only "high", "medium", or "low" for suggestion priority.
- Include multiple suggestions only when genuine improvement opportunities are identified.
- Ensure all JSON strings are properly escaped and the response is valid JSON.
`;
  const response = await generateWithFallback(client, [{
      role:"user",
      parts:[

        {
          text:prompt,
        },
        {
          inlineData:{
            mimeType:"application/pdf",
            data:pdfBase64.replace(/^data:application\/pdf;\s?base64,/, ""),
          }
        }
      ]

    }])
  const rawText = response.text
      ?.replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    if (!rawText) {
      return res.status(502).json({
        message: "The AI returned an empty response",
      });
    }
    let jsonResponse;

    try {
      jsonResponse = JSON.parse(rawText);
    } catch {
      console.error("Invalid Gemini JSON response:", rawText);

      return res.status(502).json({
        message: "The AI returned an invalid JSON response",
      });
    }

    return res.json(jsonResponse);

  }


  catch (error:any) {
    return sendAiError(res, error, "Resume analysis")
  }


})

export default router;
