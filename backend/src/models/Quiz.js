const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [questionSchema],
    timeLimit: {
      type: Number,
      default: 30,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    sourceFile: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quiz", quizSchema);
