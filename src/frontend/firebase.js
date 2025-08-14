// frontend/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase config (same as backend)
const firebaseConfig = {
  apiKey: "AIzaSyCaMSuMtXh0vAgja4Y0IsR4Vtle1CqmGxc",
  authDomain: "scrum-board-firebase.firebaseapp.com",
  projectId: "scrum-board-firebase",
  storageBucket: "scrum-board-firebase.firebasestorage.app",
  messagingSenderId: "197952936908",
  appId: "1:197952936908:web:33ea4decefab1f46465b69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
