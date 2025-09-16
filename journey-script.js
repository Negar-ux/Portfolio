// Journey Page Interactive Elements

document.addEventListener('DOMContentLoaded', function() {
    // Animate statistics counters
    animateCounters();

    // Add scroll animations
    addScrollAnimations();

    // Add skill category interactions
    addSkillInteractions();

    // Add timeline hover effects
    addTimelineEffects();
});

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        // Format the number display
        const displayValue = Math.floor(current);
        if (element.textContent.includes('+')) {
            element.textContent = displayValue + '+';
        } else {
            element.textContent = displayValue;
        }
    }, 16);
}

// Scroll Animations - Optimized for performance
function addScrollAnimations() {
    const animatedElements = document.querySelectorAll('.timeline-item, .skill-category, .publication-card, .stat-item');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        observer.observe(element);
    });
}

// Skill Category Interactions
function addSkillInteractions() {
    const skillCategories = document.querySelectorAll('.skill-category');

    skillCategories.forEach(category => {
        category.addEventListener('mouseenter', function() {
            // Add subtle animation to skill badges
            const badges = this.querySelectorAll('.skill-badge');
            badges.forEach((badge, index) => {
                setTimeout(() => {
                    badge.style.transform = 'scale(1.05)';
                }, index * 50);
            });
        });

        category.addEventListener('mouseleave', function() {
            // Reset skill badges
            const badges = this.querySelectorAll('.skill-badge');
            badges.forEach(badge => {
                badge.style.transform = 'scale(1)';
            });
        });
    });
}

// Timeline Effects
function addTimelineEffects() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            // Highlight the timeline accent
            const accent = this.querySelector('.timeline-accent');
            if (accent) {
                accent.style.transform = 'scale(1.2)';
                accent.style.transition = 'transform 0.3s ease';
            }
        });

        item.addEventListener('mouseleave', function() {
            // Reset the timeline accent
            const accent = this.querySelector('.timeline-accent');
            if (accent) {
                accent.style.transform = 'scale(1)';
            }
        });
    });
}

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for the page
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Removed parallax effect for better scroll performance