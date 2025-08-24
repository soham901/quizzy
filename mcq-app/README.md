# MCQ Test Taking App

A modern, responsive web application for managing and taking multiple-choice question (MCQ) tests. Built with Vite, Pico CSS (dark theme), and vanilla JavaScript, featuring localStorage for data persistence.

## 🚀 Features

### Core Functionality
- **Question Management**: Create, edit, delete, and organize MCQ questions
- **Interactive Testing**: Take customized tests with real-time scoring
- **Data Persistence**: All data stored locally using localStorage
- **Import/Export**: JSON-based data import/export for backup and sharing
- **Dark Theme**: Built with Pico CSS for a clean, modern interface

### Question Features
- Multiple choice questions with 2-6 options
- Category and difficulty level organization
- Search and filter functionality
- Real-time validation and error handling

### Test Features
- Customizable test settings (category, difficulty, number of questions)
- Progress tracking with visual indicators
- Question navigator for easy jumping between questions
- Detailed results with answer review
- Time tracking for performance analysis

## 🛠️ Technology Stack

- **Frontend Framework**: Vite
- **Styling**: Pico CSS (with dark theme)
- **JavaScript**: ES6+ Modules
- **Storage**: localStorage API
- **Build Tool**: Vite

## 📁 Project Structure

```
mcq-app/
├── index.html          # Main HTML file with Pico CSS integration
├── src/
│   ├── main.js         # Application entry point
│   ├── data/
│   │   └── storage.js  # localStorage management
│   ├── components/
│   │   ├── QuestionList.js     # Question management interface
│   │   ├── QuestionEditor.js   # Question creation/editing
│   │   ├── TestInterface.js    # Test taking functionality
│   │   └── ImportExport.js     # Data import/export
│   └── utils/          # Utility functions (if needed)
├── pico.min.css        # Pico CSS framework
└── package.json        # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd mcq-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5174`

## 📖 Usage Guide

### Navigation
The app features a simple tab-based navigation:
- **Home**: Welcome screen with feature overview
- **Questions**: Manage your question database
- **Take Test**: Configure and take interactive tests
- **Import/Export**: Backup and restore question data

### Managing Questions

#### Adding New Questions
1. Go to the "Questions" tab
2. Click "Add New Question"
3. Fill in the question details:
   - Question text
   - Answer options (2-6 options)
   - Select the correct answer
   - Set category and difficulty
   - Add subject information

#### Editing Questions
1. In the Questions tab, click "Edit" on any question
2. Modify the question details
3. Save your changes

#### Filtering and Searching
- **Search**: Use the search box to find questions by text
- **Category Filter**: Filter by specific categories
- **Statistics**: View real-time stats about your question database

### Taking Tests

#### Test Configuration
1. Go to the "Take Test" tab
2. Configure your test:
   - Select category (or "All Categories")
   - Choose difficulty level
   - Set number of questions (1-50)
3. Click "Start Test"

#### During the Test
- Answer questions using radio buttons
- Navigate between questions using Previous/Next buttons
- Use the question navigator to jump to specific questions
- Track your progress with the visual progress bar

#### Test Results
- View your score and percentage
- Review all answers with correct/incorrect indicators
- See time spent on the test
- Detailed breakdown of each question

### Import/Export

#### Exporting Data
1. Go to the "Import/Export" tab
2. Set a custom filename (optional)
3. Click "Download JSON File"
4. Your question data will be downloaded as a JSON file

#### Importing Data
1. In the Import/Export tab
2. Click "Choose File" and select your JSON file
3. Choose import mode:
   - **Merge**: Add new questions to existing ones
   - **Replace**: Replace all existing questions
4. Click "Import Questions"
5. Preview shows validation results before import

## 💾 Data Structure

Questions are stored in JSON format with the following structure:

```json
{
  "id": "unique-id",
  "question": "Question text here?",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctAnswer": 0,
  "category": "unit-2",
  "difficulty": "Easy",
  "subject": "CN"
}
```

## 🎨 Customization

### Styling
The app uses Pico CSS with custom CSS variables for theming. You can modify colors and styles in `index.html` or add custom CSS files.

### Adding New Features
The modular architecture makes it easy to add new features:
1. Create new components in the `src/components/` directory
2. Import and integrate them in `main.js`
3. Follow the existing component pattern for consistency

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Component Architecture
Each component follows a consistent pattern:
- `render()` - Returns HTML string
- `bindEvents(container)` - Attaches event listeners
- Component-specific methods for functionality

### Storage Management
The `StorageManager` class handles all localStorage operations:
- CRUD operations for questions
- Data validation and error handling
- Import/export functionality

## 🌟 Key Features in Detail

### Question Editor
- Dynamic option management (add/remove options)
- Real-time validation
- Rich text support for questions
- Category and difficulty management

### Test Engine
- Randomized question selection
- Progress tracking
- Answer validation
- Results analysis with detailed feedback

### Data Management
- JSON-based import/export
- Data validation and sanitization
- Merge or replace import modes
- Automatic backup capabilities

## 🔒 Security & Privacy

- All data stored locally (localStorage)
- No external API calls or data transmission
- Client-side only application
- No user authentication required

## 📱 Browser Support

- Modern browsers with ES6+ support
- Chrome 70+
- Firefox 70+
- Safari 12+
- Edge 79+

## 🤝 Contributing

This is a standalone application, but you can:
1. Fork and modify the code
2. Add new features or components
3. Improve the UI/UX
4. Fix bugs and optimize performance

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Vite, Pico CSS, and vanilla JavaScript**
