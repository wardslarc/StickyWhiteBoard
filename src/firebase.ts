// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc,
  getDoc, // Added missing getDoc import
  setDoc,
  writeBatch,
  query,
  where,
  Timestamp,
  updateDoc,
  serverTimestamp,
  arrayUnion
} from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCihWmdYsInRm8QNYC3-lbc9OwomhQxpHQ",
  authDomain: "stickyboard-3a202.firebaseapp.com",
  projectId: "stickyboard-3a202",
  storageBucket: "stickyboard-3a202.firebasestorage.app",
  messagingSenderId: "549664351902",
  appId: "1:549664351902:web:fd0123b07951353cab3d8f",
  measurementId: "G-V8FN3DTZW1"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Set up Google auth provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOut = () => firebaseSignOut(auth);

// Export Firestore functions as named exports
export { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc,
  getDoc, // Added to exports
  setDoc,
  writeBatch,
  query,
  where,
  Timestamp,
  updateDoc,
  serverTimestamp,
  arrayUnion
};

// Export types for better type safety
export type FirestoreTimestamp = Timestamp;