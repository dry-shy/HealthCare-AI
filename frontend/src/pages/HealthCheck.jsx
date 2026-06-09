import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { healthCheckAPI } from '../services/api';
import { FiCamera, FiUpload, FiX, FiAlertCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HealthCheck.css';

const HealthCheck = () => {
  const { isAuthenticated } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [imageType, setImageType] = useState('skin');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const imageTypes = [
    { value: 'skin', label: 'Skin Condition' },
    { value: 'rash', label: 'Rash' },
    { value: 'wound', label: 'Wound/Injury' },
    { value: 'eye', label: 'Eye Issue' },
    { value: 'throat', label: 'Throat/Mouth' },
    { value: 'other', label: 'Other' }
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      setError('Please upload an image');
      return;
    }

    if (!isAuthenticated) {
      setError('Please login to use this feature');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('description', description);
      formData.append('imageType', imageType);

      const response = await healthCheckAPI.analyze(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'mild':
        return <FiCheckCircle className="severity-icon mild" />;
      case 'moderate':
        return <FiAlertCircle className="severity-icon moderate" />;
      case 'urgent':
        return <FiAlertTriangle className="severity-icon urgent" />;
      default:
        return null;
    }
  };

  return (
    <div className="health-check-page page" >
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📸 Photo Health Check</h1>
          <p className="page-subtitle">
            Upload a photo of your health concern and our AI will analyze it
          </p>
        </div>

        <div className="health-check-content">
          {/* Upload Section */}
          <div className="upload-section">
            <form onSubmit={handleSubmit}>
              <div className="upload-area">
                {!preview ? (
                  <label className="upload-placeholder">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      ref={fileInputRef}
                      hidden
                    />
                    <div className="upload-icon">
                      <FiCamera />
                    </div>
                    <h3>Upload a Photo</h3>
                    <p>Click to select or drag and drop</p>
                    <span className="upload-hint">Supports JPG, PNG, WebP (Max 10MB)</span>
                  </label>
                ) : (
                  <div className="preview-container">
                    <img src={preview} alt="Preview" className="image-preview" />
                    <button type="button" className="remove-image" onClick={removeImage}>
                      <FiX />
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Type of Issue</label>
                <select
                  className="form-input"
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value)}
                >
                  {imageTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Describe your concern (optional)</label>
                <textarea
                  className="form-input"
                  placeholder="e.g., Itchy rash appeared 2 days ago, slightly painful..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading || !image}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" /> Analyzing...
                  </>
                ) : (
                  <>
                    <FiUpload /> Analyze Photo
                  </>
                )}
              </button>
            </form>

            {!isAuthenticated && (
              <div className="alert alert-warning mt-md">
                Please <a href="/login">login</a> to use this feature and save your health history.
              </div>
            )}
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                className="results-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="result-card">
                  <div className="result-header">
                    <h2>Analysis Results</h2>
                    <div className={`severity-badge severity-${result.data.analysis.severityLevel}`}>
                      {getSeverityIcon(result.data.analysis.severityLevel)}
                      {result.data.analysis.severityLevel.toUpperCase()}
                    </div>
                  </div>

                  {/* Possible Causes */}
                  <div className="result-section">
                    <h3>Possible Causes</h3>
                    <div className="causes-list">
                      {result.data.analysis.possibleCauses?.map((cause, index) => (
                        <div key={index} className="cause-item">
                          <div className="cause-header">
                            <span className="cause-name">{cause.condition}</span>
                            <span className={`probability probability-${cause.probability?.toLowerCase()}`}>
                              {cause.probability}
                            </span>
                          </div>
                          {cause.description && (
                            <p className="cause-description">{cause.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advice */}
                  <div className="result-section">
                    <h3>Recommended Actions</h3>
                    <ul className="advice-list">
                      {result.data.analysis.advice?.map((advice, index) => (
                        <li key={index}>{advice}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Home Remedies */}
                  {result.data.analysis.homeRemedySuggestions?.length > 0 && (
                    <div className="result-section">
                      <h3>💊 Home Remedy Suggestions</h3>
                      <ul className="advice-list">
                        {result.data.analysis.homeRemedySuggestions.map((remedy, index) => (
                          <li key={index}>{remedy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warning Signs */}
                  {result.data.analysis.warningSignsToWatch?.length > 0 && (
                    <div className="result-section warning-section">
                      <h3>⚠️ Watch for These Signs</h3>
                      <ul className="warning-list">
                        {result.data.analysis.warningSignsToWatch.map((sign, index) => (
                          <li key={index}>{sign}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* See Doctor */}
                  {result.data.analysis.shouldSeeDoctor && (
                    <div className="see-doctor-alert">
                      <FiAlertTriangle />
                      <div>
                        <strong>Consider seeing a doctor</strong>
                        {result.data.analysis.urgencyNote && (
                          <p>{result.data.analysis.urgencyNote}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="result-disclaimer">
                    <strong>⚠️ Disclaimer:</strong> {result.disclaimer}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
