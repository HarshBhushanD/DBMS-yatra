import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCZcelrPNc2GmIyfim10js0PpQ4nylsdn4",
  authDomain: "yatra-3734b.firebaseapp.com",
  projectId: "yatra-3734b",
  storageBucket: "yatra-3734b.firebasestorage.app",
  messagingSenderId: "166079933941",
  appId: "1:166079933941:web:c63db3eb38aabfb8d284bc",
  measurementId: "G-SYV9GD7M3R"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth,analytics,app };