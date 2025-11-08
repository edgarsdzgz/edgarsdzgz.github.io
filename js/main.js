// ===============================================
// CONFIGURATION
// ===============================================

const CONFIG = {
    storagePrefix: 'edgar_tech_',
    clickKey: 'clickCount',
    tickKey: 'tickCount',
    themeKey: 'theme',
};

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
        this.tickCount = 0;
        this.clickCounterEl = document.getElementById('clickCounter');
        this.tickCounterEl = document.getElementById('tickCounter');
        this.resetClicksBtn = document.getElementById('resetClicks');
        this.resetTicksBtn = document.getElementById('resetTicks');
        this.init();
    }

    init() {
        // Load counters from localStorage
        this.loadCounters();

        // Initialize displays
        this.updateClickDisplay();
        this.updateTickDisplay();

        // Setup click counter
        this.setupClickCounter();

        // Setup tick counter
        this.setupTickCounter();

        // Setup reset buttons
        this.setupResetButtons();

        // Setup cross-tab synchronization
        this.setupStorageListener();
    }

    loadCounters() {
        const savedClicks = getStorageItem(CONFIG.clickKey);
        const savedTicks = getStorageItem(CONFIG.tickKey);

        this.clickCount = savedClicks ? parseInt(savedClicks, 10) : 0;
        this.tickCount = savedTicks ? parseInt(savedTicks, 10) : 0;

        // Handle NaN cases
        if (isNaN(this.clickCount)) this.clickCount = 0;
        if (isNaN(this.tickCount)) this.tickCount = 0;
    }

    updateClickDisplay() {
        if (this.clickCounterEl) {
            this.clickCounterEl.textContent = formatNumber(this.clickCount);
        }
    }

    updateTickDisplay() {
        if (this.tickCounterEl) {
            this.tickCounterEl.textContent = formatNumber(this.tickCount);
        }
    }

    setupClickCounter() {
        // Listen for ANY click on the page
        document.addEventListener('click', (event) => {
            // Don't count clicks on reset buttons
            if (event.target.id === 'resetClicks' || event.target.id === 'resetTicks') {
                return;
            }

            this.clickCount++;
            setStorageItem(CONFIG.clickKey, this.clickCount);
            this.updateClickDisplay();

            // Add a subtle animation
            if (this.clickCounterEl) {
                this.clickCounterEl.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.clickCounterEl.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }

    setupTickCounter() {
        // Increment every second
        setInterval(() => {
            this.tickCount++;
            setStorageItem(CONFIG.tickKey, this.tickCount);
            this.updateTickDisplay();
        }, 1000);
    }

    setupResetButtons() {
        if (this.resetClicksBtn) {
            this.resetClicksBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset the click counter?')) {
                    this.clickCount = 0;
                    setStorageItem(CONFIG.clickKey, this.clickCount);
                    this.updateClickDisplay();
                }
            });
        }

        if (this.resetTicksBtn) {
            this.resetTicksBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset the tick counter?')) {
                    this.tickCount = 0;
                    setStorageItem(CONFIG.tickKey, this.tickCount);
                    this.updateTickDisplay();
                }
            });
        }
    }

    setupStorageListener() {
        // Sync counters across tabs
        if (storageAvailable) {
            window.addEventListener('storage', (e) => {
                if (e.key === CONFIG.storagePrefix + CONFIG.clickKey && e.newValue !== null) {
                    this.clickCount = parseInt(e.newValue, 10) || 0;
                    this.updateClickDisplay();
                } else if (e.key === CONFIG.storagePrefix + CONFIG.tickKey && e.newValue !== null) {
                    this.tickCount = parseInt(e.newValue, 10) || 0;
                    this.updateTickDisplay();
                }
            });
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
    // Initialize all managers
    new ThemeManager();
    new CounterManager();
    new NavigationManager();
    new ScrollAnimationManager();

    // Add smooth transition to counter values
    const counterValues = document.querySelectorAll('.counter-value');
    counterValues.forEach(el => {
        el.style.transition = 'transform 0.2s ease';
    });

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
