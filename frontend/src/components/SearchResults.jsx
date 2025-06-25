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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
          {searchQuery ? `No results found for "${searchQuery}"` : 'No listings available'}
        </div>
        <div className="text-gray-400 dark:text-gray-500 text-sm">
          Try adjusting your search criteria or filters
        </div>
      </div>
    );
  }

  const getActiveFilters = () => {
    const active = [];
    if (filters?.location) active.push(`Location: ${filters.location}`);
    if (filters?.minPrice || filters?.maxPrice) {
      const priceRange = [];
      if (filters.minPrice) priceRange.push(`$${filters.minPrice}`);
      if (filters.maxPrice) priceRange.push(`$${filters.maxPrice}`);
      active.push(`Price: ${priceRange.join(' - ')}`);
    }
    if (filters?.guests) active.push(`${filters.guests} guests`);
    if (filters?.checkIn && filters?.checkOut) {
      active.push(`${filters.checkIn} to ${filters.checkOut}`);
    }
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="search-results">
      {/* Search Results Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'All Listings'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {pagination?.totalItems || listings.length} properties found
            </p>
          </div>
          
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 sm:mt-0">
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing, index) => (
          <div
            key={listing._id}
            onClick={() => onListingClick(listing)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
            data-testid={`search-result-${index}`}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              {listing.photos && listing.photos.length > 0 ? (
                <img
                  src={listing.photos[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">No image</span>
                </div>
              )}
              
              {/* Price Badge */}
              <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${listing.price}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">/night</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
                {listing.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {listing.location}
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                    {listing.averageRating ? listing.averageRating.toFixed(1) : 'New'}
                  </span>
                </div>
                {listing.reviewCount && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    ({listing.reviewCount})
                  </span>
                )}
              </div>

              {/* Host Info */}
              {listing.host && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hosted by {listing.host.name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 1 && (
        <div className="flex justify-center items-center mt-12">
          <nav className="flex items-center space-x-2">
            {/* Previous Page */}
            <button
              onClick={() => onPageChange(pagination.current - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    pageNum === pagination.current
                      ? 'bg-rose-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => onPageChange(pagination.current + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 