document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Background Animation ---
    const canvas = document.getElementById('background-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        let particles = [];
        const particleCount = 70;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.1) this.size -= 0.01;
            }
            draw() {
                ctx.fillStyle = 'rgba(0, 245, 212, 0.8)';
                ctx.strokeStyle = 'rgba(155, 93, 229, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].size <= 0.1) {
                    particles.splice(i, 1);
                    i--;
                    particles.push(new Particle());
                }
            }
            requestAnimationFrame(animateParticles);
        }
        initParticles();
        animateParticles();
        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initParticles();
        });
    }

    // --- Main App Initialization ---
    
    // Buttons
    const startBtn = document.getElementById('start-btn');
    const ctaBtn = document.getElementById('cta-btn');
    const backBtn = document.getElementById('back-btn');
    const menuBtn = document.getElementById('menu-btn');

    // --- Event Listeners ---
    startBtn.addEventListener('click', Engine.init);
    backBtn.addEventListener('click', Engine.goBack);
    menuBtn.addEventListener('click', () => window.location.href = '../quests.html');
    ctaBtn.addEventListener('click', () => {
        // Handle CTA - can be expanded in Engine
        console.log("CTA Clicked!");
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.close();
        }
    });

    // Initial load
    setTimeout(() => UI.switchScreen('start'), 1000);
});
