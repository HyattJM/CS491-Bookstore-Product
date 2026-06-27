import React, { useState, useEffect } from 'react';

const BookCover = ({ isbn, title }) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!isbn) {
      setLoading(false);
      return;
    }
    
    fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
            let url = data.items[0].volumeInfo.imageLinks.thumbnail;
            if (url) {
              url = url.replace('http:', 'https:').replace('&edge=curl', '');
              // Try to get higher res if possible by replacing zoom=1 with zoom=2 or just removing it, but thumbnail is okay
            }
            setCoverUrl(url);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [title]);

  if (loading) {
    return <div className="book-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-hover)' }}>Loading...</div>;
  }

  if (!coverUrl) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="400"><rect width="280" height="400" fill="#1e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#f8fafc">No Cover</text></svg>`;
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
    return (
      <img 
        src={dataUrl} 
        alt={title} 
        className="book-cover"
      />
    );
  }

  return <img src={coverUrl} alt={title} className="book-cover" />;
};

const Dashboard = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('title');
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({ title: '', author: '', genre: '', isbn: '', price: '', quantity: '', condition: '' });

  useEffect(() => {
    fetchBooks();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', genre: '', isbn: '', price: '', quantity: '', condition: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData(book);
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingBook;
      const endpoint = isEdit ? `http://localhost:8082/api/books/${editingBook.id}` : 'http://localhost:8082/api/books';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Basic ${user.basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity, 10)
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchBooks();
      } else {
        const errText = await response.text();
        alert(`Failed to save book: ${errText}`);
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  // Debounced search for suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        fetchBooks(); // Reset table when search is cleared
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterBy]);

  const fetchSuggestions = async () => {
    try {
      const url = new URL('http://localhost:8082/api/books');
      url.searchParams.append('query', searchQuery);
      url.searchParams.append('filterBy', filterBy);
      
      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Basic ${user.basicAuth}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Extract unique strings based on the filterBy criteria for suggestions
        const uniqueSuggestions = Array.from(new Set(data.map(b => b[filterBy])));
        setSuggestions(uniqueSuggestions.slice(0, 5)); // show top 5
      }
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // The useEffect will trigger a search because searchQuery changed
    // Wait for the next render to fetch the actual books for the table
    setTimeout(() => {
      fetchBooks(suggestion);
    }, 0);
  };

  const fetchBooks = async (explicitQuery = searchQuery) => {
    try {
      setLoading(true);
      const url = new URL('http://localhost:8082/api/books');
      if (explicitQuery) {
        url.searchParams.append('query', explicitQuery);
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
        setHasSearched(!!explicitQuery);
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

      const response = await fetch('http://localhost:8082/api/sales', {
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
            <button className="btn" onClick={openAddModal}>Add New Book</button>
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

      <div className="search-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          {filterBy === 'price' ? (
            <select
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Immediately trigger search when a price range is selected
                fetchBooks(e.target.value);
              }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}
            >
              <option value="">Select Price Range...</option>
              <option value="1-100">$1 - $100</option>
              <option value="100-250">$100 - $250</option>
              <option value="250-500">$250 - $500</option>
              <option value="500+">$500+</option>
            </select>
          ) : (
            <input 
              type="text" 
              placeholder={`Search by ${filterBy}...`} 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  fetchBooks();
                }
              }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}
            />
          )}
          {filterBy !== 'price' && showSuggestions && suggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              zIndex: 10,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid rgba(51, 65, 85, 0.5)'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--surface-hover)'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <select 
          value={filterBy} 
          onChange={(e) => {
            setFilterBy(e.target.value);
            setSearchQuery(''); // Reset search query when changing filter
          }}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }}
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="genre">Genre</option>
          <option value="price">Price Range</option>
        </select>
        <button className="btn btn-primary" onClick={() => fetchBooks(searchQuery)}>Search</button>
      </div>

      <div className="books-grid">
        {books.map(book => (
          <div key={book.id} className="book-card">
            <BookCover isbn={book.isbn} title={book.title} />
            <div className="book-info">
              <div className="book-title">{book.title}</div>
              <div className="book-author">by {book.author}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Genre: {book.genre}</div>
              
              <div className="book-meta">
                <span className="book-price">${book.price.toFixed(2)}</span>
                <span className={`book-qty ${book.quantity === 0 ? 'out-of-stock' : ''}`}>
                  {book.quantity === 0 ? 'Out of Stock' : `${book.quantity} in stock`}
                </span>
              </div>
            </div>
            <div className="book-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => addToCart(book)}
                disabled={book.quantity === 0}
              >
                Add to Cart
              </button>
              {['ADMIN', 'MANAGER'].includes(user.role) && (
                <button className="btn btn-secondary" onClick={() => openEditModal(book)}>Edit</button>
              )}
              {['ADMIN'].includes(user.role) && (
                <button className="btn btn-danger">Delete</button>
              )}
            </div>
          </div>
        ))}
        {books.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>
            {hasSearched ? `No results found for '${searchQuery}' in ${filterBy}` : 'No books in inventory'}
          </div>
        )}
      </div>

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

      {/* Book Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={handleSaveBook}>
              <div className="form-group">
                <label>Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input required type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Genre</label>
                  <input required type="text" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>ISBN</label>
                  <input required type="text" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price ($)</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Quantity</label>
                  <input required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Condition</label>
                  <input type="text" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
