# Simple MCQ Test App

A simple Multiple Choice Question (MCQ) test-taking application built with Pico CSS and Vite. This app allows you to create, edit, and take MCQ tests with localStorage persistence.

## Features

- Create and edit MCQs with multiple options
- Take full tests or subject/topic-wise tests
- View test results with answer review
- Import/export questions as JSON
- Dark theme support using Pico CSS
- Responsive design for all devices
- Native mobile apps for Android and iOS

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development

To start the development server:
```bash
npm run dev
```

### Building

To build the project for production:
```bash
npm run build
```

### Preview

To preview the production build:
```bash
npm run preview
```

## Native Mobile Apps

This project includes native mobile apps for Android and iOS built with Capacitor. See [NATIVE.md](NATIVE.md) for detailed instructions on building and running the native apps.

### Quick Start for Native Apps

1. Build the web app:
   ```bash
   npm run build
   ```

2. Sync with Capacitor:
   ```bash
   npx cap sync
   ```

3. Run on Android:
   ```bash
   npm run cap:android
   ```

4. Run on iOS (macOS only):
   ```bash
   npm run cap:ios
   ```

## Data Structure

Each question follows this structure:
```json
{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "category": "topic-category",
  "difficulty": "easy|medium|hard",
  "subject": "subject-name"
}
```

## Functionality

### View Mode
- See all questions with their options and metadata
- Start different types of tests
- Edit, add, or delete questions
- Import/export questions

### Test Modes
1. **Full Test**: All questions in random order
2. **Subject-wise Test**: Questions filtered by subject
3. **Topic-wise Test**: Questions filtered by subject and topic

### Editing
- Add new questions
- Edit existing questions
- Delete questions

### Import/Export
- Export all questions as JSON
- Import questions from JSON file (choose to append or replace)

## Technologies Used

- [Vite](https://vitejs.dev/) - Build tool
- [Pico CSS](https://picocss.com/) - Minimal CSS framework
- [Capacitor](https://capacitorjs.com/) - Native runtime for mobile apps
- localStorage - For data persistence

## License

MIT