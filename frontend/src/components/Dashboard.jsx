import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const NativeFlipCard = ({ isFlipped, front, back }) => {
  return (
    <div style={{ width: '100%', height: '100%', perspective: '1000px' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          top: 0,
          left: 0
        }}>
          {front}
        </div>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          top: 0,
          left: 0
        }}>
          {back}
        </div>
      </div>
    </div>
  );
};

const BookCover = ({ isbn, title, author }) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const [synopsis, setSynopsis] = useState("");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const coverRef = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '100px' });
    
    if (coverRef.current) observer.observe(coverRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!isVisible) return;
    if (!title) {
      setLoading(false);
      return;
    }
    
    const term = encodeURIComponent(`${title} ${author}`);
    fetch(`https://itunes.apple.com/search?term=${term}&media=ebook&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.results && data.results.length > 0) {
            if (data.results[0].artworkUrl100) {
              let url = data.results[0].artworkUrl100.replace('100x100bb', '400x400bb');
              setCoverUrl(url);
            }
            if (data.results[0].description) {
              setSynopsis(data.results[0].description);
            }
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [title, author, isVisible]);

  const fallbackSvg = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="280" height="400"><rect width="280" height="400" fill="#1e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#f8fafc">No Cover</text></svg>`)}`;

  const frontContent = (
    <div style={{ minHeight: '400px', height: '100%', display: 'flex' }}>
      {loading ? (
        <div className="book-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-hover)', flex: 1, height: '100%' }}>Loading...</div>
      ) : (
        <img 
          src={coverUrl || fallbackSvg} 
          alt={title} 
          className="book-cover"
          style={{ flex: 1, objectFit: 'contain', width: '100%', height: '100%', borderBottom: '1px solid var(--border-color)', backgroundColor: '#0f172a' }}
        />
      )}
    </div>
  );

  const backContent = (
    <div 
      style={{ 
        minHeight: '400px', 
        height: '400px',
        overflowY: 'auto', 
        backgroundColor: 'var(--surface-hover)',
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        lineHeight: '1.6'
      }}
      className="book-synopsis-back"
    >
      <h4 style={{marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary)'}}>Synopsis</h4>
      {synopsis ? (
        <div dangerouslySetInnerHTML={{ __html: synopsis }} />
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>No synopsis available.</p>
      )}
    </div>
  );

  return (
    <div 
      ref={coverRef} 
      style={{ width: '100%', height: '400px' }} 
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <NativeFlipCard isFlipped={isFlipped} front={frontContent} back={backContent} />
    </div>
  );
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

  // Global Cart
  const { addToCart } = useCart();

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const response = await fetch(`http://localhost:8082/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Basic ${user.basicAuth}` }
      });
      if (response.ok) {
        fetchBooks();
      } else {
        alert("Failed to delete book");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
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
            <BookCover isbn={book.isbn} title={book.title} author={book.author} />
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
                <button className="btn btn-danger" onClick={() => handleDelete(book.id)}>Delete</button>
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
