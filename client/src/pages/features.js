// client/src/pages/features.js

export const renderFeaturesPage = (container) => {
  container.innerHTML = `
    <section class="page-section">
      <div class="container">
        <h2>Platform Features</h2>
        <ul class="feature-list">
          <li><i class="fas fa-check-circle"></i> Interactive flashcards with questions, answers, and explanations</li>
          <li><i class="fas fa-check-circle"></i> Categorized by specialty (e.g., Internal Medicine, Pharmacy)</li>
          <li><i class="fas fa-check-circle"></i> Simple image support (anatomical diagrams, etc.)</li>
          <li><i class="fas fa-check-circle"></i> Spaced repetition (SM2 algorithm) for smart review scheduling</li>
          <li><i class="fas fa-check-circle"></i> Mock exams (SCFHS style) with timer and performance report</li>
          <li><i class="fas fa-check-circle"></i> Progress tracking dashboard</li>
          <li><i class="fas fa-check-circle"></i> Responsive, modern UI</li>
        </ul>
      </div>
    </section>
  `;
};
