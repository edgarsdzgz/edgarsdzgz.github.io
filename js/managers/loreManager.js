// ===============================================
// LORE MANAGER
// ===============================================

import { CONFIG, LORE } from '../config.js';
import { getStorageItem, setStorageItem } from '../utils/storage.js';
import { formatNumber } from '../utils/helpers.js';

export class LoreManager {
    constructor(counterManager, shopManager) {
        this.counterManager = counterManager;
        this.shopManager = shopManager;
        this.unlockedLore = new Set();
        this.init();
    }

    init() {
        // Load unlocked lore from storage
        const savedLore = getStorageItem(CONFIG.unlockedLoreKey);
        if (savedLore) {
            try {
                const loreArray = JSON.parse(savedLore);
                this.unlockedLore = new Set(loreArray);
            } catch (e) {
                console.error('Error parsing unlocked lore:', e);
                this.unlockedLore = new Set();
            }
        }

        // Setup unlock buttons
        this.setupUnlockButtons();

        // Restore previously unlocked lore
        this.restoreUnlockedLore();
    }

    setupUnlockButtons() {
        const unlockButtons = document.querySelectorAll('.unlock-lore-btn');

        unlockButtons.forEach(button => {
            const loreId = button.getAttribute('data-lore-id');

            // Hide button if already unlocked
            if (this.unlockedLore.has(loreId)) {
                button.style.display = 'none';
            }

            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.handleUnlock(loreId, button);
            });
        });
    }

    restoreUnlockedLore() {
        // For each unlocked lore, recreate the lore card without animation
        this.unlockedLore.forEach(loreId => {
            const lore = LORE.find(l => l.id === loreId);
            if (lore) {
                this.createLoreCard(lore, false); // false = no animation
            }
        });
    }

    handleUnlock(loreId, button) {
        // Find lore data
        const lore = LORE.find(l => l.id === loreId);
        if (!lore) {
            console.error('Lore not found:', loreId);
            return;
        }

        // Check if already unlocked
        if (this.unlockedLore.has(loreId)) {
            return;
        }

        // Check if user has enough clicks
        const currentClicks = this.counterManager.getClickCount();
        if (currentClicks < lore.cost) {
            const shortage = lore.cost - currentClicks;
            this.showInsufficientFundsNotification(shortage, button);
            return;
        }

        // Add purchasing animation to button
        button.classList.add('purchasing');
        setTimeout(() => {
            button.classList.remove('purchasing');
        }, 500);

        // Play purchase sound (reuse from shopManager)
        this.shopManager.playPurchaseSound();

        // Deduct clicks
        this.counterManager.setClickCount(currentClicks - lore.cost);

        // Mark as unlocked
        this.unlockedLore.add(loreId);
        const loreArray = Array.from(this.unlockedLore);
        setStorageItem(CONFIG.unlockedLoreKey, JSON.stringify(loreArray));

        // Hide unlock button
        button.style.display = 'none';

        // Create and spawn lore card with animation
        this.createLoreCard(lore, true); // true = with animation

        console.log('[LORE] Unlocked:', lore.title);
    }

    createLoreCard(lore, animate = false) {
        // Find the parent timeline item
        const experienceItem = document.querySelector(`[data-experience-id="${lore.experienceId}"]`);
        if (!experienceItem) {
            console.error('Experience item not found for lore:', lore.experienceId);
            return;
        }

        // Create lore timeline item
        const loreItem = document.createElement('div');
        loreItem.className = 'timeline-item lore-item';
        loreItem.setAttribute('data-lore-id', lore.id);
        if (animate) {
            loreItem.classList.add('spawning');
        }

        // Create marker
        const marker = document.createElement('div');
        marker.className = 'timeline-marker lore-marker';

        // Create content wrapper
        const content = document.createElement('div');
        content.className = 'timeline-content lore-content';

        // Create collapsible header
        const header = document.createElement('div');
        header.className = 'lore-header';
        header.innerHTML = `
            <div class="lore-title-wrapper">
                <span class="lore-expand-icon">▼</span>
                <h4 class="lore-title">${lore.title}</h4>
            </div>
            <span class="lore-badge">Unlocked</span>
        `;

        // Create collapsible body
        const body = document.createElement('div');
        body.className = 'lore-body';
        body.innerHTML = `<p>${lore.text}</p>`;

        // Make header clickable to toggle collapse
        header.addEventListener('click', () => {
            const isCollapsed = body.style.display === 'none';
            body.style.display = isCollapsed ? 'block' : 'none';
            const icon = header.querySelector('.lore-expand-icon');
            icon.textContent = isCollapsed ? '▼' : '▶';
        });

        // Assemble lore item
        content.appendChild(header);
        content.appendChild(body);
        loreItem.appendChild(marker);
        loreItem.appendChild(content);

        // Insert after the parent experience item
        experienceItem.parentNode.insertBefore(loreItem, experienceItem.nextSibling);

        // Remove spawning class after animation
        if (animate) {
            setTimeout(() => {
                loreItem.classList.remove('spawning');
            }, 800);
        }
    }

    showInsufficientFundsNotification(shortage, button) {
        // Get button position
        const btnRect = button.getBoundingClientRect();
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
}
