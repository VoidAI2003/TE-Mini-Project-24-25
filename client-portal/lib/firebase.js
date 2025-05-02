import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALh6y3svnXTv3j8qO0nMvkKKinaeNGla0",
  authDomain: "smartchain-cfffa.firebaseapp.com",
  projectId: "smartchain-cfffa",
  storageBucket: "smartchain-cfffa.firebasestorage.app",
  messagingSenderId: "989621610467",
  appId: "1:989621610467:web:519cfbcf2e78b9443062d6",
  measurementId: "G-1YLNHE8ZVZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
