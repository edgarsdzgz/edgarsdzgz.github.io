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
        this.manualClicks = 0; // Lifetime manual clicks only
        this.agentClicks = 0; // Lifetime agent clicks only
        this.agenticClickerLevel = 0;
        this.darkModeUnlocked = false;
        this.maritimeUnlocked = false;
        this.bgmUnlocked = false;
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
        const savedManualClicks = getStorageItem(CONFIG.manualClicksKey);
        const savedAgentClicks = getStorageItem(CONFIG.agentClicksKey);
        const savedLevel = getStorageItem(CONFIG.agenticClickerLevelKey);
        const savedDarkModeUnlocked = getStorageItem(CONFIG.darkModeUnlockedKey);
        const savedMaritimeUnlocked = getStorageItem(CONFIG.maritimeUnlockedKey);
        const savedBgmUnlocked = getStorageItem(CONFIG.bgmUnlockedKey);

        this.clickCount = savedClicks ? parseInt(savedClicks, 10) : 0;
        this.totalClicks = savedTotalClicks ? parseInt(savedTotalClicks, 10) : 0;
        this.manualClicks = savedManualClicks ? parseInt(savedManualClicks, 10) : 0;
        this.agentClicks = savedAgentClicks ? parseInt(savedAgentClicks, 10) : 0;
        this.agenticClickerLevel = savedLevel ? parseInt(savedLevel, 10) : 0;
        this.darkModeUnlocked = savedDarkModeUnlocked === 'true';
        this.maritimeUnlocked = savedMaritimeUnlocked === 'true';
        this.bgmUnlocked = savedBgmUnlocked === 'true';

        // Handle NaN cases
        if (isNaN(this.clickCount)) this.clickCount = 0;
        if (isNaN(this.totalClicks)) this.totalClicks = 0;
        if (isNaN(this.manualClicks)) this.manualClicks = 0;
        if (isNaN(this.agentClicks)) this.agentClicks = 0;
        if (isNaN(this.agenticClickerLevel)) this.agenticClickerLevel = 0;
    }

    resetState() {
        this.clickCount = 0;
        this.totalClicks = 0;
        this.manualClicks = 0;
        this.agentClicks = 0;
        this.agenticClickerLevel = 0;
        this.darkModeUnlocked = false;
        this.maritimeUnlocked = false;
        this.bgmUnlocked = false;
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.clickCounterEl) {
            this.clickCounterEl.innerHTML = `${formatNumber(this.clickCount)}<span class="counter-currency">ED</span>`;
        }
    }

    setupClickCounter() {
        // Listen for ANY click on the page
        document.addEventListener('click', (event) => {
            this.clickCount++;
            this.totalClicks++;
            this.manualClicks++;
            console.log('[DEBUG] Manual click! Current:', this.clickCount, 'Total:', this.totalClicks, 'Manual:', this.manualClicks);

            setStorageItem(CONFIG.clickKey, this.clickCount);
            setStorageItem(CONFIG.totalClicksKey, this.totalClicks);
            setStorageItem(CONFIG.manualClicksKey, this.manualClicks);
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
            this.achievementManager.checkAchievements('manual_clicks', this.manualClicks);
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
            this.agentClicks++;
            setStorageItem(CONFIG.clickKey, this.clickCount);
            setStorageItem(CONFIG.agentClicksKey, this.agentClicks);
            this.updateDisplay();

            // Add subtle animation
            if (this.clickCounterEl) {
                this.clickCounterEl.style.transform = 'scale(1.08)';
                setTimeout(() => {
                    this.clickCounterEl.style.transform = 'scale(1)';
                }, 100);
            }

            // Check agent click achievements
            this.achievementManager.checkAchievements('agent_clicks', this.agentClicks);

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

    isMaritimeUnlocked() {
        return this.maritimeUnlocked;
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

    unlockMaritime() {
        this.maritimeUnlocked = true;
        setStorageItem(CONFIG.maritimeUnlockedKey, 'true');
    }

    isBGMUnlocked() {
        return this.bgmUnlocked;
    }

    unlockBGM() {
        this.bgmUnlocked = true;
        setStorageItem(CONFIG.bgmUnlockedKey, 'true');
    }
}
