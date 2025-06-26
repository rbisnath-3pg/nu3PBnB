export default function getApiBase() {
  return import.meta.env.VITE_API_URL || 'https://nu3pbnb-api.onrender.com';
} 