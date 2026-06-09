import { useState, useEffect } from 'react';
import { remediesAPI } from '../services/api';
import { FiSearch, FiStar, FiEye, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HomeRemedies.css';

const HomeRemedies = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [remedies, setRemedies] = useState([]);
  const [selectedRemedy, setSelectedRemedy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRemedy, setAiRemedy] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await remediesAPI.getCategories();
      setCategories(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load categories');
      setCategories([]);
    }
  };

  const loadRemedies = async (category = null) => {
    setLoading(true);
    try {
      const response = await remediesAPI.getAll({ 
        category: category?.id,
        search: searchQuery 
      });
      setRemedies(response.data.data || []);
    } catch (err) {
      console.error('Failed to load remedies');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setAiRemedy(null);
    loadRemedies(category);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchAIRemedy(searchQuery);
    }
  };

  const searchAIRemedy = async (condition) => {
    setAiLoading(true);
    setSelectedRemedy(null);
    try {
      const response = await remediesAPI.getAI({ condition });
      setAiRemedy({ condition, data: response.data.data, disclaimer: response.data.disclaimer });
    } catch (err) {
      console.error('Failed to get AI remedy');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="remedies-page page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🏠 Home Remedies</h1>
          <p className="page-subtitle">
            Natural remedies, diet tips, and lifestyle changes for common health issues
          </p>
        </div>

        {/* Search */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search for a condition (e.g., headache, skin itching, cold)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={aiLoading}>
              {aiLoading ? <LoadingSpinner size="small" /> : 'Get Remedies'}
            </button>
          </form>
        </div>

        {/* Categories */}
        <div className="categories-section">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-card ${selectedCategory?.id === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-desc">{category.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Generated Remedy */}
        {aiRemedy && (
          <motion.div
            className="ai-remedy-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card">
              <div className="ai-remedy-header">
                <h2>🤖 AI Remedies for "{aiRemedy.condition}"</h2>
              </div>

              {/* Remedies */}
              {aiRemedy.data.remedies?.length > 0 && (
                <div className="remedy-section">
                  <h3>Natural Remedies</h3>
                  <div className="remedies-list">
                    {aiRemedy.data.remedies.map((remedy, index) => (
                      <div key={index} className="remedy-item">
                        <h4>{remedy.name}</h4>
                        <p>{remedy.description}</p>
                        {remedy.instructions && (
                          <div className="remedy-instructions">
                            <strong>How to use:</strong> {remedy.instructions}
                          </div>
                        )}
                        {remedy.ingredients?.length > 0 && (
                          <div className="remedy-ingredients">
                            <strong>Ingredients:</strong> {remedy.ingredients.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet Tips */}
              {aiRemedy.data.dietTips?.length > 0 && (
                <div className="remedy-section">
                  <h3>🍎 Diet Tips</h3>
                  <div className="tips-list">
                    {aiRemedy.data.dietTips.map((tip, index) => (
                      <div key={index} className="tip-item">
                        <strong>{tip.tip}</strong>
                        {tip.foods?.length > 0 && (
                          <div className="tip-foods">
                            Recommended: {tip.foods.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Changes */}
              {aiRemedy.data.lifestyleChanges?.length > 0 && (
                <div className="remedy-section">
                  <h3>🏃 Lifestyle Changes</h3>
                  <ul className="lifestyle-list">
                    {aiRemedy.data.lifestyleChanges.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hygiene Tips */}
              {aiRemedy.data.hygieneTips?.length > 0 && (
                <div className="remedy-section">
                  <h3>🧼 Hygiene Tips</h3>
                  <ul className="hygiene-list">
                    {aiRemedy.data.hygieneTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {aiRemedy.data.warnings?.length > 0 && (
                <div className="remedy-section warning-section">
                  <h3><FiAlertTriangle /> Warnings</h3>
                  <ul className="warnings-list">
                    {aiRemedy.data.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* When to See Doctor */}
              {aiRemedy.data.whenToSeeDoctor?.length > 0 && (
                <div className="remedy-section doctor-section">
                  <h3>🏥 When to See a Doctor</h3>
                  <ul className="doctor-list">
                    {aiRemedy.data.whenToSeeDoctor.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="remedy-disclaimer">
                <FiAlertTriangle />
                <span>{aiRemedy.disclaimer}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Remedies from Database */}
        {selectedCategory && remedies.length > 0 && (
          <div className="remedies-section">
            <h2>{selectedCategory.icon} {selectedCategory.name} Remedies</h2>
            <div className="remedies-grid">
              {remedies.map(remedy => (
                <motion.div
                  key={remedy._id}
                  className="remedy-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedRemedy(remedy)}
                >
                  <h3>{remedy.title}</h3>
                  <p>{remedy.description}</p>
                  <div className="remedy-meta">
                    <span className="remedy-rating">
                      <FiStar /> {remedy.rating?.average?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="remedy-views">
                      <FiEye /> {remedy.views || 0}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-section">
            <LoadingSpinner text="Loading remedies..." />
          </div>
        )}

        {/* Disclaimer Banner */}
        <div className="disclaimer-banner">
          <FiAlertTriangle />
          <p>
            <strong>Disclaimer:</strong> These remedies are for general wellness and mild conditions only. 
            They are not a substitute for professional medical treatment. 
            If symptoms persist or worsen, please consult a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeRemedies;
