// client/src/pages/dashboard.js
import { getUserData, logout } from '../auth.js';

export const renderDashboardPage = (container) => {
  const user = getUserData();
  container.innerHTML = `
    <section class="dashboard text-center">
      <div class="card-glass p-8">
        <h2 class="text-4xl font-bold mb-4">Welcome, ${user ? user.name : 'Guest'}!</h2>
        <p class="text-lg mb-8">Your journey to mastering medical knowledge starts now.</p>
        <div class="flex justify-center gap-4">
          <a href="#/flashcards" data-route="flashcards" class="btn btn-primary">Manage Decks</a>
          <a href="#/study" data-route="study" class="btn btn-secondary">Start Studying</a>
        </div>
      </div>
    </section>
  `;
};
