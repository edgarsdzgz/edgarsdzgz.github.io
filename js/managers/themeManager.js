// ===============================================
// THEME MANAGER
// ===============================================

import { CONFIG } from '../config.js';
import { getStorageItem, setStorageItem } from '../utils/storage.js';

export class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.darkModeUnlocked = false;
        this.init();
    }

    init() {
        // Check if dark mode is unlocked
        const unlockedValue = getStorageItem(CONFIG.darkModeUnlockedKey);
        this.darkModeUnlocked = unlockedValue === 'true';

        // Default to light mode (dark mode locked by default)
        const savedTheme = getStorageItem(CONFIG.themeKey);
        const theme = savedTheme || 'light';

        this.setTheme(theme, false);
        this.updateToggleState();

        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    updateToggleState() {
        if (this.themeToggle) {
            if (this.darkModeUnlocked) {
                this.themeToggle.style.opacity = '1';
                this.themeToggle.style.cursor = 'pointer';
                this.themeToggle.disabled = false;
            } else {
                this.themeToggle.style.opacity = '0.3';
                this.themeToggle.style.cursor = 'not-allowed';
                this.themeToggle.disabled = true;
            }
        }
    }

    unlockDarkMode() {
        this.darkModeUnlocked = true;
        setStorageItem(CONFIG.darkModeUnlockedKey, 'true');
        this.updateToggleState();
        // Automatically switch to dark mode when unlocked
        this.setTheme('dark');
    }

    setTheme(theme, save = true) {
        // Only allow dark mode if unlocked
        if (theme === 'dark' && !this.darkModeUnlocked) {
            return;
        }

        document.documentElement.setAttribute('data-theme', theme);
        if (save) {
            setStorageItem(CONFIG.themeKey, theme);
        }
    }

    toggleTheme() {
        if (!this.darkModeUnlocked) {
            return;
        }

        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}
