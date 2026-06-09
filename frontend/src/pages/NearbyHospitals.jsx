import { useState, useEffect } from 'react';
import { hospitalsAPI } from '../services/api';
import { FiMapPin, FiPhone, FiStar, FiClock, FiAlertTriangle, FiNavigation } from 'react-icons/fi';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './NearbyHospitals.css';

const NearbyHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [filters, setFilters] = useState({
    radius: 5000,
    type: 'hospital'
  });

  useEffect(() => {
    loadSpecialists();
    loadEmergencyContacts();
    getCurrentLocation();
  }, []);

  const loadSpecialists = async () => {
    try {
      const response = await hospitalsAPI.getSpecialists();
      setSpecialists(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load specialists');
      setSpecialists([]);
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const response = await hospitalsAPI.getEmergency();
      setEmergencyContacts(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load emergency contacts');
      setEmergencyContacts([]);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          loadNearbyHospitals(loc);
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
          // Use default location (Delhi)
          const defaultLoc = { lat: 28.6139, lng: 77.2090 };
          setLocation(defaultLoc);
          loadNearbyHospitals(defaultLoc);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  const loadNearbyHospitals = async (loc) => {
    setLoading(true);
    try {
      const response = await hospitalsAPI.getNearby({
        lat: loc.lat,
        lng: loc.lng,
        radius: filters.radius,
        type: filters.type
      });
      setHospitals(response.data.data || []);
    } catch (err) {
      console.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyClick = (specialty) => {
    setSelectedSpecialty(specialty);
    // In a real app, this would filter hospitals by specialty
  };

  const openInMaps = (hospital) => {
    const { lat, lng } = hospital.location;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <div className="hospitals-page page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🏥 Nearby Hospitals</h1>
          <p className="page-subtitle">
            Find hospitals, clinics, and specialists near you
          </p>
        </div>

        {/* Emergency Section */}
        {/* <div className="emergency-section">
          <div className="emergency-header">
            <h2>🚨 Emergency Contacts</h2>
            <p>For life-threatening emergencies, call immediately!</p>
          </div>
          <div className="emergency-grid">
            {emergencyContacts.map((contact, index) => (
              <a
                key={index}
                href={`tel:${contact.number}`}
                className="emergency-card"
              >
                <div className="emergency-number">{contact.number}</div>
                <div className="emergency-name">{contact.name}</div>
                <div className="emergency-desc">{contact.description}</div>
                <div className="emergency-available">{contact.available}</div>
              </a>
            ))}
          </div>
        </div> */}

        {/* Specialists */}
        <div className="specialists-section">
          <h2>Find Specialists</h2>
          <div className="specialists-grid">
            {specialists.map(specialist => (
              <button
                key={specialist.id}
                className={`specialist-card ${selectedSpecialty?.id === specialist.id ? 'active' : ''}`}
                onClick={() => handleSpecialtyClick(specialist)}
              >
                <span className="specialist-icon">{specialist.icon}</span>
                <span className="specialist-name">{specialist.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location Status */}
        {locationError && (
          <div className="alert alert-warning">
            <FiAlertTriangle /> {locationError}
          </div>
        )}

        {location && (
          <div className="location-status">
            <FiMapPin /> Showing results near your location
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Distance</label>
            <select
              value={filters.radius}
              onChange={(e) => {
                const newFilters = { ...filters, radius: parseInt(e.target.value) };
                setFilters(newFilters);
                if (location) loadNearbyHospitals(location);
              }}
              className="form-input"
            >
              <option value="2000">Within 2 km</option>
              <option value="5000">Within 5 km</option>
              <option value="10000">Within 10 km</option>
              <option value="20000">Within 20 km</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => {
                const newFilters = { ...filters, type: e.target.value };
                setFilters(newFilters);
                if (location) loadNearbyHospitals(location);
              }}
              className="form-input"
            >
              <option value="hospital">Hospitals</option>
              <option value="doctor">Clinics</option>
              <option value="pharmacy">Pharmacies</option>
            </select>
          </div>
        </div>

        {/* Hospitals List */}
        {loading ? (
          <div className="loading-section">
            <LoadingSpinner text="Finding nearby hospitals..." />
          </div>
        ) : (
          <div className="hospitals-grid">
            {hospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                className="hospital-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="hospital-header">
                  <h3>{hospital.name}</h3>
                  {hospital.openNow !== undefined && (
                    <span className={`open-status ${hospital.openNow ? 'open' : 'closed'}`}>
                      <FiClock /> {hospital.openNow ? 'Open Now' : 'Closed'}
                    </span>
                  )}
                </div>

                <div className="hospital-address">
                  <FiMapPin /> {hospital.address}
                </div>

                {hospital.distance && (
                  <div className="hospital-distance">
                    <FiNavigation /> {hospital.distance}
                  </div>
                )}

                <div className="hospital-meta">
                  <div className="hospital-rating">
                    <FiStar className="star-icon" />
                    <span>{hospital.rating || 'N/A'}</span>
                    {hospital.totalRatings && (
                      <span className="rating-count">({hospital.totalRatings})</span>
                    )}
                  </div>
                </div>

                {hospital.specialties && (
                  <div className="hospital-specialties">
                    {hospital.specialties.map((spec, i) => (
                      <span key={i} className="specialty-tag">{spec}</span>
                    ))}
                  </div>
                )}

                <div className="hospital-actions">
                  {hospital.phone && (
                    <a href={`tel:${hospital.phone}`} className="btn btn-primary btn-sm">
                      <FiPhone /> Call
                    </a>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openInMaps(hospital)}
                  >
                    <FiNavigation /> Directions
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && hospitals.length === 0 && location && (
          <div className="no-results">
            <p>No hospitals found nearby. Try increasing the distance filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyHospitals;
