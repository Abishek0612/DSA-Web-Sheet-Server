import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// @route   POST /api/ai/research
// @desc    Research a topic using Gemini AI
// @access  Private
router.post("/research", auth, async (req, res) => {
  try {
    const { topic, context } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    logger.info(`AI research generated for topic: ${topic}`);

    res.json({
      topic,
      research: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("AI research error:", error);
    res.status(500).json({ message: "Failed to generate research" });
  }
});

// @route   POST /api/ai/generate-problems
// @desc    Generate custom problems based on criteria
// @access  Private
router.post("/generate-problems", auth, async (req, res) => {
  try {
    const { language, difficulty, topic, count = 5 } = req.body;

    if (!language || !difficulty || !topic) {
      return res
        .status(400)
        .json({ message: "Language, difficulty, and topic are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Generate ${count} coding problems for the following criteria:
    - Programming Language: ${language}
    - Difficulty Level: ${difficulty}
    - Topic/Category: ${topic}
    
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
        "difficulty": "${difficulty}",
        "tags": ["tag1", "tag2"]
      }
    ]
    
    Ensure problems are unique, well-structured, and appropriate for the specified difficulty level.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to ensure valid JSON
    text = text
      .replace(/```json\n?/, "")
      .replace(/```\n?$/, "")
      .trim();

    try {
      const problems = JSON.parse(text);
      logger.info(
        `Generated ${problems.length} problems for ${topic} - ${difficulty}`
      );

      res.json({
        problems,
        criteria: { language, difficulty, topic, count },
        timestamp: new Date().toISOString(),
      });
    } catch (parseError) {
      logger.error("Failed to parse generated problems:", parseError);
      res.status(500).json({ message: "Failed to parse generated problems" });
    }
  } catch (error) {
    logger.error("Problem generation error:", error);
    res.status(500).json({ message: "Failed to generate problems" });
  }
});

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant
// @access  Private
router.post("/chat", auth, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    logger.info(`AI chat response generated for user ${req.userId}`);

    res.json({
      response: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("AI chat error:", error);
    res.status(500).json({ message: "Failed to get AI response" });
  }
});

export default router;
