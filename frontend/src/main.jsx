/**
 * nu3PBnB Frontend Main Entry Point
 * Copyright (c) 2025 Robbie Bisnath (robbie.bisnath@3pillarglobal.com). All rights reserved.
 * 
 * React application entry point for the nu3PBnB property booking platform.
 * Initializes the app with routing, authentication, and analytics.
 */

console.log('main.jsx loaded')

// Global error handler to catch selectedListing errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('selectedListing')) {
    console.error('🚨 Global selectedListing Error Caught:', event.error);
    
    // Try to reset the selectedListing state
    if (window.selectedListingReset) {
      window.selectedListingReset();
    }
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      color: #92400e;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    errorDiv.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">⚠️ Page Error Detected</div>
      <div style="font-size: 12px;">A display error was detected and fixed. Please refresh if issues persist.</div>
      <button onclick="this.parentElement.remove()" style="
        background: #f59e0b;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        margin-top: 8px;
        cursor: pointer;
      ">Dismiss</button>
    `;
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 10000);
    
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('selectedListing')) {
    console.error('🚨 Unhandled Promise Rejection (selectedListing):', event.reason);
    event.preventDefault();
    return false;
  }
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n' // Import i18n configuration
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import analyticsService from './services/analytics'

// Initialize analytics service
analyticsService.init();

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found!</div>'
} else {
  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}
