import React, { useState, useEffect } from 'react';

const UserManagement = ({ basicAuth }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null if creating, User object if editing
  const [formData, setFormData] = useState({ username: '', password: '', role: 'CLERK' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://rarefinds-backend-api-production.up.railway.app/api/users', {
        headers: { 'Authorization': `Basic ${basicAuth}` }
      });
      if (response.ok) {
        setUsers(await response.json());
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`https://rarefinds-backend-api-production.up.railway.app/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Basic ${basicAuth}` }
      });
      if (response.ok) {
        fetchUsers();
      } else {
        const text = await response.text();
        setError(text || "Failed to delete user");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editingUser ? `https://rarefinds-backend-api-production.up.railway.app/api/users/${editingUser.id}` : 'https://rarefinds-backend-api-production.up.railway.app/api/users';
    const method = editingUser ? 'PUT' : 'POST';
    
    // For update, we only send fields if they are updated
    const payload = { ...formData };
    if (editingUser && !payload.password) {
      delete payload.password; // backend won't change password if null
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const text = await response.text();
        setError(text || "Failed to save user");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'CLERK' });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
    setIsModalOpen(true);
    setError(null);
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>User Management</h2>
        <button className="btn" onClick={openCreateModal}>Add User</button>
      </div>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button className="btn" style={{ marginRight: '0.5rem' }} onClick={() => openEditModal(user)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--surface)', padding: '2rem', 
            borderRadius: '8px', width: '100%', maxWidth: '400px'
          }}>
            <h3>{editingUser ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  required 
                  disabled={!!editingUser} // Don't allow changing username
                />
              </div>
              <div className="form-group">
                <label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required={!editingUser} 
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}
                >
                  <option value="CLERK" style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>Clerk</option>
                  <option value="MANAGER" style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>Manager</option>
                  <option value="ADMIN" style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-danger" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
