/* Complementos visuais; entradas e inclinação pertencem ao script principal. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  document.querySelectorAll('.btn').forEach(el => el.classList.add('fx-action'));
  const cards = [...document.querySelectorAll('article:not(.feature), .card')].filter(el => !el.closest('dialog'));
  cards.forEach(el => el.classList.add('fx-card'));
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  cards.forEach(card => {
    let frame = 0;
    let point;
    card.addEventListener('pointermove', event => {
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!card.isConnected || reduced.matches) return;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        card.style.setProperty('--fx-x', ((point.x - rect.left) / rect.width * 100).toFixed(1) + '%');
        card.style.setProperty('--fx-y', ((point.y - rect.top) / rect.height * 100).toFixed(1) + '%');
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
    });
  });
})();
