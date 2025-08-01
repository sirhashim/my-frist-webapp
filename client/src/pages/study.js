// client/src/pages/study.js
import StudySession from '../components/flashcards/StudySession.js';
import { isAuthenticated } from '../auth.js';
import { apiRequest } from '../api.js';

export const renderStudyPage = (container) => {
  if (!isAuthenticated()) {
    container.innerHTML = '<p class="text-center text-lg">Please log in to start a study session.</p>';
    return;
  }

  container.innerHTML = `
    <section class="study-session flex flex-col items-center justify-center space-y-6">
      <h2 class="text-3xl font-bold">Study Session</h2>
      <div id="study-card-area" class="w-full max-w-2xl min-h-[400px] flex items-center justify-center">
        <div id="loading-indicator" class="text-lg">Loading cards... <i class="fas fa-spinner fa-spin"></i></div>
        <div id="no-cards-message" class="card-glass p-8 text-center" style="display:none;">
          <h3 class="text-2xl font-bold mb-4">All Caught Up!</h3>
          <p>No flashcards are due for review. Come back later!</p>
        </div>
        <div id="current-flashcard" class="card-glass p-6 w-full" style="display:none;">
          <div id="card-content" class="text-center">
            <div id="card-image-container" class="mb-4 max-h-48 w-full flex justify-center items-center"></div>
            <h3 id="card-question" class="text-2xl font-semibold"></h3>
          </div>
          <button id="reveal-answer-btn" class="mt-6 w-full btn btn-primary">Reveal Answer</button>
          <div id="answer-area" class="mt-6 text-center" style="display:none;">
            <div class="border-t border-light-border pt-4">
              <p id="card-answer" class="text-xl font-semibold"></p>
              <p id="card-explanation" class="text-sm opacity-80 mt-2"></p>
            </div>
            <div class="rating-controls mt-6">
              <p class="mb-2 font-medium">How well did you remember?</p>
              <div class="rating-buttons flex justify-center flex-wrap gap-2">
                <button class="btn btn-secondary rating-btn" data-quality="0">Forgot</button>
                <button class="btn btn-secondary rating-btn" data-quality="1">1</button>
                <button class="btn btn-secondary rating-btn" data-quality="2">2</button>
                <button class="btn btn-secondary rating-btn" data-quality="3">3</button>
                <button class="btn btn-secondary rating-btn" data-quality="4">4</button>
                <button class="btn btn-secondary rating-btn" data-quality="5">Easy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const loadingIndicator = container.querySelector('#loading-indicator');
  const noCardsMessage = container.querySelector('#no-cards-message');
  const currentFlashcardDiv = container.querySelector('#current-flashcard');
  const cardQuestion = container.querySelector('#card-question');
  const cardImageContainer = container.querySelector('#card-image-container');
  const revealAnswerBtn = container.querySelector('#reveal-answer-btn');
  const answerArea = container.querySelector('#answer-area');
  const cardAnswer = container.querySelector('#card-answer');
  const cardExplanation = container.querySelector('#card-explanation');
  const ratingButtons = container.querySelectorAll('.rating-btn');
  const studyCardArea = container.querySelector('#study-card-area');

  let flashcards = [];
  let currentCardIndex = 0;

  const fetchDueFlashcards = async () => {
    loadingIndicator.style.display = 'block';
    currentFlashcardDiv.style.display = 'none';
    noCardsMessage.style.display = 'none';
    try {
      const cards = await apiRequest('/flashcards?due=true');
      flashcards = cards.sort(() => Math.random() - 0.5); // Shuffle cards
      if (flashcards.length > 0) {
        currentCardIndex = 0;
        displayCurrentCard();
        currentFlashcardDiv.style.display = 'block';
      } else {
        noCardsMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Error fetching due flashcards:', error);
      noCardsMessage.textContent = 'Failed to load cards. Please try again later.';
      noCardsMessage.style.display = 'block';
    } finally {
      loadingIndicator.style.display = 'none';
    }
  };

  const displayCurrentCard = () => {
    const card = flashcards[currentCardIndex];
    cardQuestion.textContent = card.question;
    cardAnswer.textContent = card.answer;
    cardExplanation.textContent = card.explanation || '';
    if (card.imageUrl) {
      cardImageContainer.innerHTML = `<img src="http://localhost:5000${card.imageUrl}" class="max-h-48 object-contain rounded-lg">`;
      cardImageContainer.style.display = 'flex';
    } else {
      cardImageContainer.innerHTML = '';
      cardImageContainer.style.display = 'none';
    }
    answerArea.style.display = 'none';
    revealAnswerBtn.style.display = 'block';
  };

  const handleRevealAnswer = () => {
    answerArea.style.display = 'block';
    revealAnswerBtn.style.display = 'none';
  };

  const handleRating = async (quality) => {
    const card = flashcards[currentCardIndex];
    try {
      await apiRequest(`/flashcards/${card._id}/review`, 'POST', { quality });
    } catch (error) {
      console.error('Failed to update card review status:', error);
      alert('Could not save review for the last card. It will appear again next time.');
    }

    currentCardIndex++;
    if (currentCardIndex < flashcards.length) {
      displayCurrentCard();
    } else {
      studyCardArea.innerHTML = '<div class="card-glass p-8 text-center"><h3 class="text-2xl font-bold mb-4">Study Session Complete!</h3><p>You have reviewed all due cards for now. Great work!</p></div>';
    }
  };

  revealAnswerBtn.addEventListener('click', handleRevealAnswer);
  ratingButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const quality = parseInt(e.target.dataset.quality, 10);
      handleRating(quality);
    });
  });

  fetchDueFlashcards();
};
