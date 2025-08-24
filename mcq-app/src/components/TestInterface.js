export class TestInterface {
  constructor(storageManager, onBackToHome) {
    this.storageManager = storageManager;
    this.onBackToHome = onBackToHome;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.testStarted = false;
    this.testCompleted = false;
    this.startTime = null;
  }

  render() {
    if (!this.testStarted) {
      return this.renderSetup();
    } else if (this.testCompleted) {
      return this.renderResults();
    } else {
      return this.renderQuestion();
    }
  }

  renderSetup() {
    const categories = this.getUniqueCategories();
    const html = `
      <article>
        <h2>Take a Test</h2>
        <p>Configure your test settings and start practicing!</p>

        <form id="test-setup-form">
          <div style="max-width: 400px; margin: 0 auto;">
            <!-- Category Selection -->
            <div style="margin-bottom: 2rem;">
              <label for="test-category">Select Category:</label>
              <select id="test-category" required>
                <option value="all">All Categories</option>
                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>

            <!-- Difficulty Selection -->
            <div style="margin-bottom: 2rem;">
              <label for="test-difficulty">Select Difficulty:</label>
              <select id="test-difficulty" required>
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <!-- Number of Questions -->
            <div style="margin-bottom: 2rem;">
              <label for="num-questions">Number of Questions:</label>
              <input
                type="number"
                id="num-questions"
                min="1"
                max="50"
                value="10"
                required
              >
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 1rem; justify-content: center;">
              <button type="submit">Start Test</button>
              <button type="button" id="back-btn" class="secondary">Back</button>
            </div>
          </div>
        </form>
      </article>
    `;

    return html;
  }

  renderQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;

    const html = `
      <article>
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3>Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</h3>
            <div>
              <strong>Category:</strong> ${question.category} |
              <strong>Difficulty:</strong> ${question.difficulty}
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="width: 100%; height: 8px; background: var(--pico-border-color); border-radius: 4px; overflow: hidden;">
            <div style="width: ${progress}%; height: 100%; background: var(--pico-color-primary); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <div class="question-card">
          <h3>${question.question}</h3>

          <form id="question-form" style="margin-top: 2rem;">
            ${question.options.map((option, index) => `
              <div style="margin-bottom: 1rem;">
                <label style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px solid var(--pico-border-color); border-radius: var(--pico-border-radius); cursor: pointer;">
                  <input
                    type="radio"
                    name="answer"
                    value="${index}"
                    style="margin: 0;"
                    ${this.userAnswers[this.currentQuestionIndex] === index ? 'checked' : ''}
                  >
                  <span style="flex: 1;">
                    <strong>${String.fromCharCode(65 + index)}.</strong> ${option}
                  </span>
                </label>
              </div>
            `).join('')}
          </form>
        </div>

        <!-- Navigation -->
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button
            id="prev-btn"
            ${this.currentQuestionIndex === 0 ? 'disabled' : ''}
            class="secondary"
          >
            Previous
          </button>

          <div style="display: flex; gap: 1rem;">
            <button id="review-btn" class="secondary">Review Later</button>
            <button id="next-btn">
              ${this.currentQuestionIndex === this.questions.length - 1 ? 'Finish Test' : 'Next'}
            </button>
          </div>
        </div>

        <!-- Question Navigator -->
        <div style="margin-top: 2rem; padding: 1rem; background: var(--pico-background-color); border-radius: var(--pico-border-radius);">
          <h4>Jump to Question:</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 0.5rem; margin-top: 1rem;">
            ${this.questions.map((_, index) => `
              <button
                class="question-nav-btn ${this.getQuestionStatusClass(index)}"
                data-index="${index}"
                style="padding: 0.5rem; border: 2px solid var(--pico-border-color); border-radius: var(--pico-border-radius); background: ${this.currentQuestionIndex === index ? 'var(--pico-color-primary)' : 'transparent'}; color: ${this.currentQuestionIndex === index ? 'white' : 'var(--pico-color)'}"
              >
                ${index + 1}
              </button>
            `).join('')}
          </div>
        </div>
      </article>
    `;

    return html;
  }

  renderResults() {
    const score = this.calculateScore();
    const totalQuestions = this.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const timeSpent = this.calculateTimeSpent();

    const html = `
      <article>
        <h2>Test Results</h2>

        <!-- Score Summary -->
        <div style="text-align: center; margin-bottom: 3rem; padding: 2rem; background: var(--pico-background-color); border-radius: var(--pico-border-radius);">
          <h3 style="margin-bottom: 1rem;">${score}/${totalQuestions} Correct</h3>
          <div style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: ${this.getScoreColor(percentage)}">
            ${percentage}%
          </div>
          <div style="color: var(--pico-muted-color);">
            Time spent: ${timeSpent}
          </div>
        </div>

        <!-- Detailed Review -->
        <div>
          <h3>Detailed Review:</h3>
          ${this.questions.map((question, index) => `
            <div class="question-card" style="margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h4>Question ${index + 1}</h4>
                <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background: ${this.userAnswers[index] === question.correctAnswer ? 'var(--pico-color-green-600)' : 'var(--pico-color-red-600)'}; color: white;">
                  ${this.userAnswers[index] === question.correctAnswer ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <p style="font-weight: bold; margin-bottom: 1rem;">${question.question}</p>

              <div>
                ${question.options.map((option, optionIndex) => `
                  <div class="option-item ${this.getOptionClass(optionIndex, question.correctAnswer, this.userAnswers[index])}">
                    ${String.fromCharCode(65 + optionIndex)}. ${option}
                    ${optionIndex === question.correctAnswer ? ' ✓ (Correct Answer)' : ''}
                    ${optionIndex === this.userAnswers[index] && optionIndex !== question.correctAnswer ? ' ✗ (Your Answer)' : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin-top: 3rem;">
          <button id="retry-btn" style="margin-right: 1rem;">Take Another Test</button>
          <button id="home-btn" class="secondary">Back to Home</button>
        </div>
      </article>
    `;

    return html;
  }

  getUniqueCategories() {
    const questions = this.storageManager.getAllQuestions();
    return [...new Set(questions.map(q => q.category))];
  }

  getQuestionStatusClass(index) {
    if (this.userAnswers[index] !== undefined) {
      return 'answered';
    }
    return 'unanswered';
  }

  getOptionClass(optionIndex, correctAnswer, userAnswer) {
    if (optionIndex === correctAnswer) {
      return 'correct-answer';
    }
    if (optionIndex === userAnswer && userAnswer !== correctAnswer) {
      return 'wrong-answer';
    }
    return '';
  }

  getScoreColor(percentage) {
    // Create a smooth color gradient from red (0%) to green (100%)
    // Red: rgb(220, 38, 38) - var(--pico-color-red-600)
    // Orange: rgb(249, 115, 22) - var(--pico-color-orange-600)
    // Green: rgb(22, 163, 74) - var(--pico-color-green-600)

    if (percentage >= 80) {
      // Green to lighter green
      const intensity = (percentage - 80) / 20; // 0 to 1
      const r = Math.round(22 + (34 * intensity)); // 22 to 56
      const g = Math.round(163 + (92 * intensity)); // 163 to 255
      const b = Math.round(74 + (181 * intensity)); // 74 to 255
      return `rgb(${r}, ${g}, ${b})`;
    } else if (percentage >= 60) {
      // Orange to green
      const intensity = (percentage - 60) / 20; // 0 to 1
      const r = Math.round(249 + (22 - 249) * intensity); // 249 to 22
      const g = Math.round(115 + (163 - 115) * intensity); // 115 to 163
      const b = Math.round(22 + (74 - 22) * intensity); // 22 to 74
      return `rgb(${r}, ${g}, ${b})`;
    } else if (percentage >= 40) {
      // Red to orange
      const intensity = (percentage - 40) / 20; // 0 to 1
      const r = Math.round(220 + (249 - 220) * intensity); // 220 to 249
      const g = Math.round(38 + (115 - 38) * intensity); // 38 to 115
      const b = Math.round(38 + (22 - 38) * intensity); // 38 to 22
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Dark red to red
      const intensity = percentage / 40; // 0 to 1
      const r = Math.round(180 + (220 - 180) * intensity); // 180 to 220
      const g = Math.round(28 + (38 - 28) * intensity); // 28 to 38
      const b = Math.round(28 + (38 - 28) * intensity); // 28 to 38
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  bindEvents(container) {
    if (!this.testStarted) {
      this.bindSetupEvents(container);
    } else if (this.testCompleted) {
      this.bindResultsEvents(container);
    } else {
      this.bindQuestionEvents(container);
    }
  }

  bindSetupEvents(container) {
    const form = container.querySelector('#test-setup-form');
    const backBtn = container.querySelector('#back-btn');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.startTest(container);
    });

    backBtn?.addEventListener('click', () => {
      this.onBackToHome();
    });
  }

  bindQuestionEvents(container) {
    const nextBtn = container.querySelector('#next-btn');
    const prevBtn = container.querySelector('#prev-btn');
    const reviewBtn = container.querySelector('#review-btn');
    const form = container.querySelector('#question-form');
    const navButtons = container.querySelectorAll('.question-nav-btn');

    // Radio button changes
    form?.addEventListener('change', (e) => {
      if (e.target.type === 'radio') {
        this.userAnswers[this.currentQuestionIndex] = parseInt(e.target.value);
      }
    });

    // Navigation buttons
    nextBtn?.addEventListener('click', () => {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.updateQuestionDisplay(container);
      } else {
        this.finishTest(container);
      }
    });

    prevBtn?.addEventListener('click', () => {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.updateQuestionDisplay(container);
      }
    });

    reviewBtn?.addEventListener('click', () => {
      // Mark for later review (could add a review flag)
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.updateQuestionDisplay(container);
      }
    });

    // Question navigator
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.currentQuestionIndex = index;
        this.updateQuestionDisplay(container);
      });
    });
  }

  bindResultsEvents(container) {
    const retryBtn = container.querySelector('#retry-btn');
    const homeBtn = container.querySelector('#home-btn');

    retryBtn?.addEventListener('click', () => {
      this.resetTest();
      this.updateDisplay(container);
    });

    homeBtn?.addEventListener('click', () => {
      this.onBackToHome();
    });
  }

  startTest(container) {
    const category = container.querySelector('#test-category').value;
    const difficulty = container.querySelector('#test-difficulty').value;
    const numQuestions = parseInt(container.querySelector('#num-questions').value);

    // Get filtered questions
    let availableQuestions = this.storageManager.getAllQuestions();

    if (category !== 'all') {
      availableQuestions = availableQuestions.filter(q => q.category === category);
    }

    if (difficulty !== 'all') {
      availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
    }

    if (availableQuestions.length === 0) {
      alert('No questions available for the selected criteria. Please adjust your filters.');
      return;
    }

    // Shuffle and select questions
    this.questions = this.shuffleArray(availableQuestions).slice(0, Math.min(numQuestions, availableQuestions.length));
    this.currentQuestionIndex = 0;
    this.userAnswers = new Array(this.questions.length).fill(undefined);
    this.testStarted = true;
    this.startTime = Date.now();

    this.updateDisplay(container);
  }

  finishTest(container) {
    this.testCompleted = true;
    this.updateDisplay(container);
  }

  resetTest() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.testStarted = false;
    this.testCompleted = false;
    this.startTime = null;
  }

  calculateScore() {
    return this.userAnswers.reduce((score, answer, index) => {
      return score + (answer === this.questions[index].correctAnswer ? 1 : 0);
    }, 0);
  }

  calculateTimeSpent() {
    if (!this.startTime) return '0 seconds';
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  updateQuestionDisplay(container) {
    const contentDiv = container.querySelector('#content');
    if (contentDiv) {
      contentDiv.innerHTML = this.renderQuestion();
      this.bindEvents(container);
    }
  }

  updateDisplay(container) {
    const contentDiv = container.querySelector('#content');
    if (contentDiv) {
      contentDiv.innerHTML = this.render();
      this.bindEvents(container);
    }
  }
}
