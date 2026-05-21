import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Active model per instruction (using gemini-3.5-flash as default)
const modelName = "gemini-3.5-flash";

// Simple in-memory cache for resume analysis
const analysisCache = new Map<string, any>();

// Memory cache for company-specific interview questions
const companyInterviewCache = new Map<string, any>();

let cachedGenAI: GoogleGenAI | null = null;
let lastApiKey: string | null = null;

// Lazy client initialization: fetches API key on call time and instantiates client on demand.
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error("[Gemini] API Key missing or empty in environment");
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  if (!cachedGenAI || lastApiKey !== apiKey) {
    cachedGenAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    lastApiKey = apiKey;
  }
  return cachedGenAI;
}

function getHash(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Helper for exponential backoff retries
async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries = 2, 
  initialDelay = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');
      
      // If quota exceeded, do not retry, throw immediately
      if (isQuotaError) {
        console.error(`[Gemini Quota] Quota exceeded (429). Skipping retries.`);
        throw error;
      }

      const isTimeout = error.message?.toLowerCase().includes('timeout') || error.code === 'ETIMEDOUT';
      
      if (i < maxRetries && (isTimeout || error.status >= 500)) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`[Gemini Retry] Attempt ${i + 1} failed. Retrying in ${delay}ms... Reason: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// Helper to clean JSON response from Gemini
function cleanJSON(text: string) {
  if (!text) return '{}';
  
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
  
  // Basic validation - check if it at least starts with { or [
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    // Try to find the first { and last }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }
  }
  
  return cleaned;
}

function truncateText(text: string, maxChars = 30000) {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  
  console.log(`[Trimmer] Truncating text from ${text.length} to ${maxChars} characters`);
  const half = Math.floor(maxChars / 2);
  return text.substring(0, half) + "\n\n...[TEXT TRUNCATED FOR PROCESSING]...\n\n" + text.substring(text.length - half);
}

export async function analyzeResume(resumeText: string) {
  const startTime = Date.now();
  
  try {
    if (!resumeText) throw new Error("No resume text provided");
    
    // Check Cache (only non-fallback hits)
    const hash = getHash(resumeText);
    if (analysisCache.has(hash)) {
      console.log(`[Cache] Found cached analysis for resume (Hash: ${hash.substring(0, 8)})`);
      return analysisCache.get(hash);
    }

    const ai = getGenAI();

    const trimmedText = truncateText(resumeText);
    const prompt = `
      Analyze the following resume text for ATS compatibility and provide feedback.
      Return the result as a STRICT JSON object with the following structure:
      {
        "atsScore": number (0-100),
        "strengths": [string],
        "weaknesses": [string],
        "missingSkills": [string],
        "formattingRecommendations": [string],
        "improvementSuggestions": [string]
      }

      Resume Text:
      ${trimmedText}
    `;

    console.log("Gemini request started");
    
    const response = await retryWithBackoff(async () => {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
        }
      });
      return result;
    });

    console.log("Gemini response success");
    const responseText = response.text || '{}';
    console.log(`[Gemini] Response received in ${Date.now() - startTime}ms`);
    
    const cleaned = cleanJSON(responseText);
    try {
      const parsed = JSON.parse(cleaned);
      
      // Schema Validation
      if (typeof parsed.atsScore !== 'number') {
        parsed.atsScore = parsed.atsScore ? parseInt(parsed.atsScore) : 70;
      }
      
      // Store in Cache
      analysisCache.set(hash, { ...parsed, isFallback: false });
      return { ...parsed, isFallback: false };
    } catch (parseError: any) {
      console.error(`[Gemini] JSON Parsing failed: ${parseError.message}`);
      throw new Error("INVALID_JSON_RESPONSE");
    }
  } catch (error: any) {
    console.error("Gemini error message:", error.message || error);
    try {
      console.error("Gemini error full object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (_) {
      console.error("Gemini error full object fallback serialize:", String(error));
    }
    
    if (error.message === "GEMINI_API_KEY_MISSING") throw error;
    
    console.log("Fallback activated");
    const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');
    
    // Fallback Mock Data
    const fallbackData = {
      atsScore: 65,
      strengths: ["Clear contact information", "Standard section headers"],
      weaknesses: ["Impact metrics could be stronger", "Achievement quantification missing"],
      missingSkills: ["Niche technical certifications", "Project management methodology"],
      formattingRecommendations: ["Ensure consistent bullet point usage", "Use 10-12pt font for body text"],
      improvementSuggestions: [
        isQuotaError ? "AI service is currently busy. Showing intelligent fallback analysis." : "Analysis failed due to technical issues. Loading fallback report.",
        "Add more quantifiable results (%, $, #) to your experience."
      ],
      isFallback: true,
      fallbackReason: isQuotaError ? 'QUOTA_EXCEEDED' : 'GENERIC_FAILURE'
    };
    
    return fallbackData;
  } finally {
    console.log(`--- Analyze Resume Finished (Total Time: ${Date.now() - startTime}ms) ---`);
  }
}

export async function generateCompanyInterviewQuestions(
  company: string,
  role: string,
  level: string,
  stack: string[]
) {
  const startTime = Date.now();
  const cacheKey = `${company.toLowerCase()}:${role.toLowerCase()}:${level.toLowerCase()}:${stack.slice().sort().join(',')}`;
  
  if (companyInterviewCache.has(cacheKey)) {
    console.log(`[Cache] Found cached company interview questions for ${company} - ${role}`);
    return companyInterviewCache.get(cacheKey);
  }

  console.log(`--- Gemini Company Interview Generation Started (${company} - ${role}) ---`);
  
  try {
    const ai = getGenAI();

    const companyStyles: any = {
      Google: "Google focuses heavily on DSA, algorithmic complexity, system thinking, scalability, and performance optimization.",
      Amazon: "Amazon targets their 16 Leadership Principles (such as customer obsession, frugality, bias for action) alongside scalable distributed systems and ownership mindset.",
      Microsoft: "Microsoft targets practical engineering, robust debugging, code quality, collaboration, client integration, and enterprise architectural principles.",
      TCS: "TCS interviews focus on software lifecycle core concepts, fundamental aptitude, CS/OOP principles, basic programming, and standard HR questions.",
      Infosys: "Infosys interviews focus on standard programming tasks, CS fundamentals, problem-solving, quality delivery, and foundational OOP models.",
      Deloitte: "Deloitte focuses on consulting scenarios, business requirements analysis, client management, systems integration, and professional communication.",
      Accenture: "Accenture targets solutions-consulting mindset, situational pressure handling, scalable systems integration, and client-centric architecture.",
      Flipkart: "Flipkart focuses heavily on complex system design, low-level design patterns (LLD), database optimization, and managing extreme peak flash sale traffic loads."
    };

    const styleGuide = companyStyles[company] || `${company} targets practical skills, behavioral traits, and standard career path alignments.`;

    const prompt = `
      Create exactly 5 comprehensive mock interview questions for a candidate interviewed at **${company}**.
      Target Role: ${role}
      Experience Level: ${level}
      Tech Stack: ${stack.join(', ')}

      Tailor the style based on this company-specific criteria:
      ${styleGuide}

      Ensure a balanced combination of:
      - Technical questions relevant to the tech stack (${stack.join(', ')})
      - Scenario-based/Situational questions inspired by ${company}'s actual workspace culture
      - Behavioral or leadership questions aligned with ${company}'s hiring values

      Return the result as a STRICT JSON array of objects. Do not include any text markdown, leading words, or explanatory output outside the final block.
      Format:
      [
        {
          "category": "Technical | Situational | Behavioral | DSA | Leadership",
          "text": "Detailed question"
        }
      ]
    `;

    console.log("Gemini request started");
    
    const response = await retryWithBackoff(async () => {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return result;
    });

    console.log("Gemini response success");
    const responseText = response.text || '[]';
    const cleaned = cleanJSON(responseText);
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      const questionsWithIds = parsed.map((q: any, idx: number) => ({
        id: `cq_${idx + 1}`,
        category: q.category || 'Technical',
        text: q.text,
        isFallback: false
      }));
      // Store in memory cache
      companyInterviewCache.set(cacheKey, questionsWithIds);
      return questionsWithIds;
    }
    throw new Error("EMPTY_OR_INVALID_ARRAY_RESPONSE");

  } catch (error: any) {
    console.error("Gemini error message:", error.message || error);
    try {
      console.error("Gemini error full object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (_) {
      console.error("Gemini error full object fallback serialize:", String(error));
    }

    if (error.message === "GEMINI_API_KEY_MISSING") throw error;

    console.log("Fallback activated");

    // Custom handcoded fallback questions tailored to each company
    const companyFallbacks: any = {
      Google: [
        { category: "DSA", text: "Explain the time complexity differences when using a self-balancing binary search tree versus a Hash Map. In what scenarios would Google prefer the tree over the Map?" },
        { category: "Technical", text: "How would you design a rate limiter for a public Google microservice handling 50,000 requests per second globally? Select an algorithm." },
        { category: "Situational", text: "You notice a critical memory leak in a core user authentication pipeline that goes live in 2 hours. How do you analyze and triage this?" },
        { category: "System Design", text: "Design a high-volume global search autocomplete suggestion engine. How do you latency-optimize key search indexes?" },
        { category: "Behavioral", text: "Describe a project scenario where you found a major architectural flaw in another engineer's design. How did you coordinate the feedback?" }
      ],
      Amazon: [
        { category: "Leadership", text: "Amazon values Ownership. Tell me about a time when you saw a problem in a system outside your scope and went out of your way to solve it." },
        { category: "System Design", text: "Design a checkout order processing queue for Prime Day that guarantees exactly-once processing under peak load of 1 million requests." },
        { category: "Behavioral", text: "Describe a time when you made a wrong tech decision with limited data, insisting on deep delivery bias. What was the fallout?" },
        { category: "Technical", text: "Explain how you would scale database read/write throughput for a fast-changing ecommerce product inventory database. What cache techniques apply?" },
        { category: "Situational", text: "Your project's delivery deadline is next week, and a critical legacy microservice you rely on goes down. How do you adapt?" }
      ],
      Microsoft: [
        { category: "Technical", text: "Explain how you would troubleshoot a persistent memory leak in an enterprise Node.js microservice running in Azure Container Apps." },
        { category: "Situational", text: "How do you build a robust automated testing and telemetry pipeline for a new serverless backend API to catch regressions early?" },
        { category: "Behavioral", text: "Tell me about a time when you disagreed with a major technology choice by an architect. How did you compromise and commit?" },
        { category: "DSA", text: "Design a thread-safe caching system in memory. How would you handle key eviction policies when we reach maximum capacity?" },
        { category: "Systems Integration", text: "How do you design solid backward compatibility for an API endpoint when introducing breaking data structures for enterprise clients?" }
      ],
      TCS: [
        { category: "Technical", text: "What is the difference between abstract classes and interfaces in Object-Oriented Programming (OOP)? Discuss with practical examples." },
        { category: "Systems Lifecycle", text: "Explain agile methodologies vs the classic waterfall software model. When is waterfall still a viable methodology?" },
        { category: "Fundamentals", text: "Describe the ACID rules in relation database management systems (DBMS) and how they differ from eventual consistency." },
        { category: "Situational", text: "If a crucial client-facing production build fails on deployment night, what is your step-by-step diagnostic strategy?" },
        { category: "HR / Fit", text: "Why do you want to join our company, and how do you handle shifting project schedules across diverse offshore delivery squads?" }
      ],
      Infosys: [
        { category: "Technical", text: "Discuss the difference between relational databases and NoSQL key-value stores. In what project scenario do you choose NoSQL?" },
        { category: "Fundamentals", text: "What is polymorphism in OOP? Explain runtime polymorphism vs compile-time polymorphism with code flow examples." },
        { category: "Systems Lifecycle", text: "Describe the primary phases of the Software Development Life Cycle (SDLC) and your personal experience with code quality checkpoints." },
        { category: "Behavioral", text: "How do you approach learning a completely new technical library or programming language when tasked with a timeline-driven project?" },
        { category: "Aptitude", text: "Explain the importance of indexes in databases and how they optimize search speed. What is the downside of excessive indexes?" }
      ],
      Deloitte: [
        { category: "Consulting", text: "A client insists on a complex bespoke feature that would delay software launch by 3 months. How do you present the tradeoff and manage expectations?" },
        { category: "Situational", text: "Describe your step-by-step methodology for planning a large-scale database schema migration with minimum downtime for a enterprise finance client." },
        { category: "Communication", text: "How do you translate a deep cloud server infrastructure crash explanation to a business stakeholder who has no tech background?" },
        { category: "Technical", text: "What security measures do you recommend when designing user-data intake forms for compliance with modern GDPR standards?" },
        { category: "Behavioral", text: "Tell me about a time when you had to deal with a client who gave highly ambiguous and shifting project requirements." }
      ],
      Accenture: [
        { category: "Consulting", text: "A project stakeholder wants to cut costs by skipping key integration testing cycles. How do you negotiate and articulate the associated risks?" },
        { category: "Technical", text: "Explain how you would connect and secure communication between an old legacy bank mainframe system and a modern cloud API gateway." },
        { category: "Situational", text: "You are integrating three separate third-party vendor APIs for a retail client, and one goes offline intermittently. How do you build resilience?" },
        { category: "Behavioral", text: "Describe a project where you had to quickly step in and resolve a deadlock in technical collaboration between two hostile teams." },
        { category: "System Architecture", text: "What is your high-level approach when choosing between a monolith software architecture and microservices for a medium-scale company website migration?" }
      ],
      Flipkart: [
        { category: "Scale Design", text: "Design the shopping cart and checkout architecture for Flipkart's Big Billion Days flash sale. How do you prevent stock oversell?" },
        { category: "Technical", text: "Explain the differences between optimistic locking and pessimistic locking, and how to utilize them during database inventory updates." },
        { category: "DSA", text: "How would you design and implement an efficient LRU (Least Recently Used) cache with O(1) read and write operations?" },
        { category: "Systems Lifecycle", text: "In high-throughput microservice grids, how do you implement a circuit breaker design pattern to prevent cascading API gateway failures?" },
        { category: "Behavioral", text: "Describe a high-pressure scenario where your code caused a system slowdown. How did you debug, hotfix, and review the incident?" }
      ]
    };

    const companyDefault = companyFallbacks[company] || [
      { category: "Technical", text: "Explain the core technologies in your selected stack. What are the key performance bottlenecks and how do you resolve them?" },
      { category: "Situational", text: "How do you coordinate with engineers, product managers, and testers to ensure stable release deployments?" },
      { category: "Behavioral", text: "Describe some of your proudest engineering accomplishments, detailing how you managed trade-offs under tight deadlines." },
      { category: "Problem Solving", text: "Write or outline an algorithm to find the key bottlenecks in a distributed web server system." },
      { category: "HR", text: "Why do you feel your technical and behavioral profile matches our team expectations, and what are your growth objectives?" }
    ];

    const fallbackQuestionsWithIds = companyDefault.map((q: any, idx: number) => ({
      id: `f_cq_${idx + 1}`,
      category: q.category || 'Technical',
      text: q.text,
      isFallback: true
    }));

    return fallbackQuestionsWithIds;

  } finally {
    console.log(`--- Gemini Company Interview Generation Finished (${Date.now() - startTime}ms) ---`);
  }
}

export async function generateInterviewQuestions(role: string, level: string, stack: string[], resumeText: string) {
  const startTime = Date.now();
  console.log('--- Gemini Question Generation Started ---');
  try {
    const ai = getGenAI();

    const trimmedResume = truncateText(resumeText, 10000); // 10k should be enough for context
    const prompt = `
      Generate 10 interview questions based on the target role, experience level, tech stack, and resume content.
      Include a mix of Technical, HR, Behavioral, and DSA questions.
      Return the result as a STRICT JSON array of objects:
      [
        {
          "id": string,
          "category": "Technical | HR | Behavioral | DSA",
          "text": "Question text here"
        }
      ]

      Target Role: ${role}
      Experience Level: ${level}
      Tech Stack: ${stack.join(', ')}
      Resume Content: ${trimmedResume}
    `;

    console.log("Gemini request started");

    const response = await retryWithBackoff(async () => {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return result;
    });

    console.log("Gemini response success");
    const cleaned = cleanJSON(response.text || '[]');
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map((q: any) => ({ ...q, isFallback: false }));
    }
    return parsed;
  } catch (error: any) {
    console.error("Gemini error message:", error.message || error);
    try {
      console.error("Gemini error full object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (_) {
      console.error("Gemini error full object fallback serialize:", String(error));
    }

    if (error.message === "GEMINI_API_KEY_MISSING") throw error;

    console.log("Fallback activated");

    // Fallback Mock Questions
    return [
      { id: "f1", category: "Technical", text: "Explain the difference between SQL and NoSQL databases.", isFallback: true },
      { id: "f2", category: "Behavioral", text: "Describe a time when you had to work through a technical conflict in a team.", isFallback: true },
      { id: "f3", category: "HR", text: "Why are you interested in this role?", isFallback: true },
      { id: "f4", category: "DSA", text: "How would you implement a stack using two queues?", isFallback: true }
    ];
  } finally {
     console.log(`--- Gemini Question Generation Finished (${Date.now() - startTime}ms) ---`);
  }
}

export async function evaluateAnswer(question: string, answer: string) {
  const startTime = Date.now();
  console.log('--- Gemini Answer Evaluation Started ---');
  try {
    const ai = getGenAI();

    const prompt = `
      Evaluate the following interview answer for the given question.
      Return the result as a STRICT JSON object:
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

    console.log("Gemini request started");

    const response = await retryWithBackoff(async () => {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return result;
    });

    console.log("Gemini response success");
    const cleaned = cleanJSON(response.text || '{}');
    const parsed = JSON.parse(cleaned);
    return { ...parsed, isFallback: false };
  } catch (error: any) {
    console.error("Gemini error message:", error.message || error);
    try {
      console.error("Gemini error full object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (_) {
      console.error("Gemini error full object fallback serialize:", String(error));
    }

    if (error.message === "GEMINI_API_KEY_MISSING") throw error;

    console.log("Fallback activated");

    return {
      clarity: 7,
      technicalAccuracy: 6,
      completeness: 5,
      communication: 8,
      overallFeedback: "Evaluation system is currently in fallback mode. Your answer was received but detailed AI analysis was skipped.",
      suggestions: ["Talk more about the 'why' behind your decisions", "Provide a concrete example from your past projects"],
      confidenceScore: 7,
      isFallback: true
    };
  } finally {
     console.log(`--- Gemini Answer Evaluation Finished (${Date.now() - startTime}ms) ---`);
  }
}

export async function matchResumeWithJD(resumeText: string, jobDescription: string) {
  console.log('--- Gemini JD Match Started ---');
  const startTime = Date.now();
  try {
    const ai = getGenAI();

    const trimmedResume = truncateText(resumeText, 20000);
    const trimmedJD = truncateText(jobDescription, 10000);

    const prompt = `
      Compare the following resume text with the job description.
      Provide a detailed compatibility analysis.
      Return the result as a STRICT JSON object with this exact structure:
      {
        "matchScore": number (0-100),
        "matchingSkills": [string],
        "missingSkills": [string],
        "atsKeywords": [string],
        "suggestions": [string],
        "hiringProbability": "Low" | "Medium" | "High",
        "jobTitle": "Extracted job title from JD"
      }

      Job Description:
      ${trimmedJD}

      Resume Text:
      ${trimmedResume}
    `;

    console.log("Gemini request started");

    const response = await retryWithBackoff(async () => {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return result;
    });

    console.log("Gemini response success");
    console.log(`[Gemini] Match response received in ${Date.now() - startTime}ms`);
    const cleaned = cleanJSON(response.text || '{}');
    const parsed = JSON.parse(cleaned);
    return { ...parsed, isFallback: false };
  } catch (error: any) {
    console.error("Gemini error message:", error.message || error);
    try {
      console.error("Gemini error full object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (_) {
      console.error("Gemini error full object fallback serialize:", String(error));
    }

    if (error.message === "GEMINI_API_KEY_MISSING") throw error;

    console.log("Fallback activated");
    const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');

    // Fallback Mock Data
    return {
      matchScore: 68,
      matchingSkills: ["Development methodology", "Problem solving", "Team collaboration"],
      missingSkills: ["Specific framework experience", "Niche tool proficiency"],
      atsKeywords: ["Software Engineer", "Developer", "Engineering"],
      suggestions: ["Align your project descriptions closer to the JD keywords", "Highlight certification achievements"],
      hiringProbability: "Medium",
      jobTitle: "Role Analysis",
      isFallback: true,
      fallbackReason: isQuotaError ? 'QUOTA_EXCEEDED' : 'GENERIC_FAILURE'
    };
  } finally {
    console.log(`--- Gemini JD Match Finished (${Date.now() - startTime}ms) ---`);
  }
}
