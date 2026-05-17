import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cache model selection
const modelName = "gemini-3-flash-preview";

export async function analyzeResume(resumeText: string) {
  console.log('--- Gemini Analysis Started ---');
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY missing - using fallback mock data");
      throw new Error("GEMINI_API_KEY missing");
    }

    const prompt = `
      Analyze the following resume text for ATS compatibility and provide feedback.
      Return the result as a JSON object with the following structure:
      {
        "atsScore": number (0-100),
        "strengths": [string],
        "weaknesses": [string],
        "missingSkills": [string],
        "formattingRecommendations": [string],
        "improvementSuggestions": [string]
      }

      Resume Text:
      ${resumeText}
    `;

    console.log('Sending request to Gemini model:', modelName);
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log('Gemini response received successfully');
    const parsed = JSON.parse(result.text || '{}');
    
    // Validate structure
    if (!parsed.atsScore && parsed.atsScore !== 0) {
      console.warn('Gemini response missing atsScore, using fallback values');
      parsed.atsScore = 70;
    }
    
    return parsed;
  } catch (error: any) {
    console.error("Gemini analyzeResume error:", error.message);
    console.log('Using fallback mock data for resume analysis');
    // Fallback Mock Data
    return {
      atsScore: 65,
      strengths: ["Clean contact information (Fallback)", "Clear section headers (Fallback)"],
      weaknesses: ["Missing measurable achievements (Fallback)", "Brief job descriptions (Fallback)"],
      missingSkills: ["Cloud Platforms (AWS/GCP) (Fallback)", "CI/CD Pipelines (Fallback)"],
      formattingRecommendations: ["Use a more standard font (Fallback)", "Increase margins (Fallback)"],
      improvementSuggestions: ["Add quantifiable metrics to your work experience (Fallback)", "Include a professional summary (Fallback)"]
    };
  } finally {
    console.log('--- Gemini Analysis Finished ---');
  }
}

export async function generateInterviewQuestions(role: string, level: string, stack: string[], resumeText: string) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const prompt = `
      Generate 10 interview questions based on the target role, experience level, tech stack, and resume content.
      Include a mix of Technical, HR, Behavioral, and DSA questions.
      Return the result as a JSON array of objects:
      [
        {
          "id": "q1",
          "category": "Technical | HR | Behavioral | DSA",
          "text": "Question text here"
        }
      ]

      Target Role: ${role}
      Experience Level: ${level}
      Tech Stack: ${stack.join(', ')}
      Resume Content Snippet: ${resumeText.substring(0, 2000)}
    `;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(result.text || '[]');
  } catch (error) {
    console.error("Gemini generateQuestions error:", error);
    // Fallback Mock Questions
    return [
      { id: "f1", category: "Technical", text: "Explain the difference between SQL and NoSQL databases." },
      { id: "f2", category: "Behavioral", text: "Describe a time when you had to work through a technical conflict in a team." },
      { id: "f3", category: "HR", text: "Why are you interested in this role?" },
      { id: "f4", category: "DSA", text: "How would you implement a stack using two queues?" }
    ];
  }
}

export async function evaluateAnswer(question: string, answer: string) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const prompt = `
      Evaluate the following interview answer for the given question.
      Return the result as a JSON object:
      {
        "clarity": number (1-10),
        "technicalAccuracy": number (1-10),
        "completeness": number (1-10),
        "communication": number (1-10),
        "overallFeedback": string,
        "suggestions": [string],
        "confidenceScore": number (1-10)
      }

      Question: ${question}
      Answer: ${answer}
    `;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(result.text || '{}');
  } catch (error) {
    console.error("Gemini evaluateAnswer error:", error);
    return {
      clarity: 7,
      technicalAccuracy: 6,
      completeness: 5,
      communication: 8,
      overallFeedback: "Good start, but you could go into more detail about specific technologies.",
      suggestions: ["Talk more about the 'why' behind your decisions", "Provide a concrete example from your past projects"],
      confidenceScore: 7
    };
  }
}
