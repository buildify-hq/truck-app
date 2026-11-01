import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1jho22j3pxEqGHeiiqbOE9vO2q_WV2W4",
  authDomain: "truck-app-74a76.firebaseapp.com",
  projectId: "truck-app-74a76",
  storageBucket: "truck-app-74a76.firebasestorage.app",
  messagingSenderId: "1063242135814",
  appId: "1:1063242135814:web:89192ad80dd4c384540687"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
