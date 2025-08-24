export class QuestionEditor {
  constructor(storageManager, onSave, onCancel) {
    this.storageManager = storageManager;
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.isEditing = false;
    this.currentQuestion = null;
  }

  // Show the editor for a new or existing question
  show(question = null) {
    this.currentQuestion = question;
    this.isEditing = !!question;
    return this.render();
  }

  render() {
    const question = this.currentQuestion || {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      category: '',
      difficulty: 'Easy',
      subject: ''
    };

    const html = `
      <article>
        <h2>${this.isEditing ? 'Edit Question' : 'Add New Question'}</h2>

        <form id="question-form">
          <!-- Question Text -->
          <div>
            <label for="question-text">Question:</label>
            <textarea
              id="question-text"
              rows="3"
              required
              placeholder="Enter your question here..."
            >${question.question}</textarea>
          </div>

          <!-- Options -->
          <div>
            <label>Answer Options:</label>
            <div id="options-container">
              ${question.options.map((option, index) => `
                <div class="option-row" style="margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <input
                      type="radio"
                      name="correct-answer"
                      value="${index}"
                      ${question.correctAnswer === index ? 'checked' : ''}
                      required
                    >
                    <input
                      type="text"
                      class="option-input"
                      placeholder="Option ${String.fromCharCode(65 + index)}"
                      value="${option}"
                      required
                    >
                    <button type="button" class="remove-option-btn" ${question.options.length <= 2 ? 'disabled' : ''}>Remove</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <button type="button" id="add-option-btn" style="margin-top: 1rem;">Add Option</button>
          </div>

          <!-- Metadata -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
            <div>
              <label for="category">Category:</label>
              <input
                type="text"
                id="category"
                placeholder="e.g., unit-2"
                value="${question.category}"
                required
              >
            </div>

            <div>
              <label for="difficulty">Difficulty:</label>
              <select id="difficulty" required>
                <option value="Easy" ${question.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
                <option value="Medium" ${question.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Hard" ${question.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
              </select>
            </div>

            <div>
              <label for="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                placeholder="e.g., CN"
                value="${question.subject}"
                required
              >
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" id="save-btn">Save Question</button>
            <button type="button" id="cancel-btn" class="secondary">Cancel</button>
          </div>
        </form>
      </article>
    `;

    return html;
  }

  bindEvents(container) {
    const form = container.querySelector('#question-form');
    const addOptionBtn = container.querySelector('#add-option-btn');
    const cancelBtn = container.querySelector('#cancel-btn');

    // Form submission
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave(container);
    });

    // Add option button
    addOptionBtn?.addEventListener('click', () => {
      this.addOption(container);
    });

    // Remove option buttons
    container.querySelectorAll('.remove-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const optionRow = e.target.closest('.option-row');
        if (optionRow) {
          this.removeOption(optionRow, container);
        }
      });
    });

    // Cancel button
    cancelBtn?.addEventListener('click', () => {
      this.onCancel();
    });
  }

  addOption(container) {
    const optionsContainer = container.querySelector('#options-container');
    const optionRows = optionsContainer.querySelectorAll('.option-row');
    const newIndex = optionRows.length;

    if (newIndex >= 6) { // Limit to 6 options
      alert('Maximum 6 options allowed');
      return;
    }

    const newOptionRow = document.createElement('div');
    newOptionRow.className = 'option-row';
    newOptionRow.style.marginBottom = '1rem';
    newOptionRow.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <input
          type="radio"
          name="correct-answer"
          value="${newIndex}"
          required
        >
        <input
          type="text"
          class="option-input"
          placeholder="Option ${String.fromCharCode(65 + newIndex)}"
          required
        >
        <button type="button" class="remove-option-btn">Remove</button>
      </div>
    `;

    optionsContainer.appendChild(newOptionRow);

    // Update remove buttons state
    this.updateRemoveButtons(container);

    // Re-bind events for the new option
    const removeBtn = newOptionRow.querySelector('.remove-option-btn');
    removeBtn.addEventListener('click', (e) => {
      this.removeOption(newOptionRow, container);
    });
  }

  removeOption(optionRow, container) {
    const optionsContainer = container.querySelector('#options-container');
    const optionRows = optionsContainer.querySelectorAll('.option-row');

    if (optionRows.length <= 2) {
      alert('Minimum 2 options required');
      return;
    }

    optionRow.remove();
    this.updateRemoveButtons(container);
    this.updateRadioButtonValues(container);
  }

  updateRemoveButtons(container) {
    const optionRows = container.querySelectorAll('.option-row');
    const removeButtons = container.querySelectorAll('.remove-option-btn');

    removeButtons.forEach(btn => {
      btn.disabled = optionRows.length <= 2;
    });
  }

  updateRadioButtonValues(container) {
    const radioButtons = container.querySelectorAll('input[type="radio"][name="correct-answer"]');
    radioButtons.forEach((radio, index) => {
      radio.value = index;
    });
  }

  handleSave(container) {
    const formData = new FormData(container.querySelector('#question-form'));

    // Get question text
    const questionText = container.querySelector('#question-text').value.trim();
    if (!questionText) {
      alert('Please enter a question');
      return;
    }

    // Get options
    const optionInputs = container.querySelectorAll('.option-input');
    const options = Array.from(optionInputs).map(input => input.value.trim());

    // Validate options
    if (options.some(option => !option)) {
      alert('All options must have text');
      return;
    }

    if (new Set(options).size !== options.length) {
      alert('All options must be unique');
      return;
    }

    // Get correct answer
    const correctAnswerRadio = container.querySelector('input[name="correct-answer"]:checked');
    if (!correctAnswerRadio) {
      alert('Please select the correct answer');
      return;
    }
    const correctAnswer = parseInt(correctAnswerRadio.value);

    // Get metadata
    const category = container.querySelector('#category').value.trim();
    const difficulty = container.querySelector('#difficulty').value;
    const subject = container.querySelector('#subject').value.trim();

    if (!category || !subject) {
      alert('Please fill in all metadata fields');
      return;
    }

    // Create question object
    const questionData = {
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      category: category,
      difficulty: difficulty,
      subject: subject
    };

    let result;
    if (this.isEditing) {
      // Update existing question
      result = this.storageManager.updateQuestion(this.currentQuestion.id, questionData);
    } else {
      // Add new question
      result = this.storageManager.addQuestion(questionData);
    }

    if (result) {
      alert(this.isEditing ? 'Question updated successfully!' : 'Question added successfully!');
      this.onSave();
    } else {
      alert('Error saving question. Please try again.');
    }
  }
}
