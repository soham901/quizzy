import { StorageManager } from './data/storage.js';
import { QuestionList } from './components/QuestionList.js';
import { QuestionEditor } from './components/QuestionEditor.js';
import { TestInterface } from './components/TestInterface.js';
import { ImportExport } from './components/ImportExport.js';

class MCQApp {
  constructor() {
    this.storageManager = new StorageManager();
    this.currentView = 'home';
    this.questionList = null;
    this.questionEditor = null;
    this.testInterface = null;
    this.importExport = null;
  }

  init() {
    // Initialize storage with default data
    this.storageManager.initialize();

    // Initialize components
    this.questionList = new QuestionList(this.storageManager, this.showQuestionEditor.bind(this));
    this.questionEditor = new QuestionEditor(this.storageManager, this.onQuestionSave.bind(this), this.onQuestionCancel.bind(this));
    this.testInterface = new TestInterface(this.storageManager, this.showHome.bind(this));
    this.importExport = new ImportExport(this.storageManager, this.showHome.bind(this));

    // Bind navigation events
    this.bindNavigation();

    // Show initial view
    this.showHome();
  }

  bindNavigation() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a[href="#"]');
      if (!target) return;

      e.preventDefault();

      const navId = target.id;
      switch (navId) {
        case 'nav-home':
          this.showHome();
          break;
        case 'nav-questions':
          this.showQuestions();
          break;
        case 'nav-test':
          this.showTest();
          break;
        case 'nav-import':
          this.showImportExport();
          break;
      }
    });
  }

  showHome() {
    this.currentView = 'home';
    const content = document.querySelector('#content');
    content.innerHTML = `
      <article id="home-section">
        <h2>Welcome to MCQ Test App</h2>
        <p>Manage your MCQ questions, take tests, and track your progress.</p>
        <ul>
          <li>📝 Create and edit questions</li>
          <li>🧪 Take interactive tests</li>
          <li>💾 Import/Export question data</li>
          <li>📊 Track your performance</li>
        </ul>
      </article>
    `;
  }

  showQuestions() {
    this.currentView = 'questions';
    const content = document.querySelector('#content');
    content.innerHTML = this.questionList.render();
    this.questionList.bindEvents(document.body);
  }

  showQuestionEditor(question = null) {
    this.currentView = 'editor';
    const content = document.querySelector('#content');
    content.innerHTML = this.questionEditor.show(question);
    this.questionEditor.bindEvents(document.body);
  }

  showTest() {
    this.currentView = 'test';
    const content = document.querySelector('#content');
    content.innerHTML = this.testInterface.render();
    this.testInterface.bindEvents(document.body);
  }

  showImportExport() {
    this.currentView = 'import-export';
    const content = document.querySelector('#content');
    content.innerHTML = this.importExport.render();
    this.importExport.bindEvents(document.body);
  }

  onQuestionSave() {
    this.showQuestions();
  }

  onQuestionCancel() {
    this.showQuestions();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new MCQApp();
  app.init();
});
