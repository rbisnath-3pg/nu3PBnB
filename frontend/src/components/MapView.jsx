import React, { useState, useEffect } from 'react';
import Map from './Map';

const MapView = ({ listings, onListingClick, onBackToList }) => {
  const [filteredListings, setFilteredListings] = useState(listings);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilteredListings(listings);
  }, [listings]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterListings(query, priceRange, ratingFilter);
  };

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: parseInt(value) || 0 };
    setPriceRange(newRange);
    filterListings(searchQuery, newRange, ratingFilter);
  };

  const handleRatingChange = (rating) => {
    setRatingFilter(rating);
    filterListings(searchQuery, priceRange, rating);
  };

  const filterListings = (query, price, rating) => {
    let filtered = listings;

    // Search filter
    if (query.trim()) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.location.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(listing =>
      listing.price >= price.min && listing.price <= price.max
    );

    // Rating filter
    if (rating > 0) {
      filtered = filtered.filter(listing =>
        listing.averageRating >= rating
      );
    }

    setFilteredListings(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange({ min: 0, max: 1000 });
    setRatingFilter(0);
    setFilteredListings(listings);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Map */}
      <div className="flex-1 min-h-0">
        <Map
          listings={filteredListings}
          onListingClick={onListingClick}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">{filteredListings.length}</span> listings found
          </div>
          <div className="flex space-x-4">
            <div>
              Price range: ${Math.min(...filteredListings.map(l => l.price))} - ${Math.max(...filteredListings.map(l => l.price))}
            </div>
            <div>
              Avg rating: {(filteredListings.reduce((sum, l) => sum + (l.averageRating || 0), 0) / filteredListings.length).toFixed(1)} ⭐
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView; 