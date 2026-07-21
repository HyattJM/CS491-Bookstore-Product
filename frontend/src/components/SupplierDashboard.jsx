import React, { useState, useEffect } from 'react';

const SupplierDashboard = ({ user }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState({ id: null, name: '', contactPerson: '', email: '', phone: '' });

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockData, setRestockData] = useState({ bookId: '', quantity: '' });

  useEffect(() => {
    fetchSuppliers();
    fetchBooks();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('https://rarefinds-backend-api-production.up.railway.app/api/suppliers', {
        headers: { 'Authorization': `Basic ${user.basicAuth}` }
      });
      if (response.ok) {
        setSuppliers(await response.json());
      }
    } catch (err) {
      setError('Failed to fetch suppliers');
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('https://rarefinds-backend-api-production.up.railway.app/api/books', {
        headers: { 'Authorization': `Basic ${user.basicAuth}` }
      });
      if (response.ok) {
        setBooks(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    const isEdit = !!supplierFormData.id;
    const url = isEdit ? `https://rarefinds-backend-api-production.up.railway.app/api/suppliers/${supplierFormData.id}` : 'https://rarefinds-backend-api-production.up.railway.app/api/suppliers';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Basic ${user.basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierFormData)
      });

      if (response.ok) {
        setIsSupplierModalOpen(false);
        fetchSuppliers();
      }
    } catch (err) {
      alert('Failed to save supplier');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!restockData.bookId || !restockData.quantity) return;

    const book = books.find(b => b.id.toString() === restockData.bookId);
    if (!book) return;

    try {
      const response = await fetch(`https://rarefinds-backend-api-production.up.railway.app/api/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${user.basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...book,
          quantity: book.quantity + parseInt(restockData.quantity, 10)
        })
      });

      if (response.ok) {
        alert('Inventory restocked successfully!');
        setIsRestockModalOpen(false);
        fetchBooks();
      }
    } catch (err) {
      alert('Failed to restock');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading suppliers...</div>;

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Supplier Management</h2>
        <div>
          <button className="btn btn-secondary" style={{ marginRight: '1rem' }} onClick={() => setIsRestockModalOpen(true)}>
            Restock Inventory
          </button>
          <button className="btn" onClick={() => { setSupplierFormData({ id: null, name: '', contactPerson: '', email: '', phone: '' }); setIsSupplierModalOpen(true); }}>
            Add Supplier
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-hover)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Supplier Name</th>
              <th style={{ padding: '1rem' }}>Contact Person</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{s.name}</td>
                <td style={{ padding: '1rem' }}>{s.contactPerson}</td>
                <td style={{ padding: '1rem' }}>{s.email}</td>
                <td style={{ padding: '1rem' }}>{s.phone}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }} onClick={() => { setSupplierFormData(s); setIsSupplierModalOpen(true); }}>Edit</button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No suppliers added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isSupplierModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{supplierFormData.id ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button className="close-btn" onClick={() => setIsSupplierModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveSupplier} className="modal-form">
              <div className="form-group">
                <label>Company Name</label>
                <input required type="text" value={supplierFormData.name} onChange={e => setSupplierFormData({...supplierFormData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input required type="text" value={supplierFormData.contactPerson} onChange={e => setSupplierFormData({...supplierFormData, contactPerson: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={supplierFormData.email} onChange={e => setSupplierFormData({...supplierFormData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input required type="text" value={supplierFormData.phone} onChange={e => setSupplierFormData({...supplierFormData, phone: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsSupplierModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRestockModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Restock Inventory</h2>
              <button className="close-btn" onClick={() => setIsRestockModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleRestock} className="modal-form">
              <div className="form-group">
                <label>Select Book</label>
                <select required value={restockData.bookId} onChange={e => setRestockData({...restockData, bookId: e.target.value})} style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', width: '100%' }}>
                  <option value="">-- Choose Book --</option>
                  {books.map(b => <option key={b.id} value={b.id}>{b.title} ({b.quantity} in stock)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity to Add</label>
                <input required type="number" min="1" value={restockData.quantity} onChange={e => setRestockData({...restockData, quantity: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsRestockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
