import { Request, Response } from "express";
import Problem from "../models/Problem";
import Progress from "../models/Progress";
import { CodeExecutionService } from "../services/codeExecutionService";
import { logger } from "../utils/logger";

export class CodeController {
  private codeExecutionService = new CodeExecutionService();

  executeCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, language, input } = req.body;

      if (!code || !language) {
        res.status(400).json({ message: "Code and language are required" });
        return;
      }

      const result = await this.codeExecutionService.executeCode(
        code,
        language,
        input || ""
      );

      res.json(result);
    } catch (error) {
      logger.error("Code execution error:", error);
      res.status(500).json({ message: "Failed to execute code" });
    }
  };

  submitSolution = async (req: Request, res: Response): Promise<void> => {
    try {
      const { problemId } = req.params;
      const { code, language } = req.body;

      if (!code || !language) {
        res.status(400).json({ message: "Code and language are required" });
        return;
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        res.status(404).json({ message: "Problem not found" });
        return;
      }

      const testResults = await this.codeExecutionService.runTestCases(
        code,
        language,
        problem.testCases.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }))
      );

      const isAccepted = testResults.passed === testResults.total;
      const status = isAccepted ? "solved" : "attempted";

      let progress = await Progress.findOne({
        userId: req.userId,
        problemId,
      });

      if (!progress) {
        progress = new Progress({
          userId: req.userId,
          problemId,
          status,
          difficulty: problem.difficulty,
          timeSpent: 0,
          attempts: 1,
        });
      } else {
        progress.status = status;
        progress.attempts += 1;
      }

      progress.submissions.push({
        code,
        language,
        timestamp: new Date(),
        result: isAccepted ? "accepted" : "wrong_answer",
      });

      if (isAccepted && !progress.solvedAt) {
        progress.solvedAt = new Date();
      }

      await progress.save();

      problem.stats.totalSubmissions += 1;
      if (isAccepted) {
        problem.stats.acceptedSubmissions += 1;
      }
      problem.stats.acceptance =
        (problem.stats.acceptedSubmissions / problem.stats.totalSubmissions) *
        100;
      await problem.save();

      res.json({
        status: isAccepted ? "accepted" : "wrong_answer",
        testResults,
        totalTests: testResults.total,
        passedTests: testResults.passed,
      });
    } catch (error) {
      logger.error("Submit solution error:", error);
      res.status(500).json({ message: "Failed to submit solution" });
    }
  };

  getProblem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { problemId } = req.params;

      const problem = await Problem.findById(problemId).select(
        "-solution -testCases"
      );
      if (!problem) {
        res.status(404).json({ message: "Problem not found" });
        return;
      }

      const progress = await Progress.findOne({
        userId: req.userId,
        problemId,
      });

      res.json({
        ...problem.toObject(),
        progress: progress
          ? {
              status: progress.status,
              attempts: progress.attempts,
              timeSpent: progress.timeSpent,
            }
          : null,
      });
    } catch (error) {
      logger.error("Get problem error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getProblems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { difficulty, category, tags, page = 1, limit = 20 } = req.query;

      const filter: any = { isActive: true };
      if (difficulty) filter.difficulty = difficulty;
      if (category) filter.category = category;
      if (tags) filter.tags = { $in: (tags as string).split(",") };

      const problems = await Problem.find(filter)
        .select("-solution -testCases")
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });

      const total = await Problem.countDocuments(filter);

      const problemsWithProgress = await Promise.all(
        problems.map(async (problem) => {
          const progress = await Progress.findOne({
            userId: req.userId,
            problemId: problem._id,
          });

          return {
            ...problem.toObject(),
            progress: progress
              ? {
                  status: progress.status,
                  attempts: progress.attempts,
                }
              : null,
          };
        })
      );

      res.json({
        problems: problemsWithProgress,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error("Get problems error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
}
