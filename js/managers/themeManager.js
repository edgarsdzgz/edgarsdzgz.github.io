// ===============================================
// THEME MANAGER
// ===============================================

import { CONFIG } from '../config.js';
import { getStorageItem, setStorageItem } from '../utils/storage.js';

export class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.darkModeUnlocked = false;
        this.synthwaveUnlocked = false;
        this.maritimeUnlocked = false;
        this.init();
    }

    init() {
        // Check which themes are unlocked
        const darkUnlockedValue = getStorageItem(CONFIG.darkModeUnlockedKey);
        const synthwaveUnlockedValue = getStorageItem(CONFIG.synthwaveUnlockedKey);
        const maritimeUnlockedValue = getStorageItem(CONFIG.maritimeUnlockedKey);

        this.darkModeUnlocked = darkUnlockedValue === 'true';
        this.synthwaveUnlocked = synthwaveUnlockedValue === 'true';
        this.maritimeUnlocked = maritimeUnlockedValue === 'true';

        // Default to light mode (all other modes locked by default)
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

    unlockSynthwave() {
        this.synthwaveUnlocked = true;
        setStorageItem(CONFIG.synthwaveUnlockedKey, 'true');
        this.updateToggleState();
        // Automatically switch to synthwave when unlocked
        this.setTheme('synthwave');
    }

    unlockMaritime() {
        this.maritimeUnlocked = true;
        setStorageItem(CONFIG.maritimeUnlockedKey, 'true');
        this.updateToggleState();
        // Automatically switch to maritime when unlocked
        this.setTheme('maritime');
    }

    setTheme(theme, save = true) {
        // Check if theme is allowed
        if (theme === 'dark' && !this.darkModeUnlocked) return;
        if (theme === 'synthwave' && !this.synthwaveUnlocked) return;
        if (theme === 'maritime' && !this.maritimeUnlocked) return;

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

        // Build theme cycle based on what's unlocked: light → dark → synthwave? → maritime? → light
        const themes = ['light', 'dark'];
        if (this.synthwaveUnlocked) themes.push('synthwave');
        if (this.maritimeUnlocked) themes.push('maritime');

        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[nextIndex];

        this.setTheme(newTheme);

        // Play swish sound
        this.playSwishSound();
    }

    playSwishSound() {
        try {
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const currentTime = audioContext.currentTime;

            // Create two oscillators for a "toggle click" sound (two-note pattern)
            const osc1 = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            const gain2 = audioContext.createGain();

            osc1.connect(gain1);
            osc2.connect(gain2);
            gain1.connect(audioContext.destination);
            gain2.connect(audioContext.destination);

            // Use triangle wave for a more "digital" toggle sound
            osc1.type = 'triangle';
            osc2.type = 'triangle';

            // First note: 600Hz (quick click)
            osc1.frequency.setValueAtTime(600, currentTime);
            gain1.gain.setValueAtTime(0, currentTime);
            gain1.gain.linearRampToValueAtTime(0.25, currentTime + 0.01);
            gain1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.08);

            // Second note: 450Hz (complementary click) - starts slightly after first
            osc2.frequency.setValueAtTime(450, currentTime + 0.05);
            gain2.gain.setValueAtTime(0, currentTime + 0.05);
            gain2.gain.linearRampToValueAtTime(0.25, currentTime + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.13);

            // Play both notes
            osc1.start(currentTime);
            osc1.stop(currentTime + 0.08);
            osc2.start(currentTime + 0.05);
            osc2.stop(currentTime + 0.13);

            console.log('[THEME] Toggle sound played');
        } catch (error) {
            console.error('[THEME] Error playing toggle sound:', error);
        }
    }
}
