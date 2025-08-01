// client/src/pages/pricing.js

export const renderPricingPage = (container) => {
  container.innerHTML = `
    <section class="page-section">
      <div class="container">
        <h2>Pricing</h2>
        <div class="pricing-grid">
          <div class="pricing-card">
            <h3>Free</h3>
            <p>Basic flashcards, limited quizzes, progress tracking</p>
            <span class="price">SAR 0</span>
            <a href="#/register" class="btn primary-btn">Get Started</a>
          </div>
          <div class="pricing-card featured">
            <h3>Pro</h3>
            <p>Unlimited flashcards, advanced analytics, mock exams</p>
            <span class="price">SAR 49/mo</span>
            <a href="#" class="btn primary-btn">Upgrade</a>
          </div>
        </div>
      </div>
    </section>
  `;
};
