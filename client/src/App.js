import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faEye, 
  faCloudUpload, 
  faImage, 
  faChartBar, 
  faCog, 
  faQuestionCircle,
  faUser,
  faHome,
  faDatabase,
  faFileAlt,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

// Add icons to library
library.add(
  faEye, 
  faCloudUpload, 
  faImage, 
  faChartBar, 
  faCog, 
  faQuestionCircle,
  faUser,
  faHome,
  faDatabase,
  faFileAlt,
  faExclamationCircle
);

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
