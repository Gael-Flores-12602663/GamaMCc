/* Efeitos progressivos: não dependem de imagens ou bibliotecas externas. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const revealSelectors = ['.section-tag', '.section-title', '.section-subtitle'];
  const reveal = [...document.querySelectorAll(revealSelectors.join(','))];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fx-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 45px 0px' });
    reveal.forEach(el => { el.classList.add('fx-reveal'); observer.observe(el); });
  }
  const cardSelector = 'article, .card, .feature-card, .vip-card, .news-card';
  const cards = [...document.querySelectorAll(cardSelector)].filter(el => !el.closest('dialog'));
  cards.forEach(el => el.classList.add('fx-card'));
  document.querySelectorAll('.btn').forEach(el => el.classList.add('fx-action'));
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cards.forEach(card => card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--fx-x', ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
      card.style.setProperty('--fx-y', ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
    }, { passive: true }));
  }
})();
