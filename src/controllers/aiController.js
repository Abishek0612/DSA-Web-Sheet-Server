const { AIService } = require("../services/aiService");
const { logger } = require("../utils/logger");

class AIController {
  constructor() {
    this.aiService = new AIService();
  }

  generateResearch = async (req, res) => {
    try {
      const { topic, context } = req.body;

      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const research = await this.aiService.generateResearch(topic, context);

      logger.info(
        `AI research generated for topic: ${topic} by user ${req.userId}`
      );

      res.json({
        topic,
        research,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("AI research error:", error);
      res.status(500).json({
        message: error.message || "Failed to generate research",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
    }
  };

  generateProblems = async (req, res) => {
    try {
      const { language, difficulty, topic, count = 5 } = req.body;

      if (!language || !difficulty || !topic) {
        return res.status(400).json({
          message: "Language, difficulty, and topic are required",
        });
      }

      const problems = await this.aiService.generateProblems({
        language,
        difficulty,
        topic,
        count,
      });

      logger.info(
        `Generated ${problems.length} problems for ${topic} - ${difficulty} by user ${req.userId}`
      );

      res.json({
        problems,
        criteria: { language, difficulty, topic, count },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Problem generation error:", error);
      res.status(500).json({
        message: error.message || "Failed to generate problems",
      });
    }
  };

  chatWithAI = async (req, res) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await this.aiService.chatWithAI(message, context);

      logger.info(`AI chat response generated for user ${req.userId}`);

      res.json({
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("AI chat error:", error);
      res.status(500).json({
        message: error.message || "Failed to get AI response",
      });
    }
  };

  explainSolution = async (req, res) => {
    try {
      const { code, language, problemDescription } = req.body;

      if (!code || !language) {
        return res
          .status(400)
          .json({ message: "Code and language are required" });
      }

      const explanation = await this.aiService.explainSolution(
        code,
        language,
        problemDescription
      );

      res.json({
        explanation,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Solution explanation error:", error);
      res.status(500).json({
        message: error.message || "Failed to explain solution",
      });
    }
  };

  reviewCode = async (req, res) => {
    try {
      const { code, language, problemDescription } = req.body;

      if (!code || !language) {
        return res
          .status(400)
          .json({ message: "Code and language are required" });
      }

      const review = await this.aiService.reviewCode(
        code,
        language,
        problemDescription
      );

      res.json({
        review,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Code review error:", error);
      res.status(500).json({
        message: error.message || "Failed to review code",
      });
    }
  };

  generateHint = async (req, res) => {
    try {
      const { problemDescription, difficulty, currentApproach } = req.body;

      if (!problemDescription) {
        return res
          .status(400)
          .json({ message: "Problem description is required" });
      }

      const hint = await this.aiService.generateHint(
        problemDescription,
        difficulty,
        currentApproach
      );

      res.json({
        hint,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Hint generation error:", error);
      res.status(500).json({
        message: error.message || "Failed to generate hint",
      });
    }
  };

  getChatHistory = async (req, res) => {
    try {
      const { limit = 50, page = 1 } = req.query;

      res.json({
        messages: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
        },
      });
    } catch (error) {
      logger.error("Get chat history error:", error);
      res.status(500).json({ message: "Failed to get chat history" });
    }
  };

  clearChatHistory = async (req, res) => {
    try {
      res.json({ message: "Chat history cleared successfully" });
    } catch (error) {
      logger.error("Clear chat history error:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  };
}

module.exports = { AIController };
