// client/src/pages/home.js

export const renderHomePage = (container) => {
  container.innerHTML = `
    <section class="hero">
      <div class="container">
        <h1>Prepare for SCFHS Exams with Confidence</h1>
        <p>Interactive flashcards, adaptive quizzes, and progress tracking for medical students and healthcare professionals in Saudi Arabia.</p>
        <div class="hero-buttons">
          <a href="#/register" class="btn primary-btn">Get Started Free</a>
          <a href="#" class="btn secondary-btn">See Demo</a>
        </div>
      </div>
    </section>
  `;
};
