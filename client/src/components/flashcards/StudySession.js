// client/src/components/flashcards/StudySession.js
import Flashcard3D from './Flashcard3D';
import { apiRequest } from '../../api';

class StudySession {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
      
    this.options = {
      category: null,
      limit: 20,
      autoStart: true,
      onSessionComplete: null,
      ...options
    };
    
    this.cards = [];
    this.currentIndex = 0;
    this.stats = { total: 0, due: 0, completed: 0, correct: 0, incorrect: 0 };
    this.init();
  }
  
  async init() {
    this.renderLoading();
    try {
      const params = new URLSearchParams({
        due: 'true',
        limit: this.options.limit,
        ...(this.options.category && { category: this.options.category })
      });
      
      const response = await apiRequest(`/api/flashcards?${params}`);
      this.cards = response.docs || [];
      this.stats = { ...this.stats, ...response.stats };
      
      if (this.cards.length === 0) {
        this.renderNoCards();
        return;
      }
      
      this.renderCard();
    } catch (error) {
      console.error('Failed to load flashcards:', error);
      this.renderError('Failed to load flashcards. Please try again.');
    }
  }
  
  renderLoading() {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="
          width: 40px; height: 40px; border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db; border-radius: 50%;
          margin: 0 auto 15px; animation: spin 1s linear infinite;
        "></div>
        Loading flashcards...
      </div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}</style>
    `;
  }
  
  renderNoCards() {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <h3>🎉 All Caught Up!</h3>
        <p>You've reviewed all your due cards. Great job!</p>
        <button id="start-new-session" style="
          background: #3498db; color: white; border: none;
          padding: 10px 20px; border-radius: 5px; cursor: pointer;
          margin-top: 15px;
        ">Start New Session</button>
      </div>
    `;
    
    document.getElementById('start-new-session')?.addEventListener('click', () => {
      this.currentIndex = 0;
      this.init();
    });
    
    this.options.onSessionComplete?.(this.stats);
  }
  
  renderError(message) {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #e74c3c;">
        <h3>⚠️ Something went wrong</h3>
        <p>${message}</p>
        <button id="retry-loading" style="
          background: #e74c3c; color: white; border: none;
          padding: 8px 16px; border-radius: 5px; cursor: pointer;
          margin-top: 15px;
        ">Try Again</button>
      </div>
    `;
    
    document.getElementById('retry-loading')?.addEventListener('click', () => this.init());
  }
  
  renderCard() {
    if (this.currentIndex >= this.cards.length) {
      this.renderNoCards();
      return;
    }
    
    const card = this.cards[this.currentIndex];
    this.container.innerHTML = '';
    
    const cardContainer = document.createElement('div');
    cardContainer.style.cssText = 'max-width: 600px; margin: 0 auto;';
    
    this.flashcard = new Flashcard3D(cardContainer, {
      width: '100%',
      height: 350,
      tilt: true,
      autoRotate: true
    });
    
    this.flashcard.setContent(
      `<div>${this.escapeHtml(card.question)}</div>`,
      `<div>${this.escapeHtml(card.answer)}</div>`
    );
    
    Flashcard3D.addReviewButtons(this.flashcard.backContent, async (difficulty) => {
      await this.handleReview(difficulty);
    });
    
    this.container.appendChild(cardContainer);
  }
  
  async handleReview(difficulty) {
    const card = this.cards[this.currentIndex];
    
    try {
      await apiRequest(`/api/flashcards/${card._id}/review`, 'POST', { quality: difficulty });
      this.stats.completed++;
      difficulty >= 2 ? this.stats.correct++ : this.stats.incorrect++;
      this.currentIndex++;
      setTimeout(() => this.renderCard(), 500);
    } catch (error) {
      console.error('Failed to update card:', error);
      alert('Failed to save your review. Please try again.');
    }
  }
  
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

export default StudySession;
