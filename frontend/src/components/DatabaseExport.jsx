import React from 'react';

const DatabaseExport = ({ basicAuth }) => {

  const handleExport = async (type) => {
    try {
      const response = await fetch(`https://rarefinds-backend-api-production.up.railway.app/api/export/${type}`, {
        headers: { 'Authorization': `Basic ${basicAuth}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to export data");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="dashboard-container">
      <h2 style={{ marginBottom: '1rem' }}>Database Backups & Exports</h2>
      <p style={{ marginBottom: '2rem' }}>Download raw CSV exports of the current system databases.</p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="login-card" style={{ padding: '2rem', textAlign: 'center', width: 'auto' }}>
          <h3>Inventory Database</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-color)', opacity: 0.8 }}>Export all books, prices, and stock quantities.</p>
          <button className="btn" onClick={() => handleExport('inventory')}>Export Inventory to CSV</button>
        </div>

        <div className="login-card" style={{ padding: '2rem', textAlign: 'center', width: 'auto' }}>
          <h3>Sales Database</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-color)', opacity: 0.8 }}>Export all historical sales transactions.</p>
          <button className="btn" onClick={() => handleExport('sales')}>Export Sales to CSV</button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseExport;
