import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ user }) => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setError(null);
    try {
      const payload = {
        items: cartItems.map(item => ({
          bookId: item.book.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch('http://localhost:8082/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${user.basicAuth}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to process checkout');
      }

      alert('Checkout successful! Transaction recorded.');
      clearCart();
      setIsCartOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
        }}
        onClick={() => setIsCartOpen(false)}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
        backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border-color)',
        zIndex: 1000, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.2)'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Shopping Cart</h2>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>Your cart is empty.</div>
          ) : (
            cartItems.map(item => (
              <div key={item.book.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.book.title}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>${item.book.price.toFixed(2)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => updateQuantity(item.book.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => updateQuantity(item.book.id, item.quantity + 1)}>+</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', marginLeft: 'auto' }} onClick={() => removeFromCart(item.book.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
            <button className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
