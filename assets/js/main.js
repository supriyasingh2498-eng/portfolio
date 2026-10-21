// ============================================================
// Supriya Singh — Modern Interactive Portfolio Experience
// Features: Interactive Particle Mesh, Magnetic Cursor Attraction,
// Multi-layer Parallax, 3D Tilt Cards, Animated Stat Counters
// ============================================================

// ------------------------------------------------------------
// 1. Reveal-on-scroll with IntersectionObserver
// ------------------------------------------------------------
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 5, 4) * 0.08}s`;
    revealObserver.observe(el);
});

// ------------------------------------------------------------
// 2. Animated Numerical Counters
// ------------------------------------------------------------
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const countSpan = entry.target;
            const target = parseInt(countSpan.getAttribute('data-count'), 10);
            if (isNaN(target)) return;

            let current = 0;
            const duration = 1200; // ms
            const stepTime = Math.max(Math.floor(duration / (target || 1)), 40);

            const timer = setInterval(() => {
                current += 1;
                countSpan.textContent = current;
                if (current >= target) {
                    countSpan.textContent = target;
                    clearInterval(timer);
                }
            }, stepTime);

            counterObserver.unobserve(countSpan);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach((span) => {
    counterObserver.observe(span);
});

// ------------------------------------------------------------
// 3. Navbar scroll state
// ------------------------------------------------------------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ------------------------------------------------------------
// 4. Mobile menu toggle
// ------------------------------------------------------------
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

// ------------------------------------------------------------
// 5. Smooth scroll for anchor navigation
// ------------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId.length < 2) return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ------------------------------------------------------------
// 6. Interactive Magnetic Background Canvas (Constellation & Attractor)
// ------------------------------------------------------------
const canvas = document.getElementById('magnetic-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 16000), 75);
    const MOUSE_RADIUS = 160;
    const CONNECT_RADIUS = 110;

    const mouse = {
        x: null,
        y: null,
        vx: 0,
        vy: 0
    };

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseX = this.x;
            this.baseY = this.y;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.4 ? 'rgba(216, 184, 118, ' : 'rgba(247, 244, 238, ';
            this.alpha = Math.random() * 0.35 + 0.15;
        }

        update() {
            // Natural float movement
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Magnetic response to cursor
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.hypot(dx, dy);

                if (dist < MOUSE_RADIUS) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                    // Magnetic spring towards the cursor
                    const pullX = (dx / dist) * force * 3;
                    const pullY = (dy / dist) * force * 3;
                    this.x += pullX;
                    this.y += pullY;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Inter-particle connecting lines
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < CONNECT_RADIUS) {
                    const lineAlpha = (1 - dist / CONNECT_RADIUS) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(185, 146, 78, ${lineAlpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Connection to mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < MOUSE_RADIUS) {
                    const mouseAlpha = (1 - dist / MOUSE_RADIUS) * 0.28;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(216, 184, 118, ${mouseAlpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

// ------------------------------------------------------------
// 7. Interactive Ambient Cursor Glow
// ------------------------------------------------------------
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow) {
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        cursorGlow.style.opacity = '1';
    });

    window.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    function renderGlow() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        cursorGlow.style.left = `${currentX}px`;
        cursorGlow.style.top = `${currentY}px`;
        requestAnimationFrame(renderGlow);
    }
    renderGlow();
}

// ------------------------------------------------------------
// 8. Magnetic Buttons & Interactive Elements (Spring Pull)
// ------------------------------------------------------------
const magneticButtons = document.querySelectorAll('.magnetic-btn, .magnetic-pill');
magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.35;
        const deltaY = (e.clientY - centerY) * 0.35;

        btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
    });
});

// ------------------------------------------------------------
// 9. 3D Tilt Magnetic Cards on Hover
// ------------------------------------------------------------
const tiltCards = document.querySelectorAll('.magnetic-card');
tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
});

// ------------------------------------------------------------
// 10. Multi-layer Scroll Parallax & Floating Orbs
// ------------------------------------------------------------
const parallaxElements = document.querySelectorAll('[data-parallax]');
const parallaxBgLayers = document.querySelectorAll('.parallax-bg');

let lastScrollY = window.scrollY;
let isTicking = false;

function applyParallax() {
    const scrollY = window.scrollY;

    parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
        const yOffset = scrollY * speed * -1;
        el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
    });

    parallaxBgLayers.forEach((bg) => {
        const speed = parseFloat(bg.getAttribute('data-speed')) || 0.2;
        const yOffset = scrollY * speed;
        bg.style.transform = `translate3d(0, ${yOffset}px, 0)`;
    });

    isTicking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!isTicking) {
        window.requestAnimationFrame(applyParallax);
        isTicking = true;
    }
}, { passive: true });
