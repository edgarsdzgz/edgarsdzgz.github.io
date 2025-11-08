// ===============================================
// ACHIEVEMENT MANAGER
// ===============================================

import { CONFIG, ACHIEVEMENTS } from '../config.js';
import { getStorageItem, setStorageItem } from '../utils/storage.js';

export class AchievementManager {
    constructor() {
        this.earnedAchievements = new Set();
        this.init();
    }

    init() {
        // Load earned achievements from storage
        const savedAchievements = getStorageItem(CONFIG.achievementsKey);
        if (savedAchievements) {
            try {
                const achievementsArray = JSON.parse(savedAchievements);
                this.earnedAchievements = new Set(achievementsArray);
            } catch (e) {
                console.error('Error parsing achievements:', e);
                this.earnedAchievements = new Set();
            }
        }
    }

    checkAchievements(checkType, ...args) {
        // Filter achievements by type
        const relevantAchievements = ACHIEVEMENTS.filter(a => a.checkType === checkType);

        relevantAchievements.forEach(achievement => {
            // Skip if already earned
            if (this.earnedAchievements.has(achievement.id)) {
                return;
            }

            // Check condition with all provided arguments
            const conditionMet = achievement.condition(...args);

            // If condition met, award achievement
            if (conditionMet) {
                this.earnAchievement(achievement);
            }
        });
    }

    earnAchievement(achievement) {
        console.log('[ACHIEVEMENT] Earned:', achievement.title);

        // Add to earned set
        this.earnedAchievements.add(achievement.id);

        // Save to localStorage
        const achievementsArray = Array.from(this.earnedAchievements);
        setStorageItem(CONFIG.achievementsKey, JSON.stringify(achievementsArray));

        // Show toast notification
        this.showToast(achievement.title);
    }

    showToast(message, duration = 3000) {
        console.log('[DEBUG] showToast called with message:', message);

        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        console.log('[DEBUG] Toast element:', toast);
        console.log('[DEBUG] Toast message element:', toastMessage);

        if (!toast) {
            console.error('[DEBUG] Toast element not found!');
            return;
        }

        // Update message
        if (toastMessage) {
            toastMessage.textContent = message;
            console.log('[DEBUG] Message updated to:', message);
        } else {
            console.error('[DEBUG] Toast message element not found!');
        }

        // Remove any existing classes
        toast.classList.remove('show', 'hiding');
        console.log('[DEBUG] Removed existing classes');

        // Force reflow to restart animation
        void toast.offsetWidth;

        // Show toast with morph-in animation
        setTimeout(() => {
            toast.classList.add('show');
            console.log('[DEBUG] Toast morphing in!');
        }, 10);

        // Hide toast with morph-out animation
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hiding');
            console.log('[DEBUG] Toast morphing out...');

            // Clean up hiding class after animation completes
            setTimeout(() => {
                toast.classList.remove('hiding');
                console.log('[DEBUG] Cleanup complete - toast fully hidden');
            }, 500); // Match morphOut animation duration
        }, duration);
    }
}
