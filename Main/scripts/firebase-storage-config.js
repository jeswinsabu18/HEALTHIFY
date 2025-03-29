

// Import the Firebase SDK components
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsjEGzYv9RFQLqtZZ_5u0Thv8NO6bZKhg",
    authDomain: "healthify-f48e1.firebaseapp.com",
    projectId: "healthify-f48e1",
    storageBucket: "healthify-f48e1.firebasestorage.app",
    messagingSenderId: "441001472005",
    appId: "1:441001472005:web:df3c878a2b596c75e26c6c",
    measurementId: "G-YDP3B3WZY5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };