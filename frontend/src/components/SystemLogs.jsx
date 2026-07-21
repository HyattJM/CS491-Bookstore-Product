import React, { useState, useEffect } from 'react';

const SystemLogs = ({ basicAuth }) => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('https://rarefinds-backend-api-production.up.railway.app/api/logs', {
        headers: { 'Authorization': `Basic ${basicAuth}` }
      });
      if (response.ok) {
        setLogs(await response.json());
      } else {
        setError("Failed to fetch logs");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>System Activity Logs</h2>
        <button className="btn" onClick={fetchLogs}>Refresh</button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Description</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td><span style={{ fontWeight: 'bold' }}>{log.action}</span></td>
                <td>{log.description}</td>
                <td>{log.username}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLogs;
