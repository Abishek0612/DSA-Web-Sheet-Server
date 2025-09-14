import mongoose, { Document, Schema } from "mongoose";

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  problemId: string;
  status: "pending" | "attempted" | "solved";
  difficulty: "Easy" | "Medium" | "Hard";
  timeSpent: number;
  attempts: number;
  lastAttempted: Date;
  solvedAt?: Date;
  notes?: string;
  solution?: string;
  rating?: number;
  bookmarked: boolean;
  submissions: Array<{
    code: string;
    language: string;
    timestamp: Date;
    result: "accepted" | "wrong_answer" | "time_limit" | "runtime_error";
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "attempted", "solved"],
      default: "pending",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAttempted: {
      type: Date,
      default: Date.now,
    },
    solvedAt: Date,
    notes: {
      type: String,
      maxlength: 1000,
    },
    solution: {
      type: String,
      maxlength: 10000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    submissions: [
      {
        code: String,
        language: String,
        timestamp: { type: Date, default: Date.now },
        result: {
          type: String,
          enum: ["accepted", "wrong_answer", "time_limit", "runtime_error"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

progressSchema.index({ userId: 1, topicId: 1, problemId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ userId: 1, lastAttempted: -1 });

export default mongoose.model<IProgress>("Progress", progressSchema);
