// services/visionService.js
const fs = require("fs");
const axios = require("axios");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildTaskPrompt } = require("../utils/aiPrompt");

// OpenAI (primary)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Gemini (fallback #1)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // get from Google AI Studio
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Ollama (fallback #2, local)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "qwen2.5vl"; // or "llava:7b"

function readImageAsBase64(imagePath) {
  const buf = fs.readFileSync(imagePath);
  return buf.toString("base64");
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Model did not return valid JSON");
  }
}

// openai for cloud
async function analyzeWithOpenAI({ imagePath, taskPrompt }) {
  if (!openai) throw new Error("OpenAI not configured");

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: taskPrompt },
          {
            type: "input_image",
            image_url: imagePath.startsWith("http")
              ? imagePath
              : `data:image/jpeg;base64,${readImageAsBase64(imagePath)}`,
          },
        ],
      },
    ],
  });

  const result = safeJsonParse(response.output_text);
  return { provider: "openai", result, usage: response.usage };
}

// gemini for cloud
async function analyzeWithGemini({ imagePath, taskPrompt }) {
  if (!genAI) throw new Error("Gemini not configured");

  const base64 = imagePath.startsWith("http")
    ? null
    : readImageAsBase64(imagePath);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const parts = [
    { text: taskPrompt },
    imagePath.startsWith("http")
      ? {
          text:
            "Image is provided as a URL; please analyze based on the image content at this URL: " +
            imagePath,
        }
      : {
          inlineData: {
            data: base64,
            mimeType: "image/jpeg",
          },
        },
  ];

  const resp = await model.generateContent(parts);
  const text = resp.response.text();
  const result = safeJsonParse(text);

  return { provider: "gemini", result, usage: null };
}

// ollama for local
async function analyzeWithOllama({ imagePath, taskPrompt }) {
  const base64 = imagePath.startsWith("http")
    ? null
    : readImageAsBase64(imagePath);

  if (!base64) {
    throw new Error("Ollama fallback requires local image path (or implement URL download).");
  }

  const payload = {
    model: OLLAMA_VISION_MODEL,
    prompt: taskPrompt,
    stream: false,
    images: [base64],
    options: {
      temperature: 0.2,
    },
  };

  const { data } = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, payload, {
    timeout: 120000,
  });

  const result = safeJsonParse(data.response);
  return { provider: "ollama", result, usage: null };
}

async function analyzeImagesByAi({ imagePath, title, description, category }) {
  const taskPrompt = buildTaskPrompt({ category, title, description });

  const providers = [
    () => analyzeWithOpenAI({ imagePath, taskPrompt }),
    () => analyzeWithGemini({ imagePath, taskPrompt }),
    () => analyzeWithOllama({ imagePath, taskPrompt }),
  ];

  let lastError = null;

  for (const run of providers) {
    try {
      const { provider, result, usage } = await run();

      return {
        provider,
        verdict: result.verdict,
        severity: result.severity,
        issue: result.issue,
        reasoning: result.summary,
        confidence: result.confidence,
        raw: result,
        usage,
      };
    } catch (e) {
      lastError = e;
    }
  }

  console.error("All vision providers failed:", lastError);
  throw new Error("Vision analysis failed (all providers)");
}

module.exports = { analyzeImagesByAi };
