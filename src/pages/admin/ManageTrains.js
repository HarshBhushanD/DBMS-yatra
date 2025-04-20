

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../Firebase';
import './ManageTrain.css'; 

const ManageTrain = () => {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null);
  const [expandedTrain, setExpandedTrain] = useState(null);
  const [editedTrainData, setEditedTrainData] = useState(null);
  const [stationToAdd, setStationToAdd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trains
        const trainsSnapshot = await getDocs(collection(db, 'trains'));
        const trainsData = [];
        
        trainsSnapshot.forEach((doc) => {
          trainsData.push({ id: doc.id, ...doc.data() });
        });
        
        setTrains(trainsData);
        
        // Fetch stations
        const stationsSnapshot = await getDocs(collection(db, 'stations'));
        const stationsData = [];
        
        stationsSnapshot.forEach((doc) => {
          stationsData.push({ id: doc.id, ...doc.data() });
        });
        
        setStations(stationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getStationName = (stationId) => {
    const station = stations.find((s) => s.id === stationId);
    return station ? station.name : stationId;
  };

  const handleEdit = (train) => {
    setEditMode(train.id);
    setEditedTrainData({ ...train });
    setExpandedTrain(train.id);
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditedTrainData(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTrainData({ ...editedTrainData, [name]: value });
  };

  const handleSeatChange = (type, value) => {
    setEditedTrainData({
      ...editedTrainData,
      seatAvailability: {
        ...editedTrainData.seatAvailability,
        [type]: parseInt(value) || 0,
      },
    });
  };

  const handleFareChange = (type, value) => {
    setEditedTrainData({
      ...editedTrainData,
      fare: {
        ...editedTrainData.fare,
        [type]: parseInt(value) || 0,
      },
    });
  };

  const addStationToRoute = () => {
    if (stationToAdd && !editedTrainData.routes.includes(stationToAdd)) {
      setEditedTrainData({
        ...editedTrainData,
        routes: [...editedTrainData.routes, stationToAdd],
      });
      setStationToAdd('');
    }
  };

  const removeStationFromRoute = (station) => {
    setEditedTrainData({
      ...editedTrainData,
      routes: editedTrainData.routes.filter((s) => s !== station),
    });
  };

  const moveStationUp = (index) => {
    if (index > 0) {
      const newRoutes = [...editedTrainData.routes];
      [newRoutes[index], newRoutes[index - 1]] = [newRoutes[index - 1], newRoutes[index]];
      setEditedTrainData({
        ...editedTrainData,
        routes: newRoutes,
      });
    }
  };

  const moveStationDown = (index) => {
    if (index < editedTrainData.routes.length - 1) {
      const newRoutes = [...editedTrainData.routes];
      [newRoutes[index], newRoutes[index + 1]] = [newRoutes[index + 1], newRoutes[index]];
      setEditedTrainData({
        ...editedTrainData,
        routes: newRoutes,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editedTrainData.name || !editedTrainData.number || editedTrainData.routes.length < 2) {
      alert('Please fill all required fields and add at least 2 stations to the route.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Update train in Firestore
      const trainRef = doc(db, 'trains', editedTrainData.id);
      const trainToUpdate = {
        ...editedTrainData,
        updatedAt: new Date(),
      };
      
      // Remove id before updating
      delete trainToUpdate.id;
      
      await updateDoc(trainRef, trainToUpdate);
      
      // Update local state
      setTrains(trains.map((train) => 
        train.id === editedTrainData.id ? { id: editedTrainData.id, ...trainToUpdate } : train
      ));
      
      setEditMode(null);
      setEditedTrainData(null);
      setSuccessMessage('Train updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating train:', error);
      alert('Failed to update train. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (trainId) => {
    if (!window.confirm('Are you sure you want to delete this train?')) {
      return;
    }
    
    try {
      // Delete train from Firestore
      await deleteDoc(doc(db, 'trains', trainId));
      
      // Update local state
      setTrains(trains.filter((train) => train.id !== trainId));
      
      setSuccessMessage('Train deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting train:', error);
      alert('Failed to delete train. Please try again.');
    }
  };

  const toggleExpand = (trainId) => {
    setExpandedTrain(expandedTrain === trainId ? null : trainId);
  };

  // Filter and sort trains
  const filteredTrains = trains.filter(train => 
    train.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
    train.number.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const sortedTrains = [...filteredTrains].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'number') {
      return sortDirection === 'asc' 
        ? a.number.localeCompare(b.number) 
        : b.number.localeCompare(a.number);
    }
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Loading trains data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Manage Trains</h1>
        <div className="admin-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search trains..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="sort-container">
            <label>Sort by:</label>
            <button 
              className={`sort-button ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => toggleSort('name')}
            >
              Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`sort-button ${sortBy === 'number' ? 'active' : ''}`}
              onClick={() => toggleSort('number')}
            >
              Number {sortBy === 'number' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>
      
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}
      
      {sortedTrains.length === 0 ? (
        <div className="no-trains">
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" width="64" height="64">
              <path d="M20 7.5v9L12 21l-8-4.5v-9L12 3l8 4.5z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 7.5L12 12l9-4.5M12 12v9" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <p>{filterQuery ? 'No trains match your search' : 'No trains found. Add some trains first.'}</p>
          </div>
        </div>
      ) : (
        <div className="trains-container">
          {sortedTrains.map((train) => (
            <div key={train.id} className={`train-card ${expandedTrain === train.id ? 'expanded' : ''}`}>
              <div className="train-header" onClick={() => toggleExpand(train.id)}>
                <div className="train-title">
                  <h3>{train.name}</h3>
                  <span className="train-number">{train.number}</span>
                </div>
                <div className="expand-icon">{expandedTrain === train.id ? '−' : '+'}</div>
              </div>
              
              {expandedTrain === train.id && (
                <div className="train-details">
                  {editMode === train.id ? (
                    <form onSubmit={handleUpdate} className="edit-form">
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor={`name-${train.id}`}>Train Name</label>
                          <input
                            type="text"
                            id={`name-${train.id}`}
                            name="name"
                            value={editedTrainData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor={`number-${train.id}`}>Train Number</label>
                          <input
                            type="text"
                            id={`number-${train.id}`}
                            name="number"
                            value={editedTrainData.number}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor={`departureTime-${train.id}`}>Departure Time</label>
                          <input
                            type="time"
                            id={`departureTime-${train.id}`}
                            name="departureTime"
                            value={editedTrainData.departureTime}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-section">
                        <h4>Seat Availability</h4>
                        
                        <div className="form-grid three-column">
                          <div className="form-group">
                            <label htmlFor={`sleeper-seats-${train.id}`}>Sleeper</label>
                            <input
                              type="number"
                              id={`sleeper-seats-${train.id}`}
                              value={editedTrainData.seatAvailability.sleeper}
                              onChange={(e) => handleSeatChange('sleeper', e.target.value)}
                              min="0"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`ac-seats-${train.id}`}>AC</label>
                            <input
                              type="number"
                              id={`ac-seats-${train.id}`}
                              value={editedTrainData.seatAvailability.ac}
                              onChange={(e) => handleSeatChange('ac', e.target.value)}
                              min="0"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`general-seats-${train.id}`}>General</label>
                            <input
                              type="number"
                              id={`general-seats-${train.id}`}
                              value={editedTrainData.seatAvailability.general}
                              onChange={(e) => handleSeatChange('general', e.target.value)}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-section">
                        <h4>Fare Details (in ₹)</h4>
                        
                        <div className="form-grid three-column">
                          <div className="form-group">
                            <label htmlFor={`sleeper-fare-${train.id}`}>Sleeper</label>
                            <div className="input-with-prefix">
                              <span className="input-prefix">₹</span>
                              <input
                                type="number"
                                id={`sleeper-fare-${train.id}`}
                                value={editedTrainData.fare.sleeper}
                                onChange={(e) => handleFareChange('sleeper', e.target.value)}
                                min="0"
                              />
                            </div>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`ac-fare-${train.id}`}>AC</label>
                            <div className="input-with-prefix">
                              <span className="input-prefix">₹</span>
                              <input
                                type="number"
                                id={`ac-fare-${train.id}`}
                                value={editedTrainData.fare.ac}
                                onChange={(e) => handleFareChange('ac', e.target.value)}
                                min="0"
                              />
                            </div>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`general-fare-${train.id}`}>General</label>
                            <div className="input-with-prefix">
                              <span className="input-prefix">₹</span>
                              <input
                                type="number"
                                id={`general-fare-${train.id}`}
                                value={editedTrainData.fare.general}
                                onChange={(e) => handleFareChange('general', e.target.value)}
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-section">
                        <h4>Route</h4>
                        
                        <div className="station-selector">
                          <div className="station-select-container">
                            <select
                              value={stationToAdd}
                              onChange={(e) => setStationToAdd(e.target.value)}
                              className="station-select"
                            >
                              <option value="">Select a station</option>
                              {stations.map((station) => (
                                <option key={station.id} value={station.id}>
                                  {station.name}
                                </option>
                              ))}
                            </select>
                            
                            <button
                              type="button"
                              className="add-station-btn"
                              onClick={addStationToRoute}
                              disabled={!stationToAdd}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                        
                        <div className="route-container">
                          {editedTrainData.routes.length > 0 ? (
                            <div className="route-stations">
                              <h5>Route Sequence</h5>
                              <div className="route-list">
                                {editedTrainData.routes.map((stationId, index) => (
                                  <div key={stationId} className="route-item">
                                    <div className="station-info">
                                      <span className="station-number">{index + 1}</span>
                                      <span className="station-name">{getStationName(stationId)}</span>
                                    </div>
                                    <div className="station-actions">
                                      <button
                                        type="button"
                                        className="action-btn move-up"
                                        onClick={() => moveStationUp(index)}
                                        disabled={index === 0}
                                        title="Move Up"
                                      >
                                        ↑
                                      </button>
                                      <button
                                        type="button"
                                        className="action-btn move-down"
                                        onClick={() => moveStationDown(index)}
                                        disabled={index === editedTrainData.routes.length - 1}
                                        title="Move Down"
                                      >
                                        ↓
                                      </button>
                                      <button
                                        type="button"
                                        className="action-btn remove"
                                        onClick={() => removeStationFromRoute(stationId)}
                                        title="Remove"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="empty-route">
                              <p>No stations added to the route yet.</p>
                              <p className="route-hint">Add at least 2 stations to create a valid route.</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={submitting}
                        >
                          {submitting ? 'Updating...' : 'Update Train'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="view-mode">
                      <div className="train-info-grid">
                        <div className="train-info-section">
                          <h4>Basic Information</h4>
                          <div className="info-item">
                            <span className="info-label">Train Name:</span>
                            <span className="info-value">{train.name}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Train Number:</span>
                            <span className="info-value">{train.number}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Departure Time:</span>
                            <span className="info-value">{train.departureTime}</span>
                          </div>
                        </div>
                        
                        <div className="train-info-section">
                          <h4>Seat Availability</h4>
                          <div className="seat-info">
                            <div className="seat-type">
                              <span className="seat-icon sleeper-icon"></span>
                              <div className="seat-details">
                                <span className="seat-name">Sleeper</span>
                                <span className="seat-count">{train.seatAvailability.sleeper} seats</span>
                              </div>
                            </div>
                            <div className="seat-type">
                              <span className="seat-icon ac-icon"></span>
                              <div className="seat-details">
                                <span className="seat-name">AC</span>
                                <span className="seat-count">{train.seatAvailability.ac} seats</span>
                              </div>
                            </div>
                            <div className="seat-type">
                              <span className="seat-icon general-icon"></span>
                              <div className="seat-details">
                                <span className="seat-name">General</span>
                                <span className="seat-count">{train.seatAvailability.general} seats</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="train-info-section">
                          <h4>Fare Details</h4>
                          <div className="fare-info">
                            <div className="fare-item">
                              <span className="fare-label">Sleeper:</span>
                              <span className="fare-value">₹{train.fare.sleeper}</span>
                            </div>
                            <div className="fare-item">
                              <span className="fare-label">AC:</span>
                              <span className="fare-value">₹{train.fare.ac}</span>
                            </div>
                            <div className="fare-item">
                              <span className="fare-label">General:</span>
                              <span className="fare-value">₹{train.fare.general}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="train-route-section">
                        <h4>Route</h4>
                        <div className="route-visual">
                          {train.routes.map((stationId, index) => (
                            <div key={stationId} className="route-stop">
                              <div className="route-station">
                                <div className="station-marker"></div>
                                <div className="station-details">
                                  <span className="station-name">{getStationName(stationId)}</span>
                                  {index === 0 && <span className="station-tag origin">Origin</span>}
                                  {index === train.routes.length - 1 && <span className="station-tag destination">Destination</span>}
                                </div>
                              </div>
                              {index < train.routes.length - 1 && <div className="route-line"></div>}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button
                          onClick={() => handleEdit(train)}
                          className="btn btn-edit"
                        >
                          Edit Train
                        </button>
                        <button
                          onClick={() => handleDelete(train.id)}
                          className="btn btn-delete"
                        >
                          Delete Train
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTrain;