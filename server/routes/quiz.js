const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new quiz
router.post(
  '/',
  [
    auth,
    [
      body('questions', 'Questions are required').isArray({ min: 1 }),
      body('answers', 'Answers are required').isArray({ min: 1 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questions, answers, score, specialty } = req.body;
    const quiz = await Quiz.create({
      userId: req.user.id,
      questions,
      answers,
      score,
      specialty,
    });
    res.status(201).json(quiz);
  }
);

// Get all quizzes for user
router.get('/', auth, async (req, res) => {
  const quizzes = await Quiz.find({ userId: req.user.id });
  res.json(quizzes);
});

// Get quiz report by id
router.get('/:id', auth, async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
  if (!quiz) return res.status(404).json({ message: 'Not found' });
  res.json(quiz);
});

module.exports = router; 