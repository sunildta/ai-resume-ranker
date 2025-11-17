// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyYoi3Ms5-3NQfyjjsEpZXjgE6I9gpMvU",
  authDomain: "ai-resume-ranker-5c6bb.firebaseapp.com",
  projectId: "ai-resume-ranker-5c6bb",
  storageBucket: "ai-resume-ranker-5c6bb.firebasestorage.app",
  messagingSenderId: "44017234767",
  appId: "1:44017234767:web:ccc832d9f626e42d8dcb3a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {auth};
export default app;