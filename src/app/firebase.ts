// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSNXLB8OFNT-g3392DQBQUeT9pDVkY--8",
  authDomain: "administracion-edificios-ce315.firebaseapp.com",
  projectId: "administracion-edificios-ce315",
  storageBucket: "administracion-edificios-ce315.firebasestorage.app",
  messagingSenderId: "6822165094",
  appId: "1:6822165094:web:133e3f21d882f8cf394ba7",
  measurementId: "G-QYZDWERLQV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
