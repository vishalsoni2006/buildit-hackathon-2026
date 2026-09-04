/**
 * HTML5 Canvas Particle System with glowing embers and shooting stars
 */
export function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 16), 85);

  // Embers and cosmic dust
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.7 - 0.2, // rising gently
      color: Math.random() > 0.4 ? 'rgba(255, 160, 40, ' : 'rgba(255, 215, 120, ',
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2
    });
  }

  // Shooting stars
  const shootingStars = [];
  function createShootingStar() {
    if (Math.random() < 0.04 && shootingStars.length < 3) {
      shootingStars.push({
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.4,
        length: Math.random() * 90 + 50,
        speed: Math.random() * 9 + 7,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 35 + 25
      });
    }
  }

  let mouse = { x: -1000, y: -1000 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  let time = 0;
  function animate() {
    time += 0.03;
    ctx.clearRect(0, 0, width, height);

    // Draw embers
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse subtle repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        p.x += (dx / dist) * 1.5;
        p.y += (dy / dist) * 1.5;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const currentAlpha = Math.max(0.1, p.alpha * (0.6 + 0.4 * Math.sin(time * p.pulseSpeed + p.pulseOffset)));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + currentAlpha + ')';
      ctx.shadowBlur = p.radius > 1.5 ? 8 : 0;
      ctx.shadowColor = 'rgba(255, 140, 0, 0.8)';
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Shooting stars
    createShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.life++;
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;

      const tailX = s.x - Math.cos(s.angle) * s.length;
      const tailY = s.y - Math.sin(s.angle) * s.length;

      const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 235, 180, ${s.opacity})`);
      grad.addColorStop(0.3, `rgba(255, 150, 40, ${s.opacity * 0.7})`);
      grad.addColorStop(1, `rgba(255, 100, 0, 0)`);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      if (s.life > s.maxLife) {
        s.opacity -= 0.06;
        if (s.opacity <= 0) {
          shootingStars.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}
