import React, { useEffect, useState } from 'react';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const Wishlist = ({ user, token, onSelectListing }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/users/me/wishlist`, {
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
      const res = await fetch(`${API_BASE}/api/users/me/wishlist/${listingId}`, {
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
      const res = await fetch(`${API_BASE}/api/users/me/wishlist`, {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map(listing => (
            <div key={listing._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden hover:shadow-2xl transition-shadow">
              <img
                src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                alt={listing.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{listing.title}</h3>
                <div className="text-gray-500 text-xs mb-1 flex items-center">
                  <span className="mr-1">📍</span>{listing.location}
                </div>
                <p className="text-gray-600 text-xs mb-2 line-clamp-2 flex-1">{listing.description || 'A wonderful place to stay.'}</p>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-lg font-bold text-gray-900">${listing.price} <span className="text-xs font-normal text-gray-500">/ night</span></span>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="mr-1">⭐</span>{listing.averageRating ? listing.averageRating.toFixed(1) : '4.8'}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    className="px-4 py-2 bg-white border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors text-xs shadow"
                    onClick={() => onSelectListing && onSelectListing(listing)}
                  >
                    View Details
                  </button>
                  <button
                    className="px-4 py-2 bg-white border border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors text-xs shadow"
                    onClick={() => handleRemove(listing._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 