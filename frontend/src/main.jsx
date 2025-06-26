/**
 * nu3PBnB Frontend Main Entry Point
 * Copyright (c) 2025 Robbie Bisnath (robbie.bisnath@protonmail.com). All rights reserved.
 * 
 * React application entry point for the nu3PBnB property booking platform.
 * Initializes the app with routing, authentication, and analytics.
 */

console.log('main.jsx loaded')
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
