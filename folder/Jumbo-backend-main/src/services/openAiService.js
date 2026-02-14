const OpenAI = require("openai");
const { buildTaskPrompt } = require("../utils/aiPrompt");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeImagesByAi({ imagePath, title, description, category }) {
  try {
    const taskPrompt = buildTaskPrompt({
      category,
      title,
      description,
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: taskPrompt },
            {
              type: "input_image",
              image_url: imagePath,
            },
          ],
        },
      ],
    });
    const result = JSON.parse(response.output_text);

    return {
      verdict: result.verdict,
      severity: result.severity,
      issue: result.issue,
      reasoning: result.summary,
      confidence: result.confidence,
      raw: result,
      usage: response.usage,
    };
  } catch (error) {
    console.error("Vision Service Error:", error);
    throw new Error("Vision analysis failed");
  }
}

module.exports = { analyzeImagesByAi };
