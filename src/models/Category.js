const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-F]{6}$/i,
    },
    order: {
      type: Number,
      required: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    topicCount: {
      type: Number,
      default: 0,
    },
    problemCount: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: 1,
    },
    prerequisites: [String],
    learningPath: [
      {
        topicId: {
          type: Schema.Types.ObjectId,
          ref: "Topic",
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
        isOptional: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ name: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ parentCategory: 1 });

module.exports = mongoose.model("Category", categorySchema);
