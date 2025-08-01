// client/src/pages/flashcards.js
import { apiRequest } from '../api.js';
import { isAuthenticated } from '../auth.js';

export const renderFlashcardsPage = async (container) => {
  if (!isAuthenticated()) {
    container.innerHTML = '<p class="text-center text-lg">Please log in to view your flashcards.</p>';
    return;
  }

  container.innerHTML = `
    <section class="flashcards-management space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold">My Flashcards</h2>
        <button id="add-flashcard-btn" class="btn btn-primary">Add New Flashcard</button>
      </div>

      <div class="card-glass p-4">
        <div class="filter-controls grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" id="search-input" placeholder="Search questions..." class="w-full">
            <select id="deck-filter"><option value="all">All Decks</option></select>
            <select id="specialty-filter"><option value="all">All Specialties</option></select>
        </div>
      </div>

      <div id="flashcards-list" class="flashcards-grid"></div>

      <!-- Add/Edit Flashcard Modal -->
      <div id="flashcard-modal" class="modal" style="display: none;">
        <div class="modal-content card-glass p-6">
          <span class="close-button font-bold text-2xl cursor-pointer absolute top-4 right-6">&times;</span>
          <h3 id="modal-title" class="text-2xl font-bold mb-6">Add New Flashcard</h3>
          <form id="flashcard-form" class="space-y-4">
            <div>
              <label for="question" class="block text-sm font-medium mb-1">Question</label>
              <input type="text" id="question" name="question" required>
            </div>
            <div>
              <label for="answer" class="block text-sm font-medium mb-1">Answer</label>
              <input type="text" id="answer" name="answer" required>
            </div>
            <div>
              <label for="explanation" class="block text-sm font-medium mb-1">Explanation (Optional)</label>
              <textarea id="explanation" name="explanation" rows="3"></textarea>
            </div>
            <div>
              <label for="specialty" class="block text-sm font-medium mb-1">Specialty</label>
              <input type="text" id="specialty" name="category" required>
            </div>
            <div>
              <label for="deck-select" class="block text-sm font-medium mb-1">Deck (Optional)</label>
              <select id="deck-select" name="deckId"><option value="">None</option></select>
            </div>
            <div>
              <label for="image-upload" class="block text-sm font-medium mb-1">Image (Optional)</label>
              <input type="file" id="image-upload" name="image" accept="image/*" class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-80">
              <div id="image-preview" class="mt-2 max-h-40 w-full overflow-hidden rounded-lg flex justify-center items-center"></div>
            </div>
            <input type="hidden" id="card-id">
            <button type="submit" class="w-full btn btn-primary">Save Flashcard</button>
          </form>
        </div>
      </div>
    </section>
  `;

  // --- Element Selectors ---
  const flashcardsListDiv = container.querySelector('#flashcards-list');
  const addFlashcardBtn = container.querySelector('#add-flashcard-btn');
  const flashcardModal = container.querySelector('#flashcard-modal');
  const closeModalBtn = container.querySelector('.close-button');
  const flashcardForm = container.querySelector('#flashcard-form');
  const modalTitle = container.querySelector('#modal-title');
  const imageUploadInput = container.querySelector('#image-upload');
  const imagePreviewDiv = container.querySelector('#image-preview');
  const searchInput = container.querySelector('#search-input');
  const deckFilter = container.querySelector('#deck-filter');
  const specialtyFilter = container.querySelector('#specialty-filter');
  const deckSelect = container.querySelector('#deck-select');

  let currentEditingCard = null;

  // --- Data Fetching and Rendering ---
  const fetchFlashcards = async () => {
    try {
      const searchQuery = searchInput.value;
      const deckId = deckFilter.value;
      const specialty = specialtyFilter.value;

      let url = '/flashcards?';
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (deckId !== 'all') url += `deckId=${deckId}&`;
      if (specialty !== 'all') url += `category=${encodeURIComponent(specialty)}&`;

      const cards = await apiRequest(url);
      renderFlashcards(cards);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
      flashcardsListDiv.innerHTML = '<p class="text-red-400 text-center">Error loading flashcards.</p>';
    }
  };

  const renderFlashcards = (cards) => {
    flashcardsListDiv.innerHTML = '';
    if (cards.length === 0) {
      flashcardsListDiv.innerHTML = '<p class="text-center text-lg col-span-full">No flashcards found. Add one to get started!</p>';
      return;
    }
    cards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card-glass p-4 flex flex-col h-full';
      cardElement.innerHTML = `
        <div class="flex-grow">
          ${card.imageUrl ? `<img src="http://localhost:5000${card.imageUrl}" alt="Flashcard Image" class="w-full h-40 object-cover rounded-lg mb-4">` : ''}
          <h3 class="font-bold text-lg mb-2">${card.question}</h3>
          <p class="text-sm opacity-80">${card.answer}</p>
        </div>
        <div class="mt-4 pt-4 border-t border-light-border flex justify-between items-center">
          <span class="text-xs font-semibold bg-secondary text-white px-2 py-1 rounded-full">${card.category || 'General'}</span>
          <div class="space-x-2">
            <button class="btn-icon edit-btn"><i class="fas fa-pencil-alt"></i></button>
            <button class="btn-icon delete-btn"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      `;
      cardElement.querySelector('.edit-btn').addEventListener('click', () => openModalForEdit(card));
      cardElement.querySelector('.delete-btn').addEventListener('click', () => handleDeleteFlashcard(card._id));
      flashcardsListDiv.appendChild(cardElement);
    });
  };

  const populateFilters = async () => {
    try {
      const [decks, specialties] = await Promise.all([
        apiRequest('/decks'),
        apiRequest('/flashcards/specialties')
      ]);

      deckFilter.innerHTML = '<option value="all">All Decks</option>';
      deckSelect.innerHTML = '<option value="">None</option>';
      decks.forEach(deck => {
        const option = document.createElement('option');
        option.value = deck._id;
        option.textContent = deck.name;
        deckFilter.appendChild(option.cloneNode(true));
        deckSelect.appendChild(option);
      });

      specialtyFilter.innerHTML = '<option value="all">All Specialties</option>';
      specialties.forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty;
        option.textContent = specialty;
        specialtyFilter.appendChild(option);
      });
    } catch (error) {
      console.error('Failed to populate filters:', error);
    }
  };

  // --- Modal Management ---
  const openModalForEdit = (card) => {
    currentEditingCard = card;
    modalTitle.textContent = 'Edit Flashcard';
    flashcardForm.elements.question.value = card.question;
    flashcardForm.elements.answer.value = card.answer;
    flashcardForm.elements.explanation.value = card.explanation || '';
    flashcardForm.elements.category.value = card.category || '';
    flashcardForm.elements.deckId.value = card.deckId || '';
    imagePreviewDiv.innerHTML = card.imageUrl ? `<img src="http://localhost:5000${card.imageUrl}" class="max-h-40 object-contain rounded-lg" alt="Image Preview">` : '';
    flashcardModal.style.display = 'flex';
  };

  const openModalForAdd = () => {
    currentEditingCard = null;
    modalTitle.textContent = 'Add New Flashcard';
    flashcardForm.reset();
    imagePreviewDiv.innerHTML = '';
    flashcardModal.style.display = 'flex';
  };

  const closeModal = () => {
    flashcardModal.style.display = 'none';
  };

  // --- API Actions ---
  const handleSaveFlashcard = async (event) => {
    event.preventDefault();
    const form = event.target;
    const imageFile = form.elements.image.files[0];
    let imageUrl = currentEditingCard ? currentEditingCard.imageUrl : undefined;

    if (imageFile && imageFile.size > 0) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        const uploadResponse = await apiRequest('/upload/user-image', 'POST', uploadFormData, true);
        imageUrl = uploadResponse.imageUrl;
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image. Please try again.');
        return;
      }
    }

    const cardData = {
      question: form.elements.question.value,
      answer: form.elements.answer.value,
      explanation: form.elements.explanation.value,
      category: form.elements.category.value,
      deckId: form.elements.deckId.value || null,
      imageUrl: imageUrl,
    };

    try {
      if (currentEditingCard) {
        await apiRequest(`/flashcards/${currentEditingCard._id}`, 'PUT', cardData);
      } else {
        await apiRequest('/flashcards', 'POST', cardData);
      }
      closeModal();
      fetchFlashcards();
      populateFilters(); // Repopulate filters in case a new specialty was added
    } catch (error) {
      console.error('Failed to save flashcard:', error);
      alert('Could not save the flashcard. Please check the fields and try again.');
    }
  };

  const handleDeleteFlashcard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
    try {
      await apiRequest(`/flashcards/${cardId}`, 'DELETE');
      fetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Failed to delete flashcard.');
    }
  };

  // --- Event Listeners ---
  addFlashcardBtn.addEventListener('click', openModalForAdd);
  closeModalBtn.addEventListener('click', closeModal);
  flashcardForm.addEventListener('submit', handleSaveFlashcard);
  window.addEventListener('click', (event) => {
    if (event.target === flashcardModal) closeModal();
  });

  imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviewDiv.innerHTML = `<img src="${e.target.result}" class="max-h-40 object-contain rounded-lg" alt="Image Preview">`;
      };
      reader.readAsDataURL(file);
    } else {
      imagePreviewDiv.innerHTML = '';
    }
  });

  let searchTimeout;
  searchInput.addEventListener('keyup', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchFlashcards, 300); // Debounce search
  });
  deckFilter.addEventListener('change', fetchFlashcards);
  specialtyFilter.addEventListener('change', fetchFlashcards);

  // --- Initial Load ---
  populateFilters();
  fetchFlashcards();
};