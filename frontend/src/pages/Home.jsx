import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCamera, FiActivity, FiHeart, FiMapPin, FiMessageCircle, FiShield, FiArrowRight, FiPhone } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: FiCamera,
      title: 'Photo Health Check',
      description: 'Upload photos of skin conditions, rashes, or injuries. Our AI analyzes and provides possible causes with severity assessment.',
      link: '/health-check',
      color: '#5b95f1'
    },
    {
      icon: FiActivity,
      title: 'Symptom Tracker',
      description: 'Log your symptoms over time. Track patterns, get AI analysis, and understand your health trends.',
      link: '/symptoms',
      color: '#045b3e'
    },
    {
      icon: FiMessageCircle,
      title: 'AI Health Assistant',
      description: 'Get personalized OTC medicine suggestions and health guidance. Safe recommendations with clear warnings.',
      link: '/ai-assistant',
      color: '#8b5cf6'
    },
    {
      icon: FiHeart,
      title: 'Home Remedies',
      description: 'Discover natural remedies, diet tips, and lifestyle changes for common health issues.',
      link: '/remedies',
      color: '#f5490b'
    },
    {
      icon: FiMapPin,
      title: 'Find Hospitals',
      description: 'Locate nearby hospitals, clinics, and specialists. Filter by distance, rating, and specialty.',
      link: '/hospitals',
      color: '#e60e0e'
    },
    {
      icon: FiShield,
      title: 'Health Dashboard',
      description: 'Your personal health history. View past analyses, symptom timeline, and health insights.',
      link: '/dashboard',
      color: '#d4069d'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `url(/src/pages/colour2.jpg)`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="container hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="hero-badge">AI-Powered Healthcare</span>
            <h1 className="hero-title">
              Your Personal <span className="gradient-text">Health Assistant</span>
            </h1>
            <p className="hero-description">
              Get instant health guidance using AI. Upload photos, track symptoms, 
              find remedies, and locate nearby hospitals. All in one place.
            </p>
            <div className="hero-actions">
              <Link to="/health-check" className="btn btn-primary btn-lg">
                <FiCamera /> Start Health Check
              </Link>
              <Link to="/symptoms" className="btn btn-secondary btn-lg">
                Track Symptoms
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}


          >
            <div className="hero-card">
              <div className="health-indicator">
                <div className="pulse-ring"></div>
                <div className="health-icon">+</div>
              </div>
              <div className="hero-features-mini">
                <div className="mini-feature">
                  <FiCamera /> Photo Analysis
                </div>
                <div className="mini-feature">
                  <FiActivity /> Symptom Tracking
                </div>
                <div className="mini-feature">
                  <FiHeart /> Home Remedies
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Comprehensive Health Features</h2>
            <p>Everything you need to monitor and improve your health</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={feature.link} className="feature-card">
                  <div 
                    className="feature-icon"
                    style={{ background: `${feature.color}20`, color: feature.color }}
                  >
                    <feature.icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="feature-link">
                    Learn more <FiArrowRight />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get health guidance in 3 simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload or Describe</h3>
              <p>Take a photo of your condition or describe your symptoms using our easy-to-use interface.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI analyzes your input and provides possible causes, severity assessment, and recommendations.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Guidance</h3>
              <p>Receive personalized advice, home remedies, and know when to see a doctor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      {/* <section className="emergency-section">
        <div className="container">
          <div className="emergency-card">
            <div className="emergency-content">
              <h2>🚨 Medical Emergency?</h2>
              <p>For life-threatening situations, don't wait - get immediate help!</p>
            </div>
            <div className="emergency-actions">
              <a href="tel:108" className="btn btn-danger btn-lg">
                <FiPhone /> Call 108 - Ambulance
              </a>
              <a href="tel:112" className="btn btn-outline btn-lg">
                <FiPhone /> Call 112 - Emergency
              </a>
            </div>
          </div>
        </div>
      </section> */}

      {/* Disclaimer */}
      <section className="disclaimer-section">
        <div className="container">
          <div className="disclaimer-card">
            <h3>⚠️ Important Disclaimer</h3>
            <p>
              This application provides AI-generated health guidance for educational purposes only. 
              It is <strong>not a substitute</strong> for professional medical advice, diagnosis, or treatment. 
              Always consult a qualified healthcare provider for medical concerns. 
              In case of emergency, call your local emergency services immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
