// client/src/pages/about.js

export const renderAboutPage = (container) => {
  container.innerHTML = `
    <section class="page-section">
      <div class="container">
        <h2>About MedFlashcards</h2>
        <p>MedFlashcards is designed to help medical students and healthcare professionals in Saudi Arabia prepare for SCFHS exams with confidence. Our platform combines expert content, adaptive learning, and smart progress tracking in a simple, modern interface.</p>
        <p>We believe in accessible, high-quality medical education for everyone.</p>
      </div>
    </section>
  `;
};
