// client/src/pages/register.js
import { apiRequest } from '../api.js';
import { navigateTo } from '../router.js';

export const renderRegisterPage = (container) => {
  container.innerHTML = `
    <section class="auth-form">
      <h2 class="text-center text-3xl font-bold">Create Account</h2>
      <form id="register-form" class="space-y-6 mt-8">
        <div>
          <label for="name" class="block text-sm font-medium">Name</label>
          <input type="text" id="name" name="name" required class="mt-1">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium">Email</label>
          <input type="email" id="email" name="email" required class="mt-1">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium">Password</label>
          <input type="password" id="password" name="password" required class="mt-1">
        </div>
        <div>
          <label for="confirm-password" class="block text-sm font-medium">Confirm Password</label>
          <input type="password" id="confirm-password" name="confirm" required class="mt-1">
        </div>
        <button type="submit" class="w-full btn btn-primary">Register</button>
        <div id="register-error" class="error-message text-red-400 text-center pt-2"></div>
        <div id="register-success" class="success-message text-green-400 text-center pt-2"></div>
      </form>
      <p class="mt-6 text-center text-sm">
        Already have an account? 
        <a href="#/login" data-route="login" class="font-medium text-secondary hover:underline">Login</a>
      </p>
    </section>
  `;

  const registerForm = container.querySelector('#register-form');
  const registerError = container.querySelector('#register-error');
  const registerSuccess = container.querySelector('#register-success');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    registerSuccess.textContent = '';

    const name = registerForm.elements.name.value;
    const email = registerForm.elements.email.value;
    const password = registerForm.elements.password.value;
    const confirm = registerForm.elements.confirm.value;

    if (password !== confirm) {
      registerError.textContent = 'Passwords do not match';
      return;
    }

    try {
      await apiRequest('/auth/register', 'POST', { name, email, password });
      registerSuccess.textContent = 'Registration successful! Please login.';
      setTimeout(() => navigateTo('/login'), 2000);
    } catch (error) {
      registerError.textContent = error.message;
    }
  });
};