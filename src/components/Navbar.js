import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth,db } from '../Firebase';

const Navbar = ({ user, isAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="font-bold text-xl">Railway Booking System</Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {isAdmin ? (
                  // Admin Navigation Links
                  <>
                    <Link to="/admin/dashboard" className="hover:text-blue-200">Dashboard</Link>
                    <Link to="/admin/add-train" className="hover:text-blue-200">Add Train</Link>
                    <Link to="/admin/manage-trains" className="hover:text-blue-200">Manage Trains</Link>
                  </>
                ) : (
                  // User Navigation Links
                  <>
                    <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                    <Link to="/book-ticket" className="hover:text-blue-200">Book Ticket</Link>
                    <Link to="/my-tickets" className="hover:text-blue-200">My Tickets</Link>
                  </>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;