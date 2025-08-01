// main.js - Main JavaScript file for vanilla JS frontend
import './index.css';

import { renderHomePage } from './pages/home.js';
import { renderLoginPage } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderFlashcardsPage } from './pages/flashcards.js';
import { renderFeaturesPage } from './pages/features.js';
import { renderPricingPage } from './pages/pricing.js';
import { renderAboutPage } from './pages/about.js';
import { renderContactPage } from './pages/contact.js';
import { renderStudyPage } from './pages/study.js';
import { renderAdminFlashcardsPage } from './pages/adminFlashcards.js';

import { isAuthenticated, getUserData, logout } from './auth.js';

const contentArea = document.getElementById('content-area');
const navLinksContainer = document.querySelector('.nav-links');

const routes = {
  '#/': renderHomePage,
  '#': renderHomePage,
  '#/login': renderLoginPage,
  '#/register': renderRegisterPage,
  '#/dashboard': renderDashboardPage,
  '#/flashcards': renderFlashcardsPage,
  '#/features': renderFeaturesPage,
  '#/pricing': renderPricingPage,
  '#/about': renderAboutPage,
  '#/contact': renderContactPage,
  '#/study': renderStudyPage,
  '#/admin/flashcards': renderAdminFlashcardsPage,
  // Add other routes here as we build them
};

const protectedRoutes = ['#/dashboard', '#/flashcards', '#/study', '#/admin/flashcards']; // Routes that require authentication

const router = () => {
  const path = window.location.hash || '#/';

  if (protectedRoutes.includes(path) && !isAuthenticated()) {
    window.location.hash = '#/login'; // Redirect to login if not authenticated
    return;
  }

  const renderFunction = routes[path];
  if (renderFunction) {
    contentArea.innerHTML = ''; // Clear previous content
    renderFunction(contentArea); // Render new content
  } else {
    contentArea.innerHTML = '<h1>404 Page Not Found</h1>'; // Basic 404
  }
  updateNavbar();
};

const updateNavbar = () => {
  navLinksContainer.innerHTML = ''; // Clear existing links

  const createAndAppendLink = (linkInfo, isButton = false, buttonClasses = []) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = linkInfo.href;
    a.textContent = linkInfo.text;
    // Correctly set data-route for router. Home route is special.
    a.dataset.route = linkInfo.href === '#/' ? '' : linkInfo.href.substring(2);

    if (isButton) {
      a.classList.add('btn', ...buttonClasses);
    }
    
    li.appendChild(a);
    navLinksContainer.appendChild(li);
    return a; // Return the anchor element to attach special listeners if needed
  };

  if (isAuthenticated()) {
    const user = getUserData();
    // Logged-in user links
    createAndAppendLink({ href: '#/dashboard', text: 'Dashboard' });
    createAndAppendLink({ href: '#/flashcards', text: 'Decks' });
    createAndAppendLink({ href: '#/study', text: 'Study' });

    if (user && user.role === 'admin') {
      createAndAppendLink({ href: '#/admin/flashcards', text: 'Admin' });
    }

    // Logout Button
    const logoutButton = createAndAppendLink({ href: '#', text: 'Logout' }, true, ['btn-secondary']);
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent navigating to '#'
      logout();
    });

  } else {
    // Logged-out user links
    createAndAppendLink({ href: '#/', text: 'Home' });
    createAndAppendLink({ href: '#/features', text: 'Features' });
    createAndAppendLink({ href: '#/pricing', text: 'Pricing' });

    // Auth buttons
    createAndAppendLink({ href: '#/login', text: 'Login' }, true, ['btn-secondary']);
    createAndAppendLink({ href: '#/register', text: 'Register' }, true, ['btn-primary']);
  }

};

// Use event delegation for nav links
navLinksContainer.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    const href = e.target.getAttribute('href');
    // Let the browser handle hash changes for normal links
    if (href && href !== '#') {
      // The 'hashchange' event will trigger the router
      return;
    }
    // Handle special cases like logout here if they don't have their own listeners
  }
});


// Listen for hash changes
window.addEventListener('hashchange', router);

// Initial route load
window.addEventListener('load', () => {
  router();
  updateNavbar(); // Initial navbar update
});

console.log("Vanilla JavaScript frontend loaded!");