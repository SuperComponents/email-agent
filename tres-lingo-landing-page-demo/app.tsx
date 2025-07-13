// Smooth scrolling for navigation links
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

// Add scroll animation for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and steps
document.querySelectorAll('.feature-card, .step, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Add loading animation to chat messages
const chatMessages = document.querySelectorAll('.chat-message');
chatMessages.forEach((msg, index) => {
    msg.style.animationDelay = `${index * 0.5}s`;
});

// Mobile menu toggle (for future implementation)
const mobileMenuButton = document.createElement('button');
mobileMenuButton.className = 'mobile-menu-button';
mobileMenuButton.innerHTML = '☰';
mobileMenuButton.style.display = 'none';

// Add mobile menu button styles
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .mobile-menu-button {
            display: block !important;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-dark);
        }
    }
`;
document.head.appendChild(style);

// Add to navbar
const navbar = document.querySelector('.nav-wrapper');
if (navbar) {
    navbar.appendChild(mobileMenuButton);
}

console.log('Trace Lingo landing page initialized');