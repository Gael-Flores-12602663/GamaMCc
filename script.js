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
