// FirebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3hPS8B2rq6kTDu_r1_E8Ee-LqGg_25QA",
  authDomain: "bac2street.firebaseapp.com",
  projectId: "bac2street",
  storageBucket: "bac2street.appspot.com",
  messagingSenderId: "298288188091",
  appId: "1:298288188091:web:b918ebffc00620f319f79e",
  measurementId: "G-8DTLZTBV9E"
};

// ✅ Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
