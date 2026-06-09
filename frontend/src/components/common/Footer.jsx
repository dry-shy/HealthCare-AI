import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiHeart, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">+</div>
              <span>HealthCare AI</span>
            </div>
            <p className="footer-desc">
              Your AI-powered health companion. Get instant health guidance, track symptoms, 
              and find nearby medical care.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><FiTwitter /></a>
              <a href="#" className="social-link"><FiLinkedin /></a>
              <a href="#" className="social-link"><FiGithub /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/health-check">Photo Health Check</Link></li>
              <li><Link to="/symptoms">Symptom Tracker</Link></li>
              <li><Link to="/remedies">Home Remedies</Link></li>
              <li><Link to="/hospitals">Find Hospitals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Emergency */}
          <div className="footer-section">
            <h4 className="footer-title">Emergency</h4>
            <div className="emergency-info">
              <a href="tel:108" className="emergency-number">
                <FiPhone /> 108 (Ambulance)
              </a>
              <a href="tel:112" className="emergency-number">
                <FiPhone /> 112 (Emergency)
              </a>
            </div>
            <p className="emergency-note">
              For life-threatening emergencies, call immediately.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-disclaimer">
            <strong>Disclaimer:</strong> This application provides AI-generated health guidance only. 
            It is not a substitute for professional medical advice, diagnosis, or treatment.
          </div>
          <div className="footer-copyright">
            <p>© 2024 HealthCare AI. Made with <FiHeart className="heart-icon" /> for better health.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
