require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Deck = require('./models/deck');
const Flashcard = require('./models/Flashcard');

const MONGO_URI = process.env.MONGO_URI;

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear previous data
    console.log('Clearing old test data...');
    const user = await User.findOne({ email: 'testuser@example.com' });
    if (user) {
      await Deck.deleteMany({ userId: user._id });
      await Flashcard.deleteMany({ userId: user._id });
      await User.deleteOne({ _id: user._id });
    }

    // 1. Create User
    console.log('Creating test user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const testUser = await User.create({
      name: 'testuser',
      email: 'testuser@example.com',
      password: hashedPassword
    });
    console.log('Test user created.');

    // 2. Create Decks
    console.log('Creating decks...');
    const deck1 = await Deck.create({ name: 'Arabic Vocabulary', description: 'Common words and phrases in Arabic.', userId: testUser._id });
    const deck2 = await Deck.create({ name: 'JavaScript Concepts', description: 'Core concepts of the JavaScript language.', userId: testUser._id });
    console.log('Decks created.');

    // 3. Create Flashcards
    console.log('Creating flashcards...');
    const flashcardsData = [
      { question: 'What is the capital of Iraq?', answer: 'Baghdad', category: 'general', userId: testUser._id },
      { question: 'What does \"كتاب\" mean in English?', answer: 'Book', category: 'languages', userId: testUser._id, deckId: deck1._id },
      { question: 'What is a JavaScript closure?', answer: 'A function that remembers its outer variables.', category: 'programming', userId: testUser._id, deckId: deck2._id },
      { question: 'What is the main purpose of HTML?', answer: 'To structure content on the web.', category: 'programming', userId: testUser._id, deckId: deck2._id },
      { question: 'What is 2 + 2?', answer: '4', category: 'general', userId: testUser._id }
    ];
    await Flashcard.insertMany(flashcardsData);
    console.log('Flashcards created.');

    console.log('--- Database Seeding Complete! ---');
    console.log('You can now log in with:');
    console.log('Email: testuser@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('An error occurred during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedDatabase();
