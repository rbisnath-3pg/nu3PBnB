// Polyfill for TextEncoder and TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        PROD: false
      }
    }
  },
  writable: true
}); 