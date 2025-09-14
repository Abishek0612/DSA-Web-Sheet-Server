import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIService } from "../services/aiService";
import { logger } from "../utils/logger";
import { rateLimiter } from "../middleware/rateLimiter";

export class AIController {
  private aiService = new AIService();
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  generateResearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topic, context } = req.body;

      if (!topic) {
        res.status(400).json({ message: "Topic is required" });
        return;
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
      res.status(500).json({ message: "Failed to generate research" });
    }
  };

  generateProblems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { language, difficulty, topic, count = 5 } = req.body;

      if (!language || !difficulty || !topic) {
        res
          .status(400)
          .json({ message: "Language, difficulty, and topic are required" });
        return;
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
      res.status(500).json({ message: "Failed to generate problems" });
    }
  };

  chatWithAI = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, context } = req.body;

      if (!message) {
        res.status(400).json({ message: "Message is required" });
        return;
      }

      const response = await this.aiService.chatWithAI(message, context);

      logger.info(`AI chat response generated for user ${req.userId}`);

      res.json({
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  };

  explainSolution = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, language, problemDescription } = req.body;

      if (!code || !language) {
        res.status(400).json({ message: "Code and language are required" });
        return;
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
      res.status(500).json({ message: "Failed to explain solution" });
    }
  };

  reviewCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, language, problemDescription } = req.body;

      if (!code || !language) {
        res.status(400).json({ message: "Code and language are required" });
        return;
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
      res.status(500).json({ message: "Failed to review code" });
    }
  };

  generateHint = async (req: Request, res: Response): Promise<void> => {
    try {
      const { problemDescription, difficulty, currentApproach } = req.body;

      if (!problemDescription) {
        res.status(400).json({ message: "Problem description is required" });
        return;
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
      res.status(500).json({ message: "Failed to generate hint" });
    }
  };

  getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 50, page = 1 } = req.query;

      // This would typically be stored in a database
      // For now, returning empty array as chat history is stateless
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

  clearChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      // This would typically clear chat history from database
      res.json({ message: "Chat history cleared successfully" });
    } catch (error) {
      logger.error("Clear chat history error:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  };
}
