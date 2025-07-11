# Hebrew Flashcards App with Firebase

A modern Hebrew flashcards application built with React, TypeScript, and Firebase (Hosting + Firestore).

## Project Structure

```
flashcards-app-2.firebase/
├── frontend/          # React + Vite frontend
├── shared/            # Shared types and utilities
├── firebase.json      # Firebase configuration
└── .firebaserc        # Firebase project settings
```

## Prerequisites

- Node.js 18 or higher
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

## Setup Instructions

### 1. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - **Authentication** (Email/Password) - **FREE**
   - **Firestore Database** - **FREE** (1GB storage, 50K reads/day, 20K writes/day)
   - **Hosting** - **FREE** (10GB storage, 360MB/day transfer)

### 2. Firebase Configuration

1. Get your Firebase config from the Firebase Console:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web app icon (</>) to add a web app
   - Copy the configuration object

2. Update the Firebase config in `frontend/src/firebase.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

3. Update the project ID in `.firebaserc`:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm run install:all
```

### 4. Build Shared Package

```bash
cd shared
npm run build
```

### 5. Development

```bash
# Start frontend in development mode
npm run dev

# Or start frontend specifically:
npm run dev:frontend
```

### 6. Deployment

```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
npm run deploy
```

## Features

- **Hebrew Flashcards**: Study Hebrew vocabulary with flashcards
- **Multiple Question Types**: Hebrew to English, English to Hebrew, and transliteration
- **Progress Tracking**: Save and track your learning progress in Firestore
- **Firebase Backend**: Free tier with Firestore database
- **Authentication**: User authentication and progress syncing
- **Responsive Design**: Works on desktop and mobile devices

## Data Structure

The app uses the following data structure:

### Flashcards
```typescript
interface Flashcard {
  id: string;
  hebrew: string;
  transliteration: string;
  english: string;
  category?: string;
  difficulty?: number;
}
```

### User Progress
```typescript
interface UserProgress {
  userId: string;
  flashcardId: string;
  correct: boolean;
  timestamp: Date;
  timeSpent?: number;
}
```

## Firebase Services Used (All FREE)

- **Authentication**: User login/signup (10K users/month free)
- **Firestore**: Store flashcards and user progress (1GB storage, 50K reads/day, 20K writes/day)
- **Hosting**: Serve the frontend application (10GB storage, 360MB/day transfer)

## Cost Breakdown

### Free Tier Limits:
- **Authentication**: 10,000 users/month
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Hosting**: 10GB storage, 360MB/day transfer

### When you might need to pay:
- If you exceed 50K Firestore reads/day
- If you exceed 20K Firestore writes/day
- If you exceed 1GB Firestore storage
- If you exceed 10K authenticated users/month

For a flashcards app, these limits are typically sufficient for personal use or small to medium-sized applications.

## Environment Variables

Create a `.env` file in the root directory:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## Troubleshooting

### Common Issues

1. **Firebase Hosting not deploying**: Make sure you have the Firebase CLI installed and are logged in
2. **Firestore rules**: Make sure your Firestore security rules allow read/write access
3. **Authentication issues**: Verify your Firebase config is correct

### Getting Help

- Check the Firebase documentation: https://firebase.google.com/docs
- Review the Firebase Console for any error messages
- Check the browser console for frontend errors

## License

This project is licensed under the MIT License. 