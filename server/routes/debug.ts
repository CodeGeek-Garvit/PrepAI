import express from 'express';
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

router.get('/ai-status', async (req, res) => {
  const status: any = {
    geminiKeyPresent: !!process.env.GEMINI_API_KEY,
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      status: 'ERROR',
      message: 'GEMINI_API_KEY is missing from environment variables.',
      diagnostics: status
    });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const startTime = Date.now();
    
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash-8b",
      contents: "Respond with 'OK'"
    });
    
    const latency = Date.now() - startTime;
    
    status.connectivity = 'SUCCESS';
    status.latencyMs = latency;
    status.modelResponse = result.text;

    res.json({
      status: 'HEALTHY',
      diagnostics: status
    });
  } catch (error: any) {
    console.error('[Debug] AI Status Check Failed:', error);
    status.connectivity = 'FAILED';
    status.error = error.message;
    
    res.status(500).json({
      status: 'UNHEALTHY',
      message: 'Gemini API connectivity check failed.',
      diagnostics: status
    });
  }
});

export default router;
