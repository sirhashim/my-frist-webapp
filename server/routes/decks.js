const express = require('express');
const router = express.Router();
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
    res.status(500).send('Server Error');
  }
});

// @route   POST api/decks
// @desc    Create a new deck
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  try {
    const newDeck = new Deck({
      name,
      description,
      userId: req.user.id
    });
    const deck = await newDeck.save();
    res.json(deck);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/decks/:id
// @desc    Update a deck
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, description } = req.body;

  try {
    let deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ msg: 'Deck not found' });

    // Make sure user owns deck
    if (deck.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description } },
      { new: true }
    );

    res.json(deck);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/decks/:id
// @desc    Delete a deck
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ msg: 'Deck not found' });

    // Make sure user owns deck
    if (deck.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Deck.findByIdAndRemove(req.params.id);

    // Also remove deckId from flashcards that belong to this deck
    await Flashcard.updateMany({ deckId: req.params.id }, { $unset: { deckId: '' } });

    res.json({ msg: 'Deck removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
