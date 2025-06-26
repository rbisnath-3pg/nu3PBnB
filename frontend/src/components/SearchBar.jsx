import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const SearchBar = ({ onSearch, onFiltersChange, className = '' }) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    checkIn: '',
    checkOut: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.({
      destination: searchQuery,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
    });
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={`flex flex-col md:flex-row items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 px-2 py-2 w-full max-w-2xl space-y-2 md:space-y-0 md:space-x-2 ${className}`}
      data-testid="search-bar"
    >
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchInputChange}
        placeholder="Enter destination"
        className="flex-1 px-4 py-3 rounded-full border-none focus:outline-none text-gray-800 text-base bg-transparent min-w-[160px]"
        data-testid="search-input"
      />
      <input
        type="date"
        value={filters.checkIn}
        onChange={e => handleFilterChange('checkIn', e.target.value)}
        className="px-4 py-3 rounded-full border-none focus:outline-none text-gray-800 text-base bg-transparent min-w-[140px]"
      />
      <input
        type="date"
        value={filters.checkOut}
        onChange={e => handleFilterChange('checkOut', e.target.value)}
        className="px-4 py-3 rounded-full border-none focus:outline-none text-gray-800 text-base bg-transparent min-w-[140px]"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full shadow transition-colors disabled:opacity-50 flex items-center min-w-[120px] justify-center"
        data-testid="search-button"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search
      </button>
    </form>
  );
};

export default SearchBar; 