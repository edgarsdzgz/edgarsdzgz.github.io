// ===============================================
// SCROLL ANIMATION MANAGER
// ===============================================

export class ScrollAnimationManager {
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
