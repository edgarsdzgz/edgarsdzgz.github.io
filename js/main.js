// ===============================================
// MAIN INITIALIZATION
// ===============================================

import { ThemeManager } from './managers/themeManager.js';
import { AchievementManager } from './managers/achievementManager.js';
import { CounterManager } from './managers/counterManager.js';
import { ShopManager } from './managers/shopManager.js';
import { LoreManager } from './managers/loreManager.js';
import { NavigationManager } from './managers/navigationManager.js';
import { ScrollAnimationManager } from './managers/scrollAnimationManager.js';
import { HeroNameManager } from './managers/heroNameManager.js';
import { BGMManager } from './managers/bgmManager.js';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('[DEBUG] Initializing portfolio...');

    // Initialize managers in order of dependencies
    // 1. ThemeManager - no dependencies
    console.log('[DEBUG] Creating ThemeManager...');
    const themeManager = new ThemeManager();

    // 2. AchievementManager - no dependencies
    console.log('[DEBUG] Creating AchievementManager...');
    const achievementManager = new AchievementManager();

    // 3. CounterManager - depends on AchievementManager
    console.log('[DEBUG] Creating CounterManager...');
    const counterManager = new CounterManager(achievementManager);

    // 4. BGMManager - no dependencies
    console.log('[DEBUG] Creating BGMManager...');
    const bgmManager = new BGMManager();

    // Setup BGM controls after BGM manager is created
    const bgmPlayPause = document.getElementById('bgm-play-pause');
    const bgmVolume = document.getElementById('bgm-volume');
    const bgmVolumeDisplay = document.getElementById('bgm-volume-display');
    const bgmControls = document.getElementById('bgm-controls');

    if (bgmPlayPause && bgmVolume && bgmVolumeDisplay) {
        bgmManager.setupControls(bgmPlayPause, bgmVolume, bgmVolumeDisplay);

        // Show controls if BGM is already unlocked
        if (bgmManager.isBGMUnlocked() && bgmControls) {
            bgmControls.style.display = 'flex';
        }
    }

    // 5. ShopManager - depends on CounterManager, ThemeManager, AchievementManager, BGMManager
    console.log('[DEBUG] Creating ShopManager...');
    const shopManager = new ShopManager(counterManager, themeManager, achievementManager, bgmManager);

    // 6. LoreManager - depends on CounterManager, ShopManager, AchievementManager
    console.log('[DEBUG] Creating LoreManager...');
    new LoreManager(counterManager, shopManager, achievementManager);

    // 7. NavigationManager - no dependencies
    console.log('[DEBUG] Creating NavigationManager...');
    new NavigationManager();

    // 8. ScrollAnimationManager - no dependencies
    console.log('[DEBUG] Creating ScrollAnimationManager...');
    new ScrollAnimationManager();

    // 9. HeroNameManager - depends on AchievementManager
    console.log('[DEBUG] Creating HeroNameManager...');
    new HeroNameManager(achievementManager);

    // Add smooth transition to counter values
    const counterValues = document.querySelectorAll('.counter-value');
    counterValues.forEach(el => {
        el.style.transition = 'transform 0.2s ease';
    });

    // Check if toast element exists
    const toastCheck = document.getElementById('toast');
    console.log('[DEBUG] Toast element check on init:', toastCheck);

    // Check theme toggle icons
    const lightRune = document.querySelector('.light-rune');
    const darkRune = document.querySelector('.dark-rune');
    console.log('[DEBUG] Light rune icon:', lightRune);
    console.log('[DEBUG] Dark rune icon:', darkRune);

    console.log('🚀 Edgar\'s Portfolio 2.0 initialized successfully!');
}
