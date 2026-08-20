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
    const mobileClose = document.getElementById('mobile-close');

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
        navMenu.querySelectorAll('.dropdown.open').forEach(function(item) {
            item.classList.remove('open');
        });
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        if (mobileClose) {
            mobileClose.addEventListener('click', closeMobileMenu);
        }

        // Dropdowns open on tap, since :hover is unavailable on touch devices
        navMenu.querySelectorAll('.dropdown > .dropdown-toggle').forEach(function(toggle) {
            toggle.addEventListener('click', function(event) {
                if (window.innerWidth > 768) return;
                event.preventDefault();
                toggle.parentElement.classList.toggle('open');
            });
        });

        // Close the menu once a destination is chosen
        navMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (!link.classList.contains('dropdown-toggle')) {
                    closeMobileMenu();
                }
            });
        });

        // Reset the menu if the viewport grows back to desktop width
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                closeMobileMenu();
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

        // Update active navigation based on current section
        updateActiveNavigation();

        lastScrollTop = scrollTop;
    });

    // Function to update active navigation based on current section
    function updateActiveNavigation() {
        // Don't update navigation on mobile view
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            return;
        }

        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a');

        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');

            // Check if this link matches the current section
            const href = link.getAttribute('href');

            // Special case for home section - only activate home links, clear all dropdown items
            if (current === 'home') {
                if (href === '#home' || href === 'index.html' || href === '#') {
                    link.classList.add('active');
                }
                // Explicitly ensure dropdown toggle and menu items don't get active class on home
                if (link.classList.contains('dropdown-toggle') ||
                    href === '#product-design' || href === '#research' ||
                    href === 'index.html#product-design' || href === 'index.html#research') {
                    link.classList.remove('active');
                }
            }
            // For other sections, don't add active class to dropdown toggle buttons
            else if ((href === `#${current}` || href === `index.html#${current}`) && !link.classList.contains('dropdown-toggle')) {
                link.classList.add('active');
            }
            // Special case for contact section (Get in touch button)
            else if (current === 'contact' && link.classList.contains('contact-nav')) {
                link.classList.add('active');
            }
        });
    }

    // Call once on page load
    updateActiveNavigation();
    
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

    // Initialize navigation toggle functionality
    initNavigationToggle();

});

// Page Navigation Progress Tracking
function initPageNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    // Track only the sections the rail actually links to, so a trailing
    // section can never claim a highlight no rail item can show.
    const sections = [...navItems]
        .map(item => document.getElementById(item.getAttribute('href').substring(1)))
        .filter(Boolean);

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

        // At the very bottom the final section can be too short to ever hold
        // the viewport midpoint, so pin it there. This must not also fire when
        // simply no section matched -- above the first section that would jump
        // the highlight to the end of the page.
        const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100;
        if (atBottom) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) {
                currentSection = lastSection.getAttribute('id');
            }
        }

        // Above the first section, or in a gap between two, fall back to the
        // nearest section rather than the last one.
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

// Navigation toggle functionality
function initNavigationToggle() {
    // Get or create the toggle button
    const pageNav = document.querySelector('.page-navigation');
    if (!pageNav) {
        console.log('Page navigation not found');
        return;
    }

    const navTitle = pageNav.querySelector('.nav-title');
    if (!navTitle) {
        console.log('Nav title not found');
        return;
    }

    console.log('Initializing navigation toggle');

    // Create toggle button if it doesn't exist
    let toggleBtn = navTitle.querySelector('.nav-toggle');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.className = 'nav-toggle';
        toggleBtn.innerHTML = '◀';
        toggleBtn.setAttribute('aria-label', 'Hide navigation menu');
        navTitle.appendChild(toggleBtn);
    }

    // Load saved state from localStorage
    const isCollapsed = localStorage.getItem('pageNavCollapsed') === 'true';
    if (isCollapsed) {
        pageNav.classList.add('collapsed');
    }

    // Toggle functionality
    function toggleNavigation(e) {
        e.preventDefault();
        e.stopPropagation();

        pageNav.classList.toggle('collapsed');
        const collapsed = pageNav.classList.contains('collapsed');

        // Update button icon and label
        toggleBtn.innerHTML = collapsed ? '▶' : '◀';
        toggleBtn.setAttribute('aria-label', collapsed ? 'Show navigation menu' : 'Hide navigation menu');

        // Save state to localStorage
        localStorage.setItem('pageNavCollapsed', collapsed);

        // Update aria attributes for accessibility
        toggleBtn.setAttribute('aria-expanded', (!collapsed).toString());
    }

    toggleBtn.addEventListener('click', toggleNavigation);

    // Also allow clicking on the collapsed navigation tab to expand
    pageNav.addEventListener('click', function(e) {
        if (pageNav.classList.contains('collapsed') && e.target === pageNav) {
            toggleNavigation(e);
        }
    });

    // Set initial aria attributes and button icon
    toggleBtn.setAttribute('aria-expanded', (!isCollapsed).toString());
    toggleBtn.innerHTML = isCollapsed ? '▶' : '◀';
    toggleBtn.setAttribute('aria-label', isCollapsed ? 'Show navigation menu' : 'Hide navigation menu');
}

