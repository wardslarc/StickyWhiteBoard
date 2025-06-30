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
  updateDoc
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
  apiKey: "AIzaSyB4xVSbPYkq7ncQ-IOgdFKEetjow0rOvbw",
  authDomain: "stickywhiteboard.firebaseapp.com",
  projectId: "stickywhiteboard",
  storageBucket: "stickywhiteboard.firebasestorage.app",
  messagingSenderId: "58339019690",
  appId: "1:58339019690:web:be47636dbd716a9d0eb9d3",
  measurementId: "G-B8PJW6XW9P"
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
  updateDoc
};

// Export types for better type safety
export type FirestoreTimestamp = Timestamp;