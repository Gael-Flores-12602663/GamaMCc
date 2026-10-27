const menu=document.getElementById('menu-toggle');
const nav=document.getElementById('nav');
const progress=document.getElementById('progress');
const topbar=document.getElementById('topbar');
function setMenu(open){
  nav.classList.toggle('open',open);
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
}
menu.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)});
document.addEventListener('click',event=>{
  if(nav.classList.contains('open')&&!nav.contains(event.target)&&!menu.contains(event.target))setMenu(false);
});
window.addEventListener('resize',()=>{if(window.innerWidth>760)setMenu(false)});
function updateScroll(){
  topbar.classList.toggle('scrolled',window.scrollY>30);
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.width=(max>0?window.scrollY/max*100:0)+'%';
}
window.addEventListener('scroll',updateScroll,{passive:true});
window.addEventListener('resize',updateScroll,{passive:true});
updateScroll();

/* Interações progressivas: o conteúdo permanece visível sem JavaScript. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  if (reduced.matches) return;

  const sections = document.querySelectorAll('.section, .statement, .join-card');
  const revealTargets = [];
  sections.forEach(section => {
    const candidates = section.matches('.statement, .join-card')
      ? [section]
      : Array.from(section.querySelectorAll('.section-tag, h2, .lead, .feature, .steps article, .join-card, .partner-panel, .social-card, .faq-items details, .about-visual'));
    candidates.forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', (index % 4) * 70 + 'ms');
      revealTargets.push(element);
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -22px 0px' });
    revealTargets.forEach(el => observer.observe(el));
    document.documentElement.classList.add('js-motion');
    // Evita elementos ocultos caso o navegador restaure a página ou pause a observação.
    window.addEventListener('pageshow', event => {
      if (event.persisted) revealTargets.forEach(el => el.classList.add('is-visible'));
    });
  }

  const particleLayer = document.querySelector('.hero-particles');
  if (particleLayer) {
    const count = finePointer.matches ? 22 : 12;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index++) {
      const particle = document.createElement('i');
      const random = (seed) => {
        const value = Math.sin((index + 1) * seed) * 10000;
        return value - Math.floor(value);
      };
      particle.style.setProperty('--x', (random(21.7) * 100).toFixed(1) + '%');
      particle.style.setProperty('--y', (20 + random(43.2) * 85).toFixed(1) + '%');
      particle.style.setProperty('--s', (2 + random(73.8) * 3).toFixed(1) + 'px');
      particle.style.setProperty('--d', (5 + random(17.5) * 8).toFixed(1) + 's');
      particle.style.setProperty('--delay', (-random(36.4) * 12).toFixed(1) + 's');
      particle.style.setProperty('--drift', (random(51.9) * 80 - 40).toFixed(1) + 'px');
      fragment.appendChild(particle);
    }
    particleLayer.appendChild(fragment);
  }

  if (finePointer.matches) {
    const hero = document.querySelector('.hero');
    const emblem = document.querySelector('[data-parallax]');
    if (hero && emblem) {
      let frame = 0;
      hero.addEventListener('pointermove', event => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const bounds = hero.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          hero.style.setProperty('--pointer-x', (x * 100).toFixed(1) + '%');
          hero.style.setProperty('--pointer-y', (y * 100).toFixed(1) + '%');
          emblem.style.setProperty('--px', ((x - .5) * 22).toFixed(1) + 'px');
          emblem.style.setProperty('--py', ((y - .5) * 16).toFixed(1) + 'px');
          frame = 0;
        });
      }, { passive: true });
      hero.addEventListener('pointerleave', () => {
        emblem.style.setProperty('--px', '0px');
        emblem.style.setProperty('--py', '0px');
      });
    }
    document.querySelectorAll('.feature').forEach(card => {
      let pending = 0;
      card.addEventListener('pointermove', event => {
        if (pending) return;
        pending = requestAnimationFrame(() => {
          const bounds = card.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          card.style.setProperty('--rx', ((.5 - y) * 5).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - .5) * 5).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          pending = 0;
        });
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const navSections = navLinks
    .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(entry => entry.section);
  if ('IntersectionObserver' in window && navSections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navSections.forEach(item => {
          const active = item.section === entry.target;
          item.link.classList.toggle('active', active);
          if (active) item.link.setAttribute('aria-current', 'location');
          else item.link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-20% 0px -60% 0px' });
    navSections.forEach(item => sectionObserver.observe(item.section));
  }
})();

/* Contato comercial: Gmail funciona mesmo se nenhum app de e-mail estiver configurado. */
(() => {
  const trigger = document.getElementById('proposal-trigger');
  const dialog = document.getElementById('proposal-dialog');
  const copy = document.getElementById('copy-proposal-email');
  const feedback = document.getElementById('proposal-feedback');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;
  trigger.addEventListener('click', event => {
    event.preventDefault();
    feedback.textContent = '';
    if (!dialog.open) dialog.showModal();
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  if (copy) {
    copy.addEventListener('click', async () => {
      const address = 'contato@gamamc.com';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(address);
        } else {
          const field = document.createElement('textarea');
          field.value = address;
          field.setAttribute('readonly', '');
          field.style.position = 'fixed';
          field.style.opacity = '0';
          document.body.appendChild(field);
          field.select();
          const success = document.execCommand('copy');
          field.remove();
          if (!success) throw new Error('copy failed');
        }
        feedback.textContent = 'E-mail copiado. Cole no serviço de e-mail de sua preferência.';
      } catch (error) {
        feedback.textContent = 'Selecione e copie: ' + address;
      }
    });
  }
})();
