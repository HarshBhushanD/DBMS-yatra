// utils/adminService.js
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Check if a user is an admin
export const checkAdminStatus = async (user) => {
  if (!user) return false;
  
  // Hardcoded admin email
  if (user.email === 'harshbhushandixit@gmail.com') {
    return true;
  }
  
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.isAdmin === true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Grant admin access to a user
export const grantAdminAccess = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, { isAdmin: true });
    } else {
      await setDoc(userDocRef, { isAdmin: true });
    }
    
    return true;
  } catch (error) {
    console.error('Error granting admin access:', error);
    return false;
  }
};

// Revoke admin access from a user
export const revokeAdminAccess = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, { isAdmin: false });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error revoking admin access:', error);
    return false;
  }
};