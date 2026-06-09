import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { medicineAPI } from '../services/api';
import { FiSend, FiAlertTriangle, FiInfo, FiPackage, FiPhone } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AIAssistance.css';

const AIAssistance = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your AI health assistant. I can help you with:

• General health questions
• Over-the-counter medicine suggestions
• Understanding symptoms
• When to see a doctor

**How can I help you today?**

⚠️ Remember: I provide general guidance only, not medical diagnoses.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [otcInfo, setOtcInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadOTCInfo();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOTCInfo = async () => {
    try {
      const response = await medicineAPI.getOTC();
      setOtcInfo(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load OTC info');
      setOtcInfo([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!isAuthenticated) {
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { role: 'assistant', content: 'Please login to use the AI chat feature. You can still browse the OTC medicine information below.' }
      ]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await medicineAPI.chat({
  question: userMessage
});

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.data,
        disclaimer: response.data.data.disclaimer
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What can I take for a headache?",
    "How to treat a mild fever at home?",
    "What helps with stomach pain?",
    "Is it safe to take paracetamol?"
  ];

  return (
    <div className="ai-assistance-page page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">💊 AI Health Assistant</h1>
          <p className="page-subtitle">
            Get safe OTC medicine suggestions and health guidance
          </p>
        </div>

        <div className="ai-content">
          {/* Chat Section */}
          <div className="chat-section">
            <div className="chat-container">
              <div className="messages-area">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      className={`message ${message.role}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="message-content">
                        {message.role === 'assistant' && (
                          <div className="message-avatar">🤖</div>
                        )}
                        <div className="message-text">
                          <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                          {message.disclaimer && (
                            <div className="message-disclaimer">
                              <FiInfo /> {message.disclaimer}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      className="message assistant"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="message-content">
                        <div className="message-avatar">🤖</div>
                        <div className="message-text typing">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length <= 2 && (
                <div className="quick-questions">
                  <p>Quick questions:</p>
                  <div className="quick-buttons">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        className="quick-btn"
                        onClick={() => setInput(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="input-area">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about health concerns, medicines, or symptoms..."
                  rows={1}
                  disabled={loading}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                >
                  <FiSend />
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="chat-disclaimer">
              <FiAlertTriangle />
              <span>
                This AI provides general guidance only. Always consult a healthcare professional 
                for medical advice. Never stop prescribed medications without doctor consultation.
              </span>
            </div>
          </div>

          {/* OTC Info Sidebar */}
          {/* <div className="otc-sidebar">
            <div className="card">
              <h2><FiPackage /> Common OTC Medicines</h2>
              <p className="otc-intro">
                Quick reference for over-the-counter medicines. Always read labels carefully.
              </p>

              {otcInfo?.map((category, index) => (
                <div key={index} className="otc-category">
                  <h3>{category.category}</h3>
                  {category.medicines?.map((medicine, mIndex) => (
                    <div key={mIndex} className="medicine-item">
                      <h4>{medicine.name}</h4>
                      <div className="medicine-uses">
                        <strong>Uses:</strong> {medicine.uses?.join(', ')}
                      </div>
                      {medicine.warnings?.length > 0 && (
                        <div className="medicine-warnings">
                          <FiAlertTriangle />
                          <ul>
                            {medicine.warnings.map((w, wIndex) => (
                              <li key={wIndex}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div> */}

            {/* Telemedicine */}
            {/* <div className="card telemedicine-card">
              <h2><FiPhone /> Need a Doctor?</h2>
              <p>For conditions requiring prescription medicines or professional evaluation:</p>
              <div className="telemedicine-options">
                <button className="btn btn-primary btn-full">
                  Book Online Consultation
                </button>
                <button className="btn btn-secondary btn-full">
                  Find Nearby Doctors
                </button>
              </div>
            </div> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default AIAssistance;
