import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LockScreen from './components/LockScreen';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem('isLocked') === 'true';
  });

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastActivity', Date.now());
    localStorage.setItem('isLocked', 'false');
    setUser(userData);
    setIsLocked(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('isLocked');
    setUser(null);
    setIsLocked(false);
  };

  const handleUnlock = () => {
    localStorage.setItem('lastActivity', Date.now());
    localStorage.setItem('isLocked', 'false');
    setIsLocked(false);
  };

  useEffect(() => {
    let intervalId;
    
    const updateActivity = () => {
      if (user && !isLocked) {
        localStorage.setItem('lastActivity', Date.now());
      }
    };

    if (user) {
      const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
      const LOGOUT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
      
      intervalId = setInterval(() => {
        const lastActivity = localStorage.getItem('lastActivity');
        if (lastActivity) {
          const idleTime = Date.now() - parseInt(lastActivity);
          
          if (idleTime > LOGOUT_TIMEOUT_MS) {
            alert('Your session has expired due to inactivity. Please log in again.');
            handleLogout();
          } else if (idleTime > LOCK_TIMEOUT_MS && !isLocked) {
            localStorage.setItem('isLocked', 'true');
            setIsLocked(true);
          }
        }
      }, 10000); // Check every 10 seconds for faster lock response

      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
      window.addEventListener('click', updateActivity);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [user, isLocked]);

  if (user && isLocked) {
    return <LockScreen user={user} onUnlock={handleUnlock} onLogout={handleLogout} />;
  }

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
