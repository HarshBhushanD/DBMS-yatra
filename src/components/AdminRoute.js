// // components/AdminRoute.js
// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const AdminRoute = ({ user, isAdmin, children }) => {
//   if (!user) {
//     return <Navigate to="/login" />;
//   }
  
//   if (!isAdmin) {
//     return <Navigate to="/dashboard" />;
//   }
  
//   return children;
// };

// export default AdminRoute;
// components/AdminRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../firebase';
import { db } from '../Firebase';

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Check if user is admin
        if (currentUser.email === 'harshbhushandixit@gmail.com') {
          // This specific email gets admin access by default
          setIsAdmin(true);
        } else {
          // For other users, check the admin role in Firestore
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setIsAdmin(userData.isAdmin === true);
            } else {
              setIsAdmin(false);
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div className="loading">Checking admin access...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default AdminRoute;