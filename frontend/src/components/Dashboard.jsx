import React, { useState, useEffect } from 'react';

const Dashboard = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('title');
  const [hasSearched, setHasSearched] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const url = new URL('http://localhost:8081/api/books');
      if (searchQuery) {
        url.searchParams.append('query', searchQuery);
        url.searchParams.append('filterBy', filterBy);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Basic ${user.basicAuth}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
        setHasSearched(!!searchQuery);
      } else {
        setError('Failed to fetch books');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (book) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) {
        if (existing.cartQty >= book.quantity) return prev; // Cannot exceed stock
        return prev.map(item => item.id === book.id ? { ...item, cartQty: item.cartQty + 1 } : item);
      }
      return [...prev, { ...book, cartQty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (bookId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === bookId) {
        const newQty = item.cartQty + delta;
        if (newQty > item.quantity) return item; // exceed stock
        return { ...item, cartQty: newQty };
      }
      return item;
    }).filter(item => item.cartQty > 0));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setCheckoutLoading(true);
      const payload = {
        items: cart.map(item => ({
          bookId: item.id,
          quantity: item.cartQty
        }))
      };

      const response = await fetch('http://localhost:8081/api/sales', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${user.basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Sale processed successfully! Transaction ID: ${result.id}`);
        setCart([]);
        setIsCartOpen(false);
        fetchBooks(); // Refresh inventory
      } else {
        const errData = await response.json();
        alert(`Failed to process sale: ${errData.message || response.statusText}`);
      }
    } catch (err) {
      alert('Connection error during checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.cartQty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);

  if (loading && books.length === 0) return <div style={{ padding: '2rem' }}>Loading inventory...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="header-row">
        <h2>Inventory Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['ADMIN', 'MANAGER'].includes(user.role) && (
            <button className="btn">Add New Book</button>
          )}
          <button 
            className="btn btn-secondary" 
            style={{ position: 'relative' }}
            onClick={() => setIsCartOpen(true)}
          >
            Cart
            {cartTotalCount > 0 && <span className="cart-badge">{cartTotalCount}</span>}
          </button>
        </div>
      </div>

      <div className="search-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder={`Search by ${filterBy}...`} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
          style={{ padding: '0.5rem', flex: 1, borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        />
        <select 
          value={filterBy} 
          onChange={(e) => setFilterBy(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="genre">Genre</option>
        </select>
        <button className="btn btn-primary" onClick={fetchBooks}>Search</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>${book.price.toFixed(2)}</td>
              <td>
                <span style={{ 
                  color: book.quantity < 5 ? 'var(--danger)' : 'var(--text-primary)',
                  fontWeight: book.quantity < 5 ? 'bold' : 'normal'
                }}>
                  {book.quantity}
                </span>
              </td>
              <td>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem', fontSize: '0.875rem' }}
                  onClick={() => addToCart(book)}
                  disabled={book.quantity === 0}
                >
                  {book.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem', fontSize: '0.875rem' }}>Edit</button>
                {['ADMIN'].includes(user.role) && (
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Delete</button>
                )}
              </td>
            </tr>
          ))}
          {books.length === 0 && !loading && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                {hasSearched ? `No results found for '${searchQuery}' in ${filterBy}` : 'No books in inventory'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Cart Side Panel */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-panel ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Shopping Cart</h3>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
              Your cart is empty.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.title}</div>
                  <div className="cart-item-price">${item.price.toFixed(2)}</div>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => updateCartQuantity(item.id, -1)}>-</button>
                  <span style={{ width: '20px', textAlign: 'center' }}>{item.cartQty}</span>
                  <button 
                    onClick={() => updateCartQuantity(item.id, 1)}
                    disabled={item.cartQty >= item.quantity}
                  >+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>${cartTotalPrice.toFixed(2)}</span>
          </div>
          <button 
            className="btn btn-primary checkout-btn" 
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkoutLoading}
          >
            {checkoutLoading ? 'Processing...' : 'Complete Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
