// Force image loading
document.addEventListener('DOMContentLoaded', function() {
    // Force immediate loading of critical images
    const criticalImages = document.querySelectorAll('img[loading="eager"]');
    criticalImages.forEach(img => {
        if (!img.complete) {
            img.loading = 'eager';
            img.setAttribute('loading', 'eager');
        }
    });

    // Ensure profile image loads immediately
    const profileImg = document.querySelector('.profile-image img');
    if (profileImg && !profileImg.complete) {
        // Force reload if image hasn't loaded
        profileImg.src = profileImg.src;
    }
    // Mobile hamburger menu functionality
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('#nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for anchor links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll effect to navigation
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '#ffffff';
            header.style.backdropFilter = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe project cards for animation
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Observe research items for animation
    const researchItems = document.querySelectorAll('.research-item, .feature');
    researchItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
    
    // Add hover effect to project cards
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Improved image loading with error handling
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Skip if image is already loaded
        if (img.complete && img.naturalHeight !== 0) {
            img.style.opacity = '1';
            return;
        }

        // Set initial state
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';

        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });

        img.addEventListener('error', function() {
            console.warn('Failed to load image:', this.src);
            this.style.opacity = '1'; // Show broken image
        });

        // Force image to start loading if it hasn't already
        if (!img.complete) {
            const src = img.src;
            img.src = '';
            img.src = src;
        }
    });
    
    // Add typing effect to hero text (optional)
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }

        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }

    // Initialize page navigation tracking
    initPageNavigation();
});

// Page Navigation Progress Tracking
function initPageNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');

    if (!navItems.length || !sections.length) return;

    // Smooth scrolling for navigation links
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Track scroll position and highlight current section
    function updateActiveSection() {
        const scrollPos = window.scrollY + window.innerHeight / 2; // Use middle of viewport

        let currentSection = '';

        // Find the section that's most visible in the viewport
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;

            // Check if the middle of the viewport is within this section
            if (scrollPos >= sectionTop && scrollPos <= sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });

        // Special handling for the last section (contact) when near bottom of page
        if (!currentSection || window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) {
                currentSection = lastSection.getAttribute('id');
            }
        }

        // If no section found with middle check, find the closest one
        if (!currentSection) {
            let minDistance = Infinity;
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const distance = Math.abs(scrollPos - sectionTop);
                if (distance < minDistance) {
                    minDistance = distance;
                    currentSection = section.getAttribute('id');
                }
            });
        }

        // Update active navigation item
        navItems.forEach(item => {
            const itemSection = item.getAttribute('data-section');
            if (itemSection === currentSection) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Listen for scroll events with throttling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveSection, 10);
    });

    // Initial check
    updateActiveSection();
}