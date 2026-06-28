import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LockScreen from './components/LockScreen';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SupplierDashboard from './components/SupplierDashboard';
import { CartProvider, useCart } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

// Separate Navbar component so it can use CartContext
const Navbar = ({ user, handleLogout }) => {
  const { cartCount, setIsCartOpen } = useCart();
  return (
    <nav className="navbar">
      <h1>Rare Finds BMS</h1>
      <div>
        <span style={{ marginRight: '1rem', color: 'var(--text-secondary)' }}>
          Welcome, {user.username} ({user.role})
        </span>
        <Link to="/" className="btn" style={{ marginRight: '0.5rem', textDecoration: 'none', background: 'transparent', color: 'var(--text-primary)' }}>Inventory</Link>
        {['ADMIN', 'MANAGER'].includes(user.role) && (
          <>
            <Link to="/analytics" className="btn" style={{ marginRight: '0.5rem', textDecoration: 'none', background: 'transparent', color: 'var(--text-primary)' }}>Analytics</Link>
            <Link to="/suppliers" className="btn" style={{ marginRight: '0.5rem', textDecoration: 'none', background: 'transparent', color: 'var(--text-primary)' }}>Suppliers</Link>
          </>
        )}
        <button className="btn" style={{ marginRight: '0.5rem' }} onClick={() => setIsCartOpen(true)}>
          Cart ({cartCount})
        </button>
        <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

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
    <CartProvider>
      <Router>
        <div className="app-container">
          {user && <Navbar user={user} handleLogout={handleLogout} />}
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/analytics" 
              element={user && ['ADMIN', 'MANAGER'].includes(user.role) ? <AnalyticsDashboard user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/suppliers" 
              element={user && ['ADMIN', 'MANAGER'].includes(user.role) ? <SupplierDashboard user={user} /> : <Navigate to="/" />} 
            />
          </Routes>
          {user && <CartDrawer user={user} />}
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
