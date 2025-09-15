const { GoogleGenAI } = require("@google/genai");
const { logger } = require("../utils/logger");

class AIService {
  constructor() {
    this.apiKeys = (process.env.GEMINI_API_KEY || "")
      .split(",")
      .filter(Boolean);
    this.currentApiKeyIndex = 0;
    this.genAI = null;

    if (this.apiKeys.length > 0) {
      this.initializeGenAI();
      logger.info(
        `AI Service initialized with ${this.apiKeys.length} API keys.`
      );
    } else {
      logger.warn("GEMINI_API_KEY not found - AI features will be disabled");
    }
  }

  initializeGenAI() {
    const apiKey = this.apiKeys[this.currentApiKeyIndex];
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
    } else {
      this.genAI = null;
    }
  }

  switchToNextApiKey() {
    this.currentApiKeyIndex =
      (this.currentApiKeyIndex + 1) % this.apiKeys.length;
    logger.warn(
      `Switching to new Gemini API key index: ${this.currentApiKeyIndex}`
    );
    this.initializeGenAI();
  }

  async makeApiCall(apiFunction) {
    if (!this.genAI) {
      throw new Error("AI service not configured");
    }

    let attempts = 0;
    while (attempts < this.apiKeys.length) {
      try {
        return await apiFunction();
      } catch (error) {
        logger.error(
          `Gemini API error with key index ${this.currentApiKeyIndex}:`,
          error.message
        );

        if (
          error.message.includes("API_KEY") ||
          error.message.includes("quota")
        ) {
          attempts++;
          if (attempts < this.apiKeys.length) {
            this.switchToNextApiKey();
          } else {
            logger.error("All Gemini API keys have failed.");
            throw new Error(
              "All available AI service API keys have failed. Please try again later."
            );
          }
        } else {
          throw error;
        }
      }
    }
    throw new Error(
      "Failed to get a response from the AI service after trying all keys."
    );
  }

  async generateResearch(topic, context) {
    const prompt = `
    As an expert in Data Structures and Algorithms, provide a comprehensive research on the following topic: "${topic}"
    Context: ${context || "General DSA learning"}
    Please provide:
    1. Brief overview and importance
    2. Key concepts and terminology
    3. Common use cases and applications
    4. Time and space complexity analysis
    5. Popular problems and examples
    6. Best practices and tips
    7. Related topics to explore
    8. Recommended learning resources
    Format the response in a clear, structured manner suitable for a student learning DSA.
    `;

    return this.makeApiCall(async () => {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      if (!response || !response.text) {
        throw new Error("Empty response from AI service");
      }
      return response.text;
    });
  }

  async generateProblems(settings) {
    const prompt = `
    Generate ${settings.count} coding problems for the following criteria:
    - Programming Language: ${settings.language}
    - Difficulty Level: ${settings.difficulty}
    - Topic/Category: ${settings.topic}
    For each problem, provide:
    1. Problem title, 2. Problem description, 3. Input/Output format, 4. Example test cases, 5. Constraints, 6. Hints for solution approach, 7. Expected time complexity, 8. Expected space complexity
    Format as JSON array.
    `;

    return this.makeApiCall(async () => {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      let text = response.text
        .replace(/```json\n?/, "")
        .replace(/```\n?$/, "")
        .trim();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.error("Failed to parse generated problems:", parseError);
        throw new Error("Failed to parse generated problems");
      }
    });
  }

  async chatWithAI(message, context) {
    const prompt = `
    You are a helpful DSA mentor. Context: ${context || "General DSA help"}
    User Question: ${message}
    Provide a helpful, accurate, and educational response.
    `;

    return this.makeApiCall(async () => {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text;
    });
  }

  async explainSolution(code, language, problemDescription) {
    const prompt = `
    Explain the following ${language} code solution in detail:
    ${problemDescription ? `Problem: ${problemDescription}\n\n` : ""}
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    Please provide:
    1. High-level approach explanation
    2. Step-by-step breakdown
    3. Time and space complexity analysis
    `;

    return this.makeApiCall(async () => {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text;
    });
  }

  async reviewCode(code, language, problemDescription) {
    const prompt = `
    Review the following ${language} code:
    ${problemDescription ? `Problem: ${problemDescription}\n\n` : ""}
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    Provide constructive feedback on correctness, performance, quality, and potential bugs.
    `;

    return this.makeApiCall(async () => {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text;
    });
  }

  async generateHint(problemDescription, difficulty, currentApproach) {
    const prompt = `
    Provide a helpful hint for the following problem:
    Problem: ${problemDescription}
    ${difficulty ? `Difficulty: ${difficulty}` : ""}
    ${currentApproach ? `Current approach: ${currentApproach}` : ""}
    Provide a hint that guides toward the solution without giving it away.
    `;

    return this.makeApiCall(async () => {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text;
    });
  }
}

module.exports = { AIService };
