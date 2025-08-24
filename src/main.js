import './style.css';
import './pwa.js';

// DOM Elements
const app = document.getElementById('app');

// State
let questions = JSON.parse(localStorage.getItem('mcqQuestions')) || [];
let currentQuestionIndex = 0;
let userAnswers = [];
let testMode = 'view'; // view, test, edit, subjectSelect, topicSelect
let selectedSubject = '';
let selectedCategory = '';
let filteredQuestions = [];

// Initialize the app
function init() {
  loadQuestions();
  loadSampleData(); // Load sample data if no questions exist
  render();
}

// Load questions from localStorage
function loadQuestions() {
  const stored = localStorage.getItem('mcqQuestions');
  if (stored) {
    questions = JSON.parse(stored);
  }
}

// Load sample data if no questions exist
function loadSampleData() {
  if (questions.length === 0) {
    // Load both JSON files when no initial data exists
    Promise.all([
      fetch('/data/cn/unit-2.json').then(response => response.json()),
      fetch('/data/cn/unit-3.json').then(response => response.json())
    ])
    .then(([unit2Data, unit3Data]) => {
      questions = questions.concat(unit2Data, unit3Data);
      saveQuestions();
      render();
    })
    .catch(error => {
      console.log('Error loading sample data:', error);
    });
  }
}

// Save questions to localStorage
function saveQuestions() {
  localStorage.setItem('mcqQuestions', JSON.stringify(questions));
}

// Clear all questions from localStorage
function clearDatabase() {
  if (confirm('Are you sure you want to clear all questions? This action cannot be undone.')) {
    questions = [];
    localStorage.removeItem('mcqQuestions');
    render();
  }
}

// Render the app based on current mode
function render() {
  switch(testMode) {
    case 'test':
      renderTest();
      break;
    case 'edit':
      renderEdit();
      break;
    case 'subjectSelect':
      renderSubjectSelect();
      break;
    case 'topicSelect':
      renderTopicSelect();
      break;
    default:
      renderView();
  }
}

// Get unique subjects from questions
function getUniqueSubjects() {
  const subjects = [...new Set(questions.map(q => q.subject))];
  return subjects.filter(s => s); // Filter out empty/null values
}

// Get unique categories for a subject
function getUniqueCategories(subject) {
  const categories = [...new Set(questions.filter(q => q.subject === subject).map(q => q.category))];
  return categories.filter(c => c); // Filter out empty/null values
}

// View mode - list questions and options
function renderView() {
  app.innerHTML = `
    <div class="actions">
      <button id="startTest">Start Full Test</button>
      <button id="startSubjectTest">Start Subject-wise Test</button>
      <button id="startTopicTest">Start Topic-wise Test</button>
      <button id="editQuestions">Edit Questions</button>
      <button id="addQuestion">Add Question</button>
      <button id="exportQuestions">Export Questions</button>
      <input type="file" id="importQuestions" accept=".json" style="display: none;">
      <button id="importButton">Import Questions</button>
      <button id="clearDatabase">Clear Database</button>
    </div>
    <div class="stats">
      <p>Total Questions: ${questions.length}</p>
    </div>
    <div class="questions-list">
      ${questions.map((q, index) => `
        <div class="question-card">
          <h3>Question ${index + 1}: ${q.question}</h3>
          <div class="options">
            ${q.options.map((option, i) => `
              <div class="option ${i === q.correctAnswer ? 'correct' : ''}">
                <strong>${String.fromCharCode(65 + i)}.</strong> ${option}
              </div>
            `).join('')}
          </div>
          <div class="question-meta">
            <span>Category: ${q.category}</span>
            <span>Difficulty: ${q.difficulty}</span>
            <span>Subject: ${q.subject}</span>
          </div>
          <div class="question-actions">
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Add event listeners
  document.getElementById('startTest')?.addEventListener('click', startTest);
  document.getElementById('startSubjectTest')?.addEventListener('click', () => {
    testMode = 'subjectSelect';
    render();
  });
  document.getElementById('startTopicTest')?.addEventListener('click', () => {
    testMode = 'subjectSelect';
    selectedSubject = '';
    render();
  });
  document.getElementById('editQuestions')?.addEventListener('click', () => {
    testMode = 'edit';
    render();
  });
  document.getElementById('addQuestion')?.addEventListener('click', addQuestion);
  document.getElementById('exportQuestions')?.addEventListener('click', exportQuestions);
  document.getElementById('importButton')?.addEventListener('click', () => {
    document.getElementById('importQuestions').click();
  });
  document.getElementById('importQuestions')?.addEventListener('change', importQuestions);
  document.getElementById('clearDatabase')?.addEventListener('click', clearDatabase);

  // Add event listeners for edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      editQuestion(index);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deleteQuestion(index);
    });
  });
}

// Subject selection view
function renderSubjectSelect() {
  const subjects = getUniqueSubjects();

  const isTopicMode = testMode === 'topicSelect' || (testMode === 'subjectSelect' && selectedSubject !== '');

  app.innerHTML = `
    <div class="subject-select">
      <h2>${isTopicMode ? 'Select Subject for Topic-wise Test' : 'Select Subject'}</h2>
      <div class="subjects-list">
        ${subjects.map(subject => `
          <div class="subject-card">
            <h3>${subject}</h3>
            <p>${questions.filter(q => q.subject === subject).length} questions</p>
            <button class="select-subject" data-subject="${subject}">Select</button>
          </div>
        `).join('')}
      </div>
      <button id="backToView">Back to Main</button>
    </div>
  `;

  // Add event listeners
  document.querySelectorAll('.select-subject').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedSubject = e.target.dataset.subject;
      if (!document.getElementById('startTopicTest')) {
        // For topic-wise test, go to topic selection
        testMode = 'topicSelect';
        render();
      } else {
        // For subject-wise test
        filteredQuestions = questions.filter(q => q.subject === selectedSubject);
        startFilteredTest();
      }
    });
  });

  document.getElementById('backToView')?.addEventListener('click', () => {
    testMode = 'view';
    selectedSubject = '';
    render();
  });
}

// Topic selection view
function renderTopicSelect() {
  const categories = getUniqueCategories(selectedSubject);

  app.innerHTML = `
    <div class="topic-select">
      <h2>Select Topic for ${selectedSubject}</h2>
      <div class="topics-list">
        ${categories.map(category => `
          <div class="topic-card">
            <h3>${category}</h3>
            <p>${questions.filter(q => q.subject === selectedSubject && q.category === category).length} questions</p>
            <button class="select-topic" data-category="${category}">Select</button>
          </div>
        `).join('')}
      </div>
      <button id="backToSubjectSelect">Back to Subjects</button>
      <button id="backToView">Back to Main</button>
    </div>
  `;

  // Add event listeners
  document.querySelectorAll('.select-topic').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedCategory = e.target.dataset.category;
      filteredQuestions = questions.filter(q => q.subject === selectedSubject && q.category === selectedCategory);
      startFilteredTest();
    });
  });

  document.getElementById('backToSubjectSelect')?.addEventListener('click', () => {
    testMode = 'subjectSelect';
    selectedCategory = '';
    render();
  });

  document.getElementById('backToView')?.addEventListener('click', () => {
    testMode = 'view';
    selectedSubject = '';
    selectedCategory = '';
    render();
  });
}

// Start filtered test (subject or topic)
function startFilteredTest() {
  if (filteredQuestions.length === 0) {
    app.innerHTML = `
      <div class="no-questions">
        <h2>No Questions Available</h2>
        <p>No questions found for the selected subject/topic.</p>
        <button id="backToView">Back to View</button>
      </div>
    `;
    document.getElementById('backToView')?.addEventListener('click', () => {
      testMode = 'view';
      selectedSubject = '';
      selectedCategory = '';
      render();
    });
    return;
  }

  currentQuestionIndex = 0;
  userAnswers = new Array(filteredQuestions.length).fill(undefined);
  testMode = 'test';
  render();
}

// Test mode - take the test
function renderTest() {
  // Use filtered questions if in subject/topic mode, otherwise use all questions
  const testQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;

  if (testQuestions.length === 0) {
    app.innerHTML = `
      <div class="no-questions">
        <h2>No Questions Available</h2>
        <p>Please add some questions first.</p>
        <button id="backToView">Back to View</button>
      </div>
    `;
    document.getElementById('backToView')?.addEventListener('click', () => {
      testMode = 'view';
      filteredQuestions = [];
      selectedSubject = '';
      selectedCategory = '';
      render();
    });
    return;
  }

  if (currentQuestionIndex >= testQuestions.length) {
    showResults();
    return;
  }

  const question = testQuestions[currentQuestionIndex];

  app.innerHTML = `
    <div class="test-header">
      <h2>Question ${currentQuestionIndex + 1} of ${testQuestions.length}</h2>
      ${filteredQuestions.length > 0 ?
        `<p>${selectedSubject}${selectedCategory ? ` - ${selectedCategory}` : ''}</p>` :
        `<p>Full Test</p>`}
      <progress value="${currentQuestionIndex}" max="${testQuestions.length}"></progress>
    </div>
    <div class="question-container">
      <h3>${question.question}</h3>
      <div class="options">
        ${question.options.map((option, i) => `
          <div class="option">
            <input type="radio" id="option${i}" name="answer" value="${i}"
              ${userAnswers[currentQuestionIndex] === i ? 'checked' : ''}>
            <label for="option${i}">${String.fromCharCode(65 + i)}. ${option}</label>
          </div>
        `).join('')}
      </div>
      <div class="test-actions">
        ${currentQuestionIndex > 0 ? '<button id="prevQuestion">Previous</button>' : ''}
        <button id="checkAnswer">Check Answer</button>
        <button id="nextQuestion">${currentQuestionIndex === testQuestions.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    </div>
  `;

  // Add event listeners
  document.querySelectorAll('input[name="answer"]').forEach(input => {
    input.addEventListener('change', (e) => {
      userAnswers[currentQuestionIndex] = parseInt(e.target.value);

      // Remove selected class from all options
      document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
      });

      // Add selected class to the chosen option
      e.target.closest('.option').classList.add('selected');
    });
  });

  document.getElementById('prevQuestion')?.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      render();
    }
  });

  document.getElementById('checkAnswer')?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
      alert('Please select an answer first!');
      return;
    }

    const userAnswer = parseInt(selected.value);
    const correctAnswer = question.correctAnswer;

    // Remove all existing classes
    document.querySelectorAll('.option').forEach(option => {
      option.classList.remove('selected', 'correct-feedback', 'incorrect-feedback', 'correct-answer-highlight');
    });

    // Add feedback classes
    const selectedOption = selected.closest('.option');
    if (userAnswer === correctAnswer) {
      selectedOption.classList.add('correct-feedback');
    } else {
      selectedOption.classList.add('incorrect-feedback');
      // Highlight the correct answer
      const correctOption = document.querySelector(`#option${correctAnswer}`).closest('.option');
      correctOption.classList.add('correct-answer-highlight');
    }

    // Disable radio buttons after checking
    document.querySelectorAll('input[name="answer"]').forEach(input => {
      input.disabled = true;
    });

    // Update the button text
    document.getElementById('checkAnswer').textContent = 'Answer Checked';
    document.getElementById('checkAnswer').disabled = true;
  });

  document.getElementById('nextQuestion')?.addEventListener('click', () => {
    // Save current answer if any
    const selected = document.querySelector('input[name="answer"]:checked');
    if (selected) {
      userAnswers[currentQuestionIndex] = parseInt(selected.value);
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      currentQuestionIndex++;
      render();
    } else {
      showResults();
    }
  });
}

// Show test results
function showResults() {
  // Use filtered questions if in subject/topic mode, otherwise use all questions
  const testQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;

  const correctAnswers = userAnswers.reduce((count, answer, index) => {
    return answer === testQuestions[index].correctAnswer ? count + 1 : count;
  }, 0);

  const percentage = Math.round((correctAnswers / testQuestions.length) * 100);

  app.innerHTML = `
    <div class="results">
      <h2>Test Results</h2>
      <div class="score">
        <h3>You scored ${correctAnswers} out of ${testQuestions.length}</h3>
        <p>Percentage: ${percentage}%</p>
        ${filteredQuestions.length > 0 ?
          `<p>Test Type: ${selectedSubject}${selectedCategory ? ` - ${selectedCategory}` : ''}</p>` :
          `<p>Test Type: Full Test</p>`}
      </div>
      <div class="answers-review">
        <h3>Review Answers</h3>
        ${testQuestions.map((q, index) => `
          <div class="review-item ${userAnswers[index] === q.correctAnswer ? 'correct' : 'incorrect'}">
            <h4>${index + 1}. ${q.question}</h4>
            <p>Your answer: ${userAnswers[index] !== undefined ? String.fromCharCode(65 + userAnswers[index]) + '. ' + q.options[userAnswers[index]] : 'Not answered'}</p>
            <p>Correct answer: ${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}</p>
          </div>
        `).join('')}
      </div>
      <button id="restartTest">Restart Test</button>
      <button id="backToView">Back to View</button>
    </div>
  `;

  document.getElementById('restartTest')?.addEventListener('click', () => {
    if (filteredQuestions.length > 0) {
      startFilteredTest();
    } else {
      startTest();
    }
  });

  document.getElementById('backToView')?.addEventListener('click', () => {
    testMode = 'view';
    currentQuestionIndex = 0;
    userAnswers = [];
    filteredQuestions = [];
    selectedSubject = '';
    selectedCategory = '';
    render();
  });
}

// Edit mode - edit questions
function renderEdit() {
  app.innerHTML = `
    <div class="edit-header">
      <h2>Edit Questions</h2>
      <button id="backToView">Back to View</button>
    </div>
    <div class="questions-edit">
      ${questions.map((q, index) => `
        <div class="question-edit-card" data-index="${index}">
          <div class="form-group">
            <label>Question:</label>
            <textarea class="question-text" data-field="question">${q.question}</textarea>
          </div>
          <div class="form-group">
            <label>Options:</label>
            ${q.options.map((option, i) => `
              <div class="option-input">
                <input type="text" class="option-text" data-option-index="${i}" value="${option}">
              </div>
            `).join('')}
          </div>
          <div class="form-group">
            <label>Correct Answer:</label>
            <select class="correct-answer" data-field="correctAnswer">
              ${q.options.map((_, i) => `
                <option value="${i}" ${i === q.correctAnswer ? 'selected' : ''}>
                  ${String.fromCharCode(65 + i)}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category:</label>
              <input type="text" class="category" data-field="category" value="${q.category}">
            </div>
            <div class="form-group">
              <label>Difficulty:</label>
              <input type="text" class="difficulty" data-field="difficulty" value="${q.difficulty}">
            </div>
            <div class="form-group">
              <label>Subject:</label>
              <input type="text" class="subject" data-field="subject" value="${q.subject}">
            </div>
          </div>
          <div class="edit-actions">
            <button class="save-question" data-index="${index}">Save</button>
            <button class="cancel-edit" data-index="${index}">Cancel</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Add event listeners
  document.getElementById('backToView')?.addEventListener('click', () => {
    testMode = 'view';
    render();
  });

  document.querySelectorAll('.save-question').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      saveQuestion(index);
    });
  });

  document.querySelectorAll('.cancel-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      testMode = 'view';
      render();
    });
  });
}

// Start the full test
function startTest() {
  currentQuestionIndex = 0;
  userAnswers = new Array(questions.length).fill(undefined);
  testMode = 'test';
  filteredQuestions = [];
  selectedSubject = '';
  selectedCategory = '';
  render();
}

// Add a new question
function addQuestion() {
  const newQuestion = {
    question: "New Question",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 0,
    category: "general",
    difficulty: "medium",
    subject: "general"
  };

  questions.push(newQuestion);
  saveQuestions();
  testMode = 'edit';
  render();
}

// Edit a specific question
function editQuestion(index) {
  testMode = 'edit';
  render();
}

// Save a specific question
function saveQuestion(index) {
  const card = document.querySelector(`.question-edit-card[data-index="${index}"]`);

  if (card) {
    // Update question text
    const questionText = card.querySelector('.question-text').value;
    questions[index].question = questionText;

    // Update options
    const optionInputs = card.querySelectorAll('.option-text');
    questions[index].options = Array.from(optionInputs).map(input => input.value);

    // Update correct answer
    const correctAnswer = parseInt(card.querySelector('.correct-answer').value);
    questions[index].correctAnswer = correctAnswer;

    // Update metadata
    questions[index].category = card.querySelector('.category').value;
    questions[index].difficulty = card.querySelector('.difficulty').value;
    questions[index].subject = card.querySelector('.subject').value;

    saveQuestions();
  }

  testMode = 'view';
  render();
}

// Delete a question
function deleteQuestion(index) {
  if (confirm('Are you sure you want to delete this question?')) {
    questions.splice(index, 1);
    saveQuestions();
    render();
  }
}

// Export questions to JSON
function exportQuestions() {
  const dataStr = JSON.stringify(questions, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  const exportFileDefaultName = 'mcq-questions.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Import questions from JSON
function importQuestions(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuestions = JSON.parse(e.target.result);
      if (Array.isArray(importedQuestions)) {
        // Ask user if they want to append or replace
        const action = confirm(`Found ${importedQuestions.length} questions. Click OK to append to existing questions, or Cancel to replace all existing questions.`);

        if (action) {
          // Append
          questions = questions.concat(importedQuestions);
        } else {
          // Replace
          questions = importedQuestions;
        }

        saveQuestions();
        render();
        alert('Questions imported successfully!');
      } else {
        alert('Invalid file format. Please import a valid JSON array of questions.');
      }
    } catch (error) {
      alert('Error parsing JSON file: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// Initialize the app
init();
