import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { symptomsAPI } from '../services/api';
import { FiPlus, FiMinus, FiActivity, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './SymptomTracker.css';

const SymptomTracker = () => {
  const { isAuthenticated } = useAuth();
  const [predefinedSymptoms, setPredefinedSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [overallFeeling, setOverallFeeling] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadSymptomsList();
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadSymptomsList = async () => {
    try {
      const response = await symptomsAPI.getList();
      setPredefinedSymptoms(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load symptoms list');
      setPredefinedSymptoms([]);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await symptomsAPI.getAll({ limit: 5 });
      setHistory(response.data.data || []);
    } catch (err) {
      console.error('Failed to load history');
    }
  };

  const toggleSymptom = (symptomName) => {
    setSelectedSymptoms(prev => {
      const existing = prev.find(s => s.name === symptomName);
      if (existing) {
        return prev.filter(s => s.name !== symptomName);
      } else {
        return [...prev, { name: symptomName, severity: 5 }];
      }
    });
  };

  const updateSymptomSeverity = (symptomName, severity) => {
    setSelectedSymptoms(prev =>
      prev.map(s => s.name === symptomName ? { ...s, severity } : s)
    );
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.find(s => s.name.toLowerCase() === customSymptom.toLowerCase())) {
      setSelectedSymptoms(prev => [...prev, { name: customSymptom.trim(), severity: 5 }]);
      setCustomSymptom('');
    }
  };

  const removeSymptom = (symptomName) => {
    setSelectedSymptoms(prev => prev.filter(s => s.name !== symptomName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    if (!isAuthenticated) {
      setError('Please login to track symptoms');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const response = await symptomsAPI.create({
        symptoms: selectedSymptoms,
        overallFeeling,
        notes
      });
      setResult(response.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze symptoms');
    } finally {
      setAnalyzing(false);
    }
  };

  const groupedSymptoms = (predefinedSymptoms || []).reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {});

  const categoryLabels = {
    head: '🧠 Head',
    general: '🏃 General',
    respiratory: '🫁 Respiratory',
    digestive: '🍽️ Digestive',
    skin: '🧴 Skin',
    musculoskeletal: '💪 Muscles & Bones',
    neurological: '⚡ Neurological',
    cardiovascular: '❤️ Heart',
    sleep: '😴 Sleep',
    mental: '🧘 Mental',
    eye: '👁️ Eye',
    ear: '👂 Ear',
    dental: '🦷 Dental'
  };

  return (
    <div className="symptom-tracker-page page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📝 Symptom Tracker</h1>
          <p className="page-subtitle">
            Track your symptoms over time and get AI-powered health insights
          </p>
        </div>

        <div className="symptom-content">
          {/* Symptom Selection */}
          <div className="symptom-selection">
            <div className="card">
              <h2>Select Your Symptoms</h2>

              {/* Symptom Categories */}
              <div className="symptom-categories">
                {Object.entries(groupedSymptoms).map(([category, symptoms]) => (
                  <div key={category} className="symptom-category">
                    <h4>{categoryLabels[category] || category}</h4>
                    <div className="symptom-chips">
                      {symptoms.map(symptom => {
                        const isSelected = selectedSymptoms.find(s => s.name === symptom.name);
                        return (
                          <button
                            key={symptom.name}
                            className={`symptom-chip ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleSymptom(symptom.name)}
                          >
                            {symptom.name}
                            {isSelected ? <FiMinus /> : <FiPlus />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Symptom */}
              <div className="custom-symptom">
                <h4>Add Custom Symptom</h4>
                <div className="custom-symptom-input">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter symptom name..."
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={addCustomSymptom}
                    disabled={!customSymptom.trim()}
                  >
                    <FiPlus /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Symptoms */}
            <AnimatePresence>
              {selectedSymptoms.length > 0 && (
                <motion.div
                  className="card selected-symptoms-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3>Selected Symptoms ({selectedSymptoms.length})</h3>
                  <div className="selected-symptoms">
                    {selectedSymptoms.map(symptom => (
                      <div key={symptom.name} className="selected-symptom">
                        <div className="symptom-info">
                          <span className="symptom-name">{symptom.name}</span>
                          <button 
                            className="remove-symptom"
                            onClick={() => removeSymptom(symptom.name)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="severity-slider">
                          <span>Severity: {symptom.severity}/10</span>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={symptom.severity}
                            onChange={(e) => updateSymptomSeverity(symptom.name, parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Feeling */}
                  <div className="overall-feeling">
                    <h4>How do you feel overall?</h4>
                    <div className="feeling-slider">
                      <span>😟</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={overallFeeling}
                        onChange={(e) => setOverallFeeling(parseInt(e.target.value))}
                      />
                      <span>😊</span>
                    </div>
                    <span className="feeling-value">{overallFeeling}/10</span>
                  </div>

                  {/* Notes */}
                  <div className="form-group">
                    <label className="form-label">Additional Notes (optional)</label>
                    <textarea
                      className="form-input"
                      placeholder="Any additional details about your symptoms..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <button
                    className="btn btn-primary btn-full"
                    onClick={handleSubmit}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <LoadingSpinner size="small" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <FiActivity /> Analyze Symptoms
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results & History */}
          <div className="symptom-results">
            {/* Analysis Result */}
            {result && (
              <motion.div
                className="card result-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2>Analysis Results</h2>

                {/* Possible Conditions */}
                {result.data.analysis?.possibleConditions?.length > 0 && (
                  <div className="result-section">
                    <h3>Possible Conditions</h3>
                    <div className="conditions-list">
                      {result.data.analysis.possibleConditions.map((condition, index) => (
                        <div key={index} className="condition-item">
                          <div className="condition-header">
                            <span className="condition-name">{condition.condition}</span>
                            <span className={`probability probability-${condition.probability?.toLowerCase()}`}>
                              {condition.probability}
                            </span>
                          </div>
                          {condition.description && (
                            <p className="condition-description">{condition.description}</p>
                          )}
                          {condition.matchingSymptoms?.length > 0 && (
                            <div className="matching-symptoms">
                              Matching: {condition.matchingSymptoms.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.data.analysis?.recommendations?.length > 0 && (
                  <div className="result-section">
                    <h3>Recommendations</h3>
                    <ul className="recommendations-list">
                      {result.data.analysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Urgency */}
                {result.data.analysis?.urgencyLevel && (
                  <div className={`urgency-badge urgency-${result.data.analysis.urgencyLevel}`}>
                    Urgency: {result.data.analysis.urgencyLevel.toUpperCase()}
                  </div>
                )}

                {/* Specialist */}
                {result.data.analysis?.suggestedSpecialist && (
                  <div className="specialist-suggestion">
                    <FiAlertCircle />
                    Consider consulting a <strong>{result.data.analysis.suggestedSpecialist}</strong>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="result-disclaimer">
                  {result.disclaimer}
                </div>
              </motion.div>
            )}

            {/* Recent History */}
            {history.length > 0 && (
              <div className="card history-card">
                <h3><FiCalendar /> Recent Entries</h3>
                <div className="history-list">
                  {history.map(record => (
                    <div key={record._id} className="history-item">
                      <div className="history-date">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                      <div className="history-symptoms">
                        {record.symptoms?.slice(0, 3).map(s => s.name).join(', ')}
                        {record.symptoms?.length > 3 && ` +${record.symptoms.length - 3} more`}
                      </div>
                      <div className="history-feeling">
                        Feeling: {record.overallFeeling}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="alert alert-info">
                <a href="/login">Login</a> to save your symptom history and track patterns over time.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomTracker;
