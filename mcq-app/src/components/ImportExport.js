export class ImportExport {
  constructor(storageManager, onBackToHome) {
    this.storageManager = storageManager;
    this.onBackToHome = onBackToHome;
  }

  render() {
    const questionCount = this.storageManager.getAllQuestions().length;
    const categories = this.getUniqueCategories();
    const exportData = this.storageManager.exportData();

    const html = `
      <article>
        <h2>Import/Export Data</h2>
        <p>Manage your question database by importing from or exporting to JSON files.</p>

        <!-- Current Database Info -->
        <div style="margin-bottom: 3rem; padding: 2rem; background: var(--pico-background-color); border-radius: var(--pico-border-radius);">
          <h3>Current Database</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <div><strong>Total Questions:</strong> ${questionCount}</div>
            <div><strong>Categories:</strong> ${categories.length}</div>
            <div><strong>Size:</strong> ${this.formatBytes(new Blob([exportData]).size)}</div>
            <div><strong>Last Modified:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">

          <!-- Export Section -->
          <div>
            <h3>📤 Export Data</h3>
            <p>Download all your questions as a JSON file for backup or sharing.</p>

            <div style="margin-bottom: 2rem;">
              <label for="export-filename">File Name:</label>
              <input
                type="text"
                id="export-filename"
                value="mcq-questions-${new Date().toISOString().split('T')[0]}"
                style="margin-bottom: 1rem;"
              >
            </div>

            <button id="export-btn" style="width: 100%;">Download JSON File</button>

            <!-- Preview -->
            <details style="margin-top: 2rem;">
              <summary>Preview Data Structure</summary>
              <pre style="background: var(--pico-code-background-color); padding: 1rem; border-radius: var(--pico-border-radius); overflow-x: auto; font-size: 0.8rem; margin-top: 1rem;">
${JSON.stringify(JSON.parse(exportData), null, 2)}
              </pre>
            </details>
          </div>

          <!-- Import Section -->
          <div>
            <h3>📥 Import Data</h3>
            <p>Upload a JSON file to add questions to your database.</p>

            <div style="margin-bottom: 2rem;">
              <label for="import-file">Select JSON File:</label>
              <input
                type="file"
                id="import-file"
                accept=".json"
                style="margin-bottom: 1rem;"
              >

              <div style="margin-top: 1rem;">
                <label for="import-mode">Import Mode:</label>
                <select id="import-mode" style="margin-top: 0.5rem;">
                  <option value="merge">Merge with existing questions</option>
                  <option value="replace">Replace all existing questions</option>
                </select>
              </div>
            </div>

            <button id="import-btn" disabled style="width: 100%;">Import Questions</button>

            <!-- Import Preview -->
            <div id="import-preview" style="margin-top: 2rem; display: none;">
              <h4>Import Preview</h4>
              <div id="import-info" style="padding: 1rem; background: var(--pico-background-color); border-radius: var(--pico-border-radius);"></div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin-top: 3rem;">
          <button id="back-btn" class="secondary">Back to Home</button>
        </div>
      </article>
    `;

    return html;
  }

  bindEvents(container) {
    const exportBtn = container.querySelector('#export-btn');
    const importBtn = container.querySelector('#import-btn');
    const importFile = container.querySelector('#import-file');
    const backBtn = container.querySelector('#back-btn');

    // Export functionality
    exportBtn?.addEventListener('click', () => {
      this.handleExport(container);
    });

    // Import file selection
    importFile?.addEventListener('change', (e) => {
      this.handleFileSelection(e, container);
    });

    // Import functionality
    importBtn?.addEventListener('click', () => {
      this.handleImport(container);
    });

    // Back button
    backBtn?.addEventListener('click', () => {
      this.onBackToHome();
    });
  }

  handleExport(container) {
    try {
      const filename = container.querySelector('#export-filename').value.trim() || 'mcq-questions';
      const data = this.storageManager.exportData();

      // Create and download the file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success message
      this.showMessage(container, 'Data exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      this.showMessage(container, 'Error exporting data. Please try again.', 'error');
    }
  }

  async handleFileSelection(event, container) {
    const file = event.target.files[0];
    const importBtn = container.querySelector('#import-btn');
    const importPreview = container.querySelector('#import-preview');
    const importInfo = container.querySelector('#import-info');

    if (!file) {
      importBtn.disabled = true;
      importPreview.style.display = 'none';
      return;
    }

    try {
      const text = await this.readFileAsText(file);
      const importedData = JSON.parse(text);

      // Validate the data structure
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid data format. Expected an array of questions.');
      }

      // Count valid questions
      const validQuestions = importedData.filter(q => {
        return q.question &&
               q.options &&
               Array.isArray(q.options) &&
               q.options.length >= 2 &&
               typeof q.correctAnswer === 'number' &&
               q.correctAnswer >= 0 &&
               q.correctAnswer < q.options.length;
      });

      // Show preview
      importInfo.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <strong>Valid Questions:</strong> ${validQuestions.length}/${importedData.length}
        </div>
        <div style="margin-bottom: 1rem;">
          <strong>Categories:</strong> ${[...new Set(validQuestions.map(q => q.category))].join(', ')}
        </div>
        <div style="margin-bottom: 1rem;">
          <strong>Sample Question:</strong> ${validQuestions[0]?.question || 'No valid questions found'}
        </div>
      `;

      importPreview.style.display = 'block';
      importBtn.disabled = validQuestions.length === 0;

      // Store the data for import
      this.pendingImportData = text;

    } catch (error) {
      console.error('File processing error:', error);
      importInfo.innerHTML = `<div style="color: var(--pico-color-red-600);">Error: ${error.message}</div>`;
      importPreview.style.display = 'block';
      importBtn.disabled = true;
      this.pendingImportData = null;
    }
  }

  handleImport(container) {
    if (!this.pendingImportData) {
      this.showMessage(container, 'Please select a valid JSON file first.', 'error');
      return;
    }

    try {
      const importMode = container.querySelector('#import-mode').value;
      const success = this.storageManager.importData(this.pendingImportData, importMode);

      if (success) {
        const message = importMode === 'replace'
          ? 'All questions replaced successfully!'
          : 'Questions imported and merged successfully!';
        this.showMessage(container, message, 'success');

        // Clear the file input and refresh the view
        container.querySelector('#import-file').value = '';
        container.querySelector('#import-preview').style.display = 'none';
        this.pendingImportData = null;

        // Update the display to show new stats
        this.updateDisplay(container);
      } else {
        this.showMessage(container, 'Error importing questions. Please check the data format.', 'error');
      }
    } catch (error) {
      console.error('Import error:', error);
      this.showMessage(container, 'Error importing data. Please try again.', 'error');
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  showMessage(container, message, type = 'info') {
    // Remove any existing messages
    const existingMessage = container.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.style.cssText = `
      padding: 1rem;
      margin: 1rem 0;
      border-radius: var(--pico-border-radius);
      border-left: 4px solid ${type === 'success' ? 'var(--pico-color-green-600)' : type === 'error' ? 'var(--pico-color-red-600)' : 'var(--pico-color-blue-600)'};
      background: var(--pico-background-color);
    `;
    messageDiv.textContent = message;

    // Insert at the top of the article
    const article = container.querySelector('article');
    article.insertBefore(messageDiv, article.firstElementChild.nextSibling);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  updateDisplay(container) {
    const contentDiv = container.querySelector('#content');
    if (contentDiv) {
      contentDiv.innerHTML = this.render();
      this.bindEvents(container);
    }
  }

  getUniqueCategories() {
    const questions = this.storageManager.getAllQuestions();
    return [...new Set(questions.map(q => q.category))];
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
