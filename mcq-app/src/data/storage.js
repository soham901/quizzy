// Storage management for MCQ questions
export class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'mcq_questions';
    this.DEFAULT_QUESTIONS = [
      {
        id: '1',
        question: "Which layer of the OSI model is the topmost layer and closest to the end user?",
        options: [
          "Transport Layer",
          "Network Layer",
          "Application Layer",
          "Data Link Layer"
        ],
        correctAnswer: 2,
        category: "unit-2",
        difficulty: "Easy",
        subject: "CN"
      },
      {
        id: '2',
        question: "What is one of the primary functions of the Application Layer?",
        options: [
          "Routing data packets",
          "Managing physical network connections",
          "Providing network services directly to applications",
          "Ensuring reliable data transport between hosts"
        ],
        correctAnswer: 2,
        category: "unit-2",
        difficulty: "Easy",
        subject: "CN"
      },
      {
        id: '3',
        question: "What is the primary function of the Transport Layer?",
        options: [
          "Routing packets between different networks",
          "Providing logical communication between application processes",
          "Managing physical connections and data link frames",
          "Translating domain names to IP addresses"
        ],
        correctAnswer: 1,
        category: "unit-3",
        difficulty: "Easy",
        subject: "CN"
      }
    ];
  }

  // Initialize storage with default data if empty
  initialize() {
    const existing = this.getAllQuestions();
    if (!existing || existing.length === 0) {
      this.saveQuestions(this.DEFAULT_QUESTIONS);
    }
  }

  // Get all questions from localStorage
  getAllQuestions() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Save questions to localStorage
  saveQuestions(questions) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(questions));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // Add a new question
  addQuestion(question) {
    const questions = this.getAllQuestions();
    const newQuestion = {
      ...question,
      id: Date.now().toString() // Simple ID generation
    };
    questions.push(newQuestion);
    return this.saveQuestions(questions) ? newQuestion : null;
  }

  // Update an existing question
  updateQuestion(id, updatedQuestion) {
    const questions = this.getAllQuestions();
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
      questions[index] = { ...updatedQuestion, id };
      return this.saveQuestions(questions);
    }
    return false;
  }

  // Delete a question
  deleteQuestion(id) {
    const questions = this.getAllQuestions();
    const filtered = questions.filter(q => q.id !== id);
    return this.saveQuestions(filtered);
  }

  // Get questions by category
  getQuestionsByCategory(category) {
    const questions = this.getAllQuestions();
    return questions.filter(q => q.category === category);
  }

  // Get questions by difficulty
  getQuestionsByDifficulty(difficulty) {
    const questions = this.getAllQuestions();
    return questions.filter(q => q.difficulty === difficulty);
  }

  // Search questions by text
  searchQuestions(searchTerm) {
    const questions = this.getAllQuestions();
    const term = searchTerm.toLowerCase();
    return questions.filter(q =>
      q.question.toLowerCase().includes(term) ||
      q.options.some(option => option.toLowerCase().includes(term))
    );
  }

  // Export data as JSON string
  exportData() {
    const questions = this.getAllQuestions();
    return JSON.stringify(questions, null, 2);
  }

  // Import data from JSON string
  importData(jsonData, mode = 'merge') {
    try {
      const importedQuestions = JSON.parse(jsonData);

      if (!Array.isArray(importedQuestions)) {
        throw new Error('Invalid data format');
      }

      // Validate question structure
      importedQuestions.forEach(q => {
        if (!q.question || !q.options || typeof q.correctAnswer !== 'number') {
          throw new Error('Invalid question structure');
        }
      });

      const existingQuestions = this.getAllQuestions();

      let finalQuestions;
      if (mode === 'replace') {
        finalQuestions = importedQuestions.map(q => ({
          ...q,
          id: q.id || Date.now().toString() + Math.random()
        }));
      } else {
        // Merge mode - add new questions, update existing
        const questionMap = new Map();

        // Add existing questions
        existingQuestions.forEach(q => questionMap.set(q.id, q));

        // Add/update imported questions
        importedQuestions.forEach(q => {
          const id = q.id || Date.now().toString() + Math.random();
          questionMap.set(id, { ...q, id });
        });

        finalQuestions = Array.from(questionMap.values());
      }

      return this.saveQuestions(finalQuestions);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}
