const express = require('express');
const { body, validationResult } = require('express-validator');
const Flashcard = require('../models/Flashcard');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const mongoose = require('mongoose');

const router = express.Router();

// Middleware to verify flashcard ownership or admin access
const canAccessCard = async (req, res, next) => {
  try {
    const card = await Flashcard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });
    
    if (card.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    req.card = card;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get flashcards with filters
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, 
      tag, 
      due, 
      difficulty, 
      limit = 20, 
      page = 1,
      search = '',
      deckId = ''
    } = req.query;
    
    const filter = { 
      $or: [
        { userId: req.user.id },
        { isPublic: true }
      ]
    };
    
    // Apply filters
    if (category) filter.category = category;
    if (deckId) filter.deckId = deckId;
    if (tag) filter.tags = tag;
    if (difficulty) filter['sm2.difficulty'] = difficulty;
    
    // Due cards filter
    if (due === 'true') {
      filter.$or = [
        { 'sm2.nextReview': { $lte: new Date() } },
        { 'sm2.nextReview': { $exists: false } }
      ];
    }
    
    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }
    
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50),
      sort: { 'sm2.nextReview': 1, 'sm2.difficulty': 1 },
      lean: true
    };
    
    const result = await Flashcard.paginate(filter, options);
    
    // Add stats for the current user's cards
    const stats = await Flashcard.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { 
        $group: {
          _id: null,
          total: { $sum: 1 },
          due: { 
            $sum: { 
              $cond: [
                { $lte: ['$sm2.nextReview', new Date()] }, 
                1, 
                0 
              ] 
            } 
          },
          avgSuccessRate: { $avg: '$stats.successRate' },
          byCategory: { $push: { category: '$category', count: 1 } }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          due: 1,
          avgSuccessRate: { $round: ['$avgSuccessRate', 2] },
          categories: {
            $reduce: {
              input: '$byCategory',
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    existing: {
                      $filter: {
                        input: '$$value',
                        as: 'cat',
                        cond: { $eq: ['$$cat.category', '$$this.category'] }
                      }
                    }
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: '$$existing' }, 0] },
                      {
                        $map: {
                          input: '$$value',
                          as: 'cat',
                          in: {
                            $cond: [
                              { $eq: ['$$cat.category', '$$this.category'] },
                              { category: '$$cat.category', count: { $add: ['$$cat.count', 1] } },
                              '$$cat'
                            ]
                          }
                        }
                      },
                      { $concatArrays: ['$$value', [{ category: '$$this.category', count: 1 }]] }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]);
    
    res.json({
      ...result,
      stats: stats[0] || { total: 0, due: 0, avgSuccessRate: 0, categories: [] }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single flashcard
router.get('/:id', auth, canAccessCard, (req, res) => {
  res.json(req.card);
});

// Create a new flashcard
router.post(
  '/',
  [
    auth,
    [
      body('question', 'Question is required').not().isEmpty(),
      body('answer', 'Answer is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const cardData = {
        ...req.body,
        userId: req.user.id,
        'sm2.difficulty': 'good',
        'sm2.nextReview': new Date(),
      };

      const card = new Flashcard(cardData);
      await card.save();

      res.status(201).json(card);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Invalid data' });
    }
  }
);

// Update a flashcard
router.put(
  '/:id',
  [
    auth,
    canAccessCard,
    [
      body('question', 'Question is required').not().isEmpty(),
      body('answer', 'Answer is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ['question', 'answer', 'explanation', 'category', 'tags', 'isPublic', 'cardStyle'];
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
      }

      updates.forEach((update) => (req.card[update] = req.body[update]));
      await req.card.save();

      res.json(req.card);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Update failed' });
    }
  }
);

// Update card after review (SM-2 algorithm)
router.post('/:id/review', auth, canAccessCard, async (req, res) => {
  try {
    const { quality } = req.body; // 0-3 (again, hard, good, easy)
    
    if (quality === undefined || quality < 0 || quality > 3) {
      return res.status(400).json({ message: 'Invalid quality rating' });
    }
    
    // Update card using SM-2 algorithm
    await req.card.updateAfterReview(quality);
    
    res.json({ 
      message: 'Review recorded',
      nextReview: req.card.sm2.nextReview,
      interval: req.card.sm2.interval
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Review failed' });
  }
});

// Delete a flashcard
router.delete('/:id', auth, canAccessCard, async (req, res) => {
  try {
    await req.card.deleteOne();
    res.json({ message: 'Flashcard deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deletion failed' });
  }
});

// Admin routes
// Get all flashcards (admin only)
router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      sort: { createdAt: -1 },
      populate: 'userId',
      lean: true
    };
    
    const result = await Flashcard.paginate({}, options);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's statistics (admin only)
router.get('/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await Flashcard.aggregate([
      {
        $group: {
          _id: '$userId',
          totalCards: { $sum: 1 },
          avgSuccessRate: { $avg: '$stats.successRate' },
          totalReviews: { $sum: '$stats.reviews' },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalCards: 1,
          avgSuccessRate: { $round: ['$avgSuccessRate', 2] },
          totalReviews: 1,
          categoryCount: { $size: '$categories' }
        }
      },
      { $sort: { totalCards: -1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk import flashcards (admin only)
router.post('/admin/import', auth, adminAuth, async (req, res) => {
  try {
    const { cards, userId } = req.body;
    
    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ message: 'No cards provided' });
    }
    
    const processedCards = cards.map(card => ({
      ...card,
      userId: userId || req.user.id,
      'sm2.difficulty': 'good',
      'sm2.nextReview': new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await Flashcard.insertMany(processedCards);
    res.status(201).json({ imported: result.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Import failed' });
  }
});

module.exports = router;