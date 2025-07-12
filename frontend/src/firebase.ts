import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDF0A-2vwdV3KVvZFwj6yZtlAizrn5ryw4",
  authDomain: "flashcards-app-2.firebaseapp.com",
  projectId: "flashcards-app-2",
  storageBucket: "flashcards-app-2.firebasestorage.app",
  appId: "1:800511631201:web:c3318015dc960b1dacef20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 