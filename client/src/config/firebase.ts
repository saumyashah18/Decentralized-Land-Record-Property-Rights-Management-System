// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAu9eBTljNWkIVT8hqTE_nhB4cJ7_4h8Kk",
    authDomain: "bhoomisetu-989ce.firebaseapp.com",
    projectId: "bhoomisetu-989ce",
    storageBucket: "bhoomisetu-989ce.firebasestorage.app",
    messagingSenderId: "68776739636",
    appId: "1:68776739636:web:73598ed88954e096d1db61",
    measurementId: "G-WHER7E18F1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
