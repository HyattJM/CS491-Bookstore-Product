import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create Base64 encoded auth header
      const encodedCredentials = btoa(`${username}:${password}`);
      
      const response = await fetch('https://rarefinds-backend-api-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${encodedCredentials}`
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        onLogin({ ...data, basicAuth: encodedCredentials });
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem', 
          width: '100%', 
          height: '120px', 
          overflow: 'hidden', 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
        }}>
          <img 
            src="/logo.png" 
            alt="Rare Finds Bookstore" 
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain',
              transform: 'scale(1.8)'
            }} 
          />
        </div>
        <h2>Sign In</h2>
        <div style={{
          backgroundColor: 'var(--bg-card-hover)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          padding: '0.75rem',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          <strong>Demo Access:</strong><br/>
          Username: <code>admin</code><br/>
          Password: <code>password</code>
        </div>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
