import { initParticles } from './particles.js';
import { initCountdown } from './countdown.js';
import { initTracks } from './tracks.js';
import { initSchedule } from './schedule.js';
import { initTeamMatcher } from './teamMatcher.js';
import { initRegistration } from './registration.js';
import { initFAQ } from './faq.js';
import { initDashboard } from './dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all subsystems
  initParticles();
  initCountdown();
  initTracks();
  initSchedule();
  initTeamMatcher();
  initRegistration();
  initDashboard();
  initFAQ();

  // Animated Numbers Counter for Hero Stats
  const statNumbers = document.querySelectorAll('.counter-val');
  let counted = false;

  function runCounters() {
    statNumbers.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const prefix = stat.getAttribute('data-prefix') || '';
      const suffix = stat.getAttribute('data-suffix') || '';
      const duration = 1800;
      const start = 0;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(start + (target - start) * ease);

        stat.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          stat.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        runCounters();
      }
    });
  }, { threshold: 0.3 });

  const heroStats = document.querySelector('.hero-stats-row');
  if (heroStats) observer.observe(heroStats);

  // Active Navigation Highlight on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset + 200;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      soundEngine.playClick();
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }
});
