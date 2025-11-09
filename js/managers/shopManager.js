// ===============================================
// SHOP MANAGER
// ===============================================

import { CONFIG } from '../config.js';
import { getStorageItem, setStorageItem, storageAvailable } from '../utils/storage.js';
import { formatNumber } from '../utils/helpers.js';

export class ShopManager {
    constructor(counterManager, themeManager, achievementManager, bgmManager = null) {
        this.counterManager = counterManager;
        this.themeManager = themeManager;
        this.achievementManager = achievementManager;
        this.bgmManager = bgmManager;
        this.dialogOpen = false;
        this.cogRotation = 0; // Track current rotation angle

        // DOM elements
        this.agenticClickerLevelEl = document.getElementById('agentic-clicker-level');
        this.cogIconEl = document.getElementById('cog-icon');
        this.vcInvestmentLevelEl = document.getElementById('vc-investment-level');
        this.darkModeLevelEl = document.getElementById('dark-mode-level');
        this.maritimeLevelEl = document.getElementById('maritime-level');
        this.bgmLevelEl = document.getElementById('bgm-level');
        this.shopButtonText = document.getElementById('shop-button-text');
        this.vcInvestmentButtonText = document.getElementById('vc-investment-button-text');
        this.darkModeButtonText = document.getElementById('dark-mode-button-text');
        this.maritimeButtonText = document.getElementById('maritime-button-text');
        this.bgmButtonText = document.getElementById('bgm-button-text');

        this.init();
    }

    init() {
        this.setupDialog();
        this.updateDisplay();

        // Register for auto-clicker tick callbacks
        this.counterManager.registerTickCallback(() => this.tickCog());
    }

    setupDialog() {
        const backdrop = document.getElementById('clicker-dialog-backdrop');
        const closeBtn = document.getElementById('close-dialog');
        const buyBtn = document.getElementById('buy-agentic-clicker');
        const vcInvestmentBtn = document.getElementById('buy-vc-investment');
        const darkModeBtn = document.getElementById('buy-dark-mode');
        const maritimeBtn = document.getElementById('buy-maritime');
        const bgmBtn = document.getElementById('buy-bgm');
        const clearDataBtn = document.getElementById('clear-data-btn');

        // Setup shop tabs
        this.setupShopTabs();

        // Toggle dialog when clicking counter
        const clickCounter = document.getElementById('clickCounter');
        if (clickCounter) {
            clickCounter.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent this from counting as a click
                if (this.dialogOpen) {
                    this.closeDialog();
                } else {
                    this.openDialog();
                }
            });
        }

        // Close dialog when clicking backdrop
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeDialog();
                }
            });
        }

        // Close dialog when clicking close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeDialog();
            });
        }

        // Handle Hire Clicker purchase
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                this.handleAgenticClickerPurchase();
            });
        }

        // Handle VC Investment purchase
        if (vcInvestmentBtn) {
            vcInvestmentBtn.addEventListener('click', () => {
                this.handleVCInvestmentPurchase();
            });
        }

        // Handle Dark Mode purchase
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => {
                this.handleDarkModePurchase();
            });
        }

        // Handle Maritime Mode purchase
        if (maritimeBtn) {
            maritimeBtn.addEventListener('click', () => {
                this.handleMaritimePurchase();
            });
        }

        // Handle BGM purchase
        if (bgmBtn) {
            bgmBtn.addEventListener('click', () => {
                this.handleBGMPurchase();
            });
        }

        // Handle clear data button
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.openConfirmDialog();
            });
        }

        // Setup confirmation dialog
        this.setupConfirmDialog();
    }

    setupConfirmDialog() {
        const confirmBackdrop = document.getElementById('confirm-dialog-backdrop');
        const confirmYes = document.getElementById('confirm-clear-yes');
        const confirmNo = document.getElementById('confirm-clear-no');

        // Close confirmation dialog when clicking backdrop
        if (confirmBackdrop) {
            confirmBackdrop.addEventListener('click', (e) => {
                if (e.target === confirmBackdrop) {
                    this.closeConfirmDialog();
                }
            });
        }

        // Handle "No" button
        if (confirmNo) {
            confirmNo.addEventListener('click', () => {
                this.closeConfirmDialog();
            });
        }

        // Handle "Yes" button - clear all data
        if (confirmYes) {
            confirmYes.addEventListener('click', () => {
                this.clearAllData();
                this.closeConfirmDialog();
                this.closeDialog();
            });
        }
    }

    setupShopTabs() {
        const tabs = document.querySelectorAll('.shop-tab');
        const panels = document.querySelectorAll('.tab-panel');
        const dialogTitle = document.getElementById('shop-dialog-title');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Remove active class from all tabs and panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                tab.classList.add('active');
                const targetPanel = document.querySelector(`[data-panel="${targetTab}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // Update dialog title
                if (dialogTitle) {
                    dialogTitle.textContent = targetTab === 'upgrades' ? 'Upgrade Shop' : 'Theme Shop';
                }

                // Open dialog if not already open
                if (!this.dialogOpen) {
                    this.openDialog();
                }
            });
        });
    }

    openDialog() {
        const backdrop = document.getElementById('clicker-dialog-backdrop');
        if (backdrop) {
            backdrop.classList.add('show');
            document.body.classList.add('dialog-open');
            this.dialogOpen = true;
        }
    }

    closeDialog() {
        const backdrop = document.getElementById('clicker-dialog-backdrop');
        if (backdrop) {
            backdrop.classList.remove('show');
            document.body.classList.remove('dialog-open');
            this.dialogOpen = false;
        }
    }

    openConfirmDialog() {
        const confirmBackdrop = document.getElementById('confirm-dialog-backdrop');
        if (confirmBackdrop) {
            confirmBackdrop.classList.add('show');
            document.body.classList.add('dialog-open');
        }
    }

    closeConfirmDialog() {
        const confirmBackdrop = document.getElementById('confirm-dialog-backdrop');
        if (confirmBackdrop) {
            confirmBackdrop.classList.remove('show');
            // Don't remove dialog-open if main dialog is still open
            const mainBackdrop = document.getElementById('clicker-dialog-backdrop');
            if (!mainBackdrop || !mainBackdrop.classList.contains('show')) {
                document.body.classList.remove('dialog-open');
            }
        }
    }

    updateDisplay() {
        // Update Hire Clicker level display
        if (this.agenticClickerLevelEl) {
            const level = this.counterManager.getAgenticClickerLevel();
            const agentText = level === 1 ? 'Agent' : 'Agents';
            this.agenticClickerLevelEl.textContent = `${level} ${agentText}`;
        }

        // Update cog icon rotation
        this.updateCogAnimation();

        // Update Hire Clicker button text with next level cost
        const currentLevel = this.counterManager.getAgenticClickerLevel();
        const maxLevel = this.counterManager.getMaxAgenticClickerLevel();
        const maxReached = currentLevel >= maxLevel;

        if (this.shopButtonText) {
            if (maxReached) {
                this.shopButtonText.innerHTML = `<span style="opacity: 0.6;">Max Level Reached</span>`;
            } else {
                const cost = this.calculateUpgradeCost();
                this.shopButtonText.innerHTML = `Hire Agent ${formatNumber(cost)}<span class="counter-currency">ED</span>`;
            }
        }

        // Update Hire Clicker button disabled state
        const agenticBtn = document.getElementById('buy-agentic-clicker');
        if (agenticBtn) {
            agenticBtn.disabled = maxReached;
            agenticBtn.style.opacity = maxReached ? '0.5' : '1';
            agenticBtn.style.cursor = maxReached ? 'not-allowed' : 'pointer';
        }

        // Update Dark Mode display
        if (this.darkModeLevelEl) {
            const unlocked = this.counterManager.isDarkModeUnlocked();
            this.darkModeLevelEl.textContent = unlocked ? 'Unlocked' : 'Locked';
        }

        // Update Dark Mode button
        if (this.darkModeButtonText) {
            const unlocked = this.counterManager.isDarkModeUnlocked();
            if (unlocked) {
                this.darkModeButtonText.innerHTML = `<span style="opacity: 0.6;">Already Unlocked</span>`;
            } else {
                this.darkModeButtonText.innerHTML = `Unlock 50<span class="counter-currency">ED</span>`;
            }
        }

        // Update button disabled state
        const darkModeBtn = document.getElementById('buy-dark-mode');
        if (darkModeBtn) {
            const unlocked = this.counterManager.isDarkModeUnlocked();
            darkModeBtn.disabled = unlocked;
            darkModeBtn.style.opacity = unlocked ? '0.5' : '1';
            darkModeBtn.style.cursor = unlocked ? 'not-allowed' : 'pointer';
        }

        // Update Maritime Mode display
        if (this.maritimeLevelEl) {
            const unlocked = this.counterManager.isMaritimeUnlocked();
            this.maritimeLevelEl.textContent = unlocked ? 'Unlocked' : 'Locked';
        }

        // Update Maritime Mode button
        if (this.maritimeButtonText) {
            const unlocked = this.counterManager.isMaritimeUnlocked();
            if (unlocked) {
                this.maritimeButtonText.innerHTML = `<span style="opacity: 0.6;">Already Unlocked</span>`;
            } else {
                this.maritimeButtonText.innerHTML = `Unlock 200<span class="counter-currency">ED</span>`;
            }
        }

        // Update Maritime button disabled state
        const maritimeBtn = document.getElementById('buy-maritime');
        if (maritimeBtn) {
            const unlocked = this.counterManager.isMaritimeUnlocked();
            maritimeBtn.disabled = unlocked;
            maritimeBtn.style.opacity = unlocked ? '0.5' : '1';
            maritimeBtn.style.cursor = unlocked ? 'not-allowed' : 'pointer';
        }

        // Update VC Investment display
        if (this.vcInvestmentLevelEl) {
            const unlocked = this.counterManager.isVCInvestmentUnlocked();
            this.vcInvestmentLevelEl.textContent = unlocked ? 'Unlocked' : 'Locked';
        }

        // Update VC Investment button
        if (this.vcInvestmentButtonText) {
            const unlocked = this.counterManager.isVCInvestmentUnlocked();
            if (unlocked) {
                this.vcInvestmentButtonText.innerHTML = `<span style="opacity: 0.6;">Already Unlocked</span>`;
            } else {
                this.vcInvestmentButtonText.innerHTML = `Unlock 1000<span class="counter-currency">ED</span>`;
            }
        }

        // Update VC Investment button disabled state
        const vcBtn = document.getElementById('buy-vc-investment');
        if (vcBtn) {
            const unlocked = this.counterManager.isVCInvestmentUnlocked();
            vcBtn.disabled = unlocked;
            vcBtn.style.opacity = unlocked ? '0.5' : '1';
            vcBtn.style.cursor = unlocked ? 'not-allowed' : 'pointer';
        }

        // Update BGM display
        if (this.bgmLevelEl) {
            const unlocked = this.counterManager.isBGMUnlocked();
            this.bgmLevelEl.textContent = unlocked ? 'Unlocked' : 'Locked';
        }

        // Update BGM button
        if (this.bgmButtonText) {
            const unlocked = this.counterManager.isBGMUnlocked();
            if (unlocked) {
                this.bgmButtonText.innerHTML = `<span style="opacity: 0.6;">Already Unlocked</span>`;
            } else {
                this.bgmButtonText.innerHTML = `Unlock 250<span class="counter-currency">ED</span>`;
            }
        }

        // Update BGM button disabled state
        const bgmBtn = document.getElementById('buy-bgm');
        if (bgmBtn) {
            const unlocked = this.counterManager.isBGMUnlocked();
            bgmBtn.disabled = unlocked;
            bgmBtn.style.opacity = unlocked ? '0.5' : '1';
            bgmBtn.style.cursor = unlocked ? 'not-allowed' : 'pointer';
        }
    }

    calculateUpgradeCost() {
        const level = this.counterManager.getAgenticClickerLevel();

        if (level < 10) {
            // Levels 1-10: Base cost is 20, increases by 40% per level
            return Math.floor(20 * Math.pow(1.4, level));
        } else {
            // Levels 11-20: Base cost is 750, increases by 60% per level
            // Subtract 10 from level to start at base cost for level 11
            return Math.floor(750 * Math.pow(1.6, level - 10));
        }
    }

    updateCogAnimation() {
        if (!this.cogIconEl) return;

        const level = this.counterManager.getAgenticClickerLevel();

        if (level === 0) {
            // No agents - cog is stopped
            this.cogIconEl.classList.add('stopped');
        } else {
            // Agents working - cog is active
            this.cogIconEl.classList.remove('stopped');
        }
    }

    tickCog() {
        if (!this.cogIconEl) return;

        const level = this.counterManager.getAgenticClickerLevel();
        if (level === 0) return; // Don't tick if no agents

        // Rotate 45 degrees (1/8th of a turn) on each tick
        this.cogRotation += 45;
        this.cogIconEl.style.transform = `rotate(${this.cogRotation}deg)`;
    }

    handleAgenticClickerPurchase() {
        const currentLevel = this.counterManager.getAgenticClickerLevel();
        const maxLevel = this.counterManager.getMaxAgenticClickerLevel();

        // Check if max level reached
        if (currentLevel >= maxLevel) {
            console.log('[SHOP] Max level reached for Hire Clicker');
            return;
        }

        const cost = this.calculateUpgradeCost();
        const currentClicks = this.counterManager.getClickCount();

        // Check if user has enough clicks
        if (currentClicks < cost) {
            const shortage = cost - currentClicks;
            this.showInsufficientFundsNotification(shortage);
            return;
        }

        // Add purchasing animation to button
        const buyBtn = document.getElementById('buy-agentic-clicker');
        if (buyBtn) {
            buyBtn.classList.add('purchasing');
            setTimeout(() => {
                buyBtn.classList.remove('purchasing');
            }, 500);
        }

        // Animate energy siphon
        this.animateEnergySiphon();

        // Play sound
        this.playPurchaseSound();

        // Deduct clicks with animation
        this.animateCounterDeduction(cost, () => {
            // Start slot machine animation and sound immediately
            this.playSlotMachineAnimation();
            this.playSlotMachineSound();

            // After 500ms, update the number and complete the purchase
            setTimeout(() => {
                // Level up
                this.counterManager.incrementAgenticClickerLevel();

                // Update shop display
                this.updateDisplay();

                // Notify counter manager to restart auto-clicker
                this.counterManager.restartAutoClicker();

                // Check for purchase-based achievements
                this.achievementManager.checkAchievements('purchase', this.counterManager.getAgenticClickerLevel());

                // Check for shop completion achievement
                this.checkShopCompletion();
            }, 500);
        });
    }

    handleDarkModePurchase() {
        const cost = 50;
        const currentClicks = this.counterManager.getClickCount();

        // Check if already unlocked
        if (this.counterManager.isDarkModeUnlocked()) {
            return;
        }

        // Check if user has enough clicks
        if (currentClicks < cost) {
            const shortage = cost - currentClicks;
            this.showInsufficientFundsNotification(shortage);
            return;
        }

        // Add purchasing animation to button
        const darkModeBtn = document.getElementById('buy-dark-mode');
        if (darkModeBtn) {
            darkModeBtn.classList.add('purchasing');
            setTimeout(() => {
                darkModeBtn.classList.remove('purchasing');
            }, 500);
        }

        // Animate energy siphon
        this.animateEnergySiphon();

        // Play sound
        this.playPurchaseSound();

        // Deduct clicks with animation
        this.animateCounterDeduction(cost, () => {
            // After deduction completes, unlock dark mode
            this.counterManager.unlockDarkMode();

            // Update shop display
            this.updateDisplay();

            // Unlock and activate dark mode in theme manager
            this.themeManager.unlockDarkMode();

            // Check for shop completion achievement
            this.checkShopCompletion();

            console.log('[DARK MODE] Unlocked!');
        });
    }

    handleMaritimePurchase() {
        const cost = 200;
        const currentClicks = this.counterManager.getClickCount();

        // Check if already unlocked
        if (this.counterManager.isMaritimeUnlocked()) {
            return;
        }

        // Check if user has enough clicks
        if (currentClicks < cost) {
            const shortage = cost - currentClicks;
            this.showInsufficientFundsNotification(shortage);
            return;
        }

        // Add purchasing animation to button
        const maritimeBtn = document.getElementById('buy-maritime');
        if (maritimeBtn) {
            maritimeBtn.classList.add('purchasing');
            setTimeout(() => {
                maritimeBtn.classList.remove('purchasing');
            }, 500);
        }

        // Animate energy siphon
        this.animateEnergySiphon();

        // Play sound
        this.playPurchaseSound();

        // Deduct clicks with animation
        this.animateCounterDeduction(cost, () => {
            // After deduction completes, unlock maritime mode
            this.counterManager.unlockMaritime();

            // Update shop display
            this.updateDisplay();

            // Unlock and activate maritime mode in theme manager
            this.themeManager.unlockMaritime();

            // Check for shop completion achievement
            this.checkShopCompletion();

            console.log('[MARITIME MODE] Unlocked!');
        });
    }

    handleBGMPurchase() {
        const cost = 250;
        const currentClicks = this.counterManager.getClickCount();

        // Check if already unlocked
        if (this.counterManager.isBGMUnlocked()) {
            return;
        }

        // Check if user has enough clicks
        if (currentClicks < cost) {
            const shortage = cost - currentClicks;
            this.showInsufficientFundsNotification(shortage);
            return;
        }

        // Add purchasing animation to button
        const bgmBtn = document.getElementById('buy-bgm');
        if (bgmBtn) {
            bgmBtn.classList.add('purchasing');
            setTimeout(() => {
                bgmBtn.classList.remove('purchasing');
            }, 500);
        }

        // Animate energy siphon
        this.animateEnergySiphon();

        // Play sound
        this.playPurchaseSound();

        // Deduct clicks with animation
        this.animateCounterDeduction(cost, () => {
            // After deduction completes, unlock BGM
            this.counterManager.unlockBGM();

            // Update shop display
            this.updateDisplay();

            // Unlock and activate BGM in BGM manager (if available)
            if (this.bgmManager) {
                this.bgmManager.unlock();
            }

            console.log('[BGM] Unlocked!');
        });
    }

    handleVCInvestmentPurchase() {
        const cost = 1000;
        const currentClicks = this.counterManager.getClickCount();

        // Check if already unlocked
        if (this.counterManager.isVCInvestmentUnlocked()) {
            return;
        }

        // Check if user has enough clicks
        if (currentClicks < cost) {
            const shortage = cost - currentClicks;
            this.showInsufficientFundsNotification(shortage);
            return;
        }

        // Add purchasing animation to button
        const vcBtn = document.getElementById('buy-vc-investment');
        if (vcBtn) {
            vcBtn.classList.add('purchasing');
            setTimeout(() => {
                vcBtn.classList.remove('purchasing');
            }, 500);
        }

        // Animate energy siphon
        this.animateEnergySiphon();

        // Play sound
        this.playPurchaseSound();

        // Deduct clicks with animation
        this.animateCounterDeduction(cost, () => {
            // After deduction completes, unlock VC Investment
            this.counterManager.unlockVCInvestment();

            // Update shop display
            this.updateDisplay();

            console.log('[VC Investment] Unlocked! 10 more Hire Clicker levels available.');
        });
    }

    checkShopCompletion() {
        const agenticLevel = this.counterManager.getAgenticClickerLevel();
        const darkModeUnlocked = this.counterManager.isDarkModeUnlocked();
        const maritimeUnlocked = this.counterManager.isMaritimeUnlocked();

        const maxLevel = this.counterManager.getMaxAgenticClickerLevel();
        this.achievementManager.checkAchievements(
            'shop_completion',
            agenticLevel,
            darkModeUnlocked,
            maritimeUnlocked,
            maxLevel
        );
    }

    animateCounterDeduction(cost, onComplete) {
        const startCount = this.counterManager.getClickCount();
        const endCount = startCount - cost;
        const duration = 800; // Animation duration in ms
        const startTime = Date.now();

        // Animate counter counting down
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic function for smooth deceleration
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentCount = Math.round(startCount - (cost * easeProgress));
            this.counterManager.setClickCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Final update to ensure exact value
                this.counterManager.setClickCount(endCount);

                // Call completion callback
                if (onComplete) {
                    onComplete();
                }
            }
        };

        // Start animation after a short delay
        setTimeout(() => {
            animate();
        }, 200);
    }

    animateEnergySiphon() {
        const beam = document.getElementById('energy-beam');
        const beamLine = document.getElementById('beam-line');
        const counter = document.getElementById('clickCounter');
        const buyBtn = document.getElementById('buy-agentic-clicker');

        if (!beam || !beamLine || !counter || !buyBtn) return;

        // Get positions
        const counterRect = counter.getBoundingClientRect();
        const btnRect = buyBtn.getBoundingClientRect();

        const x1 = counterRect.left + counterRect.width / 2;
        const y1 = counterRect.top + counterRect.height / 2;
        const x2 = btnRect.left + btnRect.width / 2;
        const y2 = btnRect.top + btnRect.height / 2;

        // Set beam line coordinates
        beamLine.setAttribute('x1', x1);
        beamLine.setAttribute('y1', y1);
        beamLine.setAttribute('x2', x2);
        beamLine.setAttribute('y2', y2);

        // Activate beam
        beam.classList.add('active');

        // Add pulse animation to counter
        counter.classList.add('energy-active');

        // Remove animations after completion
        setTimeout(() => {
            beam.classList.remove('active');
            counter.classList.remove('energy-active');
        }, 1000);
    }

    playPurchaseSound() {
        try {
            // Create audio context (Web Audio API)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create oscillator for the main tone
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Configure sound: swoosh/zap effect
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);

            // Volume envelope
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            // Play sound
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Web Audio API not supported:', e);
        }
    }

    showInsufficientFundsNotification(shortage) {
        const buyBtn = document.getElementById('buy-agentic-clicker');
        if (!buyBtn) return;

        // Get button position
        const btnRect = buyBtn.getBoundingClientRect();
        const centerX = btnRect.left + btnRect.width / 2;
        const centerY = btnRect.top + btnRect.height / 2;

        // Create floating text element
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.innerHTML = `Need ${formatNumber(shortage)} more <span class="counter-currency" style="color: #ff6b6b; background: none; -webkit-text-fill-color: #ff6b6b;">ED</span>`;

        // Position at button center
        floatingText.style.left = `${centerX}px`;
        floatingText.style.top = `${centerY}px`;
        floatingText.style.transform = 'translate(-50%, -50%)';

        // Add to document
        document.body.appendChild(floatingText);

        // Remove element after animation completes
        setTimeout(() => {
            floatingText.remove();
        }, 2000);
    }

    playSlotMachineAnimation() {
        if (this.agenticClickerLevelEl) {
            // Remove existing animation class if any
            this.agenticClickerLevelEl.classList.remove('slot-machine');

            // Force reflow to restart animation
            void this.agenticClickerLevelEl.offsetWidth;

            // Add animation class
            this.agenticClickerLevelEl.classList.add('slot-machine');

            // Remove animation class after completion
            setTimeout(() => {
                this.agenticClickerLevelEl.classList.remove('slot-machine');
            }, 600);
        }
    }

    playSlotMachineSound() {
        try {
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const currentTime = audioContext.currentTime;

            // Create oscillators for multiple tones
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            // Connect nodes
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Configure slot machine "spinning" sound (rising chirp)
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(400, currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(800, currentTime + 0.3);

            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(600, currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.3);

            // Volume envelope - fade in and out
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.3);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.35);

            // Play spinning sound
            oscillator1.start(currentTime);
            oscillator1.stop(currentTime + 0.35);
            oscillator2.start(currentTime);
            oscillator2.stop(currentTime + 0.35);

            // Create "ding" sound at the end
            setTimeout(() => {
                const dingOscillator = audioContext.createOscillator();
                const dingGain = audioContext.createGain();

                dingOscillator.connect(dingGain);
                dingGain.connect(audioContext.destination);

                // High pitched "ding"
                dingOscillator.type = 'sine';
                dingOscillator.frequency.setValueAtTime(1200, audioContext.currentTime);

                // Quick attack and decay
                dingGain.gain.setValueAtTime(0.2, audioContext.currentTime);
                dingGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                dingOscillator.start(audioContext.currentTime);
                dingOscillator.stop(audioContext.currentTime + 0.2);
            }, 350);
        } catch (e) {
            console.log('Web Audio API not supported:', e);
        }
    }

    clearAllData() {
        // Stop auto-clicker
        this.counterManager.stopAutoClicker();

        // Clear all localStorage
        if (storageAvailable) {
            localStorage.removeItem(CONFIG.storagePrefix + CONFIG.clickKey);
            localStorage.removeItem(CONFIG.storagePrefix + CONFIG.totalClicksKey);
            localStorage.removeItem(CONFIG.storagePrefix + CONFIG.agenticClickerLevelKey);
            localStorage.removeItem(CONFIG.storagePrefix + CONFIG.darkModeUnlockedKey);
            localStorage.removeItem(CONFIG.storagePrefix + CONFIG.achievementsKey);
            // Note: We keep theme preference, but reset to light mode
            setStorageItem(CONFIG.themeKey, 'light');
        }

        // Reset counter manager state
        this.counterManager.resetState();

        // Reset theme to light and lock dark mode
        this.themeManager.darkModeUnlocked = false;
        this.themeManager.setTheme('light');
        this.themeManager.updateToggleState();

        // Reset achievement manager state
        this.achievementManager.earnedAchievements = new Set();

        // Update all displays
        this.updateDisplay();

        console.log('[CLEAR DATA] All game progress has been reset');
    }
}
