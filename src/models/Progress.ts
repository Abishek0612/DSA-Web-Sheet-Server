import mongoose, { Document, Schema } from "mongoose";

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  problemId: string;
  status: "pending" | "attempted" | "solved";
  difficulty: "Easy" | "Medium" | "Hard";
  timeSpent: number; // in minutes
  attempts: number;
  lastAttempted: Date;
  solvedAt?: Date;
  notes?: string;
  solution?: string;
  rating?: number; // 1-5 stars
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
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastAttempted: {
      type: Date,
      default: Date.now,
    },
    solvedAt: Date,
    notes: String,
    solution: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
progressSchema.index({ userId: 1, topicId: 1, problemId: 1 }, { unique: true });

export default mongoose.model<IProgress>("Progress", progressSchema);
