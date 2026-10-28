
/* GamaMC Portal: somente dados públicos, sem segredos nem endpoints administrativos. */
(() => {
  'use strict';
  const gallery = document.getElementById('portal-lightbox');
  const image = document.getElementById('portal-lightbox-img');
  const close = document.getElementById('portal-lightbox-close');
  if (gallery && image && typeof gallery.showModal === 'function') {
    document.querySelectorAll('[data-gallery-src]').forEach(button => {
      button.addEventListener('click', () => {
        const source = button.getAttribute('data-gallery-src');
        if (!['/banner-gamamc.png', '/logo-gamamc.png'].includes(source)) return;
        image.src = source;
        image.alt = button.getAttribute('data-gallery-alt') || 'Imagem oficial do GamaMC';
        if (!gallery.open) gallery.showModal();
      });
    });
    close?.addEventListener('click', () => gallery.close());
    gallery.addEventListener('click', event => { if (event.target === gallery) gallery.close(); });
    gallery.addEventListener('close', () => { image.removeAttribute('src'); });
  }

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && typeof value === 'string' && value.trim()) element.textContent = value;
  };
  const newsList = document.getElementById('portal-news-list');
  const safeDate = input => {
    const value = String(input || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'DATA A CONFIRMAR';
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return 'DATA A CONFIRMAR';
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).format(date).toUpperCase();
  };
  fetch('/portal-publico.json', { cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error('Configuração indisponível'); return response.json(); })
    .then(data => {
      if (data.status && data.status.phase === 'prelaunch') {
        setText('public-status', 'PRÉ-LANÇAMENTO');
        setText('public-ip', 'A divulgar');
        setText('public-players', 'Disponível após integração');
        if (typeof data.status.version === 'string') setText('public-version', data.status.version);
      }
      if (!newsList || !Array.isArray(data.news)) return;
      const entries = data.news.slice(0, 6).filter(item => item && typeof item.title === 'string' && typeof item.summary === 'string' && item.title.length <= 120 && item.summary.length <= 500);
      if (!entries.length) return;
      const fragment = document.createDocumentFragment();
      for (const item of entries) {
        const article = document.createElement('article');
        article.className = 'portal-news-card';
        const time = document.createElement('small');
        time.textContent = safeDate(item.date) + ' / ' + String(item.category || 'ATUALIZAÇÕES').slice(0, 30).toUpperCase();
        const heading = document.createElement('h3');
        heading.textContent = item.title;
        const description = document.createElement('p');
        description.textContent = item.summary;
        article.append(time, heading, description);
        fragment.appendChild(article);
      }
      newsList.replaceChildren(fragment);
    })
    .catch(() => { /* Fallback de notícias e status já visível no HTML. */ });
})();
