// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLrJcUISHH2UVKeT88cT3uHN0tpTp5Dx0",
  authDomain: "wildcore-88292.firebaseapp.com",
  databaseURL: "https://wildcore-88292-default-rtdb.firebaseio.com",
  projectId: "wildcore-88292",
  storageBucket: "wildcore-88292.firebasestorage.app",
  messagingSenderId: "380042176463",
  appId: "1:380042176463:web:9cb282817911239b4754ba",
  measurementId: "G-C3C9JETKK3"
};

// Initialize Firebase and services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);

// Export initialized services
export { auth, firestore, analytics, functions };
export default app; 