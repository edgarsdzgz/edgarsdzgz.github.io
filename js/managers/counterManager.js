// ===============================================
// COUNTER MANAGER
// ===============================================

import { CONFIG } from '../config.js';
import { getStorageItem, setStorageItem, storageAvailable } from '../utils/storage.js';
import { formatNumber } from '../utils/helpers.js';

export class CounterManager {
    constructor(achievementManager) {
        this.achievementManager = achievementManager;
        this.clickCount = 0;
        this.totalClicks = 0; // Lifetime clicks
        this.agenticClickerLevel = 0;
        this.darkModeUnlocked = false;
        this.autoClickerIntervalId = null;
        this.tickCallbacks = []; // Callbacks to trigger on each auto-click tick

        // DOM elements
        this.clickCounterEl = document.getElementById('clickCounter');

        this.init();
    }

    init() {
        // Load counters from localStorage
        this.loadState();

        // Initialize display
        this.updateDisplay();

        // Setup click counter
        this.setupClickCounter();

        // Setup cross-tab synchronization
        this.setupStorageListener();

        // Start auto-clicker if level > 0
        if (this.agenticClickerLevel > 0) {
            this.startAutoClicker();
        }
    }

    loadState() {
        const savedClicks = getStorageItem(CONFIG.clickKey);
        const savedTotalClicks = getStorageItem(CONFIG.totalClicksKey);
        const savedLevel = getStorageItem(CONFIG.agenticClickerLevelKey);
        const savedDarkModeUnlocked = getStorageItem(CONFIG.darkModeUnlockedKey);

        this.clickCount = savedClicks ? parseInt(savedClicks, 10) : 0;
        this.totalClicks = savedTotalClicks ? parseInt(savedTotalClicks, 10) : 0;
        this.agenticClickerLevel = savedLevel ? parseInt(savedLevel, 10) : 0;
        this.darkModeUnlocked = savedDarkModeUnlocked === 'true';

        // Handle NaN cases
        if (isNaN(this.clickCount)) this.clickCount = 0;
        if (isNaN(this.totalClicks)) this.totalClicks = 0;
        if (isNaN(this.agenticClickerLevel)) this.agenticClickerLevel = 0;
    }

    resetState() {
        this.clickCount = 0;
        this.totalClicks = 0;
        this.agenticClickerLevel = 0;
        this.darkModeUnlocked = false;
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.clickCounterEl) {
            this.clickCounterEl.innerHTML = `<span class="counter-currency">ED</span> ${formatNumber(this.clickCount)}`;
        }
    }

    setupClickCounter() {
        // Listen for ANY click on the page
        document.addEventListener('click', (event) => {
            this.clickCount++;
            this.totalClicks++;
            console.log('[DEBUG] Click detected! Current:', this.clickCount, 'Total:', this.totalClicks);

            setStorageItem(CONFIG.clickKey, this.clickCount);
            setStorageItem(CONFIG.totalClicksKey, this.totalClicks);
            this.updateDisplay();

            // Add a subtle animation to nav counter
            if (this.clickCounterEl) {
                this.clickCounterEl.style.transform = 'scale(1.15)';
                setTimeout(() => {
                    this.clickCounterEl.style.transform = 'scale(1)';
                }, 200);
            }

            // Check for click-based achievements
            this.achievementManager.checkAchievements('click', this.totalClicks);
        });
    }

    setupStorageListener() {
        // Sync click counter across tabs
        if (storageAvailable) {
            window.addEventListener('storage', (e) => {
                if (e.key === CONFIG.storagePrefix + CONFIG.clickKey && e.newValue !== null) {
                    this.clickCount = parseInt(e.newValue, 10) || 0;
                    this.updateDisplay();
                }
            });
        }
    }

    calculateAutoClickerInterval() {
        // Level 1: 2000ms (2 seconds), each level is 5% faster (95% of previous interval)
        // Formula: 2000 * (0.95 ^ (level - 1))
        return 2000 * Math.pow(0.95, this.agenticClickerLevel - 1);
    }

    startAutoClicker() {
        // Clear existing interval if any
        if (this.autoClickerIntervalId) {
            clearInterval(this.autoClickerIntervalId);
        }

        // Only start if level > 0
        if (this.agenticClickerLevel === 0) {
            return;
        }

        const interval = this.calculateAutoClickerInterval();
        console.log(`[AUTO-CLICKER] Starting at level ${this.agenticClickerLevel}, interval: ${interval.toFixed(2)}ms`);

        this.autoClickerIntervalId = setInterval(() => {
            this.clickCount++;
            // Note: totalClicks is NOT incremented for auto-clicks, only manual clicks count
            setStorageItem(CONFIG.clickKey, this.clickCount);
            this.updateDisplay();

            // Add subtle animation
            if (this.clickCounterEl) {
                this.clickCounterEl.style.transform = 'scale(1.08)';
                setTimeout(() => {
                    this.clickCounterEl.style.transform = 'scale(1)';
                }, 100);
            }

            // Trigger all tick callbacks
            this.triggerTickCallbacks();
        }, interval);
    }

    stopAutoClicker() {
        if (this.autoClickerIntervalId) {
            clearInterval(this.autoClickerIntervalId);
            this.autoClickerIntervalId = null;
            console.log('[AUTO-CLICKER] Stopped');
        }
    }

    restartAutoClicker() {
        this.startAutoClicker();
    }

    // Tick callback system
    registerTickCallback(callback) {
        this.tickCallbacks.push(callback);
    }

    triggerTickCallbacks() {
        this.tickCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('[COUNTER] Error in tick callback:', error);
            }
        });
    }

    // Getters
    getClickCount() {
        return this.clickCount;
    }

    getTotalClicks() {
        return this.totalClicks;
    }

    getAgenticClickerLevel() {
        return this.agenticClickerLevel;
    }

    isDarkModeUnlocked() {
        return this.darkModeUnlocked;
    }

    getAutoClickerInterval() {
        return this.calculateAutoClickerInterval();
    }

    // Setters (used by ShopManager)
    setClickCount(value) {
        this.clickCount = value;
        setStorageItem(CONFIG.clickKey, this.clickCount);
        this.updateDisplay();
    }

    incrementAgenticClickerLevel() {
        this.agenticClickerLevel++;
        setStorageItem(CONFIG.agenticClickerLevelKey, this.agenticClickerLevel);
    }

    unlockDarkMode() {
        this.darkModeUnlocked = true;
        setStorageItem(CONFIG.darkModeUnlockedKey, 'true');
    }
}
