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
            } else {
                this.themeToggle.style.opacity = '0.3';
                this.themeToggle.style.cursor = 'not-allowed';
            }
            // Never disable the button - let clicks through for counter
            this.themeToggle.disabled = false;
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

        // Play swish sound
        this.playSwishSound();
    }

    playSwishSound() {
        try {
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const currentTime = audioContext.currentTime;

            // Create oscillator and gain node
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Configure swoosh sound: frequency sweep with envelope
            oscillator.type = 'sine';

            // Frequency sweep: 800Hz -> 400Hz (downward swish)
            oscillator.frequency.setValueAtTime(800, currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.15);

            // Volume envelope: quick attack, medium decay
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.02); // Quick attack
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15); // Smooth decay

            // Start and stop
            oscillator.start(currentTime);
            oscillator.stop(currentTime + 0.15);

            console.log('[THEME] Swish sound played');
        } catch (error) {
            console.error('[THEME] Error playing swish sound:', error);
        }
    }
}
