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
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        try {
                    // Only setup cursor on desktop
        if (!this.isMobile && window.innerWidth > 768) {
            this.setupCursor();
        }
            
            // Reduce particle count on mobile
            this.setupParticles();
            this.setupNavigation();
            this.setupThemeToggle();
            this.setupScrollAnimations();
            this.setupHeroAnimations();
            this.setupMobileMenu();
            this.setupPopupModals();
            this.setupGallery();
            this.bindEvents();
            this.startAnimations();
            
            // Add mobile-specific optimizations
            if (this.isMobile) {
                this.setupMobileOptimizations();
            }
            
            // Handle orientation changes
            this.handleOrientationChange();
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
        const interactiveElements = document.querySelectorAll('button, a, .card-item, .info-popup-trigger, .gallery-card');
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

        // Setup smart navigation hiding
        this.lastScrollY = window.scrollY;
        this.navHideThreshold = 100; // Hide nav after scrolling 100px down
        
        // Update nav on scroll with throttling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveNavOnScroll();
                this.handleNavVisibility();
            }, 10);
        });
    }

    handleNavVisibility() {
        const nav = document.querySelector('.floating-nav');
        if (!nav) return;

        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > this.lastScrollY;
        const scrollingUp = currentScrollY < this.lastScrollY;

        // Show nav at the very top
        if (currentScrollY < 50) {
            nav.classList.remove('nav-hidden');
            nav.classList.add('nav-visible');
        }
        // Hide nav when scrolling down past threshold
        else if (scrollingDown && currentScrollY > this.navHideThreshold) {
            nav.classList.add('nav-hidden');
            nav.classList.remove('nav-visible');
        }
        // Show nav when scrolling up
        else if (scrollingUp) {
            nav.classList.remove('nav-hidden');
            nav.classList.add('nav-visible');
        }

        this.lastScrollY = currentScrollY;
        this.updateNavBackground();
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
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
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
                    requestAnimationFrame(() => {
                        entry.target.classList.add('animate-in');
                        this.triggerSectionAnimations(entry.target);
                    });
                }
            });
        }, observerOptions);

        // Observe all sections with debouncing
        const sections = document.querySelectorAll('section, .featured-work, .hero-content, .gallery-card');
        sections.forEach(el => {
            observer.observe(el);
        });
    }

    // Optimize animation performance
    triggerSectionAnimations(target) {
        if (this.isMobile) {
            // Simplified animations for mobile
            requestAnimationFrame(() => {
                target.querySelectorAll('.quality-item, .strength-item, .stat-item, .tag, .gallery-card').forEach(item => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1)';
                });
            });
        } else {
            // Full animations for desktop
            const items = target.querySelectorAll('.quality-item, .strength-item, .stat-item, .gallery-card');
            items.forEach((item, index) => {
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0) scale(1)';
                    });
                }, index * 100);
            });

            const tags = target.querySelectorAll('.tag');
            tags.forEach((tag, index) => {
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'translateY(0) scale(1)';
                    });
                }, index * 80);
            });
        }
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
        const nav = document.querySelector('.floating-nav');
        const mobileLinks = document.querySelectorAll('.nav-menu a');

        if (navToggle && navMenu) {
            // Toggle menu
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // Update ARIA attribute
                const isExpanded = navMenu.classList.contains('active');
                navToggle.setAttribute('aria-expanded', isExpanded);
                
                // Keep nav visible when menu is open
                if (isExpanded) {
                    nav.classList.remove('nav-hidden');
                    nav.classList.add('nav-visible');
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });

            // Handle mobile link clicks
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });

            // Handle touch events for better mobile experience
            let touchStartY = 0;
            navMenu.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            navMenu.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const scrollTop = navMenu.scrollTop;
                const scrollHeight = navMenu.scrollHeight;
                const clientHeight = navMenu.clientHeight;

                // Prevent default only when scrolling would not be possible
                if ((scrollTop <= 0 && touchY > touchStartY) || 
                    (scrollTop + clientHeight >= scrollHeight && touchY < touchStartY)) {
                    e.preventDefault();
                }
            }, { passive: false });
        }

        // Update menu visibility on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
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

    setupGallery() {
        const galleryCards = document.querySelectorAll('.gallery-card');
        const lightbox = document.querySelector('#lightbox');
        const lightboxImage = document.querySelector('#lightbox-image');
        const closeButton = document.querySelector('.lightbox-close');
        const prevButton = document.querySelector('.lightbox-prev');
        const nextButton = document.querySelector('.lightbox-next');

        if (!lightbox || !lightboxImage || !closeButton || !prevButton || !nextButton) {
            console.warn('Lightbox elements not found:', { 
                lightbox: !!lightbox, 
                lightboxImage: !!lightboxImage, 
                closeButton: !!closeButton, 
                prevButton: !!prevButton, 
                nextButton: !!nextButton 
            });
            return;
        }

        let currentIndex = 0;
        const images = [];

        galleryCards.forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                images.push(img.src);
            }
        });

        function openLightbox(index) {
            currentIndex = index;
            lightboxImage.src = images[currentIndex];
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function showPrevImage() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            lightboxImage.src = images[currentIndex];
        }

        function showNextImage() {
            currentIndex = (currentIndex + 1) % images.length;
            lightboxImage.src = images[currentIndex];
        }

        galleryCards.forEach((card, index) => {
            // Add touch-friendly interactions
            card.addEventListener('click', () => {
                openLightbox(index);
            });
            
            // Add touch feedback for mobile devices
            if ('ontouchstart' in window) {
                card.addEventListener('touchstart', () => {
                    card.style.transform = 'scale(0.98)';
                }, { passive: true });
                
                card.addEventListener('touchend', () => {
                    setTimeout(() => {
                        card.style.transform = '';
                    }, 150);
                }, { passive: true });
            }
        });

        closeButton.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        prevButton.addEventListener('click', showPrevImage);
        nextButton.addEventListener('click', showNextImage);

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'Escape') {
                    closeLightbox();
                } else if (e.key === 'ArrowLeft') {
                    showPrevImage();
                } else if (e.key === 'ArrowRight') {
                    showNextImage();
                }
            }
        });

        // Add swipe gesture support for mobile
        if ('ontouchstart' in window) {
            let touchStartX = 0;
            let touchEndX = 0;
            const minSwipeDistance = 50;

            lightbox.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            lightbox.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                
                if (lightbox.classList.contains('active')) {
                    const swipeDistance = touchStartX - touchEndX;
                    
                    if (Math.abs(swipeDistance) > minSwipeDistance) {
                        if (swipeDistance > 0) {
                            // Swipe left - next image
                            showNextImage();
                        } else {
                            // Swipe right - previous image
                            showPrevImage();
                        }
                    }
                }
            }, { passive: true });
        }
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

    setupMobileOptimizations() {
        // Disable heavy animations on mobile for better performance
        document.querySelectorAll('.floating-cards .card-item, .gallery-card').forEach(card => {
            if (card.classList.contains('gallery-card')) {
                // Simplify gallery card animations on mobile
                card.style.transform = 'none';
                card.style.animation = 'none';
            } else {
                card.style.animation = 'none';
            }
        });

        // Use passive event listeners for better scroll performance
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });

        // Reduce particle count and animation complexity
        this.particles = this.particles.slice(0, 5);
    }

    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // Wait for orientation change to complete
            setTimeout(() => {
                // Update layout-related calculations
                this.handleResize();
                
                // Force recalculation of mobile menu position
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    setTimeout(() => navMenu.classList.add('active'), 100);
                }
            }, 100);
        });
    }

    updateLayoutCalculations() {
        // Update any height-based calculations
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // Update hero section height
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.minHeight = `${window.innerHeight}px`;
        }
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