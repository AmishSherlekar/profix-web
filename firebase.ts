// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsqUzWj16SyaZooYR8ITVxG449gxha7iQ",
  authDomain: "profix-845c1.firebaseapp.com",
  projectId: "profix-845c1",
  storageBucket: "profix-845c1.firebasestorage.app",
  messagingSenderId: "591771107246",
  appId: "1:591771107246:web:09c024a1e74609babd523f",
  measurementId: "G-BD0EGFJX3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);