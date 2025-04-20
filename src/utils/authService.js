// utils/authService.js
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendPasswordResetEmail
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
  import { db } from '../Firebase0';
  
  const auth = getAuth();
  
  // Register a new user
  export const registerUser = async (email, password, userData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Set up user in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        displayName: userData.displayName || '',
        phoneNumber: userData.phoneNumber || '',
        createdAt: serverTimestamp(),
        isAdmin: email === 'harshbhushandixit@gmail.com' // Auto-set admin for specific email
      });
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Login existing user
  export const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Logout user
  export const logoutUser = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Reset password
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Get current user data from Firestore
  export const getUserData = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { success: true, userData: userDoc.data() };
      } else {
        return { success: false, error: 'User document not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Update user data in Firestore
  export const updateUserData = async (userId, userData) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, userData, { merge: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };