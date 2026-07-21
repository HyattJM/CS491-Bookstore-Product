import React, { useState } from 'react';

const LockScreen = ({ user, onUnlock, onLogout }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const encodedCredentials = btoa(`${user.username}:${password}`);
      
      const response = await fetch('https://rarefinds-backend-api-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${encodedCredentials}`
        },
        body: JSON.stringify({ username: user.username, password })
      });

      if (response.ok) {
        onUnlock();
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1rem',
            fontWeight: 'bold'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Session Locked</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, <strong>{user.username}</strong></p>
        </div>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Enter password to unlock"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ textAlign: 'center' }}
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            onClick={onLogout}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              textDecoration: 'underline', 
              cursor: 'pointer' 
            }}
          >
            Not {user.username}? Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
