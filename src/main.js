import "./style.css";
import "./pwa.js";
import posthog from "posthog-js";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Initialize PostHog analytics
posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
  capture_exceptions: true,
  debug: import.meta.env.MODE === "development",
});

// Capacitor initialization
import { Capacitor } from "@capacitor/core";

// DOM Elements
const app = document.getElementById("app");

// State
let questions = JSON.parse(localStorage.getItem("mcqQuestions")) || [];
let currentQuestionIndex = 0;
let userAnswers = [];
let testMode = "view"; // view, test, edit, subjectSelect, topicSelect
let selectedSubject = "";
let selectedCategory = "";
let filteredQuestions = [];
let showAllQuestions = false; // New state to track if all questions should be shown

// Initialize the app
function init() {
  loadQuestions();
  showOnboarding(); // Show onboarding if no questions exist
  render();
  initTour(); // Initialize tour guide
}

// Initialize tour guide
function initTour() {
  // Create driver.js instance with progress indicator
  const driverObj = driver({
    showButtons: true,
    nextBtnText: "Next →",
    prevBtnText: "← Prev",
    doneBtnText: "Finish",
    keyboardControl: true,
    animate: true,
    progressText: "{{current}} of {{total}}",
    steps: [
      {
        element: ".navbar-brand",
        popover: {
          title: "Welcome to Quizzy!",
          description: "This is a simple MCQ test-taking application. Let's take a quick tour.",
          position: "bottom"
        }
      },
      {
        element: "#app",
        popover: {
          title: "Main Dashboard",
          description: "This is your main dashboard where you can see your questions and start tests.",
          position: "bottom"
        }
      },
      {
        element: "#startTest",
        popover: {
          title: "Start Full Test",
          description: "Click this button to start a full test with all your questions.",
          position: "bottom"
        }
      },
      {
        element: "#openOpenAI",
        popover: {
          title: "AI Prompt",
          description: "Click this button to generate new questions using AI.",
          position: "bottom"
        }
      },
      {
        element: "#themeToggle",
        popover: {
          title: "Theme Toggle",
          description: "Use this button to switch between light and dark themes.",
          position: "bottom"
        }
      },
    ]
  });

  // Add event listener to start tour button
  document.getElementById("startTour")?.addEventListener("click", () => {
    driverObj.drive();
  });
}

// Load questions from localStorage
function loadQuestions() {
  const stored = localStorage.getItem("mcqQuestions");
  if (stored) {
    questions = JSON.parse(stored);
  }
}

// Show onboarding screen if no questions exist
function showOnboarding() {
  if (questions.length === 0) {
    testMode = "onboarding";
    render();
  }
}

// Save questions to localStorage
function saveQuestions() {
  localStorage.setItem("mcqQuestions", JSON.stringify(questions));
}

// Clear all questions from localStorage
function clearDatabase() {
  if (
    confirm(
      "Are you sure you want to clear all questions? This action cannot be undone.",
    )
  ) {
    questions = [];
    localStorage.removeItem("mcqQuestions");
    render();
  }
}

// Import JSON data
function importJsonData() {
  const jsonInput = document.getElementById("jsonInput").value;

  if (!jsonInput) {
    alert("Please paste JSON data first.");
    return;
  }

  try {
    const importedQuestions = JSON.parse(jsonInput);

    if (Array.isArray(importedQuestions)) {
      questions = importedQuestions;
      saveQuestions();
      testMode = "view";
      render();
      alert("Questions imported successfully!");
    } else {
      alert(
        "Invalid JSON format. Please ensure the data is an array of questions.",
      );
    }
  } catch (error) {
    alert("Error parsing JSON: " + error.message);
  }
}

// Add sample data
function addSampleData() {
  // Add 5 sample questions
  const sampleQuestions = [
    {
    question: "Which is a valid HTML tag?",
      options: [
        "<bro>",
        "<br>",
        "<hy>",
        "<abb>",
      ],
      correctAnswer: 0,
      category: "html",
      difficulty: "Easy",
      subject: "web-development",
  },
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlink and Text Markup Language",
      ],
      correctAnswer: 0,
      category: "html",
      difficulty: "Easy",
      subject: "web-development",
    },
    {
      question:
        "Which CSS property is used to change the text color of an element?",
      options: ["fgcolor", "text-color", "color", "font-color"],
      correctAnswer: 2,
      category: "css",
      difficulty: "Easy",
      subject: "web-development",
    },
    {
      question: "Which JavaScript method is used to write HTML output?",
      options: [
        "document.write()",
        "document.output()",
        "document.text()",
        "document.html()",
      ],
      correctAnswer: 0,
      category: "javascript",
      difficulty: "Easy",
      subject: "web-development",
    },
    {
      question: "In CSS, what does the 'font-size' property do?",
      options: [
        "Changes the font family",
        "Changes the size of the text",
        "Changes the color of the text",
        "Changes the style of the text",
      ],
      correctAnswer: 1,
      category: "css",
      difficulty: "Easy",
      subject: "web-development",
    },
  ];

  questions = sampleQuestions;
  saveQuestions();
  testMode = "view";
  render();
}

// Open OpenAI site with prompt
function openOpenAI() {
  const promptText = `Generate maximum MCQs from this PDF in the following JSON format:

[
    {
        "question": "",
        "options": [
            "",
            "",
            "",
            ""
        ],
        "correctAnswer": 0,
        "category": "topic-category",
        "difficulty": "Easy",
        "subject": "subject-name"
    },
    ...
]

Requirements:
1. Generate at least 30 high-quality MCQs
2. Ensure questions cover all important concepts from the PDF
3. Distribute difficulty levels: 40% Easy, 40% Medium, 20% Hard
4. Include questions that require both factual recall and conceptual understanding
5. Make sure all options are plausible but only one is correct
6. Ensure correctAnswer index matches the correct option (0-3)
7. Use appropriate category and subject names`;
  // Open OpenAI in a new tab with the prompt
  const openaiUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(promptText)}`;
  window.open(openaiUrl, "_blank");
}

// Add event listener for OpenAI button
document.getElementById("openOpenAI")?.addEventListener("click", openOpenAI);

// Show JSON input interface
function showJsonInput() {
  app.innerHTML = `
    <div class="json-input card">
      <div class="card-body">
        <h2 class="card-title">Paste Your JSON Data</h2>
        <p class="card-text">Copy and paste the JSON data generated by AI here:</p>
        <textarea id="jsonInput" class="form-control mb-3" placeholder='[{"question": "Example question?", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "category": "example", "difficulty": "Easy", "subject": "example"}]' rows="10"></textarea>
        <div class="json-actions d-flex justify-content-center gap-3 mb-4">
          <button id="importJson" class="btn btn-success">
            <i class="fas fa-file-import me-2"></i>Import JSON
          </button>
          <button id="cancelJson" class="btn btn-secondary">
            <i class="fas fa-times me-2"></i>Cancel
          </button>
        </div>
        <div class="instructions card">
          <div class="card-body">
            <h5 class="card-title"><i class="fas fa-info-circle me-2"></i>Instructions</h5>
            <ol class="mb-0">
              <li>Generate questions using the "AI Prompt" button in the navbar</li>
              <li>Copy the JSON output from the AI</li>
              <li>Paste it in the text area above</li>
              <li>Click "Import JSON"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners using jQuery
  $("#importJson").on("click", importJsonData);
  $("#cancelJson").on("click", () => {
    showOnboarding();
    render();
  });
}

// Render the app based on current mode
function render() {
  // Reset showAllQuestions when not in view mode
  if (testMode !== "view") {
    showAllQuestions = false;
  }

  switch (testMode) {
    case "test":
      renderTest();
      break;
    case "edit":
      renderEdit();
      break;
    case "add":
      renderAdd();
      break;
    case "subjectSelect":
      renderSubjectSelect();
      break;
    case "topicSelect":
      renderTopicSelect();
      break;
    case "onboarding":
      renderOnboarding();
      break;
    default:
      renderView();
  }
}

// Render add question form
function renderAdd() {
  app.innerHTML = `
    <div class="add-question card">
      <div class="card-body">
        <h2 class="card-title mb-4">Add New Question</h2>
        <div class="question-edit-card">
          <div class="form-group mb-3">
            <label class="form-label">Question:</label>
            <textarea class="form-control question-text" id="addQuestionText" rows="3" placeholder="Enter your question here...">New Question</textarea>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Options:</label>
            <div class="option-input mb-2">
              <input type="text" class="form-control option-text" data-option-index="0" value="Option A" placeholder="Option A">
            </div>
            <div class="option-input mb-2">
              <input type="text" class="form-control option-text" data-option-index="1" value="Option B" placeholder="Option B">
            </div>
            <div class="option-input mb-2">
              <input type="text" class="form-control option-text" data-option-index="2" value="Option C" placeholder="Option C">
            </div>
            <div class="option-input mb-2">
              <input type="text" class="form-control option-text" data-option-index="3" value="Option D" placeholder="Option D">
            </div>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Correct Answer:</label>
            <select class="form-control correct-answer" id="addCorrectAnswer">
              <option value="0">A</option>
              <option value="1">B</option>
              <option value="2">C</option>
              <option value="3">D</option>
            </select>
          </div>
          <div class="form-row row">
            <div class="form-group col-md-4 mb-3">
              <label class="form-label">Category:</label>
              <input type="text" class="form-control" id="addCategory" value="general" placeholder="Category">
            </div>
            <div class="form-group col-md-4 mb-3">
              <label class="form-label">Difficulty:</label>
              <input type="text" class="form-control" id="addDifficulty" value="medium" placeholder="Difficulty">
            </div>
            <div class="form-group col-md-4 mb-3">
              <label class="form-label">Subject:</label>
              <input type="text" class="form-control" id="addSubject" value="general" placeholder="Subject">
            </div>
          </div>
          <div class="edit-actions d-flex justify-content-end gap-2">
            <button id="cancelAdd" class="btn btn-secondary">Cancel</button>
            <button id="saveAdd" class="btn btn-primary">Save Question</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  $("#cancelAdd").on("click", () => {
    testMode = "view";
    render();
  });

  $("#saveAdd").on("click", () => {
    // Get form values
    const questionText = $("#addQuestionText").val();
    const options = [];
    $(".option-text").each(function () {
      options.push($(this).val());
    });
    const correctAnswer = parseInt($("#addCorrectAnswer").val());
    const category = $("#addCategory").val();
    const difficulty = $("#addDifficulty").val();
    const subject = $("#addSubject").val();

    // Create new question object
    const newQuestion = {
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      category: category,
      difficulty: difficulty,
      subject: subject,
    };

    // Add to questions array
    questions.push(newQuestion);
    saveQuestions();

    // Return to view mode
    testMode = "view";
    render();
  });
}

// Onboarding screen
function renderOnboarding() {
  app.innerHTML = `
    <div class="onboarding card">
      <div class="card-body text-center">
        <h1 class="card-title mb-3">Welcome to Quizzy!</h1>
        <p class="card-text mb-4 text-muted">Get started by adding some questions to your database</p>

        <div class="row g-3">
          <div class="col-md-6">
            <button id="addSampleData" class="btn btn-primary btn-lg w-100 py-3">
              <i class="fas fa-database me-2"></i>Add Sample Data
            </button>
          </div>
          <div class="col-md-6">
            <button id="pasteJsonData" class="btn btn-info btn-lg w-100 py-3">
              <i class="fas fa-paste me-2"></i>Paste JSON Data
            </button>
          </div>
          <div class="col-md-6">
            <button id="openOpenAI2" class="btn btn-success btn-lg w-100 py-3">
              <i class="fas fa-robot me-2"></i>Generate with AI
            </button>
          </div>
          <div class="col-md-6">
            <button id="startTourCTA" class="btn btn-outline-primary btn-lg w-100 py-3">
              <i class="fas fa-question-circle me-2"></i>Take a Tour
            </button>
          </div>
        </div>

        <div class="instructions card mt-4">
          <div class="card-body">
            <h5 class="card-title"><i class="fas fa-info-circle me-2"></i>Quick Start Guide</h5>
            <ol class="text-start mb-0 small">
              <li>Use "Generate with AI" to create questions automatically</li>
              <li>Copy the JSON output from AI</li>
              <li>Paste it using "Paste JSON Data"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners using jQuery
  $("#addSampleData").on("click", addSampleData);
  $("#pasteJsonData").on("click", showJsonInput);
  $("#openOpenAI").on("click", openOpenAI);
  $("#openOpenAI2").on("click", openOpenAI);
  $("#startTourCTA").on("click", function() {
    // Trigger the tour start button in the navbar
    document.getElementById("startTour")?.click();
  });
}

// Get unique subjects from questions
function getUniqueSubjects() {
  const subjects = [...new Set(questions.map((q) => q.subject))];
  return subjects.filter((s) => s); // Filter out empty/null values
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// View mode - list questions and options
function renderView() {
  // Show only the first 5 questions by default, or all if showAllQuestions is true
  const displayedQuestions = showAllQuestions ? questions : questions.slice(0, 5);
  const hasMoreQuestions = questions.length > 5;

  app.innerHTML = `
    <div class="actions-container card">
      <div class="card-body">
        <h2 class="card-title mb-4">Quiz Dashboard</h2>
        <div class="row">
          <div class="col-md-6 mb-3">
            <button id="startTest" class="btn btn-primary w-100 py-3">
              <i class="fas fa-play-circle me-2"></i>Start Full Test
              <div class="small mt-1">Test yourself on all questions</div>
            </button>
          </div>
          <div class="col-md-6 mb-3">
            <button id="startSubjectTest" class="btn btn-success w-100 py-3">
              <i class="fas fa-book me-2"></i>Subject-wise Test
              <div class="small mt-1">Focus on specific subjects</div>
            </button>
          </div>
          <div class="col-md-6 mb-3">
            <button id="editQuestions" class="btn btn-warning w-100 py-3">
              <i class="fas fa-edit me-2"></i>Edit Questions
              <div class="small mt-1">Add, edit, or remove questions</div>
            </button>
          </div>
          <div class="col-md-6 mb-3">
            <button id="addQuestion" class="btn btn-secondary w-100 py-3">
              <i class="fas fa-plus-circle me-2"></i>Add Question
              <div class="small mt-1">Manually add a new question</div>
            </button>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-md-4 mb-3">
            <button id="exportQuestions" class="btn btn-outline-primary w-100 py-2">
              <i class="fas fa-file-export me-2"></i>Export
            </button>
          </div>
          <div class="col-md-4 mb-3">
            <button id="importButton" class="btn btn-outline-secondary w-100 py-2">
              <i class="fas fa-file-import me-2"></i>Import
            </button>
            <input type="file" id="importQuestions" accept=".json" style="display: none;">
          </div>
          <div class="col-md-4 mb-3">
            <button id="clearDatabase" class="btn btn-outline-danger w-100 py-2">
              <i class="fas fa-trash-alt me-2"></i>Clear All
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="stats alert alert-info d-flex justify-content-between align-items-center">
      <div>
        <strong>Total Questions:</strong> ${questions.length}
      </div>
      <div>
        ${!showAllQuestions && hasMoreQuestions ? `<a href="#" id="showAllQuestions" class="btn btn-sm btn-outline-primary">Show all questions</a>` : ""}
        ${showAllQuestions && hasMoreQuestions ? `<a href="#" id="showLessQuestions" class="btn btn-sm btn-outline-secondary">Show less</a>` : ""}
      </div>
    </div>

    <div class="questions-list">
      ${displayedQuestions
        .map(
          (q, index) => `
        <div class="question-card card mb-3">
          <div class="card-body">
            <h5 class="card-title">Question ${index + 1}: ${q.question}</h5>
            <div class="options mt-3">
              ${q.options
                .map(
                  (option, i) => `
                <div class="option ${i === q.correctAnswer ? "correct" : ""} p-2 mb-1 rounded">
                  <strong>${String.fromCharCode(65 + i)}.</strong> ${escapeHtml(option)}
                </div>
              `,
                )
                .join("")}
            </div>
            <div class="question-meta mt-3">
              <span class="meta-badge badge bg-secondary me-2"><i class="fas fa-folder me-1"></i> ${q.category}</span>
              <span class="meta-badge badge bg-info me-2"><i class="fas fa-signal me-1"></i> ${q.difficulty}</span>
              <span class="meta-badge badge bg-primary me-2"><i class="fas fa-book me-1"></i> ${q.subject}</span>
            </div>
            <div class="question-actions mt-3">
              <button class="edit-btn btn btn-sm btn-outline-warning me-2" data-index="${index}">
                <i class="fas fa-edit me-1"></i>Edit
              </button>
              <button class="delete-btn btn btn-sm btn-outline-danger" data-index="${index}">
                <i class="fas fa-trash me-1"></i>Delete
              </button>
            </div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;

  // Add event listeners using jQuery
  $("#startTest").on("click", startTest);
  $("#startSubjectTest").on("click", () => {
    testMode = "subjectSelect";
    render();
  });
  $("#editQuestions").on("click", () => {
    testMode = "edit";
    render();
  });
  $("#addQuestion").on("click", function () {
    console.log("Add Question button event triggered");
    addQuestion();
  });
  $("#exportQuestions").on("click", exportQuestions);
  $("#importButton").on("click", () => {
    $("#importQuestions").click();
  });
  $("#importQuestions").on("change", importQuestions);
  $("#clearDatabase").on("click", clearDatabase);

  // Add event listeners for show more/less buttons
  $("#showAllQuestions").on("click", function(e) {
    e.preventDefault();
    showAllQuestions = true;
    render();
  });

  $("#showLessQuestions").on("click", function(e) {
    e.preventDefault();
    showAllQuestions = false;
    render();
  });

  // Add event listeners for edit and delete buttons
  $(".edit-btn").on("click", function () {
    const index = parseInt($(this).data("index"));
    editQuestion(index);
  });

  $(".delete-btn").on("click", function () {
    const index = parseInt($(this).data("index"));
    deleteQuestion(index);
  });
}

// Subject selection view
function renderSubjectSelect() {
  const subjects = getUniqueSubjects();

  app.innerHTML = `
    <div class="subject-select card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Select Subject</h2>
        <div class="row">
          ${subjects
            .map(
              (subject) => `
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="subject-card card h-100">
                <div class="card-body text-center d-flex flex-column">
                  <h3 class="card-title">${subject}</h3>
                  <p class="card-text flex-grow-1">${questions.filter((q) => q.subject === subject).length} questions</p>
                  <button class="select-subject btn btn-primary mt-auto" data-subject="${subject}">
                    <i class="fas fa-arrow-right me-2"></i>Select
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="d-flex justify-content-between mt-4">
          <button id="backToView" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Back to Main
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners using jQuery
  $(".select-subject").on("click", function () {
    selectedSubject = $(this).data("subject");
    // Directly start subject-wise test
    filteredQuestions = questions.filter((q) => q.subject === selectedSubject);
    startFilteredTest();
  });

  $("#backToView").on("click", () => {
    testMode = "view";
    selectedSubject = "";
    showAllQuestions = false; // Reset show all questions state
    // Show onboarding if no questions
    if (questions.length === 0) {
      showOnboarding();
    }
    render();
  });
}

// Topic selection view
function renderTopicSelect() {
  const categories = getUniqueCategories(selectedSubject);

  app.innerHTML = `
    <div class="topic-select card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Select Topic for ${selectedSubject}</h2>
        <div class="row">
          ${categories
            .map(
              (category) => `
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="topic-card card h-100">
                <div class="card-body text-center d-flex flex-column">
                  <h3 class="card-title">${category}</h3>
                  <p class="card-text flex-grow-1">${questions.filter((q) => q.subject === selectedSubject && q.category === category).length} questions</p>
                  <button class="select-topic btn btn-primary mt-auto" data-category="${category}">
                    <i class="fas fa-arrow-right me-2"></i>Select
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="d-flex justify-content-between mt-4">
          <button id="backToSubjectSelect" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Back to Subjects
          </button>
          <button id="backToView" class="btn btn-outline-secondary">
            <i class="fas fa-home me-2"></i>Back to Main
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners using jQuery
  $(".select-topic").on("click", function () {
    selectedCategory = $(this).data("category");
    filteredQuestions = questions.filter(
      (q) => q.subject === selectedSubject && q.category === selectedCategory,
    );
    startFilteredTest();
  });

  $("#backToSubjectSelect").on("click", () => {
    testMode = "subjectSelect";
    selectedCategory = "";
    render();
  });

  $("#backToView").on("click", () => {
    testMode = "view";
    selectedSubject = "";
    selectedCategory = "";
    showAllQuestions = false; // Reset show all questions state
    render();
  });
}

// Start filtered test (subject or topic)
function startFilteredTest() {
  if (filteredQuestions.length === 0) {
    app.innerHTML = `
      <div class="no-questions">
        <h2>No Questions Available</h2>
        <p>No questions found for the selected subject.</p>
        <button id="backToView">Back to View</button>
      </div>
    `;
    document.getElementById("backToView")?.addEventListener("click", () => {
      testMode = "view";
      selectedSubject = "";
      selectedCategory = "";
      render();
    });
    return;
  }

  currentQuestionIndex = 0;
  userAnswers = new Array(filteredQuestions.length).fill(undefined);
  testMode = "test";
  render();
}

// Test mode - take the test
function renderTest() {
  // Use filtered questions if in subject/topic mode, otherwise use all questions
  const testQuestions =
    filteredQuestions.length > 0 ? filteredQuestions : questions;

  if (testQuestions.length === 0) {
    app.innerHTML = `
      <div class="no-questions card">
        <div class="card-body text-center">
          <h2 class="card-title">No Questions Available</h2>
          <p class="card-text">Please add some questions first.</p>
          <button id="backToView" class="btn btn-primary">
            <i class="fas fa-arrow-left me-2"></i>Back to View
          </button>
        </div>
      </div>
    `;
    document.getElementById("backToView")?.addEventListener("click", () => {
      testMode = "view";
      filteredQuestions = [];
      selectedSubject = "";
      selectedCategory = "";
      // Show onboarding if no questions
      if (questions.length === 0) {
        showOnboarding();
      }
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
    <div class="test-header card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="card-title mb-0">Question ${currentQuestionIndex + 1} of ${testQuestions.length}</h2>
          ${filteredQuestions.length > 0
            ? `<span class="badge bg-success"><i class="fas fa-book me-1"></i>${selectedSubject}</span>`
            : `<span class="badge bg-primary"><i class="fas fa-globe me-1"></i>Full Test</span>`
          }
        </div>
        <div class="progress mt-3">
          <div class="progress-bar" role="progressbar" style="width: ${((currentQuestionIndex) / testQuestions.length) * 100}%" aria-valuenow="${currentQuestionIndex}" aria-valuemin="0" aria-valuemax="${testQuestions.length}"></div>
        </div>
      </div>
    </div>
    <div class="question-container card">
      <div class="card-body">
        <h3 class="card-title mb-4">${question.question}</h3>
        <div class="options">
    ${question.options
      .map(
        (option, i) => `
      <div class="option mb-2 p-3 rounded border option-item" data-option-index="${i}">
        <label class="d-flex align-items-center cursor-pointer w-100 h-100">
          <input
            type="radio"
            id="option${i}"
            name="answer"
            value="${i}"
            ${userAnswers[currentQuestionIndex] === i ? "checked" : ""}
            class="me-2 option-radio"
          >
          <span class="flex-grow-1 option-text">${String.fromCharCode(65 + i)}. ${option}</span>
        </label>
      </div>
    `,
      )
      .join("")}
  </div>
        <div class="test-actions d-flex justify-content-between mt-4">
          ${currentQuestionIndex > 0 ? '<button id="prevQuestion" class="btn btn-secondary"><i class="fas fa-arrow-left me-2"></i>Previous</button>' : '<div></div>'}
          <div>
            <button id="checkAnswer" class="btn btn-info me-2"><i class="fas fa-check-circle me-2"></i>Check Answer</button>
            <button id="nextQuestion" class="btn btn-primary">${currentQuestionIndex === testQuestions.length - 1 ? '<i class="fas fa-flag-checkered me-2"></i>Finish' : '<i class="fas fa-arrow-right me-2"></i>Next'}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners using jQuery for better handling
  // Handle clicks on the entire option area
  $(".option-item").on("click", function () {
    const optionIndex = $(this).data("option-index");
    const radioInput = $(this).find(".option-radio");

    // Check the radio button
    radioInput.prop("checked", true);

    // Trigger the change event
    radioInput.trigger("change");
  });

  $('input[name="answer"]').on("change", function () {
    userAnswers[currentQuestionIndex] = parseInt($(this).val());

    // Remove selected class from all options
    $(".option").removeClass("selected");

    // Add selected class to the chosen option
    $(this).closest(".option").addClass("selected");
  });

  $("#prevQuestion").on("click", function () {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      render();
    }
  });

  $("#checkAnswer").on("click", function () {
    const selected = $('input[name="answer"]:checked');
    if (selected.length === 0) {
      alert("Please select an answer first!");
      return;
    }

    const userAnswer = parseInt(selected.val());
    const correctAnswer = question.correctAnswer;

    // Remove all existing classes
    $(".option").removeClass(
      "selected correct-feedback incorrect-feedback correct-answer-highlight",
    );

    // Add feedback classes
    const selectedOption = selected.closest(".option");
    if (userAnswer === correctAnswer) {
      selectedOption.addClass("correct-feedback");
    } else {
      selectedOption.addClass("incorrect-feedback");
      // Highlight the correct answer
      const correctOption = $(`#option${correctAnswer}`).closest(".option");
      correctOption.addClass("correct-answer-highlight");
    }

    // Disable radio buttons after checking
    $('input[name="answer"]').prop("disabled", true);

    // Update the button text
    $("#checkAnswer").html('<i class="fas fa-check me-2"></i>Answer Checked');
    $("#checkAnswer").prop("disabled", true);
  });

  $("#nextQuestion").on("click", function () {
    // Save current answer if any
    const selected = $('input[name="answer"]:checked');
    if (selected.length > 0) {
      userAnswers[currentQuestionIndex] = parseInt(selected.val());
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
  const testQuestions =
    filteredQuestions.length > 0 ? filteredQuestions : questions;

  const correctAnswers = userAnswers.reduce((count, answer, index) => {
    return answer === testQuestions[index].correctAnswer ? count + 1 : count;
  }, 0);

  const percentage = Math.round((correctAnswers / testQuestions.length) * 100);

  app.innerHTML = `
    <div class="results card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Test Results</h2>
        <div class="score text-center p-4 rounded mb-4 ${percentage >= 70 ? "bg-success text-white" : percentage >= 50 ? "bg-warning" : "bg-danger text-white"}">
          <h3 class="mb-3">You scored ${correctAnswers} out of ${testQuestions.length}</h3>
          <p class="display-4 mb-2">${percentage}%</p>
          <p class="mb-0">
            ${filteredQuestions.length > 0
              ? `<i class="fas fa-book me-1"></i>Test Type: ${selectedSubject}`
              : `<i class="fas fa-globe me-1"></i>Test Type: Full Test`
            }
          </p>
        </div>
        <div class="answers-review">
          <h3 class="mb-4"><i class="fas fa-book-open me-2"></i>Review Answers</h3>
          ${testQuestions
            .map(
              (q, index) => `
            <div class="review-item card mb-3 ${userAnswers[index] === q.correctAnswer ? "border-success" : "border-danger"}">
              <div class="card-body">
                <h4 class="card-title">Q${index + 1}. ${q.question}</h4>
                <p class="card-text"><strong>Your answer:</strong> ${userAnswers[index] !== undefined ? String.fromCharCode(65 + userAnswers[index]) + ". " + q.options[userAnswers[index]] : "Not answered"}</p>
                <p class="card-text"><strong>Correct answer:</strong> ${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}</p>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="d-flex justify-content-center gap-3 mt-4">
          <button id="restartTest" class="btn btn-primary">
            <i class="fas fa-redo me-2"></i>Restart Test
          </button>
          <button id="backToView" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Back to View
          </button>
        </div>
      </div>
    </div>
  `;

  $("#restartTest").on("click", () => {
    if (filteredQuestions.length > 0) {
      startFilteredTest();
    } else {
      startTest();
    }
  });

  $("#backToView").on("click", () => {
    testMode = "view";
    currentQuestionIndex = 0;
    userAnswers = [];
    filteredQuestions = [];
    selectedSubject = "";
    selectedCategory = "";
    showAllQuestions = false; // Reset show all questions state
    // Show onboarding if no questions
    if (questions.length === 0) {
      showOnboarding();
    }
    render();
  });
}

// Edit mode - edit questions
function renderEdit() {
  // If we're editing a specific question
  if (window.editingQuestionIndex !== undefined) {
    const q = questions[window.editingQuestionIndex];
    const index = window.editingQuestionIndex;

    app.innerHTML = `
      <div class="edit-question card">
        <div class="card-body">
          <h2 class="card-title mb-4">Edit Question</h2>
          <div class="question-edit-card">
            <div class="form-group mb-3">
              <label class="form-label">Question:</label>
              <textarea class="form-control question-text" id="editQuestionText" data-field="question" rows="3">${q.question}</textarea>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Options:</label>
              ${q.options
                .map(
                  (option, i) => `
              <div class="option-input mb-2">
                <input type="text" class="form-control option-text" data-option-index="${i}" value="${option}" placeholder="Option ${String.fromCharCode(65 + i)}">
              </div>
            `,
                )
                .join("")}
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Correct Answer:</label>
              <select class="form-control correct-answer" id="editCorrectAnswer" data-field="correctAnswer">
                <option value="0" ${0 === q.correctAnswer ? "selected" : ""}>A</option>
                <option value="1" ${1 === q.correctAnswer ? "selected" : ""}>B</option>
                <option value="2" ${2 === q.correctAnswer ? "selected" : ""}>C</option>
                <option value="3" ${3 === q.correctAnswer ? "selected" : ""}>D</option>
              </select>
            </div>
            <div class="form-row row">
              <div class="form-group col-md-4 mb-3">
                <label class="form-label">Category:</label>
                <input type="text" class="form-control" id="editCategory" data-field="category" value="${q.category}" placeholder="Category">
              </div>
              <div class="form-group col-md-4 mb-3">
                <label class="form-label">Difficulty:</label>
                <input type="text" class="form-control" id="editDifficulty" data-field="difficulty" value="${q.difficulty}" placeholder="Difficulty">
              </div>
              <div class="form-group col-md-4 mb-3">
                <label class="form-label">Subject:</label>
                <input type="text" class="form-control" id="editSubject" data-field="subject" value="${q.subject}" placeholder="Subject">
              </div>
            </div>
            <div class="edit-actions d-flex justify-content-between gap-2">
              <button id="deleteQuestion" class="btn btn-danger">Delete Question</button>
              <div>
                <button id="cancelEdit" class="btn btn-secondary">Cancel</button>
                <button id="saveEdit" class="btn btn-primary" data-index="${index}">Save Question</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    $("#cancelEdit").on("click", () => {
      testMode = "view";
      render();
    });

    $("#deleteQuestion").on("click", function () {
      if (
        confirm(
          "Are you sure you want to delete this question? This action cannot be undone.",
        )
      ) {
        // Remove the question from the array
        questions.splice(window.editingQuestionIndex, 1);
        saveQuestions();

        // Return to view mode
        testMode = "view";
        render();
      }
    });

    $("#saveEdit").on("click", function () {
      const index = parseInt($(this).data("index"));

      // Get form values
      const questionText = $("#editQuestionText").val();
      const options = [];
      $(".option-text").each(function () {
        options.push($(this).val());
      });
      const correctAnswer = parseInt($("#editCorrectAnswer").val());
      const category = $("#editCategory").val();
      const difficulty = $("#editDifficulty").val();
      const subject = $("#editSubject").val();

      // Update question object
      questions[index].question = questionText;
      questions[index].options = options;
      questions[index].correctAnswer = correctAnswer;
      questions[index].category = category;
      questions[index].difficulty = difficulty;
      questions[index].subject = subject;

      saveQuestions();

      // Return to view mode
      testMode = "view";
      render();
    });
  } else {
    // Existing edit all questions functionality
    app.innerHTML = `
      <div class="edit-header w-100 card">
        <div class="card-body w-100">
          <div class="d-flex justify-content-between align-items-center w-100">
            <h2 class="card-title">Edit Questions</h2>
            <button id="backToView" class="btn btn-secondary">Back to View</button>
          </div>
        </div>
      </div>
      <div class="questions-edit">
        ${questions
          .map(
            (q, index) => `
          <div class="question-edit-card card mb-4">
            <div class="card-body">
              <div class="form-group mb-3">
                <label class="form-label">Question:</label>
                <textarea class="form-control question-text" data-field="question" rows="3">${q.question}</textarea>
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Options:</label>
                ${q.options
                  .map(
                    (option, i) => `
                <div class="option-input mb-2">
                  <input type="text" class="form-control option-text" data-option-index="${i}" value="${option}" placeholder="Option ${String.fromCharCode(65 + i)}">
                </div>
              `,
                  )
                  .join("")}
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Correct Answer:</label>
                <select class="form-control correct-answer" data-field="correctAnswer">
                  <option value="0" ${0 === q.correctAnswer ? "selected" : ""}>A</option>
                  <option value="1" ${1 === q.correctAnswer ? "selected" : ""}>B</option>
                  <option value="2" ${2 === q.correctAnswer ? "selected" : ""}>C</option>
                  <option value="3" ${3 === q.correctAnswer ? "selected" : ""}>D</option>
                </select>
              </div>
              <div class="form-row row">
                <div class="form-group col-md-4 mb-3">
                  <label class="form-label">Category:</label>
                  <input type="text" class="form-control category" data-field="category" value="${q.category}" placeholder="Category">
                </div>
                <div class="form-group col-md-4 mb-3">
                  <label class="form-label">Difficulty:</label>
                  <input type="text" class="form-control difficulty" data-field="difficulty" value="${q.difficulty}" placeholder="Difficulty">
                </div>
                <div class="form-group col-md-4 mb-3">
                  <label class="form-label">Subject:</label>
                  <input type="text" class="form-control subject" data-field="subject" value="${q.subject}" placeholder="Subject">
                </div>
              </div>
              <div class="edit-actions d-flex justify-content-between gap-2">
                <button class="delete-question btn btn-danger" data-index="${index}">Delete</button>
                <div>
                  <button class="save-question btn btn-primary" data-index="${index}">Save</button>
                  <button class="cancel-edit btn btn-secondary" data-index="${index}">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;

    // Add event listeners using jQuery
    $("#backToView").on("click", () => {
      testMode = "view";
      showAllQuestions = false; // Reset show all questions state
      // Show onboarding if no questions
      if (questions.length === 0) {
        showOnboarding();
      }
      render();
    });

    $(".save-question").on("click", function () {
      const index = parseInt($(this).data("index"));
      saveQuestion(index);
    });

    $(".cancel-edit").on("click", () => {
      testMode = "view";
      // Show onboarding if no questions
      if (questions.length === 0) {
        showOnboarding();
      }
      render();
    });

    $(".delete-question").on("click", function () {
      const index = parseInt($(this).data("index"));
      if (
        confirm(
          "Are you sure you want to delete this question? This action cannot be undone.",
        )
      ) {
        // Remove the question from the array
        questions.splice(index, 1);
        saveQuestions();

        // Re-render the edit view
        render();
      }
    });
  }
}

// Start the full test
function startTest() {
  currentQuestionIndex = 0;
  userAnswers = new Array(questions.length).fill(undefined);
  testMode = "test";
  filteredQuestions = [];
  selectedSubject = "";
  selectedCategory = "";
  render();
}

// Add a new question
function addQuestion() {
  testMode = "add";
  render();
}

// Edit a specific question
function editQuestion(index) {
  // Store the index of the question being edited
  window.editingQuestionIndex = index;
  testMode = "edit";
  render();
}

// Save a specific question
function saveQuestion(index) {
  const card = $(`.question-edit-card[data-index="${index}"]`);

  if (card.length) {
    // Update question text
    const questionText = card.find(".question-text").val();
    questions[index].question = questionText;

    // Update options
    const optionInputs = card.find(".option-text");
    questions[index].options = optionInputs
      .map(function () {
        return $(this).val();
      })
      .get();

    // Update correct answer
    const correctAnswer = parseInt(card.find(".correct-answer").val());
    questions[index].correctAnswer = correctAnswer;

    // Update metadata
    questions[index].category = card.find(".category").val();
    questions[index].difficulty = card.find(".difficulty").val();
    questions[index].subject = card.find(".subject").val();

    saveQuestions();
  }

  testMode = "view";
  render();
}

// Delete a question
function deleteQuestion(index) {
  if (confirm("Are you sure you want to delete this question?")) {
    questions.splice(index, 1);
    saveQuestions();
    render();
  }
}

// Export questions to JSON
function exportQuestions() {
  const dataStr = JSON.stringify(questions, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "mcq-questions.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

// Import questions from JSON
function importQuestions(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuestions = JSON.parse(e.target.result);
      if (Array.isArray(importedQuestions)) {
        // Ask user if they want to append or replace
        const action = confirm(
          `Found ${importedQuestions.length} questions. Click OK to append to existing questions, or Cancel to replace all existing questions.`,
        );

        if (action) {
          // Append
          questions = questions.concat(importedQuestions);
        } else {
          // Replace
          questions = importedQuestions;
        }

        saveQuestions();
        render();
        alert("Questions imported successfully!");
      } else {
        alert(
          "Invalid file format. Please import a valid JSON array of questions.",
        );
      }
    } catch (error) {
      alert("Error parsing JSON file: " + error.message);
    }
  };
  reader.readAsText(file);
}

// Initialize the app
$(function () {
  init();

  // Add event listeners for navbar navigation
  $("#homeLink").on("click", function (e) {
    e.preventDefault();
    testMode = "view";
    showAllQuestions = false; // Reset show all questions state
    render();
  });

  $("#startTestLink").on("click", function (e) {
    e.preventDefault();
    startTest();
  });

  $("#editQuestionsLink").on("click", function (e) {
    e.preventDefault();
    testMode = "edit";
    showAllQuestions = false; // Reset show all questions state
    render();
  });
});
