/**
 * ============================================
 * MedAxis Healthcare - Main JavaScript File
 * ============================================
 * Features: Form handling, animations, counters, 
 *           call functionality, notifications, utilities
 * Version: 2.0
 * ============================================
 */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    
    // ========================================
    // 1. CONTACT FORM HANDLING
    // ========================================
    const form = document.getElementById("contactForm");
    const popup = document.getElementById("successPopup");
    
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email || !data.message) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Show success & reset
            if (popup) {
                popup.style.display = "block";
                setTimeout(() => {
                    popup.style.display = "none";
                }, 4000);
            }
            form.reset();
            showNotification('Thank you! We will contact you soon.', 'success');
            
            // Optional: Send to backend
            // submitFormToBackend(data);
        });
    }

    // ========================================
    // 2. SCROLL ANIMATIONS (Intersection Observer)
    // ========================================
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    // Observe animated elements
    const animatedElements = document.querySelectorAll(
        ".hero-content, .card, .why-box, .testimonial-card, .blog-card, .product-card, .value-item, .team-member, .service-item"
    );
    animatedElements.forEach(el => observer.observe(el));

    // ========================================
    // 3. STATISTICS COUNTER ANIMATION
    // ========================================
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute("data-target"));
        const suffix = target > 1000000 ? "M+" : target > 1000 ? "+" : "";
        let current = 0;
        const increment = target / 150; // Adjust speed here
        
        const update = () => {
            current += increment;
            if (current < target) {
                element.innerText = Math.floor(current).toLocaleString() + suffix;
                requestAnimationFrame(update);
            } else {
                element.innerText = target.toLocaleString() + suffix;
            }
        };
        update();
    };

    const statsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains("counted")) {
                entry.target.classList.add("counted");
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll(".counter").forEach(el => statsObserver.observe(el));

    // ========================================
    // 4. CALL NOW BUTTON FUNCTIONALITY
    // ========================================
    
    // Handle dynamic "Call Now" buttons (including map popup)
    document.addEventListener('click', function(e) {
        const callBtn = e.target.closest('[data-action="call-now"]');
        if (callBtn) {
            e.preventDefault();
            const phone = callBtn.getAttribute('data-phone') || '+6561234567';
            const location = callBtn.getAttribute('data-location') || 'MedAxis Hospital';
            
            handleCallAction(phone, location);
        }
    });
    
    // Also handle legacy ID-based button (for map popup)
    document.addEventListener('click', function(e) {
        if (e.target.id === 'callNowBtn' || e.target.closest('#callNowBtn')) {
            e.preventDefault();
            handleCallAction('+6561234567', 'Singapore Hospital');
        }
    });
    
    function handleCallAction(phone, location) {
        // Clean phone number for tel: link (remove spaces, dashes, etc.)
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        // Copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(phone).then(() => {
                showNotification('📞 Number copied to clipboard! Dialing...', 'success');
                // Open dialer after brief delay
                setTimeout(() => {
                    window.location.href = `tel:${cleanPhone}`;
                }, 1200);
                // Log the call
                logCallClick(location, phone);
            }).catch(() => {
                // Fallback: just open dialer
                fallbackDialer(cleanPhone);
            });
        } else {
            // Fallback for older browsers or HTTP
            fallbackDialer(cleanPhone);
        }
    }
    
    function fallbackDialer(phone) {
        showNotification('📞 Opening dialer...', 'info');
        setTimeout(() => {
            window.location.href = `tel:${phone}`;
        }, 800);
    }

    // ========================================
    // 5. NOTIFICATION SYSTEM
    // ========================================
    window.showNotification = function(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.medaxis-notification').forEach(n => n.remove());
        
        // Icons by type
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        // Colors by type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#8b0000',
            warning: '#ffc107'
        };
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'medaxis-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
            max-width: 350px;
            line-height: 1.4;
        `;
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    };

    // Add animation keyframes if not present
    if (!document.getElementById('medaxis-animations')) {
        const style = document.createElement('style');
        style.id = 'medaxis-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // 6. CALL LOGGING (Optional Backend)
    // ========================================
    window.logCallClick = async function(location, phone) {
        try {
            // Replace with your actual backend URL
            const backendUrl = 'https://your-server.com/api/log-call';
            
            await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: location,
                    phone: phone,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    pageUrl: window.location.href,
                    referrer: document.referrer
                }),
                // Don't wait too long - don't block UX
                signal: AbortSignal.timeout(3000)
            });
            console.log('✅ Call logged:', location);
        } catch (error) {
            // Silent fail - never break user experience
            console.log('⚠️ Call logging skipped (offline/server error)');
        }
    };

    // ========================================
    // 7. MOBILE MENU TOGGLE
    // ========================================
    function initMobileMenu() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        // Check if we're on mobile
        if (window.innerWidth <= 768) {
            // Create mobile menu button if needed
            if (!document.querySelector('.mobile-menu-btn')) {
                const menuBtn = document.createElement('button');
                menuBtn.className = 'mobile-menu-btn';
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                menuBtn.style.cssText = `
                    display: block;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #8b0000;
                    padding: 5px;
                `;
                
                const navContainer = nav.querySelector('.nav-container') || nav;
                navContainer.insertBefore(menuBtn, navContainer.firstChild);
                
                // Toggle menu
                menuBtn.addEventListener('click', function() {
                    const navLinks = nav.querySelector('ul');
                    if (navLinks) {
                        const isHidden = navLinks.style.display === 'none' || !navLinks.style.display;
                        navLinks.style.display = isHidden ? 'flex' : 'none';
                        if (isHidden) {
                            navLinks.style.flexDirection = 'column';
                            navLinks.style.position = 'absolute';
                            navLinks.style.top = '100%';
                            navLinks.style.left = '0';
                            navLinks.style.right = '0';
                            navLinks.style.background = 'white';
                            navLinks.style.padding = '1rem';
                            navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        }
                    }
                });
            }
        }
        
        // Handle resize
        window.addEventListener('resize', function() {
            const menuBtn = document.querySelector('.mobile-menu-btn');
            const navLinks = nav.querySelector('ul');
            
            if (window.innerWidth > 768) {
                if (menuBtn) menuBtn.style.display = 'none';
                if (navLinks) {
                    navLinks.style.display = 'flex';
                    navLinks.style.flexDirection = 'row';
                    navLinks.style.position = 'static';
                    navLinks.style.boxShadow = 'none';
                }
            } else {
                if (menuBtn) menuBtn.style.display = 'block';
            }
        });
    }
    initMobileMenu();

    // ========================================
    // 8. SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== 'javascript:void(0)') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ========================================
    // 9. NAVIGATION SCROLL EFFECT
    // ========================================
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        if (window.scrollY > 100) {
            nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            nav.style.boxShadow = '0 3px 15px rgba(0,0,0,0.08)';
            nav.style.background = '#fff';
        }
        lastScrollY = window.scrollY;
    });

    // ========================================
    // 10. NEWSLETTER SUBSCRIPTION (Blog Page)
    // ========================================
    const newsletterForm = document.querySelector('.newsletter button');
    if (newsletterForm) {
        newsletterForm.addEventListener('click', function(e) {
            e.preventDefault();
            const emailInput = document.querySelector('.newsletter input[type="email"]');
            const email = emailInput.value;
            
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Please enter a valid email', 'error');
                return;
            }
            
            showNotification('Thank you for subscribing!', 'success');
            emailInput.value = '';
        });
    }

    // ========================================
    // 11. UTILITY FUNCTIONS
    // ========================================
    window.MedAxisUtils = {
        // Format phone number for display
        formatPhone: (phone) => {
            const cleaned = ('' + phone).replace(/\D/g, '');
            const match = cleaned.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
            if (match) {
                return `+${match[1]} ${match[2]} ${match[3]}`;
            }
            return phone;
        },
        
        // Validate email
        isValidEmail: (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        // Show loading spinner
        showLoading: (message = 'Loading...') => {
            const spinner = document.createElement('div');
            spinner.id = 'medaxis-loading';
            spinner.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
                font-weight: 600;
            `;
            spinner.innerHTML = `
                <div style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid #8b0000; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <div>${message}</div>
            `;
            document.body.appendChild(spinner);
        },
        
        hideLoading: () => {
            const spinner = document.getElementById('medaxis-loading');
            if (spinner) spinner.remove();
        },
        
        // Debounce function for performance
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Format date
        formatDate: (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // ========================================
    // 12. CONSOLE BRANDING
    // ========================================
    console.log('%c 🏥 MedAxis Healthcare Solutions ', 'background: #8b0000; color: white; font-size: 18px; padding: 12px; border-radius: 8px; font-weight: bold;');
    console.log('%c Transforming Healthcare Through Innovation | v2.0 ', 'color: #8b0000; font-size: 12px; margin-top: 5px;');
    console.log('%c Contact: info@medaxis.com | +254 712 345 678 ', 'color: #666; font-size: 11px;');

}); // End DOMContentLoaded

// ========================================
// GLOBAL HELPER: Add Call Action to Any Element
// Usage: <button data-action="call-now" data-phone="+6512345678" data-location="Clinic Name">
// ========================================
function addCallAction(element, phone, location) {
    element.setAttribute('data-action', 'call-now');
    element.setAttribute('data-phone', phone);
    element.setAttribute('data-location', location || 'MedAxis');
    element.style.cursor = 'pointer';
}

// Auto-initialize elements with data-call attribute
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-call]').forEach(el => {
        const phone = el.getAttribute('data-call');
        const location = el.getAttribute('data-location') || 'MedAxis';
        addCallAction(el, phone, location);
    });
});

// ========================================
// OPTIONAL: Form Backend Submission
// ========================================
async function submitFormToBackend(data) {
    try {
        await fetch('https://your-server.com/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...data,
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href
            }),
            signal: AbortSignal.timeout(5000)
        });
        console.log('✅ Form submitted to backend');
    } catch (error) {
        console.log('⚠️ Backend submission failed (offline)');
    }
}