import React from 'react';

const SearchResults = ({ 
  listings, 
  searchQuery, 
  filters, 
  pagination, 
  onPageChange, 
  onListingClick,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          {searchQuery ? `No results found for "${searchQuery}"` : 'No listings available'}
        </div>
        <div className="text-gray-400 text-sm">
          Try adjusting your search criteria or filters
        </div>
      </div>
    );
  }

  // Dummy filter controls for visual match
  const FiltersCard = () => (
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-xs mb-8 mx-auto md:mx-0 md:mb-0">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-900">Filters</span>
        <button className="text-sm text-green-600 hover:underline">Clear all</button>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
        <input type="text" placeholder="Enter location" className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-green-400 text-sm" />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Price Range</label>
        <div className="flex space-x-2">
          <input type="number" placeholder="Min" className="w-1/2 px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-green-400 text-sm" />
          <input type="number" placeholder="Max" className="w-1/2 px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-green-400 text-sm" />
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">{listings.length} places available</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Filters Card */}
          <div className="md:w-1/4 w-full mb-6 md:mb-0">
            <FiltersCard />
          </div>
          {/* Results Grid */}
          <div className="md:w-3/4 w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Search Results</h2>
              <div className="text-gray-600 text-sm mb-2">{listings.length} places found</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((listing, index) => (
                <div
                  key={listing._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  {/* Image */}
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={listing.photos && listing.photos.length > 0 ? listing.photos[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{listing.title}</h3>
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
                    <button
                      className="mt-4 px-4 py-2 bg-white border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors text-xs shadow self-end"
                      onClick={() => onListingClick(listing)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 