// ===============================================
// NAVIGATION MANAGER
// ===============================================

export class NavigationManager {
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
