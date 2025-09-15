const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    companies: [String],
    links: {
      leetcode: String,
      codeforces: String,
      hackerrank: String,
      geeksforgeeks: String,
    },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: String,
      },
    ],
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    constraints: [String],
    hints: [String],
    template: [
      {
        language: { type: String, required: true },
        code: { type: String, required: true },
      },
    ],
    solution: [
      {
        language: { type: String, required: true },
        code: { type: String, required: true },
        explanation: String,
      },
    ],
    editorial: {
      approach: String,
      timeComplexity: String,
      spaceComplexity: String,
      explanation: String,
    },
    stats: {
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      acceptance: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ tags: 1 });

module.exports = mongoose.model("Problem", problemSchema);
