// client/src/pages/login.js
import { apiRequest } from '../api.js';
import { navigateTo } from '../router.js';
import { setAuthToken, setUserData } from '../auth.js';

export const renderLoginPage = (container) => {
  container.innerHTML = `
    <section class="auth-form">
      <h2 class="text-center text-3xl font-bold">Login</h2>
      <form id="login-form" class="space-y-6 mt-8">
        <div>
          <label for="email" class="block text-sm font-medium">Email</label>
          <input type="email" id="email" name="email" required class="mt-1">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium">Password</label>
          <input type="password" id="password" name="password" required class="mt-1">
        </div>
        <button type="submit" class="w-full btn btn-primary">Login</button>
        <div id="login-error" class="error-message text-red-400 text-center pt-2"></div>
      </form>
      <p class="mt-6 text-center text-sm">
        Don't have an account? 
        <a href="#/register" data-route="register" class="font-medium text-secondary hover:underline">Register</a>
      </p>
    </section>
  `;

  const loginForm = container.querySelector('#login-form');
  const loginError = container.querySelector('#login-error');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = loginForm.elements.email.value;
    const password = loginForm.elements.password.value;

    try {
      const data = await apiRequest('/auth/login', 'POST', { email, password });
      setAuthToken(data.token);
      setUserData(data.user);
      navigateTo('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      loginError.textContent = error.message;
    }
  });
};