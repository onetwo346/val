// Advanced Modern JavaScript for Val's Portfolio - Stable Version

class PortfolioApp {
    constructor() {
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.cursor = document.querySelector('.cursor-glow');
        this.isLoaded = true;
        this.reelRotation = 0;
        this.currentTheme = 'night';
        this.animationFrameId = null;
        this.particleInterval = null;
        this.reelInterval = null;
        this.init();
    }

    init() {
        try {
            this.setupCursor();
            this.setupParticles();
            this.setupNavigation();
            this.setupThemeToggle();
            this.setupScrollAnimations();
            this.setupHeroAnimations();
            this.setupMobileMenu();
            this.setupPopupModals();
            this.bindEvents();
            this.startAnimations();
        } catch (error) {
            console.error('Portfolio initialization error:', error);
        }
    }

    setupCursor() {
        if (window.innerWidth <= 768) {
            if (this.cursor) this.cursor.style.display = 'none';
            return;
        }

        if (!this.cursor) return;

        const handleMouseMove = (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
        };

        document.addEventListener('mousemove', handleMouseMove);

        // Enhanced cursor for interactive elements
        const interactiveElements = document.querySelectorAll('button, a, .card-item, .info-popup-trigger');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (this.cursor) {
                    this.cursor.style.transform = 'scale(2)';
                    this.cursor.style.background = 'radial-gradient(circle, #00d4ff 0%, transparent 70%)';
                }
            });
            
            el.addEventListener('mouseleave', () => {
                if (this.cursor) {
                    this.cursor.style.transform = 'scale(1)';
                    this.cursor.style.background = 'radial-gradient(circle, #00d4ff 0%, transparent 70%)';
                }
            });
        });

        // Store reference for cleanup
        this.mouseMoveHandler = handleMouseMove;
    }

    setupParticles() {
        const particlesContainer = document.querySelector('.particles-container');
        if (!particlesContainer) return;

        // Clear existing particles
        particlesContainer.innerHTML = '';

        // Create particles with reduced count for better performance
        const particleCount = window.innerWidth > 768 ? 15 : 8;
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(particlesContainer);
        }

        this.animateParticles();
    }

    createParticle(container) {
        const particle = document.createElement('div');
        const isDay = this.currentTheme === 'day';
        const colors = isDay ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)' : 'linear-gradient(45deg, #00d4ff, #a855f7)';
        
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: ${colors};
            border-radius: 50%;
            pointer-events: none;
            opacity: ${Math.random() * 0.6 + 0.2};
        `;
        
        container.appendChild(particle);
        
        this.particles.push({
            element: particle,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 3 + 1
        });
    }

    animateParticles() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const animate = () => {
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off edges with boundary checking
                if (particle.x <= 0 || particle.x >= window.innerWidth) {
                    particle.vx *= -1;
                    particle.x = Math.max(0, Math.min(particle.x, window.innerWidth));
                }
                if (particle.y <= 0 || particle.y >= window.innerHeight) {
                    particle.vy *= -1;
                    particle.y = Math.max(0, Math.min(particle.y, window.innerHeight));
                }

                // Mouse interaction with distance limit
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 80 && distance > 0) {
                    const force = 0.00005;
                    particle.vx += (dx / distance) * force;
                    particle.vy += (dy / distance) * force;
                }

                // Limit velocity to prevent runaway particles
                const maxVelocity = 2;
                particle.vx = Math.max(-maxVelocity, Math.min(maxVelocity, particle.vx));
                particle.vy = Math.max(-maxVelocity, Math.min(maxVelocity, particle.vy));

                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
            });

            this.animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                this.smoothScrollTo(targetId);
                this.updateActiveNavItem(link);
            });
        });

        // Update nav on scroll with throttling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveNavOnScroll();
                this.updateNavBackground();
            }, 10);
        });
    }

    smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    updateActiveNavItem(activeLink) {
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos <= sectionTop + sectionHeight) {
                const activeLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
                if (activeLink) {
                    this.updateActiveNavItem(activeLink);
                }
            }
        });
    }

    updateNavBackground() {
        const nav = document.querySelector('.floating-nav');
        if (!nav) return;

        if (window.scrollY > 50) {
            nav.style.background = 'rgba(255, 255, 255, 0.15)';
            nav.style.backdropFilter = 'blur(25px)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.1)';
            nav.style.backdropFilter = 'blur(20px)';
        }
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.triggerSectionAnimations(entry.target);
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section, .featured-work, .hero-content').forEach(el => {
            observer.observe(el);
        });
    }

    triggerSectionAnimations(target) {
        // Stagger animations for grid items
        const gridItems = target.querySelectorAll('.quality-item, .strength-item, .stat-item');
        gridItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        });

        // Animate expertise tags
        const tags = target.querySelectorAll('.tag');
        tags.forEach((tag, index) => {
            setTimeout(() => {
                tag.style.opacity = '1';
                tag.style.transform = 'translateY(0) scale(1)';
            }, index * 80);
        });
    }

    setupHeroAnimations() {
        this.animateFloatingCards();
        this.setupTypingEffect();
    }

    animateFloatingCards() {
        const cards = document.querySelectorAll('.card-item');
        cards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.1)';
                card.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.3)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }

    setupTypingEffect() {
        const titleLines = document.querySelectorAll('.title-line');
        titleLines.forEach((line, index) => {
            const text = line.textContent;
            line.textContent = '';
            
            setTimeout(() => {
                this.typeText(line, text, 60);
            }, 300 + (index * 200));
        });
    }

    typeText(element, text, speed) {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
    }

    setupThemeToggle() {
        const themeToggle = document.querySelector('#themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'night';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'night' ? 'day' : 'night';
        this.setTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update particles for theme change
        this.updateParticlesForTheme();
    }

    updateParticlesForTheme() {
        const isDay = this.currentTheme === 'day';
        const colors = isDay ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)' : 'linear-gradient(45deg, #00d4ff, #a855f7)';
        
        this.particles.forEach(particle => {
            particle.element.style.background = colors;
        });
    }

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    setupPopupModals() {
        const popupTriggers = document.querySelectorAll('.info-popup-trigger');
        const popupModals = document.querySelectorAll('.popup-modal');
        const closeButtons = document.querySelectorAll('.popup-close');

        // Open popup
        popupTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const popupId = trigger.getAttribute('data-popup');
                const popup = document.getElementById(popupId);
                if (popup) {
                    popup.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Close popup
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const popup = button.closest('.popup-modal');
                if (popup) {
                    popup.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close popup when clicking outside
        popupModals.forEach(popup => {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close popup with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                popupModals.forEach(popup => {
                    if (popup.classList.contains('active')) {
                        popup.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            }
        });
    }

    bindEvents() {
        // Enhanced button interactions
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e.target, e);
            });
        });

        // Scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                this.smoothScrollTo('#about');
            });
        }

        // Window resize handling with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Advanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    createRippleEffect(button, event) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    handleResize() {
        // Update particle system for new dimensions
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) particle.x = window.innerWidth - 10;
            if (particle.y > window.innerHeight) particle.y = window.innerHeight - 10;
        });
    }

    handleKeyboardNavigation(e) {
        const navLinks = document.querySelectorAll('.nav-menu a');
        const currentActive = document.querySelector('.nav-menu a.active');
        let currentIndex = Array.from(navLinks).indexOf(currentActive);

        switch(e.key) {
            case 'ArrowDown':
            case 'Tab':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % navLinks.length;
                this.smoothScrollTo(navLinks[currentIndex].getAttribute('href'));
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? navLinks.length - 1 : currentIndex - 1;
                this.smoothScrollTo(navLinks[currentIndex].getAttribute('href'));
                break;
            case 'Home':
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'End':
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                break;
        }
    }

    startAnimations() {
        // Start any additional animations after page load
        this.createFloatingElements();
        this.setupParallaxEffects();
    }

    createFloatingElements() {
        const floatingElements = document.querySelectorAll('.float-element');
        floatingElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.5}s`;
            element.addEventListener('click', () => {
                element.style.animation = 'none';
                setTimeout(() => {
                    element.style.animation = '';
                }, 100);
            });
        });
    }

    setupParallaxEffects() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const parallaxElements = document.querySelectorAll('.hero-visual, .floating-elements');
                    
                    parallaxElements.forEach(element => {
                        const speed = 0.3;
                        element.style.transform = `translateY(${scrolled * speed}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Cleanup method to prevent memory leaks
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
        }
        if (this.reelInterval) {
            clearInterval(this.reelInterval);
        }
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
    }
}

// Global utility functions
window.scrollToSection = function(sectionId) {
    const targetElement = document.querySelector(`#${sectionId}`);
    if (targetElement) {
        const offsetTop = targetElement.offsetTop - 100;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};

// Add dynamic CSS animations
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes ripple {
        from {
            opacity: 1;
            transform: scale(0);
        }
        to {
            opacity: 0;
            transform: scale(2);
        }
    }

    .animate-in {
        animation: slideInFade 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }

    @keyframes slideInFade {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .nav-menu.active {
        display: flex !important;
        position: fixed;
        top: 80px;
        right: 2rem;
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(20px);
        padding: 2rem;
        border-radius: 20px;
        flex-direction: column;
        gap: 1rem;
        z-index: 999;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }

    .keyboard-nav *:focus {
        outline: 2px solid #00d4ff;
        outline-offset: 2px;
        border-radius: 4px;
    }

    /* Enhanced grid item animations */
    .quality-item,
    .strength-item,
    .stat-item {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
        transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .tag {
        opacity: 0;
        transform: translateY(20px) scale(0.8);
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    }

    /* Smooth card animations */
    .card-item {
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .card-item:hover {
        transform: translateY(-8px) scale(1.05);
        box-shadow: 0 20px 40px rgba(0, 212, 255, 0.3);
    }
`;

document.head.appendChild(dynamicStyles);

// Initialize the app
let portfolioApp;
document.addEventListener('DOMContentLoaded', () => {
    portfolioApp = new PortfolioApp();
});

// Performance optimization and cleanup
window.addEventListener('beforeunload', () => {
    if (portfolioApp) {
        portfolioApp.destroy();
    }
    // Clean up any running animations or intervals
    document.querySelectorAll('*').forEach(el => {
        if (el.style) el.style.animation = 'none';
    });
});

// Error handling for better stability
window.addEventListener('error', (e) => {
    console.error('Global error caught:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
}); 