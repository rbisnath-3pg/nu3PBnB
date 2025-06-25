import React, { useEffect, useState } from 'react';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const Wishlist = ({ user, token, onSelectListing }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/users/me/wishlist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setWishlist(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load wishlist');
        setLoading(false);
      });
  }, [token]);

  const handleRemove = async (listingId) => {
    try {
      const res = await fetch(`${API_BASE}/users/me/wishlist/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const updatedWishlist = await res.json();
      setWishlist(updatedWishlist);
      setError(null);
    } catch {
      setError('Failed to remove from wishlist');
    }
  };

  const handleAdd = async (listingId) => {
    try {
      const res = await fetch(`${API_BASE}/users/me/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ listingId })
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const updatedWishlist = await res.json();
      setWishlist(updatedWishlist);
      setError(null);
    } catch {
      setError('Failed to add to wishlist');
    }
  };

  if (!token) return <div className="p-4">Sign in to view your wishlist.</div>;
  if (loading) return <div className="p-4">Loading wishlist...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <div>No properties in your wishlist yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(listing => (
            <div key={listing._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
              <img
                src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                alt={listing.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{listing.location}</p>
              <div className="flex-1" />
              <div className="flex justify-between items-center mt-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => onSelectListing && onSelectListing(listing)}
                >
                  View Details
                </button>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleRemove(listing._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 