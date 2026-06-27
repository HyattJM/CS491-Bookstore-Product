import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastActivity', Date.now());
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    setUser(null);
  };

  useEffect(() => {
    let intervalId;
    
    const updateActivity = () => {
      if (user) {
        localStorage.setItem('lastActivity', Date.now());
      }
    };

    if (user) {
      // 30 minutes in milliseconds
      const TIMEOUT_MS = 30 * 60 * 1000;
      
      intervalId = setInterval(() => {
        const lastActivity = localStorage.getItem('lastActivity');
        if (lastActivity && Date.now() - parseInt(lastActivity) > TIMEOUT_MS) {
          alert('Your session has expired due to inactivity. Please log in again.');
          handleLogout();
        }
      }, 60000); // Check every minute

      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, [user]);

  return (
    <Router>
      <div className="app-container">
        {user && (
          <nav className="navbar">
            <h1>Rare Finds BMS</h1>
            <div>
              <span style={{ marginRight: '1rem', color: 'var(--text-secondary)' }}>
                Welcome, {user.username} ({user.role})
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
          </nav>
        )}
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
