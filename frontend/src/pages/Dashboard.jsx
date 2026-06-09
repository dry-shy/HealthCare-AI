import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { FiCamera, FiActivity, FiCalendar, FiTrendingUp, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    loadInsights();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getOverview();
      setDashboardData(response.data?.data || {});
    } catch (err) {
      console.error('Failed to load dashboard');
      setDashboardData({});
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await dashboardAPI.getInsights();
      setInsights(response.data.data || []);
    } catch (err) {
      console.error('Failed to load insights');
    }
  };

  const handleExport = async () => {
    try {
      const response = await dashboardAPI.exportData();
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      console.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page page">
        <div className="container">
          <div className="loading-section">
            <LoadingSpinner text="Loading your health dashboard..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page page">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">📊 Health Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name || 'User'}!</p>
          </div>
          <button className="btn btn-secondary" onClick={handleExport}>
            <FiDownload /> Export Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="stat-icon blue">
              <FiCamera />
            </div>
            <div className="stat-content">
              <span className="stat-value">{dashboardData?.overview?.totalHealthChecks || 0}</span>
              <span className="stat-label">Health Checks</span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon green">
              <FiActivity />
            </div>
            <div className="stat-content">
              <span className="stat-value">{dashboardData?.overview?.totalSymptomRecords || 0}</span>
              <span className="stat-label">Symptom Records</span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card severity-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="severity-breakdown">
              <span className="severity-item mild">
                <span className="severity-dot"></span>
                Mild: {dashboardData?.overview?.severityBreakdown?.mild || 0}
              </span>
              <span className="severity-item moderate">
                <span className="severity-dot"></span>
                Moderate: {dashboardData?.overview?.severityBreakdown?.moderate || 0}
              </span>
              <span className="severity-item urgent">
                <span className="severity-dot"></span>
                Urgent: {dashboardData?.overview?.severityBreakdown?.urgent || 0}
              </span>
            </div>
            <span className="stat-label">Severity Breakdown</span>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content">
          {/* Recent Health Checks */}
          <div className="card">
            <div className="card-header">
              <h2><FiCamera /> Recent Health Checks</h2>
              <Link to="/health-check" className="btn btn-secondary btn-sm">New Check</Link>
            </div>
            {dashboardData?.recentHealthChecks?.length > 0 ? (
              <div className="history-list">
                {dashboardData.recentHealthChecks.map(check => (
                  <div key={check._id} className="history-item">
                    <div className="history-icon">
                      <FiCamera />
                    </div>
                    <div className="history-content">
                      <span className="history-type">{check.imageType}</span>
                      <span className="history-date">
                        {new Date(check.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`severity-badge severity-${check.analysis?.severityLevel}`}>
                      {check.analysis?.severityLevel}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No health checks yet</p>
                <Link to="/health-check" className="btn btn-primary btn-sm">Start Your First Check</Link>
              </div>
            )}
          </div>

          {/* Recent Symptoms */}
          <div className="card">
            <div className="card-header">
              <h2><FiActivity /> Recent Symptoms</h2>
              <Link to="/symptoms" className="btn btn-secondary btn-sm">Track New</Link>
            </div>
            {dashboardData?.recentSymptoms?.length > 0 ? (
              <div className="history-list">
                {dashboardData.recentSymptoms.map(record => (
                  <div key={record._id} className="history-item">
                    <div className="history-icon green">
                      <FiActivity />
                    </div>
                    <div className="history-content">
                      <span className="history-symptoms">
                        {record.symptoms?.slice(0, 2).map(s => s.name).join(', ')}
                        {record.symptoms?.length > 2 && ` +${record.symptoms.length - 2}`}
                      </span>
                      <span className="history-date">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="feeling-badge">
                      Feeling: {record.overallFeeling}/10
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No symptoms tracked yet</p>
                <Link to="/symptoms" className="btn btn-primary btn-sm">Start Tracking</Link>
              </div>
            )}
          </div>

          {/* Common Symptoms */}
          {dashboardData?.commonSymptoms?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2><FiTrendingUp /> Most Common Symptoms</h2>
              </div>
              <div className="common-symptoms">
                {dashboardData.commonSymptoms.map((symptom, index) => (
                  <div key={symptom._id} className="symptom-bar">
                    <div className="symptom-info">
                      <span className="symptom-name">{symptom._id}</span>
                      <span className="symptom-count">{symptom.count}x</span>
                    </div>
                    <div className="symptom-progress">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(symptom.count / dashboardData.commonSymptoms[0].count) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Insights */}
          {insights.length > 0 && (
            <div className="card insights-card">
              <div className="card-header">
                <h2><FiAlertCircle /> Health Insights</h2>
              </div>
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div key={index} className={`insight-item ${insight.severity}`}>
                    <div className="insight-icon">
                      {insight.severity === 'positive' ? '✨' : 
                       insight.severity === 'warning' ? '⚠️' : 'ℹ️'}
                    </div>
                    <div className="insight-content">
                      <h4>{insight.title}</h4>
                      <p>{insight.description}</p>
                      {insight.recommendation && (
                        <span className="insight-recommendation">{insight.recommendation}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/health-check" className="action-card blue">
              <FiCamera />
              <span>New Photo Check</span>
            </Link>
            <Link to="/symptoms" className="action-card green">
              <FiActivity />
              <span>Track Symptoms</span>
            </Link>
            <Link to="/hospitals" className="action-card red">
              <FiCalendar />
              <span>Find Hospitals</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
