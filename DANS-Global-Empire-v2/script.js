const brandTheme=document.createElement('link');
brandTheme.rel='stylesheet';
brandTheme.href='theme.css?v=20261012-navy';
document.head.appendChild(brandTheme);

const menuBtn=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav');
const header=document.querySelector('.site-header');

if(menuBtn&&nav){
  menuBtn.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',String(open));
    menuBtn.textContent=open?'✕':'☰';
  });

  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.textContent='☰';
  }));
}

if(header){
  const syncHeader=()=>header.classList.toggle('scrolled',window.scrollY>12);
  syncHeader();
  window.addEventListener('scroll',syncHeader,{passive:true});
}

const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.1,rootMargin:'0px 0px -24px 0px'});

document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
