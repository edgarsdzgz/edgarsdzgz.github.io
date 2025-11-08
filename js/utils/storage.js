// ===============================================
// STORAGE UTILITY FUNCTIONS
// ===============================================

import { CONFIG } from '../config.js';

/**
 * Check if localStorage is available
 */
export const storageAvailable = (() => {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.warn('localStorage is not available. Counters and theme will not persist.');
        return false;
    }
})();

/**
 * Get item from localStorage with prefix
 */
export function getStorageItem(key) {
    if (!storageAvailable) return null;
    try {
        return localStorage.getItem(CONFIG.storagePrefix + key);
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}

/**
 * Set item in localStorage with prefix
 */
export function setStorageItem(key, value) {
    if (!storageAvailable) return false;
    try {
        localStorage.setItem(CONFIG.storagePrefix + key, value);
        return true;
    } catch (e) {
        console.error('Error writing to localStorage:', e);
        return false;
    }
}
