// ===============================================
// CONFIGURATION
// ===============================================

const CONFIG = {
    storagePrefix: 'edgar_tech_',
    clickKey: 'clickCount',
    totalClicksKey: 'totalClicks', // Lifetime clicks (never decreases)
    tickKey: 'tickCount',
    themeKey: 'theme',
    agenticClickerLevelKey: 'agenticClickerLevel',
    achievementsKey: 'earnedAchievements', // Array of earned achievement IDs
};

// ===============================================
// ACHIEVEMENTS DEFINITIONS
// ===============================================

const ACHIEVEMENTS = [
    {
        id: 'first_click',
        title: 'Your First Click!',
        description: 'Clicked for the first time on the site',
        checkType: 'click',
        condition: (totalClicks) => totalClicks >= 1
    },
    {
        id: 'ten_clicks',
        title: '10x Develo-clicker',
        description: 'Clicked 10 times',
        checkType: 'click',
        condition: (totalClicks) => totalClicks >= 10
    },
    {
        id: 'over_9000',
        title: 'Over 9000!',
        description: 'Clicked 9001 times',
        checkType: 'click',
        condition: (totalClicks) => totalClicks >= 9001
    },
    {
        id: 'first_purchase',
        title: 'I think this site is not what I think it is',
        description: 'Bought 1 item',
        checkType: 'purchase',
        condition: (level) => level >= 1
    }
];

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

/**
 * Check if localStorage is available
 */
const storageAvailable = (() => {
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
function getStorageItem(key) {
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
function setStorageItem(key, value) {
    if (!storageAvailable) return false;
    try {
        localStorage.setItem(CONFIG.storagePrefix + key, value);
        return true;
    } catch (e) {
        console.error('Error writing to localStorage:', e);
        return false;
    }
}

/**
 * Format number with thousands separator
 */
function formatNumber(num) {
    return num.toLocaleString();
}

// ===============================================
// THEME TOGGLE
// ===============================================

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        // Load saved theme or detect system preference
        const savedTheme = getStorageItem(CONFIG.themeKey);
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;

        this.setTheme(theme, false);

        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!getStorageItem(CONFIG.themeKey)) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    }

    setTheme(theme, save = true) {
        document.documentElement.setAttribute('data-theme', theme);
        if (save) {
            setStorageItem(CONFIG.themeKey, theme);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// ===============================================
// COUNTER MANAGER
// ===============================================

class CounterManager {
    constructor() {
        this.clickCount = 0;
        this.totalClicks = 0; // Lifetime clicks
        this.agenticClickerLevel = 0;
        this.earnedAchievements = new Set(); // Set of earned achievement IDs
        this.autoClickerIntervalId = null; // Auto-clicker interval ID
        // this.tickCount = 0; // DISABLED - Tick counter removed
        this.clickCounterEl = document.getElementById('clickCounter');
        this.shopButtonSubtitle = document.getElementById('shop-button-subtitle');
        // this.tickCounterEl = document.getElementById('tickCounter'); // DISABLED
        // this.resetClicksBtn = document.getElementById('resetClicks'); // DISABLED
        // this.resetTicksBtn = document.getElementById('resetTicks'); // DISABLED
        this.init();
    }

    init() {
        // Load counters from localStorage
        this.loadCounters();

        // Initialize displays
        this.updateClickDisplay();
        this.updateShopButtonSubtitle();
        // this.updateTickDisplay(); // DISABLED

        // Setup click counter
        this.setupClickCounter();

        // Setup tick counter - DISABLED (will add button to start later)
        // this.setupTickCounter();

        // Setup reset buttons - DISABLED
        // this.setupResetButtons();

        // Setup cross-tab synchronization
        this.setupStorageListener();

        // Setup clicker dialog
        this.setupClickerDialog();

        // Start auto-clicker if level > 0
        if (this.agenticClickerLevel > 0) {
            this.startAutoClicker();
        }
    }

    loadCounters() {
        const savedClicks = getStorageItem(CONFIG.clickKey);
        const savedTotalClicks = getStorageItem(CONFIG.totalClicksKey);
        const savedLevel = getStorageItem(CONFIG.agenticClickerLevelKey);
        const savedAchievements = getStorageItem(CONFIG.achievementsKey);
        // const savedTicks = getStorageItem(CONFIG.tickKey); // DISABLED

        this.clickCount = savedClicks ? parseInt(savedClicks, 10) : 0;
        this.totalClicks = savedTotalClicks ? parseInt(savedTotalClicks, 10) : 0;
        this.agenticClickerLevel = savedLevel ? parseInt(savedLevel, 10) : 0;
        // this.tickCount = savedTicks ? parseInt(savedTicks, 10) : 0; // DISABLED

        // Load earned achievements
        if (savedAchievements) {
            try {
                const achievementsArray = JSON.parse(savedAchievements);
                this.earnedAchievements = new Set(achievementsArray);
            } catch (e) {
                console.error('Error parsing achievements:', e);
                this.earnedAchievements = new Set();
            }
        }

        // Handle NaN cases
        if (isNaN(this.clickCount)) this.clickCount = 0;
        if (isNaN(this.totalClicks)) this.totalClicks = 0;
        if (isNaN(this.agenticClickerLevel)) this.agenticClickerLevel = 0;
        // if (isNaN(this.tickCount)) this.tickCount = 0; // DISABLED
    }

    updateClickDisplay() {
        if (this.clickCounterEl) {
            this.clickCounterEl.innerHTML = `<span class="counter-currency">ED</span> ${formatNumber(this.clickCount)}`;
        }
    }

    updateShopButtonSubtitle() {
        if (this.shopButtonSubtitle) {
            const nextLevel = this.agenticClickerLevel + 1;
            const cost = this.calculateUpgradeCost();
            this.shopButtonSubtitle.textContent = `Level ${nextLevel} ED ${formatNumber(cost)}`;
        }
    }

    calculateUpgradeCost() {
        // Base cost is 20, increases by 40% per level
        return Math.floor(20 * Math.pow(1.4, this.agenticClickerLevel));
    }

    calculateAutoClickerInterval() {
        // Level 1: 750ms, each level is 5% faster (95% of previous interval)
        // Formula: 750 * (0.95 ^ (level - 1))
        return 750 * Math.pow(0.95, this.agenticClickerLevel - 1);
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
            this.updateClickDisplay();

            // Add subtle animation
            if (this.clickCounterEl) {
                this.clickCounterEl.style.transform = 'scale(1.08)';
                setTimeout(() => {
                    this.clickCounterEl.style.transform = 'scale(1)';
                }, 100);
            }
        }, interval);
    }

    stopAutoClicker() {
        if (this.autoClickerIntervalId) {
            clearInterval(this.autoClickerIntervalId);
            this.autoClickerIntervalId = null;
            console.log('[AUTO-CLICKER] Stopped');
        }
    }

    // DISABLED - Tick counter removed
    // updateTickDisplay() {
    //     if (this.tickCounterEl) {
    //         this.tickCounterEl.textContent = formatNumber(this.tickCount);
    //     }
    // }

    setupClickCounter() {
        // Listen for ANY click on the page
        document.addEventListener('click', (event) => {
            // No need to filter clicks anymore since reset buttons are removed

            this.clickCount++;
            this.totalClicks++; // Increment lifetime clicks
            console.log('[DEBUG] Click detected! Current:', this.clickCount, 'Total:', this.totalClicks);

            setStorageItem(CONFIG.clickKey, this.clickCount);
            setStorageItem(CONFIG.totalClicksKey, this.totalClicks);
            this.updateClickDisplay();

            // Add a subtle animation to nav counter
            if (this.clickCounterEl) {
                this.clickCounterEl.style.transform = 'scale(1.15)';
                setTimeout(() => {
                    this.clickCounterEl.style.transform = 'scale(1)';
                }, 200);
            }

            // Check for click-based achievements
            this.checkAchievements('click');
        });
    }

    checkAchievements(checkType) {
        // Filter achievements by type
        const relevantAchievements = ACHIEVEMENTS.filter(a => a.checkType === checkType);

        relevantAchievements.forEach(achievement => {
            // Skip if already earned
            if (this.earnedAchievements.has(achievement.id)) {
                return;
            }

            // Check condition based on type
            let conditionMet = false;
            if (checkType === 'click') {
                conditionMet = achievement.condition(this.totalClicks);
            } else if (checkType === 'purchase') {
                conditionMet = achievement.condition(this.agenticClickerLevel);
            }

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

    // DISABLED - Tick counter will be added with button later
    // setupTickCounter() {
    //     // Increment every second
    //     setInterval(() => {
    //         this.tickCount++;
    //         setStorageItem(CONFIG.tickKey, this.tickCount);
    //         this.updateTickDisplay();
    //     }, 1000);
    // }

    // DISABLED - Reset buttons removed
    // setupResetButtons() {
    //     if (this.resetClicksBtn) {
    //         this.resetClicksBtn.addEventListener('click', () => {
    //             if (confirm('Are you sure you want to reset the click counter?')) {
    //                 this.clickCount = 0;
    //                 setStorageItem(CONFIG.clickKey, this.clickCount);
    //                 this.updateClickDisplay();
    //             }
    //         });
    //     }

    //     if (this.resetTicksBtn) {
    //         this.resetTicksBtn.addEventListener('click', () => {
    //             if (confirm('Are you sure you want to reset the tick counter?')) {
    //                 this.tickCount = 0;
    //                 setStorageItem(CONFIG.tickKey, this.tickCount);
    //                 this.updateTickDisplay();
    //             }
    //         });
    //     }
    // }

    setupStorageListener() {
        // Sync click counter across tabs
        if (storageAvailable) {
            window.addEventListener('storage', (e) => {
                if (e.key === CONFIG.storagePrefix + CONFIG.clickKey && e.newValue !== null) {
                    this.clickCount = parseInt(e.newValue, 10) || 0;
                    this.updateClickDisplay();
                }
                // Tick counter sync disabled
                // else if (e.key === CONFIG.storagePrefix + CONFIG.tickKey && e.newValue !== null) {
                //     this.tickCount = parseInt(e.newValue, 10) || 0;
                //     this.updateTickDisplay();
                // }
            });
        }
    }

    setupClickerDialog() {
        const backdrop = document.getElementById('clicker-dialog-backdrop');
        const dialog = document.getElementById('clicker-dialog');
        const closeBtn = document.getElementById('close-dialog');
        const buyBtn = document.getElementById('buy-agentic-clicker');

        // Open dialog when clicking counter
        if (this.clickCounterEl) {
            this.clickCounterEl.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent this from counting as a click
                this.openDialog();
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

        // Handle purchase
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                this.handlePurchase();
            });
        }
    }

    openDialog() {
        const backdrop = document.getElementById('clicker-dialog-backdrop');
        if (backdrop) {
            backdrop.classList.add('show');
        }
    }

    closeDialog() {
        const backdrop = document.getElementById('clicker-dialog-backdrop');
        if (backdrop) {
            backdrop.classList.remove('show');
        }
    }

    handlePurchase() {
        const cost = this.calculateUpgradeCost();

        // Check if user has enough clicks
        if (this.clickCount < cost) {
            alert(`Not enough clicks! You need ${cost} clicks but only have ${this.clickCount}.`);
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

        // Deduct clicks after a short delay (for animation effect)
        setTimeout(() => {
            const startCount = this.clickCount;
            const endCount = this.clickCount - cost;
            const duration = 800; // Animation duration in ms
            const startTime = Date.now();

            // Animate counter counting down
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic function for smooth deceleration
                const easeProgress = 1 - Math.pow(1 - progress, 3);

                const currentCount = Math.round(startCount - (cost * easeProgress));
                this.clickCount = currentCount;
                this.updateClickDisplay();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Final update to ensure exact value
                    this.clickCount = endCount;
                    setStorageItem(CONFIG.clickKey, this.clickCount);
                    this.updateClickDisplay();

                    // Level up!
                    this.agenticClickerLevel++;
                    setStorageItem(CONFIG.agenticClickerLevelKey, this.agenticClickerLevel);
                    this.updateShopButtonSubtitle();

                    // Start or restart auto-clicker with new speed
                    this.startAutoClicker();

                    // Check for purchase-based achievements
                    this.checkAchievements('purchase');
                }
            };

            animate();
        }, 200);
    }

    animateEnergySiphon() {
        const beam = document.getElementById('energy-beam');
        const beamLine = document.getElementById('beam-line');
        const counter = this.clickCounterEl;
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
}

// ===============================================
// NAVIGATION MANAGER
// ===============================================

class NavigationManager {
    constructor() {
        this.nav = document.getElementById('nav');
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.sections = document.querySelectorAll('section[id]');
        this.init();
    }

    init() {
        // Smooth scroll for nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const navHeight = this.nav ? this.nav.offsetHeight : 0;
                    const targetPosition = targetSection.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Active nav highlighting on scroll
        window.addEventListener('scroll', () => this.highlightActiveNav());

        // Initial highlight
        this.highlightActiveNav();
    }

    highlightActiveNav() {
        const scrollPosition = window.scrollY;
        const navHeight = this.nav ? this.nav.offsetHeight : 0;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });

        // Remove active class if at the very top
        if (scrollPosition < 100) {
            this.navLinks.forEach(link => link.classList.remove('active'));
        }
    }
}

// ===============================================
// SCROLL ANIMATIONS
// ===============================================

class ScrollAnimationManager {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        this.init();
    }

    init() {
        // Add fade-in class to elements that should animate
        const animatedElements = document.querySelectorAll('.timeline-item, .project-card, .counter-card, .education-card, .contact-item');

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }
}

// ===============================================
// INITIALIZATION
// ===============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('[DEBUG] Initializing portfolio...');

    // Initialize all managers
    console.log('[DEBUG] Creating ThemeManager...');
    new ThemeManager();

    console.log('[DEBUG] Creating CounterManager...');
    new CounterManager();

    console.log('[DEBUG] Creating NavigationManager...');
    new NavigationManager();

    console.log('[DEBUG] Creating ScrollAnimationManager...');
    new ScrollAnimationManager();

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

// ===============================================
// UTILITY: SCROLL TO TOP
// ===============================================

// Add scroll to top functionality when clicking logo
const navLogo = document.querySelector('.nav-logo');
if (navLogo) {
    navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
