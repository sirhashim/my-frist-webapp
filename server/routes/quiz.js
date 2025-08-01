const express = require('express');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new quiz
router.post('/', auth, async (req, res) => {
  const { questions, answers, score, specialty } = req.body;
  const quiz = await Quiz.create({
    userId: req.userId,
    questions,
    answers,
    score,
    specialty,
  });
  res.status(201).json(quiz);
});

// Get all quizzes for user
router.get('/', auth, async (req, res) => {
  const quizzes = await Quiz.find({ userId: req.userId });
  res.json(quizzes);
});

// Get quiz report by id
router.get('/:id', auth, async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.userId });
  if (!quiz) return res.status(404).json({ message: 'Not found' });
  res.json(quiz);
});

module.exports = router; 