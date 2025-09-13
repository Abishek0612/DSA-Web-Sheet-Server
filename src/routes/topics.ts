import express from "express";
import Topic from "../models/Topic";
import Progress from "../models/Progress";
import { auth } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

// @route   GET /api/topics
// @desc    Get all topics with user progress
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { category, difficulty, search, sort = "order" } = req.query;

    // Build filter object
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search as string, "i")] } },
      ];
    }

    // Build sort object
    const sortObj: any = {};
    switch (sort) {
      case "name":
        sortObj.name = 1;
        break;
      case "difficulty":
        sortObj.totalProblems = -1;
        break;
      default:
        sortObj.order = 1;
    }

    const topics = await Topic.find(filter).sort(sortObj);

    // Get user progress for all topics
    const userProgress = await Progress.find({ userId: req.userId });
    const progressMap = new Map();

    userProgress.forEach((progress) => {
      const key = `${progress.topicId}-${progress.problemId}`;
      progressMap.set(key, progress);
    });

    // Enhance topics with progress data
    const enhancedTopics = topics.map((topic) => {
      const topicObj = topic.toObject();
      let solvedCount = 0;
      let totalCount = topicObj.problems.length;

      topicObj.problems = topicObj.problems.map((problem) => {
        const progressKey = `${topic._id}-${problem._id}`;
        const progress = progressMap.get(progressKey);

        if (progress?.status === "solved") {
          solvedCount++;
        }

        return {
          ...problem,
          progress: progress
            ? {
                status: progress.status,
                timeSpent: progress.timeSpent,
                attempts: progress.attempts,
                lastAttempted: progress.lastAttempted,
                rating: progress.rating,
              }
            : null,
        };
      });

      // Filter by difficulty if specified
      if (difficulty) {
        topicObj.problems = topicObj.problems.filter(
          (problem) => problem.difficulty.toLowerCase() === difficulty
        );
        totalCount = topicObj.problems.length;
        solvedCount = topicObj.problems.filter(
          (p) => p.progress?.status === "solved"
        ).length;
      }

      return {
        ...topicObj,
        progress: {
          solved: solvedCount,
          total: totalCount,
          percentage:
            totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0,
        },
      };
    });

    res.json(enhancedTopics);
  } catch (error) {
    logger.error("Get topics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/topics/:id
// @desc    Get single topic with problems
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Get user progress for this topic
    const userProgress = await Progress.find({
      userId: req.userId,
      topicId: req.params.id,
    });

    const progressMap = new Map();
    userProgress.forEach((progress) => {
      progressMap.set(progress.problemId, progress);
    });

    // Enhance problems with progress data
    const enhancedProblems = topic.problems.map((problem) => {
      const progress = progressMap.get(problem._id?.toString());
      return {
        ...problem.toObject(),
        progress: progress
          ? {
              status: progress.status,
              timeSpent: progress.timeSpent,
              attempts: progress.attempts,
              lastAttempted: progress.lastAttempted,
              notes: progress.notes,
              rating: progress.rating,
            }
          : null,
      };
    });

    res.json({
      ...topic.toObject(),
      problems: enhancedProblems,
    });
  } catch (error) {
    logger.error("Get topic error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/topics/categories/list
// @desc    Get all categories
// @access  Private
router.get("/categories/list", auth, async (req, res) => {
  try {
    const categories = await Topic.distinct("category", { isActive: true });
    res.json(categories);
  } catch (error) {
    logger.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
