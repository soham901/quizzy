import { Capacitor } from "@capacitor/core";
import MCQApp from "./mcq-app.js";

// Load viva questions from the JSON file
async function loadVivaQuestions() {
  try {
    const response = await fetch('./data/DM_viva_Curated.json');
    const data = await response.json();
    // Flatten the questions from all units into a single array
    const allQuestions = data.units.flatMap(unit =>
      unit.vivaQuestions.map(q => ({ ...q, unit: unit.title }))
    );
    return { allQuestions, units: data.units };
  } catch (error) {
    console.error("Error loading viva questions:", error);
    return { allQuestions: [], units: [] };
  }
}

// Viva Practice Component
class VivaPractice {
  constructor() {
    this.questions = [];
    this.allQuestions = [];
    this.units = [];
    this.currentIndex = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.isAnswerVisible = false;
    this.selectedUnit = 'all'; // 'all' or unit title
  }

  async init() {
    const { allQuestions, units } = await loadVivaQuestions();
    this.allQuestions = allQuestions;
    this.units = units;

    // Load saved unit selection from localStorage if available
    const savedUnit = localStorage.getItem("vivaSelectedUnit");
    this.selectedUnit = savedUnit || 'all';

    // Filter questions based on unit selection
    this.filterQuestions();

    // Load saved index from localStorage if available
    const savedIndex = localStorage.getItem("vivaCurrentIndex");
    this.currentIndex = savedIndex ? parseInt(savedIndex) : 0;

    // Ensure index is within bounds
    if (this.currentIndex >= this.questions.length) {
      this.currentIndex = 0;
    }

    this.startTime = Date.now();
    this.render();
    this.startTimer();
  }

  filterQuestions() {
    if (this.selectedUnit === 'all') {
      this.questions = this.allQuestions;
    } else {
      this.questions = this.allQuestions.filter(q => q.unit === this.selectedUnit);
    }
  }

  saveCurrentIndex() {
    localStorage.setItem("vivaCurrentIndex", this.currentIndex.toString());
  }

  saveUnitSelection() {
    localStorage.setItem("vivaSelectedUnit", this.selectedUnit);
  }

  startTimer() {
    // Clear any existing timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Start new timer
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    const timerElement = document.getElementById("viva-timer");
    if (timerElement) {
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  selectUnit(unit) {
    this.selectedUnit = unit;
    this.saveUnitSelection();
    this.filterQuestions();
    this.currentIndex = 0;
    this.isAnswerVisible = false;
    this.saveCurrentIndex();
    this.render();
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.saveCurrentIndex();
      this.isAnswerVisible = false;
      this.render();
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.saveCurrentIndex();
      this.isAnswerVisible = false;
      this.render();
    }
  }

  toggleAnswer() {
    this.isAnswerVisible = !this.isAnswerVisible;
    const button = document.getElementById("showAnswerBtn");
    if (button) {
      button.innerHTML = this.isAnswerVisible
        ? '<i class="fas fa-eye-slash me-2"></i>Hide Answer'
        : '<i class="fas fa-eye me-2"></i>Show Answer';
    }
    this.renderAnswer();
  }

  renderAnswer() {
    const answerContainer = document.getElementById("answerContainer");
    if (answerContainer) {
      answerContainer.className = `answer-container mb-4 ${this.isAnswerVisible ? '' : 'd-none'}`;
    }
  }

  resetPractice() {
    if (confirm("Are you sure you want to reset your practice session?")) {
      this.currentIndex = 0;
      this.startTime = Date.now();
      this.isAnswerVisible = false;
      this.saveCurrentIndex();
      this.render();
      this.startTimer();
    }
  }

  renderUnitSelection() {
    const app = document.getElementById("app");

    app.innerHTML = `
      <div class="viva-practice card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="card-title mb-0">Viva Practice</h2>
            <div class="timer">
              <span class="badge bg-primary fs-6" id="viva-timer">00:00</span>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="mb-3">Select a Unit to Practice:</h4>
            <div class="list-group">
              <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center unit-select-btn" data-unit="all">
                <span>All Units</span>
                <span class="badge bg-primary rounded-pill">${this.allQuestions.length}</span>
              </button>
              ${this.units.map(unit => {
                const unitQuestions = this.allQuestions.filter(q => q.unit === unit.title);
                return `
                  <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center unit-select-btn" data-unit="${unit.title}">
                    <span>${unit.title}</span>
                    <span class="badge bg-secondary rounded-pill">${unitQuestions.length}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="d-flex">
            <button id="backToMain" class="btn btn-outline-secondary w-100">
              <i class="fas fa-home me-2"></i>Main Menu
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for unit selection
    document.querySelectorAll('.unit-select-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const unit = e.currentTarget.getAttribute('data-unit');
        this.selectUnit(unit);
      });
    });

    // Add event listener for back button
    document.getElementById("backToMain")?.addEventListener("click", () => {
      window.location.hash = "";
      window.location.reload();
    });

    // Update timer display
    this.updateTimer();
  }

  render() {
    const app = document.getElementById("app");

    // If no unit is selected, show unit selection screen
    if (!this.selectedUnit) {
      this.renderUnitSelection();
      return;
    }

    if (this.questions.length === 0) {
      app.innerHTML = `
        <div class="viva-practice card">
          <div class="card-body text-center">
            <h2 class="card-title">Viva Practice</h2>
            <p class="card-text">No questions available for the selected unit.</p>
            <div class="action-buttons mt-3">
              <button id="changeUnit" class="btn btn-primary">
                <i class="fas fa-exchange-alt me-2"></i>Change Unit
              </button>
              <button id="backToMain" class="btn btn-secondary">
                <i class="fas fa-home me-2"></i>Main Menu
              </button>
            </div>
          </div>
        </div>
      `;
      document.getElementById("changeUnit")?.addEventListener("click", () => {
        this.selectedUnit = null;
        this.renderUnitSelection();
      });
      document.getElementById("backToMain")?.addEventListener("click", () => {
        window.location.hash = "";
        window.location.reload();
      });
      return;
    }

    const question = this.questions[this.currentIndex];

    app.innerHTML = `
      <div class="viva-practice card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="card-title mb-0 d-none d-md-block">Viva Practice</h2>
            <div class="timer">
              <span class="badge bg-primary fs-6" id="viva-timer">00:00</span>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="question-info d-flex align-items-center">
              <span class="badge bg-secondary me-2">${question.unit}</span>
              <span class="badge bg-${this.getDifficultyClass(question.difficulty)}">${question.difficulty}</span>
            </div>
            <button id="changeUnit" class="btn btn-sm btn-outline-primary d-none d-md-inline-block">
              <i class="fas fa-exchange-alt me-1"></i>Change Unit
            </button>
          </div>

          <div class="question-container">
            <h4 class="question-text">
              <span class="question-number">${this.currentIndex + 1}.</span>
              ${this.escapeHtml(question.question)}
            </h4>
          </div>

          <div id="answerContainer" class="answer-container mb-4 ${this.isAnswerVisible ? '' : 'd-none'}">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Answer:</h5>
                <p class="card-text">${this.escapeHtml(question.answer)}</p>
              </div>
            </div>
          </div>

          <div class="navigation-buttons mb-3">
            <button id="prevBtn" class="btn btn-secondary" ${this.currentIndex === 0 ? 'disabled' : ''}>
              <i class="fas fa-arrow-left me-2"></i>Prev
            </button>

            <button id="showAnswerBtn" class="btn btn-info">
              ${this.isAnswerVisible ? '<i class="fas fa-eye-slash me-2"></i>Hide' : '<i class="fas fa-eye me-2"></i>Show'}
            </button>

            <button id="nextBtn" class="btn btn-primary" ${this.currentIndex === this.questions.length - 1 ? 'disabled' : ''}>
              Next<i class="fas fa-arrow-right ms-2"></i>
            </button>
          </div>

          <div class="progress mb-3">
            <div class="progress-bar" role="progressbar"
                 style="width: ${((this.currentIndex + 1) / this.questions.length) * 100}%"
                 aria-valuenow="${this.currentIndex + 1}"
                 aria-valuemin="0"
                 aria-valuemax="${this.questions.length}">
              ${this.currentIndex + 1} / ${this.questions.length}
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center flex-wrap">
            <button id="resetBtn" class="btn btn-outline-danger mb-2 mb-md-0">
              <i class="fas fa-redo me-2"></i>Reset
            </button>
            <div class="question-counter text-center mb-2 mb-md-0">
              Question ${this.currentIndex + 1} of ${this.questions.length}
            </div>
            <div class="d-flex gap-2">
              <button id="changeUnitMobile" class="btn btn-outline-primary d-md-none">
                <i class="fas fa-exchange-alt"></i>
              </button>
              <button id="backToMain" class="btn btn-outline-secondary">
                <i class="fas fa-home"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    document.getElementById("prevBtn")?.addEventListener("click", () => this.prevQuestion());
    document.getElementById("nextBtn")?.addEventListener("click", () => this.nextQuestion());
    document.getElementById("showAnswerBtn")?.addEventListener("click", () => this.toggleAnswer());
    document.getElementById("resetBtn")?.addEventListener("click", () => this.resetPractice());
    document.getElementById("changeUnit")?.addEventListener("click", () => this.renderUnitSelection());
    document.getElementById("changeUnitMobile")?.addEventListener("click", () => this.renderUnitSelection());
    document.getElementById("backToMain")?.addEventListener("click", () => {
      window.location.hash = "";
      window.location.reload();
    });

    // Update timer display
    this.updateTimer();
  }

  getDifficultyClass(difficulty) {
    switch (difficulty.toLowerCase()) {
      case "easy": return "success";
      case "medium": return "warning";
      case "hard": return "danger";
      default: return "secondary";
    }
  }

  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

export default VivaPractice;
