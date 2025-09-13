import mongoose, { Document, Schema } from "mongoose";

export interface IProblem {
  _id?: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  links: {
    leetcode?: string;
    codeforces?: string;
    youtube?: string;
    article?: string;
  };
  tags: string[];
  companies: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  hints: string[];
  solution?: {
    approach: string;
    code: string;
    explanation: string;
  };
}

export interface ITopic extends Document {
  name: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  isActive: boolean;
  problems: IProblem[];
  totalProblems: number;
  estimatedTime: string;
  prerequisites: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>({
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
  },
});

const topicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true, unique: true },
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
  },
  {
    timestamps: true,
  }
);

// Update totalProblems before saving
topicSchema.pre("save", function (next) {
  this.totalProblems = this.problems.length;
  next();
});

export default mongoose.model<ITopic>("Topic", topicSchema);
