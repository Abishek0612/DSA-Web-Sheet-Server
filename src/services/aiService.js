const { GoogleGenAI } = require("@google/genai");
const { logger } = require("../utils/logger");

class AIService {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      logger.info("AI Service initialized successfully");
    } else {
      logger.warn("GEMINI_API_KEY not found - AI features will be disabled");
    }
  }

  async generateResearch(topic, context) {
    try {
      if (!this.genAI) {
        throw new Error("AI service not configured");
      }

      logger.info(`Generating research for topic: ${topic}`);

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

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (!response || !response.text) {
        throw new Error("Empty response from AI service");
      }

      logger.info("Research generated successfully");
      return response.text;
    } catch (error) {
      logger.error("AI research generation error:", error);

      if (error.message?.includes("API_KEY")) {
        throw new Error(
          "Invalid API key. Please check your GEMINI_API_KEY environment variable."
        );
      } else if (error.message?.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later.");
      } else if (error.message?.includes("model")) {
        throw new Error("Model not available. Please try again later.");
      }

      throw new Error("Failed to generate research. Please try again later.");
    }
  }

  async generateProblems(settings) {
    try {
      if (!this.genAI) {
        throw new Error("AI service not configured");
      }

      const prompt = `
Generate ${settings.count} coding problems for the following criteria:
- Programming Language: ${settings.language}
- Difficulty Level: ${settings.difficulty}
- Topic/Category: ${settings.topic}

For each problem, provide:
1. Problem title
2. Problem description
3. Input/Output format
4. Example test cases
5. Constraints
6. Hints for solution approach
7. Expected time complexity
8. Expected space complexity

Format as JSON array with the following structure:
[
  {
    "title": "Problem Title",
    "description": "Detailed problem description",
    "inputFormat": "Input format description",
    "outputFormat": "Output format description",
    "examples": [
      {
        "input": "sample input",
        "output": "sample output",
        "explanation": "explanation"
      }
    ],
    "constraints": ["constraint1", "constraint2"],
    "hints": ["hint1", "hint2"],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "difficulty": "${settings.difficulty}",
    "tags": ["tag1", "tag2"]
  }
]

Ensure problems are unique, well-structured, and appropriate for the specified difficulty level.
      `;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text;

      // Clean up the response to extract JSON
      text = text
        .replace(/```json\n?/, "")
        .replace(/```\n?$/, "")
        .trim();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.error("Failed to parse generated problems:", parseError);
        throw new Error("Failed to parse generated problems");
      }
    } catch (error) {
      logger.error("AI problem generation error:", error);
      throw new Error("Failed to generate problems");
    }
  }

  async chatWithAI(message, context) {
    try {
      if (!this.genAI) {
        throw new Error("AI service not configured");
      }

      const prompt = `
You are a helpful DSA (Data Structures and Algorithms) mentor and coding assistant. 
Context: ${context || "General DSA help"}

User Question: ${message}

Please provide a helpful, accurate, and educational response. If the question is about:
- Algorithm concepts: Explain clearly with examples
- Code problems: Provide approach and hints, not complete solutions
- Debugging: Help identify potential issues
- Best practices: Share industry-standard approaches

Keep responses concise but comprehensive. Use simple language and provide examples when helpful.
      `;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      logger.error("AI chat error:", error);
      throw new Error("Failed to get AI response");
    }
  }

  async explainSolution(code, language, problemDescription) {
    try {
      if (!this.genAI) {
        throw new Error("AI service not configured");
      }

      const prompt = `
Explain the following ${language} code solution in detail:

${problemDescription ? `Problem: ${problemDescription}\n\n` : ""}

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. High-level approach explanation
2. Step-by-step breakdown of the algorithm
3. Time and space complexity analysis
4. Key insights and optimizations
5. Alternative approaches if applicable

Make the explanation clear and educational for someone learning DSA.
      `;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      logger.error("AI solution explanation error:", error);
      throw new Error("Failed to explain solution");
    }
  }

  async reviewCode(code, language, problemDescription) {
    try {
      if (!this.genAI) {
        throw new Error("AI service not configured");
      }

      const prompt = `
Review the following ${language} code and provide constructive feedback:

${problemDescription ? `Problem: ${problemDescription}\n\n` : ""}

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Code correctness assessment
2. Performance analysis (time/space complexity)
3. Code quality and readability feedback
4. Potential bugs or edge cases
5. Suggestions for improvement
6. Best practices recommendations

Be constructive and educational in your feedback.
      `;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      logger.error("AI code review error:", error);
      throw new Error("Failed to review code");
    }
  }

  async generateHint(problemDescription, difficulty, currentApproach) {
    try {
      if (!this.genAI) {
        throw new Error("AI service not configured");
      }

      const prompt = `
Provide a helpful hint for the following problem:

Problem: ${problemDescription}
${difficulty ? `Difficulty: ${difficulty}` : ""}
${currentApproach ? `Current approach: ${currentApproach}` : ""}

Please provide a hint that:
1. Guides toward the solution without giving it away
2. Suggests the right data structure or algorithm approach
3. Highlights key insights needed
4. Is appropriate for the difficulty level
5. Encourages learning and problem-solving

Keep the hint concise and just enough to nudge in the right direction.
      `;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      logger.error("AI hint generation error:", error);
      throw new Error("Failed to generate hint");
    }
  }
}

module.exports = { AIService };
