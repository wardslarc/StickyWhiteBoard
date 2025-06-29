// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc,
  setDoc,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOut = () => firebaseSignOut(auth);

// Export Firestore functions
export { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc,
  setDoc,
  writeBatch,
  query,
  where
};