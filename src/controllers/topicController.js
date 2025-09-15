const Topic = require("../models/Topic");
const Progress = require("../models/Progress");
const { logger } = require("../utils/logger");

class TopicController {
  getTopics = async (req, res) => {
    try {
      const { category, difficulty, search, sort = "order" } = req.query;

      const filter = { isActive: true };
      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const sortObj = {};
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

      const userProgress = await Progress.find({ userId: req.userId });
      const progressMap = new Map();

      userProgress.forEach((progress) => {
        const key = `${progress.topicId}-${progress.problemId}`;
        progressMap.set(key, progress);
      });

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
  };

  getTopicById = async (req, res) => {
    try {
      const topic = await Topic.findById(req.params.id);
      if (!topic) {
        res.status(404).json({ message: "Topic not found" });
        return;
      }

      const userProgress = await Progress.find({
        userId: req.userId,
        topicId: req.params.id,
      });

      const progressMap = new Map();
      userProgress.forEach((progress) => {
        progressMap.set(progress.problemId, progress);
      });

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
                bookmarked: progress.bookmarked,
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
  };

  getCategories = async (req, res) => {
    try {
      const categories = await Topic.distinct("category", { isActive: true });
      res.json(categories);
    } catch (error) {
      logger.error("Get categories error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  searchTopics = async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || typeof q !== "string") {
        res.status(400).json({ message: "Search query is required" });
        return;
      }

      const topics = await Topic.find({
        isActive: true,
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { tags: { $in: [new RegExp(q, "i")] } },
        ],
      })
        .limit(Number(limit))
        .select("name description icon category tags");

      res.json(topics);
    } catch (error) {
      logger.error("Search topics error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  createTopic = async (req, res) => {
    try {
      const topic = new Topic(req.body);
      await topic.save();

      logger.info(`Topic created: ${topic.name} by user ${req.userId}`);
      res.status(201).json(topic);
    } catch (error) {
      logger.error("Create topic error:", error);
      if (error.code === 11000) {
        res
          .status(400)
          .json({ message: "Topic with this name already exists" });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  };

  updateTopic = async (req, res) => {
    try {
      const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!topic) {
        res.status(404).json({ message: "Topic not found" });
        return;
      }

      logger.info(`Topic updated: ${topic.name} by user ${req.userId}`);
      res.json(topic);
    } catch (error) {
      logger.error("Update topic error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  deleteTopic = async (req, res) => {
    try {
      const topic = await Topic.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!topic) {
        res.status(404).json({ message: "Topic not found" });
        return;
      }

      logger.info(`Topic deleted: ${topic.name} by user ${req.userId}`);
      res.json({ message: "Topic deleted successfully" });
    } catch (error) {
      logger.error("Delete topic error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  addProblem = async (req, res) => {
    try {
      const topic = await Topic.findById(req.params.id);
      if (!topic) {
        res.status(404).json({ message: "Topic not found" });
        return;
      }

      const newProblem = req.body;
      topic.problems.push(newProblem);
      await topic.save();

      if (this.io) {
        this.io.emit("notification", {
          id: Date.now().toString(),
          type: "info",
          title: "New Problem Added! ",
          message: `A new ${newProblem.difficulty} problem "${newProblem.name}" has been added to ${topic.name}`,
          sound: true,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(
        `Problem added to topic: ${topic.name} by user ${req.userId}`
      );
      res.status(201).json(topic);
    } catch (error) {
      logger.error("Add problem error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  updateProblem = async (req, res) => {
    try {
      const { topicId, problemId } = req.params;

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

      Object.assign(problem, req.body);
      await topic.save();

      logger.info(
        `Problem updated in topic: ${topic.name} by user ${req.userId}`
      );
      res.json(topic);
    } catch (error) {
      logger.error("Update problem error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  deleteProblem = async (req, res) => {
    try {
      const { topicId, problemId } = req.params;

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

      problem.isActive = false;
      await topic.save();

      logger.info(
        `Problem deleted from topic: ${topic.name} by user ${req.userId}`
      );
      res.json({ message: "Problem deleted successfully" });
    } catch (error) {
      logger.error("Delete problem error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = { TopicController };
