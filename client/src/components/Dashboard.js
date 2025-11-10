import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file (JPG, PNG, SVG)');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);

    const formData = new FormData();
    formData.append('image', selectedFile);

    console.log('FormData created, sending request...');

    try {
      const response = await axios.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      let errorMessage = 'An error occurred while processing the image';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Make sure the Flask server is running on port 5000.';
      } else {
        // Something else happened
        errorMessage = `Network error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatClassName = (className) => {
    return className
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10b981'; // Green
    if (confidence >= 0.6) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Eye Disease Classification</h1>
        <p className="page-subtitle">Upload a retinal image to detect eye diseases using AI</p>
      </div>

      <div className="upload-section">
        <div
          className={`upload-area ${dragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="upload-icon">
            <FontAwesomeIcon icon="cloud-upload" />
          </div>
          <div className="upload-text">Select a file or drag and drop here.</div>
          <div className="upload-subtext">JPG, PNG, SVG files will be relevant.</div>
          <button className="upload-button" type="button">
            Browse Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden-input"
          />
        </div>

        {selectedFile && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              className="upload-button" 
              onClick={handleSubmit}
              disabled={loading}
              style={{ 
                backgroundColor: loading ? '#ccc' : '#667eea',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        )}

        {error && (
          <div className="error">
            <FontAwesomeIcon icon="exclamation-circle" style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}
      </div>

      <div className="preview-section">
        <div className="image-preview">
          <h3 className="preview-title">Upload Image</h3>
          {preview ? (
            <img src={preview} alt="Preview" className="preview-image" />
          ) : (
            <div className="no-image">No image uploaded</div>
          )}
        </div>

        <div className="results-section">
          <h3 className="preview-title">Preview Results</h3>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : result ? (
            <div>
              <div className="result-item">
                <div className="result-label">Predicted Disease</div>
                <div className="result-value">{formatClassName(result.predicted_class)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Confidence Score</div>
                <div className="result-value">{(result.confidence * 100).toFixed(1)}%</div>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ 
                      width: `${result.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(result.confidence)
                    }}
                  ></div>
                </div>
              </div>
              <div className="result-item">
                <div className="result-label">Analysis Status</div>
                <div className="result-value" style={{ color: '#10b981' }}>Complete</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6e6e73', padding: '40px' }}>
              Upload an image to see prediction results
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
