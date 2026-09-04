import { soundEngine } from './audio.js';

export function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  const searchInput = document.getElementById('faq-search-input');

  items.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        const isOpen = item.classList.contains('open');

        // Close other items
        items.forEach(other => {
          if (other !== item) other.classList.remove('open');
        });

        if (isOpen) {
          item.classList.remove('open');
        } else {
          item.classList.add('open');
        }
      });
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      items.forEach(item => {
        const question = item.querySelector('.faq-question-btn').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

        if (question.includes(query) || answer.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
}
