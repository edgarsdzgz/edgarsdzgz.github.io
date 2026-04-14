// ===============================================
// MAIN INITIALIZATION
// ===============================================

import { ThemeManager } from './managers/themeManager.js';
import { NavigationManager } from './managers/navigationManager.js';
import { ScrollAnimationManager } from './managers/scrollAnimationManager.js';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    new ThemeManager();
    new NavigationManager();
    new ScrollAnimationManager();
}
