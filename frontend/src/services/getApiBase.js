// This file conditionally re-exports the correct getApiBase for the environment.
// Vite will resolve .vite.js, Node/Jest will use the moduleNameMapper in Jest config.

// Default to Vite/browser version (for Vite's resolver)
import getApiBase from './getApiBase.vite.js';
export default getApiBase; 