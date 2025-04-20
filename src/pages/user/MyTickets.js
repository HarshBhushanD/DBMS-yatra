import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../Firebase';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  // First, ensure we have the authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Then fetch tickets once we have a user
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        console.log("No user found, skipping ticket fetch");
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching tickets for user:", user.uid);
        const ticketsRef = collection(db, 'tickets');
        const q = query(
          ticketsRef,
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Query snapshot size:", querySnapshot.size);
        
        if (querySnapshot.empty) {
          console.log("No tickets found for user");
          setTickets([]);
          setError("No tickets found. Book your first ticket to see it here!");
        } else {
          const ticketsData = [];
          querySnapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            console.log("Ticket data:", data);
            ticketsData.push(data);
          });
          
          ticketsData.sort((a, b) => {
            const dateA = a.departureDate?.toDate ? a.departureDate.toDate() : new Date(a.departureDate);
            const dateB = b.departureDate?.toDate ? b.departureDate.toDate() : new Date(b.departureDate);
            return dateB - dateA;
          });
          
          setTickets(ticketsData);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        console.error('Error details:', error.code, error.message);
        setError(`Error loading tickets: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, [user]);
  
  const getFilteredTickets = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return tickets.filter(ticket => {
          const departureDate = ticket.departureDate?.toDate ? 
            ticket.departureDate.toDate() : 
            ticket.departureDate instanceof Date ? 
              ticket.departureDate : 
              new Date(ticket.departureDate);
          return departureDate >= now;
        });
        
      case 'past':
        return tickets.filter(ticket => {
          const departureDate = ticket.departureDate?.toDate ? 
            ticket.departureDate.toDate() : 
            ticket.departureDate instanceof Date ? 
              ticket.departureDate : 
              new Date(ticket.departureDate);
          return departureDate < now;
        });
        
      default:
        return tickets;
    }
  };
  
  const filteredTickets = getFilteredTickets();
  
  if (!user && !loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          Please log in to view your tickets.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded ${filter === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Past
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Loading your tickets...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                  <div>
                    <h3 className="font-medium">{ticket.trainName} (#{ticket.trainNumber})</h3>
                    <p className="text-sm text-gray-600">PNR: {ticket.pnr}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                      ticket.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      ticket.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {ticket.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="font-medium text-lg">{ticket.source}</p>
                      <p className="text-sm text-gray-600">{ticket.departureTime}</p>
                    </div>
                    <div className="border-t border-dashed flex-grow mx-4 h-0 self-center"></div>
                    <div className="text-right">
                      <p className="font-medium text-lg">{ticket.destination}</p>
                      <p className="text-sm text-gray-600">
                        {ticket.departureDate?.toDate ? 
                          ticket.departureDate.toDate().toLocaleDateString() : 
                          new Date(ticket.departureDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Passenger</p>
                      <p className="font-medium">{ticket.passengerName} ({ticket.passengerAge}, {ticket.passengerGender})</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Seat</p>
                      <p className="font-medium">{ticket.seatType} • {ticket.seatNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Fare</p>
                      <p className="font-medium">₹{ticket.fare}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No tickets found. {user ? "You haven't booked any tickets yet." : "Please log in to view your tickets."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;