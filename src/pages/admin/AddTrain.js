// // pages/admin/AddTrain.js - Key admin page for adding trains
// import React, { useState, useEffect } from 'react';
// import { collection, addDoc, getDocs } from 'firebase/firestore';
// import { db } from '../../Firebase';

// const AddTrain = () => {
//   const [stations, setStations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);
  
//   // Train form state
//   const [trainData, setTrainData] = useState({
//     name: '',
//     number: '',
//     departureTime: '',
//     routes: [],
//     seatAvailability: {
//       sleeper: 100,
//       ac: 50,
//       general: 200,
//     },
//     fare: {
//       sleeper: 500,
//       ac: 1000,
//       general: 300,
//     },
//   });
  
//   // Selected route stations
//   const [selectedStations, setSelectedStations] = useState([]);
//   const [stationToAdd, setStationToAdd] = useState('');
  
//   useEffect(() => {
//     const fetchStations = async () => {
//       try {
//         const stationsSnapshot = await getDocs(collection(db, 'stations'));
//         const stationsData = [];
        
//         stationsSnapshot.forEach((doc) => {
//           stationsData.push({ id: doc.id, ...doc.data() });
//         });
        
//         setStations(stationsData);
//       } catch (error) {
//         console.error('Error fetching stations:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchStations();
//   }, []);
  
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setTrainData({ ...trainData, [name]: value });
//   };
  
//   const handleSeatChange = (type, value) => {
//     setTrainData({
//       ...trainData,
//       seatAvailability: {
//         ...trainData.seatAvailability,
//         [type]: parseInt(value) || 0,
//       },
//     });
//   };
  
//   const handleFareChange = (type, value) => {
//     setTrainData({
//       ...trainData,
//       fare: {
//         ...trainData.fare,
//         [type]: parseInt(value) || 0,
//       },
//     });
//   };
  
//   const addStationToRoute = () => {
//     if (stationToAdd && !selectedStations.includes(stationToAdd)) {
//       setSelectedStations([...selectedStations, stationToAdd]);
//       setStationToAdd('');
//     }
//   };
  
//   const removeStationFromRoute = (station) => {
//     setSelectedStations(selectedStations.filter((s) => s !== station));
//   };
  
//   const moveStationUp = (index) => {
//     if (index > 0) {
//       const newStations = [...selectedStations];
//       [newStations[index], newStations[index - 1]] = [newStations[index - 1], newStations[index]];
//       setSelectedStations(newStations);
//     }
//   };
  
//   const moveStationDown = (index) => {
//     if (index < selectedStations.length - 1) {
//       const newStations = [...selectedStations];
//       [newStations[index], newStations[index + 1]] = [newStations[index + 1], newStations[index]];
//       setSelectedStations(newStations);
//     }
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!trainData.name || !trainData.number || selectedStations.length < 2) {
//       alert('Please fill all required fields and add at least 2 stations to the route.');
//       return;
//     }
    
//     setSubmitting(true);
    
//     try {
//       // Update train data with selected stations
//       const trainToAdd = {
//         ...trainData,
//         routes: selectedStations,
//         createdAt: new Date(),
//       };
      
//       // Add train to Firestore
//       await addDoc(collection(db, 'trains'), trainToAdd);
      
//       // Reset form
//       setTrainData({
//         name: '',
//         number: '',
//         departureTime: '',
//         seatAvailability: {
//           sleeper: 100,
//           ac: 50,
//           general: 200,
//         },
//         fare: {
//           sleeper: 500,
//           ac: 1000,
//           general: 300,
//         },
//       });
//       setSelectedStations([]);
//       setSuccess(true);
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSuccess(false);
//       }, 3000);
//     } catch (error) {
//       console.error('Error adding train:', error);
//       alert('Failed to add train. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };
  
//   if (loading) {
//     return <div className="admin-container">Loading stations data...</div>;
//   }
  
//   return (
//     <div className="admin-container">
//       <h1>Add New Train</h1>
      
//       {success && (
//         <div className="success-message">
//           Train added successfully!
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit} className="admin-form">
//         <div className="form-group">
//           <label htmlFor="name">Train Name:</label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             value={trainData.name}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="number">Train Number:</label>
//           <input
//             type="text"
//             id="number"
//             name="number"
//             value={trainData.number}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="departureTime">Departure Time:</label>
//           <input
//             type="time"
//             id="departureTime"
//             name="departureTime"
//             value={trainData.departureTime}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
        
//         <div className="form-section">
//           <h3>Seat Availability</h3>
          
//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="sleeper-seats">Sleeper:</label>
//               <input
//                 type="number"
//                 id="sleeper-seats"
//                 value={trainData.seatAvailability.sleeper}
//                 onChange={(e) => handleSeatChange('sleeper', e.target.value)}
//                 min="0"
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="ac-seats">AC:</label>
//               <input
//                 type="number"
//                 id="ac-seats"
//                 value={trainData.seatAvailability.ac}
//                 onChange={(e) => handleSeatChange('ac', e.target.value)}
//                 min="0"
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="general-seats">General:</label>
//               <input
//                 type="number"
//                 id="general-seats"
//                 value={trainData.seatAvailability.general}
//                 onChange={(e) => handleSeatChange('general', e.target.value)}
//                 min="0"
//               />
//             </div>
//           </div>
//         </div>
        
//         <div className="form-section">
//           <h3>Fare Details (in Rs.)</h3>
          
//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="sleeper-fare">Sleeper:</label>
//               <input
//                 type="number"
//                 id="sleeper-fare"
//                 value={trainData.fare.sleeper}
//                 onChange={(e) => handleFareChange('sleeper', e.target.value)}
//                 min="0"
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="ac-fare">AC:</label>
//               <input
//                 type="number"
//                 id="ac-fare"
//                 value={trainData.fare.ac}
//                 onChange={(e) => handleFareChange('ac', e.target.value)}
//                 min="0"
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="general-fare">General:</label>
//               <input
//                 type="number"
//                 id="general-fare"
//                 value={trainData.fare.general}
//                 onChange={(e) => handleFareChange('general', e.target.value)}
//                 min="0"
//               />
//             </div>
//           </div>
//         </div>
        
//         <div className="form-section">
//           <h3>Route</h3>
          
//           <div className="station-selector">
//             <select
//               value={stationToAdd}
//               onChange={(e) => setStationToAdd(e.target.value)}
//             >
//               <option value="">Select a station</option>
//               {stations.map((station) => (
//                 <option key={station.id} value={station.id}>
//                   {station.name}
//                 </option>
//               ))}
//             </select>
            
//             <button
//               type="button"
//               onClick={addStationToRoute}
//               disabled={!stationToAdd}
//             >
//               Add to Route
//             </button>
//           </div>
          
//           {selectedStations.length > 0 ? (
//             <div className="selected-stations">
//               <h4>Selected Stations (in order):</h4>
//               <ul>
//                 {selectedStations.map((stationId, index) => {
//                   const station = stations.find((s) => s.id === stationId);
//                   return (
//                     <li key={stationId} className="station-item">
//                       <span>{index + 1}. {station ? station.name : stationId}</span>
//                       <div className="station-actions">
//                         <button
//                           type="button"
//                           onClick={() => moveStationUp(index)}
//                           disabled={index === 0}
//                         >
//                           ↑
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => moveStationDown(index)}
//                           disabled={index === selectedStations.length - 1}
//                         >
//                           ↓
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => removeStationFromRoute(stationId)}
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           ) : (
//             <p>No stations added to the route yet.</p>
//           )}
//         </div>
        
//         <div className="form-actions">
//           <button
//             type="submit"
//             className="submit-button"
//             disabled={submitting}
//           >
//             {submitting ? 'Adding Train...' : 'Add Train'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddTrain;

// pages/admin/AddTrain.js - Enhanced UI
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../Firebase';

const AddTrain = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Train form state
  const [trainData, setTrainData] = useState({
    name: '',
    number: '',
    departureTime: '',
    routes: [],
    seatAvailability: {
      sleeper: 100,
      ac: 50,
      general: 200,
    },
    fare: {
      sleeper: 500,
      ac: 1000,
      general: 300,
    },
  });
  
  // Selected route stations
  const [selectedStations, setSelectedStations] = useState([]);
  const [stationToAdd, setStationToAdd] = useState('');

  const stateCapitals = [
    {  name: 'Amaravati', state: 'AP', stateFullName: 'Andhra Pradesh' },
    { name: 'Itanagar', state: 'AR', stateFullName: 'Arunachal Pradesh' },
    {  name: 'Dispur', state: 'AS', stateFullName: 'Assam' },
    {  name: 'Patna', state: 'BR', stateFullName: 'Bihar' },
    {  name: 'Raipur', state: 'CG', stateFullName: 'Chhattisgarh' },
    {  name: 'Panaji', state: 'GA', stateFullName: 'Goa' },
    { name: 'Gandhinagar', state: 'GJ', stateFullName: 'Gujarat' },
    {  name: 'Chandigarh', state: 'HR', stateFullName: 'Haryana' },
    {  name: 'Shimla', state: 'HP', stateFullName: 'Himachal Pradesh' },
    {  name: 'Ranchi', state: 'JH', stateFullName: 'Jharkhand' },
    {name: 'Bengaluru', state: 'KA', stateFullName: 'Karnataka' },
    {  name: 'Thiruvananthapuram', state: 'KL', stateFullName: 'Kerala' },
    {  name: 'Bhopal', state: 'MP', stateFullName: 'Madhya Pradesh' },
    { name: 'Mumbai', state: 'MH', stateFullName: 'Maharashtra' },
    {  name: 'Imphal', state: 'MN', stateFullName: 'Manipur' },
    {  name: 'Shillong', state: 'ML', stateFullName: 'Meghalaya' },
    {  name: 'Aizawl', state: 'MZ', stateFullName: 'Mizoram' },
    {  name: 'Kohima', state: 'NL', stateFullName: 'Nagaland' },
    { name: 'Bhubaneswar', state: 'OD', stateFullName: 'Odisha' },
    {  name: 'Chandigarh', state: 'PB', stateFullName: 'Punjab' },
    {  name: 'Jaipur', state: 'RJ', stateFullName: 'Rajasthan' },
    { name: 'Gangtok', state: 'SK', stateFullName: 'Sikkim' },
    {  name: 'Chennai', state: 'TN', stateFullName: 'Tamil Nadu' },
    { name: 'Hyderabad', state: 'TS', stateFullName: 'Telangana' },
    {  name: 'Agartala', state: 'TR', stateFullName: 'Tripura' },
    {  name: 'Lucknow', state: 'UP', stateFullName: 'Uttar Pradesh' },
    {  name: 'Dehradun', state: 'UK', stateFullName: 'Uttarakhand' },
    {  name: 'Kolkata', state: 'WB', stateFullName: 'West Bengal' },
    {  name: 'New Delhi', state: 'DL', stateFullName: 'Delhi' },
    {  name: 'Jammu', state: 'JK', stateFullName: 'Jammu and Kashmir' },
    {  name: 'Srinagar', state: 'JK', stateFullName: 'Jammu and Kashmir (Summer)' },
    {  name: 'Port Blair', state: 'AN', stateFullName: 'Andaman and Nicobar Islands' },
    {  name: 'Chandigarh', state: 'CH', stateFullName: 'Chandigarh' },
    {  name: 'Daman', state: 'DN', stateFullName: 'Dadra and Nagar Haveli and Daman and Diu' },
    {  name: 'Kavaratti', state: 'LD', stateFullName: 'Lakshadweep' },
    {  name: 'Puducherry', state: 'PY', stateFullName: 'Puducherry' },
    {  name: 'Ladakh', state: 'LA', stateFullName: 'Ladakh' }
  ];
  
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsSnapshot = await getDocs(collection(db, 'stations'));
        const stationsData = [];
        
        stationsSnapshot.forEach((doc) => {
          stationsData.push({ id: doc.id, ...doc.data() });
        });
        
        setStations(stationsData);
      } catch (error) {
        console.error('Error fetching stations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStations();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTrainData({ ...trainData, [name]: value });
  };
  
  const handleSeatChange = (type, value) => {
    setTrainData({
      ...trainData,
      seatAvailability: {
        ...trainData.seatAvailability,
        [type]: parseInt(value) || 0,
      },
    });
  };
  
  const handleFareChange = (type, value) => {
    setTrainData({
      ...trainData,
      fare: {
        ...trainData.fare,
        [type]: parseInt(value) || 0,
      },
    });
  };
  
  const addStationToRoute = () => {
    if (stationToAdd && !selectedStations.includes(stationToAdd)) {
      setSelectedStations([...selectedStations, stationToAdd]);
      setStationToAdd('');
    }
  };
  
  const removeStationFromRoute = (station) => {
    setSelectedStations(selectedStations.filter((s) => s !== station));
  };
  
  const moveStationUp = (index) => {
    if (index > 0) {
      const newStations = [...selectedStations];
      [newStations[index], newStations[index - 1]] = [newStations[index - 1], newStations[index]];
      setSelectedStations(newStations);
    }
  };
  
  const moveStationDown = (index) => {
    if (index < selectedStations.length - 1) {
      const newStations = [...selectedStations];
      [newStations[index], newStations[index + 1]] = [newStations[index + 1], newStations[index]];
      setSelectedStations(newStations);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!trainData.name || !trainData.number || selectedStations.length < 2) {
      alert('Please fill all required fields and add at least 2 stations to the route.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Update train data with selected stations
      const trainToAdd = {
        ...trainData,
        routes: selectedStations,
        createdAt: new Date(),
      };
      
      // Add train to Firestore
      await addDoc(collection(db, 'trains'), trainToAdd);
      
      // Reset form
      setTrainData({
        name: '',
        number: '',
        departureTime: '',
        seatAvailability: {
          sleeper: 100,
          ac: 50,
          general: 200,
        },
        fare: {
          sleeper: 500,
          ac: 1000,
          general: 300,
        },
      });
      setSelectedStations([]);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding train:', error);
      alert('Failed to add train. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const getStationDisplay = (station) => {
    if (station.state && station.stateFullName) {
      return `${station.name} (${station.stateFullName}, ${station.state})`;
    }
    return station.name;
  };
  
  if (loading) {
    return (
      <div className="admin-container bg-gray-50 min-h-screen p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <span className="ml-3 text-gray-700 font-medium">Loading stations data...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-container bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Add New Train
        </h1>
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="font-medium">Train added successfully!</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Train Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={trainData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter train name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Train Number</label>
              <input
                type="text"
                id="number"
                name="number"
                value={trainData.number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter train number"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
            <input
              type="time"
              id="departureTime"
              name="departureTime"
              value={trainData.departureTime}
              onChange={handleInputChange}
              className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Seat Availability</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="sleeper-seats" className="block text-sm font-medium text-gray-700 mb-1">Sleeper</label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="number"
                    id="sleeper-seats"
                    value={trainData.seatAvailability.sleeper}
                    onChange={(e) => handleSeatChange('sleeper', e.target.value)}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                    Seats
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="ac-seats" className="block text-sm font-medium text-gray-700 mb-1">AC</label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="number"
                    id="ac-seats"
                    value={trainData.seatAvailability.ac}
                    onChange={(e) => handleSeatChange('ac', e.target.value)}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                    Seats
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="general-seats" className="block text-sm font-medium text-gray-700 mb-1">General</label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="number"
                    id="general-seats"
                    value={trainData.seatAvailability.general}
                    onChange={(e) => handleSeatChange('general', e.target.value)}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                    Seats
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Fare Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="sleeper-fare" className="block text-sm font-medium text-gray-700 mb-1">Sleeper</label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                    ₹
                  </span>
                  <input
                    type="number"
                    id="sleeper-fare"
                    value={trainData.fare.sleeper}
                    onChange={(e) => handleFareChange('sleeper', e.target.value)}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="ac-fare" className="block text-sm font-medium text-gray-700 mb-1">AC</label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                    ₹
                  </span>
                  <input
                    type="number"
                    id="ac-fare"
                    value={trainData.fare.ac}
                    onChange={(e) => handleFareChange('ac', e.target.value)}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="general-fare" className="block text-sm font-medium text-gray-700 mb-1">General</label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                    ₹
                  </span>
                  <input
                    type="number"
                    id="general-fare"
                    value={trainData.fare.general}
                    onChange={(e) => handleFareChange('general', e.target.value)}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Route</h3>
            
            <div className="station-selector flex flex-wrap gap-2 mb-4">
              {/* <select
                value={stationToAdd}
                onChange={(e) => setStationToAdd(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select> */}
              <select
                value={stationToAdd}
                onChange={(e) => setStationToAdd(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a station</option>
                <optgroup label="State Capitals">
                  {stateCapitals.map((capital) => (
                    <option key={capital.id} value={capital.id}>
                      {capital.name} ({capital.stateFullName}, {capital.state})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Stations">
                  {stations.filter(station => !stateCapitals.some(capital => capital.id === station.id)).map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              
              <button
                type="button"
                onClick={addStationToRoute}
                disabled={!stationToAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Route
              </button>
            </div>
            
            {selectedStations.length > 0 ? (
              <div className="selected-stations mt-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">Selected Stations (in order)</h4>
                <ul className="bg-white border border-gray-200 rounded-md overflow-hidden">
                  {selectedStations.map((stationId, index) => {
                    const station = stations.find((s) => s.id === stationId);
                    return (
                      <li 
                        key={stationId} 
                        className={`px-4 py-3 flex items-center justify-between ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } ${
                          index !== selectedStations.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-3">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{station ? station.name : stationId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => moveStationUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                            title="Move Up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStationDown(index)}
                            disabled={index === selectedStations.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                            title="Move Down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStationFromRoute(stationId)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      No stations added to the route yet. Please add at least 2 stations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Train...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  Add Train
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTrain;
