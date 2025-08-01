const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Deck = require('../models/deck');
const auth = require('../middleware/auth'); // Assuming auth middleware exists
const Flashcard = require('../models/Flashcard');

// @route   GET api/decks
// @desc    Get all decks for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const decks = await Deck.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/decks
// @desc    Create a new deck
// @access  Private
router.post('/', [auth, [body('name', 'Name is required').not().isEmpty()]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;
  try {
    const newDeck = new Deck({
      name,
      description,
      userId: req.user.id,
    });
    const deck = await newDeck.save();
    res.json(deck);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT api/decks/:id
// @desc    Update a deck
// @access  Private
router.put('/:id', [auth, [body('name', 'Name is required').not().isEmpty()]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    let deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    // Make sure user owns deck
    if (deck.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    deck = await Deck.findByIdAndUpdate(req.params.id, { $set: { name, description } }, { new: true });

    res.json(deck);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE api/decks/:id
// @desc    Delete a deck
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    // Make sure user owns deck
    if (deck.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Deck.findByIdAndDelete(req.params.id);

    // Also remove deckId from flashcards that belong to this deck
    await Flashcard.updateMany({ deckId: req.params.id }, { $unset: { deckId: '' } });

    res.json({ message: 'Deck removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
