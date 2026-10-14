# 📅 Calendar UI

A beautiful, modern, and fully-featured calendar application built with React + Vite. Works as both a web app and a Progressive Web App (PWA) that can be installed on any device.

## ✨ Features

### Core Calendar Features
- **Month View** - Beautiful 7-column calendar grid with current day highlighting
- **Event Management** - Create, edit, and delete events with rich details
- **Task Support** - Deadline-type events with checkbox completion status
- **Category Support** - Color-coded event categories (Exam, Appointment, Birthday, Meeting, Deadline, Other)
- **Today Section** - Desktop sidebar showing today's events and tasks
- **Date Selection** - Click any date to see all events for that day
- **Event Indicators** - Visual dots on dates with events (max 3 dots, +N for more)

### User Experience
- **Dark Theme** - Modern dark UI with smooth animations and transitions
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Touch-Friendly** - Optimized buttons and interactions for touch devices
- **Smooth Animations** - Polished transitions and micro-interactions
- **Error Handling** - Clear error messages with recovery options
- **Loading States** - Visual feedback during async operations
- **Empty States** - Helpful messaging when no events exist

### Advanced Features
- **Keyboard Shortcuts** - Cmd/Ctrl+N, Esc, Arrow keys for navigation
- **Form Validation** - Real-time validation with character counters
- **Edit Events** - Modify event details after creation
- **API Integration** - Connected to calendar-service backend
- **Error Recovery** - Handles network failures gracefully

### PWA Features
- **Installable** - Add to home screen on iOS, Android, desktop
- **Offline Support** - Basic caching for offline access
- **Standalone Mode** - Runs as a native-looking app
- **App Shortcuts** - Quick actions from home screen

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Calendar Service API running ([see setup](https://github.com/Luissoares11/calendar-service))

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd calendar-ui
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your Calendar Service API details:
```env
VITE_CALENDAR_SERVICE_URL=http://localhost:8010
VITE_CALENDAR_API_TOKEN=your_api_token
```

4. Start development server
```bash
npm run dev
```

Your app will open at http://localhost:5173/

## 🔐 Security

⚠️ **Important**: The `.env` file contains sensitive information (API tokens). It is **never** committed to version control and is listed in `.gitignore`.

- Never share your API token
- Keep `.env` file private

## 🏗️ Build & Deploy

Create a production build:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📦 Environment Variables

Create a `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CALENDAR_SERVICE_URL` | URL of the Calendar Service API | `http://localhost:8010` |
| `VITE_CALENDAR_API_TOKEN` | API authentication token | Your secret token |
