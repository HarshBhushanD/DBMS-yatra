import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../../Firebase';

const BookTicket = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search parameters
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  
  // Indian state capitals with state information
  const stateCapitals = [
    { id: 'cap-01', name: 'Amaravati', state: 'AP', stateFullName: 'Andhra Pradesh' },
    { id: 'cap-02', name: 'Itanagar', state: 'AR', stateFullName: 'Arunachal Pradesh' },
    { id: 'cap-03', name: 'Dispur', state: 'AS', stateFullName: 'Assam' },
    { id: 'cap-04', name: 'Patna', state: 'BR', stateFullName: 'Bihar' },
    { id: 'cap-05', name: 'Raipur', state: 'CG', stateFullName: 'Chhattisgarh' },
    { id: 'cap-06', name: 'Panaji', state: 'GA', stateFullName: 'Goa' },
    { id: 'cap-07', name: 'Gandhinagar', state: 'GJ', stateFullName: 'Gujarat' },
    { id: 'cap-08', name: 'Chandigarh', state: 'HR', stateFullName: 'Haryana' },
    { id: 'cap-09', name: 'Shimla', state: 'HP', stateFullName: 'Himachal Pradesh' },
    { id: 'cap-10', name: 'Ranchi', state: 'JH', stateFullName: 'Jharkhand' },
    { id: 'cap-11', name: 'Bengaluru', state: 'KA', stateFullName: 'Karnataka' },
    { id: 'cap-12', name: 'Thiruvananthapuram', state: 'KL', stateFullName: 'Kerala' },
    { id: 'cap-13', name: 'Bhopal', state: 'MP', stateFullName: 'Madhya Pradesh' },
    { id: 'cap-14', name: 'Mumbai', state: 'MH', stateFullName: 'Maharashtra' },
    { id: 'cap-15', name: 'Imphal', state: 'MN', stateFullName: 'Manipur' },
    { id: 'cap-16', name: 'Shillong', state: 'ML', stateFullName: 'Meghalaya' },
    { id: 'cap-17', name: 'Aizawl', state: 'MZ', stateFullName: 'Mizoram' },
    { id: 'cap-18', name: 'Kohima', state: 'NL', stateFullName: 'Nagaland' },
    { id: 'cap-19', name: 'Bhubaneswar', state: 'OD', stateFullName: 'Odisha' },
    { id: 'cap-20', name: 'Chandigarh', state: 'PB', stateFullName: 'Punjab' },
    { id: 'cap-21', name: 'Jaipur', state: 'RJ', stateFullName: 'Rajasthan' },
    { id: 'cap-22', name: 'Gangtok', state: 'SK', stateFullName: 'Sikkim' },
    { id: 'cap-23', name: 'Chennai', state: 'TN', stateFullName: 'Tamil Nadu' },
    { id: 'cap-24', name: 'Hyderabad', state: 'TS', stateFullName: 'Telangana' },
    { id: 'cap-25', name: 'Agartala', state: 'TR', stateFullName: 'Tripura' },
    { id: 'cap-26', name: 'Lucknow', state: 'UP', stateFullName: 'Uttar Pradesh' },
    { id: 'cap-27', name: 'Dehradun', state: 'UK', stateFullName: 'Uttarakhand' },
    { id: 'cap-28', name: 'Kolkata', state: 'WB', stateFullName: 'West Bengal' },
    { id: 'cap-29', name: 'New Delhi', state: 'DL', stateFullName: 'Delhi' },
    { id: 'cap-30', name: 'Jammu', state: 'JK', stateFullName: 'Jammu and Kashmir' },
    { id: 'cap-31', name: 'Srinagar', state: 'JK', stateFullName: 'Jammu and Kashmir (Summer)' },
    { id: 'cap-32', name: 'Port Blair', state: 'AN', stateFullName: 'Andaman and Nicobar Islands' },
    { id: 'cap-33', name: 'Chandigarh', state: 'CH', stateFullName: 'Chandigarh' },
    { id: 'cap-34', name: 'Daman', state: 'DN', stateFullName: 'Dadra and Nagar Haveli and Daman and Diu' },
    { id: 'cap-35', name: 'Kavaratti', state: 'LD', stateFullName: 'Lakshadweep' },
    { id: 'cap-36', name: 'Puducherry', state: 'PY', stateFullName: 'Puducherry' },
    { id: 'cap-37', name: 'Ladakh', state: 'LA', stateFullName: 'Ladakh' }
  ];
  
  // Selected train details
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState({
    name: auth.currentUser?.displayName || '',
    age: '',
    gender: 'male',
    seatType: 'sleeper', // sleeper, ac, general
  });
  
  // Payment details (simplified)
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  useEffect(() => {
    const loadStationsAndTrains = async () => {
      try {
        // Load stations
        const stationsSnapshot = await getDocs(collection(db, 'stations'));
        const stationsData = [];
        stationsSnapshot.forEach((doc) => {
          stationsData.push({ id: doc.id, ...doc.data() });
        });
        
        // Add Indian state capitals if not already in the stations list
        const existingStationNames = new Set(stationsData.map(station => station.name));
        stateCapitals.forEach(capital => {
          if (!existingStationNames.has(capital.name)) {
            stationsData.push({
              id: `auto-${capital.name.toLowerCase().replace(/\s+/g, '-')}`,
              name: capital.name,
              code: capital.name.substring(0, 3).toUpperCase(),
              state: capital.state,
              stateFullName: capital.stateFullName
            });
          }
        });
        
        // Sort stations alphabetically
        stationsData.sort((a, b) => a.name.localeCompare(b.name));
        setStations(stationsData);
        
        // Load trains
        const trainsSnapshot = await getDocs(collection(db, 'trains'));
        const trainsData = [];
        trainsSnapshot.forEach((doc) => {
          trainsData.push({ id: doc.id, ...doc.data() });
        });
        
        // Ensure all trains have the state capitals in their routes
        trainsData.forEach(train => {
          if (!train.routes) {
            train.routes = [];
          }
          // Add state capitals to routes if not already included
          // This is simplified; in a real app, you'd have proper route configuration
          stateCapitals.forEach(capital => {
            if (!train.routes.includes(capital.name)) {
              train.routes.push(capital.name);
            }
          });
        });
        
        setTrains(trainsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStationsAndTrains();
  }, []);
  
  // Filter trains based on source, destination and date
  const handleSearchTrains = () => {
    if (!source || !destination || !date) {
      alert('Please fill all search fields');
      return;
    }
    
    // In a real app, this would be a more sophisticated query to Firebase
    const filtered = trains.filter((train) => {
      const trainRoutes = train.routes || [];
      
      // Check if train passes through both source and destination in correct order
      const sourceIndex = trainRoutes.indexOf(source);
      const destIndex = trainRoutes.indexOf(destination);
      
      return sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex;
    });
    
    setFilteredTrains(filtered);
    setStep(2);
  };
  
  // Select a train
  const selectTrain = (train) => {
    setSelectedTrain(train);
    setStep(3);
  };
  
  // Handle passenger details change
  const handlePassengerChange = (e) => {
    const { name, value } = e.target;
    setPassengerDetails((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle payment and ticket creation
  const handleBookTicket = async () => {
    if (!selectedTrain || !passengerDetails.name || !passengerDetails.age) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate a PNR number
      const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      
      // Calculate fare based on distance and seat type
      const sourceIndex = selectedTrain.routes.indexOf(source);
      const destIndex = selectedTrain.routes.indexOf(destination);
      const distance = (destIndex - sourceIndex) * 100; // Simplified distance calculation
      
      let baseFare = distance * 1.5;
      if (passengerDetails.seatType === 'ac') {
        baseFare *= 2;
      } else if (passengerDetails.seatType === 'sleeper') {
        baseFare *= 1.5;
      }
      
      const fare = Math.round(baseFare);
      
      // Generate seat number (simplified)
      const seatNumber = `${passengerDetails.seatType.charAt(0).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
      
      // Create ticket in Firestore
      const ticketRef = await addDoc(collection(db, 'tickets'), {
        userId: auth.currentUser.uid,
        trainId: selectedTrain.id,
        trainName: selectedTrain.name,
        trainNumber: selectedTrain.number,
        source,
        destination,
        departureDate: new Date(date),
        departureTime: selectedTrain.departureTime || '08:00 AM', // Default time if not specified
        passengerName: passengerDetails.name,
        passengerAge: parseInt(passengerDetails.age),
        passengerGender: passengerDetails.gender,
        seatType: passengerDetails.seatType,
        seatNumber,
        pnr,
        fare,
        status: 'confirmed',
        paymentMethod,
        bookingTime: serverTimestamp(),
      });
      
      // Update the train's seat availability (simplified)
      await updateDoc(doc(db, 'trains', selectedTrain.id), {
        [`seatAvailability.${passengerDetails.seatType}`]: selectedTrain.seatAvailability?.[passengerDetails.seatType] - 1 || 0
      });
      
      // Navigate to ticket confirmation
      navigate('/my-tickets');
      
    } catch (error) {
      alert('Error booking ticket: ' + error.message);
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render form based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Search Trains</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">From Station</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Source Station</option>
                  <optgroup label="State Capitals">
                    {stateCapitals.map((capital) => (
                      <option key={capital.id} value={capital.name}>
                        {capital.name} ({capital.stateFullName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Stations">
                    {stations
                      .filter(station => !stateCapitals.some(cap => cap.name === station.name))
                      .map((station) => (
                        <option key={station.id} value={station.name}>
                          {station.name} {station.state ? `(${station.state})` : ''}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">To Station</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Destination Station</option>
                  <optgroup label="State Capitals">
                    {stateCapitals.map((capital) => (
                      <option key={capital.id} value={capital.name} disabled={capital.name === source}>
                        {capital.name} ({capital.stateFullName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Stations">
                    {stations
                      .filter(station => !stateCapitals.some(cap => cap.name === station.name))
                      .map((station) => (
                        <option key={station.id} value={station.name} disabled={station.name === source}>
                          {station.name} {station.state ? `(${station.state})` : ''}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Travel Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                onClick={handleSearchTrains}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
              >
                Search Trains
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Available Trains</h2>
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Search
              </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              <p>
                <span className="font-medium">Route:</span> {source} to {destination}
              </p>
              <p>
                <span className="font-medium">Date:</span> {new Date(date).toLocaleDateString()}
              </p>
            </div>
            
            {filteredTrains.length > 0 ? (
              <div className="space-y-4">
                {filteredTrains.map((train) => (
                  <div key={train.id} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{train.name}</h3>
                        <p className="text-gray-600 text-sm">Train #{train.number}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{train.departureTime || '08:00 AM'}</p>
                        <p className="text-gray-500 text-sm">{date}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex space-x-4 text-sm">
                        <div>
                          <p className="text-gray-500">Sleeper</p>
                          <p className="font-medium">₹{(train.fare?.sleeper || 500)} • {train.seatAvailability?.sleeper || 'NA'} seats</p>
                        </div>
                        <div>
                          <p className="text-gray-500">AC</p>
                          <p className="font-medium">₹{(train.fare?.ac || 1000)} • {train.seatAvailability?.ac || 'NA'} seats</p>
                        </div>
                        <div>
                          <p className="text-gray-500">General</p>
                          <p className="font-medium">₹{(train.fare?.general || 300)} • {train.seatAvailability?.general || 'NA'} seats</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => selectTrain(train)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No trains available for this route and date.</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Modify Search
                </button>
              </div>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Passenger Details</h2>
              <button
                onClick={() => setStep(2)}
                className="text-blue-600 hover:underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Trains
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">
                    {selectedTrain?.name} (#{selectedTrain?.number})
                  </h3>
                  <p className="text-sm text-gray-600">
                    {source} to {destination} • {new Date(date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{selectedTrain?.departureTime || '08:00 AM'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Passenger Name</label>
                <input
                  type="text"
                  name="name"
                  value={passengerDetails.name}
                  onChange={handlePassengerChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={passengerDetails.age}
                  onChange={handlePassengerChange}
                  min="1"
                  max="120"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={passengerDetails.gender}
                  onChange={handlePassengerChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Seat Type</label>
                <select
                  name="seatType"
                  value={passengerDetails.seatType}
                  onChange={handlePassengerChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sleeper">Sleeper class (₹{selectedTrain?.fare?.sleeper || 500})</option>
                  <option value="ac">AC (₹{selectedTrain?.fare?.ac || 1000})</option>
                  <option value="general">General (₹{selectedTrain?.fare?.general || 300})</option>
                </select>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mr-2"
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="mr-2"
                    />
                    <span>Net Banking</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mr-2"
                    />
                    <span>UPI</span>
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleBookTicket}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300 mt-6"
              >
                {loading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Book Railway Tickets</h1>
      
      {loading && step === 1 ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        renderStepContent()
      )}
    </div>
  );
};

export default BookTicket;
