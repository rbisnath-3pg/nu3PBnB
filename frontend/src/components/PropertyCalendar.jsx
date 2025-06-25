import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isBefore, isAfter, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { FaCalendar, FaCheck, FaTimes } from 'react-icons/fa';
import getApiBase from '../services/getApiBase';

const API_BASE = getApiBase();

const PropertyCalendar = ({ 
  listingId, 
  onDateSelect, 
  selectedStartDate, 
  selectedEndDate,
  existingBookings = [],
  minStay = 1,
  maxStay = 30
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch availability data for the property
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!listingId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/listings/${listingId}/availability`);
        if (response.ok) {
          const data = await response.json();
          setAvailability(data.availability || []);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [listingId]);

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Check if a date is available
  const isDateAvailable = (date) => {
    const today = startOfDay(new Date());
    
    // Past dates are not available
    if (isBefore(date, today)) {
      return false;
    }

    // Check if date conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      if (booking.status === 'declined') return false;
      
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      return date >= bookingStart && date < bookingEnd;
    });

    return !hasConflict;
  };

  // Check if a date range is available
  const isDateRangeAvailable = (start, end) => {
    const days = eachDayOfInterval({ start, end });
    return days.every(day => isDateAvailable(day));
  };

  // Get date status for styling
  const getDateStatus = (date) => {
    if (!isDateAvailable(date)) {
      return 'unavailable';
    }
    
    if (selectedStartDate && isSameDay(date, selectedStartDate)) {
      return 'start-selected';
    }
    
    if (selectedEndDate && isSameDay(date, selectedEndDate)) {
      return 'end-selected';
    }
    
    if (selectedStartDate && selectedEndDate && 
        date > selectedStartDate && date < selectedEndDate) {
      return 'in-range';
    }
    
    return 'available';
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (!isDateAvailable(date)) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      onDateSelect(date, null);
    } else {
      // Complete selection
      if (date <= selectedStartDate) {
        // If clicked date is before or same as start, make it the new start
        onDateSelect(date, null);
      } else {
        // Check if the range is available
        if (isDateRangeAvailable(selectedStartDate, date)) {
          onDateSelect(selectedStartDate, date);
        }
      }
    }
  };

  // Navigate months
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Get day of week headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Availability Calendar
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayHeaders.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, index) => {
              const status = getDateStatus(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={!isDateAvailable(day)}
                  className={`
                    h-12 rounded-lg text-sm font-medium transition-all
                    ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : ''}
                    ${status === 'unavailable' ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : ''}
                    ${status === 'available' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600' : ''}
                    ${status === 'start-selected' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${status === 'end-selected' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${status === 'in-range' ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">In Range</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Unavailable</span>
            </div>
          </div>

          {/* Selected dates info */}
          {selectedStartDate && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Selected:</strong> {format(selectedStartDate, 'MMM dd, yyyy')}
                {selectedEndDate && ` - ${format(selectedEndDate, 'MMM dd, yyyy')}`}
              </div>
              {selectedStartDate && selectedEndDate && (
                <div className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                  {Math.ceil((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24))} nights
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyCalendar; 