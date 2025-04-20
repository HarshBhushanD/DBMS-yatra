import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth,db } from '../../Firebase';

const UserDashboard = () => {
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingTrips = async () => {
      if (!auth.currentUser) {
        console.log('No authenticated user found');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Current user:', auth.currentUser.uid);
        const today = new Date();
        console.log('Today:', today);
        
        const ticketsRef = collection(db, 'tickets');
        const q = query(
          ticketsRef,
          where('userId', '==', auth.currentUser.uid),
          where('departureDate', '>=', today),
          orderBy('departureDate'),
          limit(5)
        );
        
        console.log('Query created:', q);
        const querySnapshot = await getDocs(q);
        console.log('Query snapshot size:', querySnapshot.size);
        
        const tickets = [];
        querySnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          console.log('Ticket data:', data);
          tickets.push(data);
        });
        
        console.log('Fetched tickets:', tickets);
        setUpcomingTrips(tickets);
      } catch (error) {
        console.error('Error fetching upcoming trips:', error);
        console.error('Error details:', error.code, error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpcomingTrips();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {auth.currentUser?.displayName || 'User'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Link to="/book-ticket" className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-md transition flex items-center justify-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <span className="text-lg font-medium">Book New Ticket</span>
        </Link>
        
        <Link to="/my-tickets" className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-md transition flex items-center justify-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-lg font-medium">View All Tickets</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Trips</h2>
        
        {loading ? (
          <div className="text-center py-4">Loading your trips...</div>
        ) : upcomingTrips.length > 0 ? (
          <div className="space-y-4">
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-lg">{trip.trainName} (#{trip.trainNumber})</div>
                    <div className="text-sm text-gray-600">
                      {trip.source} to {trip.destination}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(trip.departureDate.toDate()).toLocaleDateString()} at {trip.departureTime}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      PNR: {trip.pnr} • Status: <span className={`font-medium ${
                        trip.status === 'confirmed' ? 'text-green-600' : 
                        trip.status === 'waiting' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>{trip.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">₹{trip.fare}</div>
                    <div className="text-xs text-gray-500">{trip.seatType} • {trip.seatNumber}</div>
                    <div className="text-xs text-gray-500 mt-1">{trip.passengerName} ({trip.passengerAge}, {trip.passengerGender})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>You don't have any upcoming trips</p>
            <Link to="/book-ticket" className="inline-block mt-2 text-blue-600 hover:underline">
              Book a ticket now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;