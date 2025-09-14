const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  links: {
    leetcode: String,
    codeforces: String,
    youtube: String,
    article: String,
    editorial: String,
  },
  tags: [String],
  companies: [String],
  timeComplexity: String,
  spaceComplexity: String,
  hints: [String],
  solution: {
    approach: String,
    code: String,
    explanation: String,
    language: { type: String, default: "javascript" },
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const topicSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, required: true },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    problems: [problemSchema],
    totalProblems: { type: Number, default: 0 },
    estimatedTime: { type: String, required: true },
    prerequisites: [String],
    tags: [String],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
  },
  {
    timestamps: true,
  }
);

topicSchema.pre("save", function (next) {
  this.totalProblems = this.problems.filter((p) => p.isActive).length;
  next();
});

topicSchema.index({ name: 1 });
topicSchema.index({ category: 1 });
topicSchema.index({ order: 1 });

module.exports = mongoose.model("Topic", topicSchema);
