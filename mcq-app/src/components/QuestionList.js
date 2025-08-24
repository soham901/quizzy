export class QuestionList {
  constructor(storageManager, onEditQuestion) {
    this.storageManager = storageManager;
    this.onEditQuestion = onEditQuestion;
    this.filteredQuestions = [];
    this.currentFilter = 'all';
    this.searchTerm = '';
  }

  render() {
    const questions = this.storageManager.getAllQuestions();
    this.filteredQuestions = this.applyFilters(questions);

    const html = `
      <article class="question-management">
        <div class="header-section">
          <h2>Question Management</h2>
          <button id="add-question-btn" class="add-question-btn">+ Add Question</button>
        </div>

        <!-- Controls -->
        <div class="controls-section">
          <div class="filter-group">
            <div class="filter-item">
              <label for="search">Search:</label>
              <input type="text" id="search" placeholder="Search questions..." class="search-input">
            </div>

            <div class="filter-item">
              <label for="category-filter">Category:</label>
              <select id="category-filter" class="filter-select">
                <option value="all">All Categories</option>
                ${this.getUniqueCategories(questions).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>

            <div class="filter-item">
              <label for="difficulty-filter">Difficulty:</label>
              <select id="difficulty-filter" class="filter-select">
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="statistics-section">
          <h3>Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item"><strong>Total Questions:</strong> ${questions.length}</div>
            <div class="stat-item"><strong>Filtered:</strong> ${this.filteredQuestions.length}</div>
            <div class="stat-item"><strong>Categories:</strong> ${this.getUniqueCategories(questions).length}</div>
            <div class="stat-item"><strong>Easy:</strong> ${questions.filter(q => q.difficulty === 'Easy').length}</div>
            <div class="stat-item"><strong>Medium:</strong> ${questions.filter(q => q.difficulty === 'Medium').length}</div>
            <div class="stat-item"><strong>Hard:</strong> ${questions.filter(q => q.difficulty === 'Hard').length}</div>
          </div>
        </div>

        <!-- Questions List -->
        <div id="questions-container">
          ${this.renderQuestions()}
        </div>
      </article>
    `;

    return html;
  }

  renderQuestions() {
    if (this.filteredQuestions.length === 0) {
      return '<p style="text-align: center; padding: 2rem;">No questions found.</p>';
    }

    return this.filteredQuestions.map(question => `
      <div class="question-card">
        <div class="question-header">
          <div class="question-meta">
            <span class="meta-item"><strong>Category:</strong> ${question.category}</span>
            <span class="meta-item"><strong>Difficulty:</strong> ${question.difficulty}</span>
            <span class="meta-item"><strong>Subject:</strong> ${question.subject}</span>
          </div>
          <div class="question-actions">
            <button class="edit-btn secondary" data-id="${question.id}">Edit</button>
            <button class="delete-btn" data-id="${question.id}">Delete</button>
          </div>
        </div>

        <h4 class="question-text">${question.question}</h4>

        <div class="question-options">
          ${question.options.map((option, index) => `
            <div class="option-item ${index === question.correctAnswer ? 'correct-answer' : ''}">
              ${String.fromCharCode(65 + index)}. ${option} ${index === question.correctAnswer ? '✓' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  getUniqueCategories(questions) {
    return [...new Set(questions.map(q => q.category))];
  }

  applyFilters(questions) {
    let filtered = [...questions];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(term) ||
        q.options.some(option => option.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(q => q.category === this.currentFilter);
    }

    return filtered;
  }

  bindEvents(container) {
    // Search functionality
    const searchInput = container.querySelector('#search');
    searchInput?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.updateDisplay(container);
    });

    // Category filter
    const categoryFilter = container.querySelector('#category-filter');
    categoryFilter?.addEventListener('change', (e) => {
      this.currentFilter = e.target.value;
      this.updateDisplay(container);
    });

    // Add question button
    const addBtn = container.querySelector('#add-question-btn');
    addBtn?.addEventListener('click', () => {
      this.onEditQuestion(null); // null means new question
    });

    // Edit buttons
    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const question = this.storageManager.getAllQuestions().find(q => q.id === id);
        if (question) {
          this.onEditQuestion(question);
        }
      });
    });

    // Delete buttons
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this question?')) {
          this.storageManager.deleteQuestion(id);
          this.updateDisplay(container);
        }
      });
    });
  }

  updateDisplay(container) {
    const questionsContainer = container.querySelector('#questions-container');
    if (questionsContainer) {
      const questions = this.storageManager.getAllQuestions();
      this.filteredQuestions = this.applyFilters(questions);
      questionsContainer.innerHTML = this.renderQuestions();

      // Re-bind events for new elements
      this.bindEvents(container);
    }
  }
}
