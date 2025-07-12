import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface Flashcard {
  id?: string;
  userId: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  correctCount: number;
}

export interface StudySession {
  id?: string;
  userId: string;
  flashcardIds: string[];
  startTime: Date;
  endTime?: Date;
  correctAnswers: number;
  totalAnswers: number;
}

// Create a new flashcard
export async function createFlashcard(flashcard: Omit<Flashcard, 'id'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = await addDoc(collection(db, 'flashcards'), {
    ...flashcard,
    userId: user.uid,
    createdAt: new Date(),
    reviewCount: 0,
    correctCount: 0
  });

  return docRef.id;
}

// Get user's flashcards
export async function getUserFlashcards(): Promise<Flashcard[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, 'flashcards'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Flashcard[];
}

// Update flashcard progress
export async function updateFlashcardProgress(
  flashcardId: string, 
  reviewCount: number, 
  correctCount: number
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await updateDoc(doc(db, 'flashcards', flashcardId), {
    reviewCount,
    correctCount,
    lastReviewed: new Date()
  });
}

// Create study session
export async function createStudySession(session: Omit<StudySession, 'id'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = await addDoc(collection(db, 'studySessions'), {
    ...session,
    userId: user.uid,
    startTime: new Date()
  });

  return docRef.id;
}

// Get user's study sessions
export async function getUserStudySessions(): Promise<StudySession[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, 'studySessions'),
    where('userId', '==', user.uid),
    orderBy('startTime', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as StudySession[];
}

// Delete a flashcard
export async function deleteFlashcard(flashcardId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await deleteDoc(doc(db, 'flashcards', flashcardId));
} 