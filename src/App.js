// // App.js - Main Application File
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from './Firebase';

// // Pages
// import Login from './pages/Login';
// import Register from './pages/Register';
// import UserDashboard from './pages/user/Dashboard';
// import BookTicket from './pages/user/BookTicket';
// import MyTickets from './pages/user/MyTickets';
// import AdminDashboard from './pages/admin/Dashboard';
// import AddTrain from './pages/admin/AddTrain';
// import ManageTrains from './pages/admin/ManageTrains';

// // Components
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';
// import AdminRoute from './components/AdminRoute';

// function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
      
//       // Check if user is admin (in a real app, this would check a database)
//       if (currentUser) {
//         // For demo purposes, check if email contains "admin"
//         setIsAdmin(currentUser.email.includes('admin'));
//       }
      
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-100">
//         <Navbar user={user} isAdmin={isAdmin} />
//         <div className="container mx-auto py-6 px-4">
//           <Routes>
//             <Route path="/" element={user ? <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} /> : <Navigate to="/login" />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
            
//             {/* User Routes */}
//             <Route path="/dashboard" element={<ProtectedRoute user={user}><UserDashboard /></ProtectedRoute>} />
//             <Route path="/book-ticket" element={<ProtectedRoute user={user}><BookTicket /></ProtectedRoute>} />
//             <Route path="/my-tickets" element={<ProtectedRoute user={user}><MyTickets /></ProtectedRoute>} />
            
//             {/* Admin Routes */}
//             <Route path="/admin/dashboard" element={<AdminRoute user={user} isAdmin={isAdmin}><AdminDashboard /></AdminRoute>} />
//             <Route path="/admin/add-train" element={<AdminRoute user={user} isAdmin={isAdmin}><AddTrain /></AdminRoute>} />
//             <Route path="/admin/manage-trains" element={<AdminRoute user={user} isAdmin={isAdmin}><ManageTrains /></AdminRoute>} />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;

// App.js - Main Application File
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './Firebase';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/user/Dashboard';
import BookTicket from './pages/user/BookTicket';
import MyTickets from './pages/user/MyTickets';
import AdminDashboard from './pages/admin/Dashboard';
import AddTrain from './pages/admin/AddTrain';
import ManageTrains from './pages/admin/ManageTrains';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Check if user is admin
      if (currentUser) {
        // Grant admin access to specific email
        if (currentUser.email === 'harshbhushandixit@gmail.com') {
          setIsAdmin(true);
        } else {
          // For other users, check admin status in database
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
        setIsAdmin(false);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} isAdmin={isAdmin} />
        <div className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={user ? <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute user={user}><UserDashboard /></ProtectedRoute>} />
            <Route path="/book-ticket" element={<ProtectedRoute user={user}><BookTicket /></ProtectedRoute>} />
            <Route path="/my-tickets" element={<ProtectedRoute user={user}><MyTickets /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute user={user} isAdmin={isAdmin}><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/add-train" element={<AdminRoute user={user} isAdmin={isAdmin}><AddTrain /></AdminRoute>} />
            <Route path="/admin/manage-trains" element={<AdminRoute user={user} isAdmin={isAdmin}><ManageTrains /></AdminRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;