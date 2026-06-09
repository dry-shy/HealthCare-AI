import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export const LoadingOverlay = ({ text }) => {
  return (
    <div className="loading-overlay">
      <LoadingSpinner size="large" text={text} />
    </div>
  );
};

export default LoadingSpinner;
