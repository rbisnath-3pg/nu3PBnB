export default function getApiBase() {
  return process.env.VITE_API_URL || 'http://localhost:3000';
} 