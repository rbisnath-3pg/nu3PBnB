import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaHome, FaMapMarkerAlt, FaDollarSign, FaUsers, FaBed, FaBath, FaWifi, FaUpload, FaTimes, FaCheck } from 'react-icons/fa';

const API_BASE = import.meta.env.PROD 
  ? 'https://nu3pbnb-api.onrender.com/api'
  : '/api';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    images: [],
    city: '',
    country: '',
    location: '',
    latitude: '',
    longitude: '',
    type: '',
    maxGuests: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '', // comma separated
    available: false
  });
  const [imageFiles, setImageFiles] = useState([]); // For new uploads

  useEffect(() => {
    const now = new Date().toISOString();
    console.info(`[EditListing][${now}] Mounted with id:`, id);
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        console.info(`[EditListing][${now}] Fetching listing`, id);
        const res = await fetch(`${API_BASE}/listings/${id}`);
        if (!res.ok) throw new Error('Failed to fetch listing');
        const data = await res.json();
        const l = data.listing || data;
        setForm({
          title: l.title || '',
          price: l.price || '',
          description: l.description || '',
          images: l.images || l.photos || [],
          city: l.city || '',
          country: l.country || '',
          location: l.location || '',
          latitude: l.latitude || '',
          longitude: l.longitude || '',
          type: l.type || '',
          maxGuests: l.maxGuests || '',
          bedrooms: l.bedrooms || '',
          bathrooms: l.bathrooms || '',
          amenities: l.amenities ? l.amenities.join(', ') : '',
          available: l.available || false
        });
        console.info(`[EditListing][${now}] Listing loaded`, l);
      } catch (err) {
        setError(err.message);
        console.error(`[EditListing][${now}] Error loading listing:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const now = new Date().toISOString();
    if (["price", "latitude", "longitude", "maxGuests", "bedrooms", "bathrooms"].includes(name)) {
      setForm((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
      console.info(`[EditListing][${now}] Number field changed:`, name, value);
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      console.info(`[EditListing][${now}] Checkbox field changed:`, name, checked);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      console.info(`[EditListing][${now}] Text field changed:`, name, value);
    }
  };

  const handleImagesChange = (e) => {
    const value = e.target.value;
    const images = value.split('\n').map(url => url.trim()).filter(Boolean);
    setForm((prev) => ({ ...prev, images }));
    const now = new Date().toISOString();
    console.info(`[EditListing][${now}] Images changed:`, images);
  };

  const handleRemoveImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
    const now = new Date().toISOString();
    console.warn(`[EditListing][${now}] Removed image at index:`, idx);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const now = new Date().toISOString();
    console.info(`[EditListing][${now}] Submitting form`, form);
    try {
      // Upload new images as blobs
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append('images', file));
        const uploadRes = await fetch(`${API_BASE}/listings/${id}/upload-images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Failed to upload images');
        const uploadData = await uploadRes.json();
        uploadedImageUrls = uploadData.urls || [];
      }
      const res = await fetch(`${API_BASE}/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: form.title,
          price: form.price,
          description: form.description,
          photos: [...form.images, ...uploadedImageUrls],
          city: form.city,
          country: form.country,
          location: form.location,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          type: form.type,
          maxGuests: form.maxGuests,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
          available: form.available
        })
      });
      console.info(`[EditListing][${now}] PUT /api/listings/${id} response status:`, res.status);
      if (!res.ok) {
        let backendError = '';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errData = await res.json();
            backendError = errData.message || errData.error || res.statusText;
            console.error(`[EditListing][${now}] Backend error data:`, errData);
          } else {
            backendError = await res.text();
            console.error(`[EditListing][${now}] Backend error text:`, backendError);
          }
        } catch (e) {
          backendError = res.statusText;
          console.error(`[EditListing][${now}] Error parsing backend error:`, e);
        }
        throw new Error('Failed to update listing: ' + backendError);
      }
      const updated = await res.json();
      console.info(`[EditListing][${now}] Listing updated successfully:`, updated);
      navigate('/host/dashboard');
      console.info(`[EditListing][${now}] Navigated to /host/dashboard`);
    } catch (err) {
      setError(err.message);
      console.error(`[EditListing][${now}] Error submitting form`, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <FaHome className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Property</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your property details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/host/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <FaHome className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Property Title</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  placeholder="e.g., Cozy Downtown Loft"
                />
                <p className="text-xs text-gray-500 mt-1">A catchy title for your property</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Price per Night</label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="price" 
                    type="number" 
                    value={form.price} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                    placeholder="150"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Set a competitive nightly rate</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors min-h-[120px]" 
                placeholder="Describe your property, amenities, and what makes it unique..."
              />
              <p className="text-xs text-gray-500 mt-1">Help guests understand what makes your property special</p>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <FaMapMarkerAlt className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Location</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">City</label>
                <input 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  placeholder="New York"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Country</label>
                <input 
                  name="country" 
                  value={form.country} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  placeholder="USA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Full Location</label>
                <input 
                  name="location" 
                  value={form.location} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  placeholder="New York, USA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Latitude</label>
                <input 
                  name="latitude" 
                  type="number" 
                  value={form.latitude} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  step="any" 
                  placeholder="40.7128"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Longitude</label>
                <input 
                  name="longitude" 
                  type="number" 
                  value={form.longitude} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  step="any" 
                  placeholder="-74.0060"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Property Type</label>
                <input 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  placeholder="Apartment, House, Villa, etc."
                />
              </div>
            </div>
          </div>

          {/* Property Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <FaUsers className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Property Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Max Guests</label>
                <input 
                  name="maxGuests" 
                  type="number" 
                  value={form.maxGuests} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  placeholder="4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Bedrooms</label>
                <input 
                  name="bedrooms" 
                  type="number" 
                  value={form.bedrooms} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  placeholder="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Bathrooms</label>
                <input 
                  name="bathrooms" 
                  type="number" 
                  value={form.bathrooms} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                  placeholder="1"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Amenities</label>
              <input 
                name="amenities" 
                value={form.amenities} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" 
                placeholder="WiFi, Parking, Pool, Kitchen, etc."
              />
              <p className="text-xs text-gray-500 mt-1">List amenities separated by commas</p>
            </div>

            <div className="mt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  id="available"
                  name="available"
                  type="checkbox"
                  checked={form.available}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available for booking</span>
              </label>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <FaUpload className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Property Images</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Image URLs</label>
                <textarea 
                  name="images" 
                  value={form.images.join('\n')} 
                  onChange={handleImagesChange} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors min-h-[80px]" 
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Paste one image URL per line. The first image will be the cover photo.</p>
              </div>

              {form.images.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Current Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="preview" className="w-full h-24 object-cover rounded-lg border shadow-sm" />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(idx)} 
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Upload New Photos</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300" 
                />
                <p className="text-xs text-gray-500 mt-1">You can upload multiple images. Supported formats: JPG, PNG, etc.</p>
              </div>

              {imageFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">New Images to Upload</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-24 object-cover rounded-lg border shadow-sm" />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFile(idx)} 
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <button 
              type="button" 
              onClick={() => navigate('/host/dashboard')} 
              className="px-8 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing; 