import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDm5elmw1tA0-iEWQXFTfzpbgv3mxK1rKU",
  authDomain: "biriyanidibe-38898.firebaseapp.com",
  projectId: "biriyanidibe-38898",
  storageBucket: "biriyanidibe-38898.firebasestorage.app",
  messagingSenderId: "1083766037281",
  appId: "1:1083766037281:web:3dc3dfb613e887552a7c60",
  measurementId: "G-L08TJ99C96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
