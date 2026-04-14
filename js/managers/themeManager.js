// ===============================================
// THEME MANAGER
// ===============================================
// Light/dark toggle with localStorage persistence.

const STORAGE_KEY = 'edgarsdzgz_theme';

export class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        const savedTheme = this.loadTheme();
        const theme = savedTheme || this.preferredTheme();
        this.setTheme(theme);

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    preferredTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    loadTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // localStorage not available; theme won't persist across sessions
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.saveTheme(theme);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
    }
}
