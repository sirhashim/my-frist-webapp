const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // Added index
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    imageUrl: String,
    specialty: String,
  }],
  answers: [{ type: String }],
  score: { type: Number },
  specialty: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);