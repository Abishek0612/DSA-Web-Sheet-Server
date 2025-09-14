import mongoose, { Document, Schema } from "mongoose";

export interface IProblemStandalone extends Document {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  tags: string[];
  companies: string[];
  links: {
    leetcode?: string;
    codeforces?: string;
    hackerrank?: string;
    geeksforgeeks?: string;
  };
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  hints: string[];
  editorial: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
    code: Array<{
      language: string;
      solution: string;
    }>;
  };
  stats: {
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptance: number;
    likes: number;
    dislikes: number;
  };
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblemStandalone>(
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
    constraints: [String],
    hints: [String],
    editorial: {
      approach: String,
      timeComplexity: String,
      spaceComplexity: String,
      explanation: String,
      code: [
        {
          language: String,
          solution: String,
        },
      ],
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

problemSchema.index({ title: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ tags: 1 });

export default mongoose.model<IProblemStandalone>("Problem", problemSchema);
