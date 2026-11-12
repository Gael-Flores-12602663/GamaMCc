(() => {
'use strict';
// Informa armazenamento local e recursos externos presentes no site.
const key='gama_privacy_notice_v1';
const notice=document.createElement('aside');notice.className='privacy-notice';notice.setAttribute('aria-label','Privacidade e armazenamento');
notice.innerHTML='<strong>Sua privacidade no GamaMC</strong><p>O site utiliza o selo oficial TrustedSite. Esse fornecedor recebe dados técnicos de acesso e pode usar cookies e armazenamento local para exibir o selo e contar visitas, inclusive ao abrir sua validação. A hospedagem também pode registrar dados técnicos. Guardamos sua preferência de exibição deste aviso neste navegador. Na loja, a sessão de login e a seleção de plano são necessárias ao serviço. <a href="/politicas.html#cookies">Entenda os cookies e seus direitos</a>.</p><button type="button">Entendi e fechar</button>';
try{notice.hidden=localStorage.getItem(key)==='dismissed';}catch{}
notice.querySelector('button').addEventListener('click',()=>{notice.hidden=true;try{localStorage.setItem(key,'dismissed');}catch{}});
document.body.append(notice);
const settings=document.createElement('button');settings.type='button';settings.className='privacy-settings';settings.textContent='Privacidade e cookies';settings.addEventListener('click',()=>{notice.hidden=false;notice.querySelector('button').focus();});
(document.querySelector('footer')||document.querySelector('main')||document.body).append(settings);
})();