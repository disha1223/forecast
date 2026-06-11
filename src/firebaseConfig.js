import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHEGHeGmd7gpD_Y0O26tK3heWAtuO8L8Q",
  authDomain: "weather-297c2.firebaseapp.com",
  projectId: "weather-297c2",
  storageBucket: "weather-297c2.firebasestorage.app",
  messagingSenderId: "448411205810",
  appId: "1:448411205810:web:7fb40469359eeef79b89ab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);