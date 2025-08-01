// client/src/pages/adminFlashcards.js
import { apiRequest } from '../api.js';
import { isAuthenticated, getUserData } from '../auth.js';

export const renderAdminFlashcardsPage = async (container) => {
  const user = getUserData();
  
  if (!isAuthenticated() || user.role !== 'admin') {
    container.innerHTML = '<p>You do not have permission to access this page.</p>';
    return;
  }

  container.innerHTML = `
    <section class="flashcards-management admin-dashboard">
      <div class="container">
        <h2>Admin Dashboard</h2>
        
        <div class="admin-tabs">
          <button id="tab-flashcards" class="tab-btn active">Manage Flashcards</button>
          <button id="tab-stats" class="tab-btn">User Statistics</button>
          <button id="tab-import" class="tab-btn">Bulk Import</button>
        </div>
        
        <div id="flashcards-panel" class="admin-panel active-panel">
          <div class="admin-controls">
            <button id="add-flashcard-btn" class="btn primary-btn">Add New Flashcard</button>
            <div class="filter-controls">
              <label for="specialty-filter">Filter by Specialty:</label>
              <select id="specialty-filter">
                <option value="all">All</option>
              </select>
            </div>
          </div>
          <div id="flashcards-list" class="flashcards-grid"></div>
        </div>
        
        <div id="stats-panel" class="admin-panel">
          <h3>User Statistics</h3>
          <div id="stats-container" class="stats-container">
            <p>Loading statistics...</p>
          </div>
        </div>
        
        <div id="import-panel" class="admin-panel">
          <h3>Bulk Import Flashcards</h3>
          <div class="import-form">
            <div class="form-group">
              <label for="import-data">Paste JSON data:</label>
              <textarea id="import-data" rows="10" placeholder='{"cards": [{"question": "Question 1", "answer": "Answer 1", "specialty": "Cardiology"}, ...]}'></textarea>
            </div>
            <button id="import-btn" class="btn primary-btn">Import Cards</button>
            <div id="import-result" class="result-message"></div>
          </div>
        </div>
        
        <!-- Add/Edit Flashcard Modal -->
        <div id="flashcard-modal" class="modal">
          <div class="modal-content">
            <span class="close-button">&times;</span>
            <h3 id="modal-title">Add New Flashcard</h3>
            <form id="flashcard-form">
              <div class="form-group">
                <label for="question">Question:</label>
                <input type="text" id="question" name="question" required>
              </div>
              <div class="form-group">
                <label for="answer">Answer:</label>
                <input type="text" id="answer" name="answer" required>
              </div>
              <div class="form-group">
                <label for="explanation">Explanation (Optional):</label>
                <textarea id="explanation" name="explanation"></textarea>
              </div>
              <div class="form-group">
                <label for="specialty">Specialty:</label>
                <input type="text" id="specialty" name="specialty" required>
              </div>
              <div class="form-group">
                <label for="image-upload">Image (Optional):</label>
                <input type="file" id="image-upload" name="image" accept="image/*">
                <div id="image-preview" class="image-preview"></div>
              </div>
              <input type="hidden" id="card-id">
              <button type="submit" class="btn primary-btn" id="save-flashcard-btn">Save Flashcard</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;

  // Get DOM elements
  const tabFlashcards = container.querySelector('#tab-flashcards');
  const tabStats = container.querySelector('#tab-stats');
  const tabImport = container.querySelector('#tab-import');
  
  const flashcardsPanel = container.querySelector('#flashcards-panel');
  const statsPanel = container.querySelector('#stats-panel');
  const importPanel = container.querySelector('#import-panel');
  
  const flashcardsListDiv = container.querySelector('#flashcards-list');
  const statsContainer = container.querySelector('#stats-container');
  const importDataTextarea = container.querySelector('#import-data');
  const importBtn = container.querySelector('#import-btn');
  const importResult = container.querySelector('#import-result');
  
  const addFlashcardBtn = container.querySelector('#add-flashcard-btn');
  const flashcardModal = container.querySelector('#flashcard-modal');
  const closeModalBtn = container.querySelector('.close-button');
  const flashcardForm = container.querySelector('#flashcard-form');
  const modalTitle = container.querySelector('#modal-title');
  const cardIdInput = container.querySelector('#card-id');
  const imageUploadInput = container.querySelector('#image-upload');
  const imagePreviewDiv = container.querySelector('#image-preview');
  const specialtyFilter = container.querySelector('#specialty-filter');

  let allFlashcards = []; // To store all fetched flashcards
  let currentEditingCard = null;
  let specialties = new Set();

  // Tab switching functionality
  const switchTab = (activeTab, activePanel) => {
    // Remove active class from all tabs and panels
    [tabFlashcards, tabStats, tabImport].forEach(tab => tab.classList.remove('active'));
    [flashcardsPanel, statsPanel, importPanel].forEach(panel => panel.classList.remove('active-panel'));
    
    // Add active class to selected tab and panel
    activeTab.classList.add('active');
    activePanel.classList.add('active-panel');
  };

  tabFlashcards.addEventListener('click', () => {
    switchTab(tabFlashcards, flashcardsPanel);
    fetchFlashcards(); // Refresh flashcards when tab is clicked
  });
  
  tabStats.addEventListener('click', () => {
    switchTab(tabStats, statsPanel);
    fetchStats(); // Fetch statistics when tab is clicked
  });
  
  tabImport.addEventListener('click', () => {
    switchTab(tabImport, importPanel);
  });

  // Fetch all flashcards (admin endpoint)
  const fetchFlashcards = async () => {
    try {
      const response = await apiRequest('/flashcards/admin/all');
      allFlashcards = response.docs || [];
      
      // Extract unique specialties for filter
      specialties = new Set();
      allFlashcards.forEach(card => {
        if (card.specialty) specialties.add(card.specialty);
      });
      
      // Update specialty filter options
      updateSpecialtyFilter();
      
      // Display all flashcards initially
      displayFlashcards(allFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      flashcardsListDiv.innerHTML = `<p class="error-message">Failed to load flashcards: ${error.message}</p>`;
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const stats = await apiRequest('/flashcards/admin/stats');
      displayStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      statsContainer.innerHTML = `<p class="error-message">Failed to load statistics: ${error.message}</p>`;
    }
  };

  // Update specialty filter options
  const updateSpecialtyFilter = () => {
    specialtyFilter.innerHTML = '<option value="all">All</option>';
    specialties.forEach(specialty => {
      const option = document.createElement('option');
      option.value = specialty;
      option.textContent = specialty;
      specialtyFilter.appendChild(option);
    });
  };

  // Filter flashcards by specialty
  const filterFlashcards = () => {
    const selectedSpecialty = specialtyFilter.value;
    const filteredCards = selectedSpecialty === 'all'
      ? allFlashcards
      : allFlashcards.filter(card => card.specialty === selectedSpecialty);
    displayFlashcards(filteredCards);
  };

  // Display flashcards in the grid
  const displayFlashcards = (cards) => {
    flashcardsListDiv.innerHTML = '';
    if (cards.length === 0) {
      flashcardsListDiv.innerHTML = '<p>No flashcards found. Add one!</p>';
      return;
    }
    
    cards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('flashcard-item');
      cardElement.innerHTML = `
        <h3>${card.question}</h3>
        <p>${card.answer}</p>
        ${card.specialty ? `<span class="specialty-tag">${card.specialty}</span>` : ''}
        ${card.imageUrl ? `<img src="http://localhost:5000${card.imageUrl}" alt="Flashcard Image" class="flashcard-image">` : ''}
        <div class="flashcard-actions">
          <button class="btn edit-btn" data-id="${card._id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn delete-btn" data-id="${card._id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      `;
      flashcardsListDiv.appendChild(cardElement);
    });

    // Add event listeners for edit and delete buttons
    container.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const cardId = e.target.dataset.id;
        const cardToEdit = allFlashcards.find(card => card._id === cardId);
        openModalForEdit(cardToEdit);
      });
    });

    container.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const cardId = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this flashcard?')) {
          await handleDeleteFlashcard(cardId);
        }
      });
    });
  };

  // Display user statistics
  const displayStats = (stats) => {
    if (!stats || stats.length === 0) {
      statsContainer.innerHTML = '<p>No statistics available.</p>';
      return;
    }

    let statsHTML = `
      <table class="stats-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Total Cards</th>
            <th>Success Rate</th>
            <th>Total Reviews</th>
            <th>Categories</th>
          </tr>
        </thead>
        <tbody>
    `;

    stats.forEach(user => {
      statsHTML += `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.totalCards}</td>
          <td>${user.avgSuccessRate ? user.avgSuccessRate.toFixed(2) + '%' : 'N/A'}</td>
          <td>${user.totalReviews || 0}</td>
          <td>${user.categoryCount || 0}</td>
        </tr>
      `;
    });

    statsHTML += '</tbody></table>';
    statsContainer.innerHTML = statsHTML;
  };

  // Modal functions
  const openModalForAdd = () => {
    modalTitle.textContent = 'Add New Flashcard';
    flashcardForm.reset();
    cardIdInput.value = '';
    currentEditingCard = null;
    imagePreviewDiv.innerHTML = '';
    flashcardModal.style.display = 'block';
  };

  const openModalForEdit = (card) => {
    modalTitle.textContent = 'Edit Flashcard';
    flashcardForm.elements.question.value = card.question;
    flashcardForm.elements.answer.value = card.answer;
    flashcardForm.elements.explanation.value = card.explanation || '';
    flashcardForm.elements.specialty.value = card.specialty || '';
    cardIdInput.value = card._id;
    currentEditingCard = card;
    imagePreviewDiv.innerHTML = card.imageUrl ? `<img src="http://localhost:5000${card.imageUrl}" class="image-preview-img">` : '';
    flashcardModal.style.display = 'block';
  };

  const closeModal = () => {
    flashcardModal.style.display = 'none';
    flashcardForm.reset();
    currentEditingCard = null;
    imagePreviewDiv.innerHTML = '';
  };

  // Handle save flashcard (create or update)
  const handleSaveFlashcard = async (e) => {
    e.preventDefault();
    const formData = new FormData(flashcardForm);
    const cardData = {
      question: formData.get('question'),
      answer: formData.get('answer'),
      explanation: formData.get('explanation'),
      specialty: formData.get('specialty'),
    };

    const imageFile = imageUploadInput.files[0];
    let imageUrl = currentEditingCard ? currentEditingCard.imageUrl : null;

    try {
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        const uploadResponse = await apiRequest('/upload/image', 'POST', uploadFormData, true);
        imageUrl = uploadResponse.imageUrl;
      }
      cardData.imageUrl = imageUrl;

      if (currentEditingCard) {
        await apiRequest(`/flashcards/admin/${cardIdInput.value}`, 'PUT', cardData);
      } else {
        await apiRequest('/flashcards/admin', 'POST', cardData);
      }
      closeModal();
      fetchFlashcards();
    } catch (error) {
      console.error('Error saving flashcard:', error);
      alert('Failed to save flashcard: ' + error.message);
    }
  };

  // Handle delete flashcard
  const handleDeleteFlashcard = async (cardId) => {
    try {
      await apiRequest(`/flashcards/admin/${cardId}`, 'DELETE');
      fetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Failed to delete flashcard: ' + error.message);
    }
  };

  // Handle bulk import
  const handleImport = async () => {
    try {
      const importData = JSON.parse(importDataTextarea.value);
      if (!importData.cards || !Array.isArray(importData.cards) || importData.cards.length === 0) {
        throw new Error('Invalid import data format. Expected {"cards": [...]}');
      }
      
      const response = await apiRequest('/flashcards/admin/import', 'POST', importData);
      importResult.textContent = `Successfully imported ${response.imported} flashcards.`;
      importResult.className = 'success-message';
      importDataTextarea.value = '';
    } catch (error) {
      console.error('Import error:', error);
      importResult.textContent = `Import failed: ${error.message}`;
      importResult.className = 'error-message';
    }
  };

  // Add event listeners
  addFlashcardBtn.addEventListener('click', openModalForAdd);
  closeModalBtn.addEventListener('click', closeModal);
  flashcardForm.addEventListener('submit', handleSaveFlashcard);
  specialtyFilter.addEventListener('change', filterFlashcards);
  importBtn.addEventListener('click', handleImport);

  // Image upload preview
  imageUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviewDiv.innerHTML = `<img src="${e.target.result}" class="image-preview-img">`;
      };
      reader.readAsDataURL(file);
    } else {
      imagePreviewDiv.innerHTML = '';
    }
  });

  // Initial data fetch
  fetchFlashcards();
};