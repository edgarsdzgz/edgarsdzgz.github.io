// ===============================================
// HERO NAME MANAGER
// ===============================================

export class HeroNameManager {
    constructor(achievementManager) {
        this.achievementManager = achievementManager;
        this.isAnimating = false;
        this.heroName = document.getElementById('hero-name');
        this.init();
    }

    init() {
        if (!this.heroName) {
            console.error('[HERO NAME] Element not found');
            return;
        }

        this.setupHoverEffect();
        this.setupClickEffect();
    }

    setupHoverEffect() {
        this.heroName.addEventListener('mouseenter', () => {
            if (this.isAnimating) return;

            this.isAnimating = true;
            this.heroName.classList.add('glitch');

            // Check achievement
            this.achievementManager.checkAchievements('name_hover', true);

            // Remove class after animation completes
            setTimeout(() => {
                this.heroName.classList.remove('glitch');
                this.isAnimating = false;
            }, 300);
        });
    }

    setupClickEffect() {
        this.heroName.addEventListener('click', (e) => {
            // Don't trigger if glitch animation is happening
            if (this.isAnimating) return;

            this.isAnimating = true;
            this.heroName.classList.add('pop-glow');

            // Check achievement
            this.achievementManager.checkAchievements('name_click', true);

            // Remove class after animation completes
            setTimeout(() => {
                this.heroName.classList.remove('pop-glow');
                this.isAnimating = false;
            }, 600);
        });
    }
}
