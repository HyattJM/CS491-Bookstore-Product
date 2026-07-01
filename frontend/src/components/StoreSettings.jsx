import React, { useState, useEffect } from 'react';

const StoreSettings = ({ basicAuth }) => {
  const [settings, setSettings] = useState([]);
  const [error, setError] = useState(null);
  
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/settings', {
        headers: { 'Authorization': `Basic ${basicAuth}` }
      });
      if (response.ok) {
        setSettings(await response.json());
      } else {
        setError("Failed to fetch settings");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  const handleSave = async (e, key, value) => {
    if (e) e.preventDefault();
    try {
      const response = await fetch('http://localhost:8082/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify({ settingKey: key, settingValue: value })
      });
      if (response.ok) {
        setNewKey('');
        setNewValue('');
        fetchSettings();
      } else {
        setError("Failed to save setting");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  return (
    <div className="dashboard-container">
      <h2 style={{ marginBottom: '1rem' }}>Store Settings</h2>
      <p style={{ marginBottom: '2rem' }}>Configure global variables for the bookstore application.</p>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Setting Key</label>
          <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="e.g. TAX_RATE" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Setting Value</label>
          <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="e.g. 0.08" />
        </div>
        <button className="btn" onClick={(e) => handleSave(e, newKey, newValue)} disabled={!newKey || !newValue}>Add Setting</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {settings.map(setting => (
            <tr key={setting.settingKey}>
              <td style={{ fontWeight: 'bold' }}>{setting.settingKey}</td>
              <td>
                <input 
                  type="text" 
                  defaultValue={setting.settingValue} 
                  onBlur={(e) => {
                    if (e.target.value !== setting.settingValue) {
                      handleSave(null, setting.settingKey, e.target.value);
                    }
                  }} 
                />
              </td>
              <td><span style={{ fontSize: '0.8rem', color: 'gray' }}>Edits autosave on blur</span></td>
            </tr>
          ))}
          {settings.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>No settings configured.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StoreSettings;
