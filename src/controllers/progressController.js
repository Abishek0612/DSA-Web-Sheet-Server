const Progress = require("../models/Progress");
const User = require("../models/User");
const Topic = require("../models/Topic");
const { logger } = require("../utils/logger");

class ProgressController {
  getUserProgress = async (req, res) => {
    try {
      const { topicId, status, difficulty } = req.query;

      const filter = { userId: req.userId };
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

  updateProgress = async (req, res) => {
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

      const oldStatus = progress?.status;

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

      if (status === "solved" && oldStatus !== "solved") {
        await this.updateUserStatistics(req.userId, problem.difficulty);

        const user = await User.findById(req.userId);

        if (this.io) {
          this.io.to(`user-${req.userId}`).emit("progress-updated", {
            type: "problem-solved",
            problemName: problem.name,
            topicName: topic.name,
            difficulty: problem.difficulty,
            userStats: user.statistics,
            timestamp: new Date().toISOString(),
          });

          this.io.to(`user-${req.userId}`).emit("notification", {
            id: Date.now().toString(),
            type: "success",
            title: "Problem Solved! 🎉",
            message: `Great job solving "${problem.name}"!`,
            sound: true,
            timestamp: new Date().toISOString(),
          });
        }
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

  getProgressStats = async (req, res) => {
    try {
      const user = await User.findById(req.userId);

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

  getDailyProgress = async (req, res) => {
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

  updateUserStatistics = async (userId, difficulty) => {
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

module.exports = { ProgressController };
