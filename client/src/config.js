// API Configuration
// In production, use relative path (same domain)
// In development, use localhost
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? '' // Use relative path in production (same domain)
  : 'http://localhost:5000'; // Use localhost in development

export default API_URL;

