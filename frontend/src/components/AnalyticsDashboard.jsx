import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const AnalyticsDashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/analytics/dashboard', {
        headers: { 'Authorization': `Basic ${user.basicAuth}` }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        throw new Error('Failed to load analytics data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading analytics...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

  // Prepare chart data from recent transactions
  const revenueData = data?.recentTransactions?.map(t => ({
    name: new Date(t.date).toLocaleDateString(),
    amount: t.amount
  })).reverse() || [];

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <h2 style={{ marginBottom: '2rem' }}>Analytics Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Revenue</h4>
          <div style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            ${data?.totalRevenue?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Books Sold</h4>
          <div style={{ fontSize: '2rem', color: '#10b981', fontWeight: 'bold' }}>
            {data?.totalBooksSold || 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Chart */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Recent Revenue</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--danger)' }}>Low Stock Alerts</h3>
          {data?.lowStockItems?.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>All books are well stocked.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0' }}>Title</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Qty Remaining</th>
                </tr>
              </thead>
              <tbody>
                {data?.lowStockItems?.map(book => (
                  <tr key={book.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{book.title}</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 'bold', color: book.quantity === 0 ? 'var(--danger)' : '#fbbf24' }}>
                      {book.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Detailed Transactions Table */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Recent Sales History</h3>
        {data?.detailedTransactions?.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No recent transactions.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Books</th>
                  <th>Qty</th>
                  <th>Total Sale</th>
                </tr>
              </thead>
              <tbody>
                {data?.detailedTransactions?.map(tx => (
                  <tr key={tx.id}>
                    <td>#{tx.id}</td>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                    <td>{tx.user}</td>
                    <td>{tx.role}</td>
                    <td>{tx.books}</td>
                    <td>{tx.quantity}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${tx.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
