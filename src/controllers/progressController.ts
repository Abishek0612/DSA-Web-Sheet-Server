import { Request, Response } from "express";
import Progress from "../models/Progress";
import User from "../models/User";
import Topic from "../models/Topic";
import { logger } from "../utils/logger";

export class ProgressController {
  getUserProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId, status, difficulty } = req.query;

      const filter: any = { userId: req.userId };
      if (topicId) filter.topicId = topicId;
      if (status) filter.status = status;
      if (difficulty) filter.difficulty = difficulty;

      const progress = await Progress.find(filter)
        .populate("topicId", "name icon category")
        .sort({ lastAttempted: -1 });

      res.json(progress);
    } catch (error) {
      logger.error("Get user progress error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  updateProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId, problemId, status, timeSpent, notes, rating } = req.body;

      const topic = await Topic.findById(topicId);
      if (!topic) {
        res.status(404).json({ message: "Topic not found" });
        return;
      }

      const problem = topic.problems.id(problemId);
      if (!problem) {
        res.status(404).json({ message: "Problem not found" });
        return;
      }

      let progress = await Progress.findOne({
        userId: req.userId,
        topicId,
        problemId,
      });

      if (progress) {
        progress.status = status;
        progress.timeSpent += timeSpent || 0;
        progress.attempts += 1;
        progress.lastAttempted = new Date();
        if (notes) progress.notes = notes;
        if (rating) progress.rating = rating;
        if (status === "solved" && !progress.solvedAt) {
          progress.solvedAt = new Date();
        }
      } else {
        progress = new Progress({
          userId: req.userId,
          topicId,
          problemId,
          status,
          difficulty: problem.difficulty,
          timeSpent: timeSpent || 0,
          attempts: 1,
          lastAttempted: new Date(),
          notes,
          rating,
          solvedAt: status === "solved" ? new Date() : undefined,
        });
      }

      await progress.save();

      if (status === "solved") {
        await this.updateUserStatistics(req.userId, problem.difficulty);
      }

      logger.info(
        `Progress updated for user ${req.userId}: ${problemId} - ${status}`
      );
      res.json(progress);
    } catch (error) {
      logger.error("Update progress error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getProgressStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await Progress.aggregate([
        { $match: { userId: req.userId } },
        {
          $group: {
            _id: null,
            totalSolved: {
              $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] },
            },
            totalAttempted: {
              $sum: { $cond: [{ $eq: ["$status", "attempted"] }, 1, 0] },
            },
            easySolved: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "solved"] },
                      { $eq: ["$difficulty", "Easy"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            mediumSolved: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "solved"] },
                      { $eq: ["$difficulty", "Medium"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            hardSolved: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "solved"] },
                      { $eq: ["$difficulty", "Hard"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalTimeSpent: { $sum: "$timeSpent" },
            averageTimePerProblem: { $avg: "$timeSpent" },
          },
        },
      ]);

      const user = await User.findById(req.userId).select("statistics");
      const result = stats[0] || {
        totalSolved: 0,
        totalAttempted: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        totalTimeSpent: 0,
        averageTimePerProblem: 0,
      };

      res.json({
        ...result,
        currentStreak: user?.statistics?.currentStreak || 0,
        maxStreak: user?.statistics?.maxStreak || 0,
      });
    } catch (error) {
      logger.error("Get progress stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getDailyProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year } = req.params;
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);

      const dailyProgress = await Progress.aggregate([
        {
          $match: {
            userId: req.userId,
            solvedAt: { $gte: startDate, $lte: endDate },
            status: "solved",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$solvedAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const result = dailyProgress.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      res.json(result);
    } catch (error) {
      logger.error("Get daily progress error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getWeeklyProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const weeklyProgress = await Progress.aggregate([
        {
          $match: {
            userId: req.userId,
            status: "solved",
            solvedAt: {
              $gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              week: { $week: "$solvedAt" },
              year: { $year: "$solvedAt" },
            },
            count: { $sum: 1 },
            timeSpent: { $sum: "$timeSpent" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.week": 1 },
        },
      ]);

      res.json(weeklyProgress);
    } catch (error) {
      logger.error("Get weekly progress error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getMonthlyProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const monthlyProgress = await Progress.aggregate([
        {
          $match: {
            userId: req.userId,
            status: "solved",
            solvedAt: {
              $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$solvedAt" },
              year: { $year: "$solvedAt" },
            },
            count: { $sum: 1 },
            timeSpent: { $sum: "$timeSpent" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);

      res.json(monthlyProgress);
    } catch (error) {
      logger.error("Get monthly progress error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getTopicProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId } = req.params;

      const progress = await Progress.find({
        userId: req.userId,
        topicId,
      }).sort({ lastAttempted: -1 });

      const stats = {
        total: progress.length,
        solved: progress.filter((p) => p.status === "solved").length,
        attempted: progress.filter((p) => p.status === "attempted").length,
        pending: progress.filter((p) => p.status === "pending").length,
        totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
      };

      res.json({ progress, stats });
    } catch (error) {
      logger.error("Get topic progress error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  toggleBookmark = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId, problemId } = req.params;

      let progress = await Progress.findOne({
        userId: req.userId,
        topicId,
        problemId,
      });

      if (!progress) {
        const topic = await Topic.findById(topicId);
        const problem = topic?.problems.id(problemId);

        if (!problem) {
          res.status(404).json({ message: "Problem not found" });
          return;
        }

        progress = new Progress({
          userId: req.userId,
          topicId,
          problemId,
          difficulty: problem.difficulty,
          bookmarked: true,
        });
      } else {
        progress.bookmarked = !progress.bookmarked;
      }

      await progress.save();
      res.json({ bookmarked: progress.bookmarked });
    } catch (error) {
      logger.error("Toggle bookmark error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getBookmarks = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookmarks = await Progress.find({
        userId: req.userId,
        bookmarked: true,
      })
        .populate("topicId", "name icon category")
        .sort({ lastAttempted: -1 });

      res.json(bookmarks);
    } catch (error) {
      logger.error("Get bookmarks error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  submitSolution = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId, problemId } = req.params;
      const { code, language, result } = req.body;

      let progress = await Progress.findOne({
        userId: req.userId,
        topicId,
        problemId,
      });

      if (!progress) {
        const topic = await Topic.findById(topicId);
        const problem = topic?.problems.id(problemId);

        if (!problem) {
          res.status(404).json({ message: "Problem not found" });
          return;
        }

        progress = new Progress({
          userId: req.userId,
          topicId,
          problemId,
          difficulty: problem.difficulty,
        });
      }

      progress.submissions.push({
        code,
        language,
        timestamp: new Date(),
        result,
      });

      if (result === "accepted" && progress.status !== "solved") {
        progress.status = "solved";
        progress.solvedAt = new Date();
        await this.updateUserStatistics(req.userId, progress.difficulty);
      } else if (progress.status === "pending") {
        progress.status = "attempted";
      }

      progress.attempts += 1;
      progress.lastAttempted = new Date();

      await progress.save();
      res.json(progress);
    } catch (error) {
      logger.error("Submit solution error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId, problemId } = req.params;

      const progress = await Progress.findOne({
        userId: req.userId,
        topicId,
        problemId,
      });

      if (!progress) {
        res.status(404).json({ message: "No submissions found" });
        return;
      }

      res.json(progress.submissions);
    } catch (error) {
      logger.error("Get submissions error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  private updateUserStatistics = async (
    userId: string,
    difficulty: string
  ): Promise<void> => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      user.statistics.totalSolved += 1;

      switch (difficulty) {
        case "Easy":
          user.statistics.easySolved += 1;
          break;
        case "Medium":
          user.statistics.mediumSolved += 1;
          break;
        case "Hard":
          user.statistics.hardSolved += 1;
          break;
      }

      const today = new Date().toDateString();
      const lastSolvedDate = user.statistics.lastSolvedDate?.toDateString();

      if (lastSolvedDate === today) {
      } else if (
        lastSolvedDate ===
        new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      ) {
        user.statistics.currentStreak += 1;
      } else {
        user.statistics.currentStreak = 1;
      }

      if (user.statistics.currentStreak > user.statistics.maxStreak) {
        user.statistics.maxStreak = user.statistics.currentStreak;
      }

      user.statistics.lastSolvedDate = new Date();
      await user.save();
    } catch (error) {
      logger.error("Update user statistics error:", error);
    }
  };
}
