// Dark Mode Toggle Functionality
(function() {
    'use strict';

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply theme on page load
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Get the theme toggle button
        const themeToggle = document.getElementById('theme-toggle');

        if (!themeToggle) {
            console.warn('Theme toggle button not found');
            return;
        }

        // Toggle theme function
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            // Update theme
            document.documentElement.setAttribute('data-theme', newTheme);

            // Save preference
            localStorage.setItem('theme', newTheme);

            // Optional: Log for debugging
            console.log('Theme switched to:', newTheme);
        }

        // Add click event listener
        themeToggle.addEventListener('click', toggleTheme);

        // Optional: Add keyboard support (Enter or Space)
        themeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    });
})();
