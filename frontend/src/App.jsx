import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HealthCheck from './pages/HealthCheck';
import SymptomTracker from './pages/SymptomTracker';
import AIAssistance from './pages/AIAssistance';
import HomeRemedies from './pages/HomeRemedies';
import NearbyHospitals from './pages/NearbyHospitals';
import Dashboard from './pages/Dashboard';

// CSS imports
import './pages/Home.css';
import './pages/Auth.css';
import './pages/HealthCheck.css';
import './pages/SymptomTracker.css';
import './pages/AIAssistance.css';
import './pages/HomeRemedies.css';
import './pages/NearbyHospitals.css';
import './pages/Dashboard.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/health-check" element={<HealthCheck />} />
              <Route path="/symptoms" element={<SymptomTracker />} />
              <Route path="/ai-assistant" element={<AIAssistance />} />
              <Route path="/remedies" element={<HomeRemedies />} />
              <Route path="/hospitals" element={<NearbyHospitals />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
