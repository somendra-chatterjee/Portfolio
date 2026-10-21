'use strict';
(() => {
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const icons={linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3c0-4 6-4 6 0v4"/>',email:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 5 9 8 9-8"/>',phone:'<path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c0 2-2 3-4 2C9 19 5 15 3 7c-1-2 0-4 2-4Z"/>',whatsapp:'<path d="M21 11.5A9 9 0 0 1 7.5 19.3L3 21l1.7-4.5A9 9 0 1 1 21 11.5Z"/><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-2 3 2c-1 3-4 2-7 0s-5-6-2-8Z"/>'};
 function icon(kind){return '<svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[kind]+'</svg>';}
 $$('a').forEach(a=>{const h=a.getAttribute('href')||'';const kind=h.includes('linkedin.com')?'linkedin':h.startsWith('mailto:')?'email':h.includes('wa.me')?'whatsapp':h.startsWith('tel:')?'phone':null;if(kind)a.insertAdjacentHTML('afterbegin',icon(kind));});
 const extra=$$('[data-extra-project]'), more=$('#more-projects');
 function showExtra(show){extra.forEach(a=>a.hidden=!show);more.setAttribute('aria-expanded',String(show));more.textContent=show?'Show featured projects':'View all 6 projects';}
 showExtra(false);
 more.addEventListener('click',()=>showExtra(more.getAttribute('aria-expanded')!=='true'));
 function revealExtra(){if(extra.some(p=>'#'+p.id===location.hash))showExtra(true);}
 window.addEventListener('hashchange',revealExtra);revealExtra();
 $$('[data-view="full"],[data-expand]').forEach(b=>b.addEventListener('click',()=>showExtra(true)));
 $$('[data-view="overview"],[data-collapse]').forEach(b=>b.addEventListener('click',()=>showExtra(false)));
 $$('[data-career]').forEach(b=>b.addEventListener('click',()=>$$('#experience details').forEach(d=>d.open=b.dataset.career==='open')));
 const cd=$('#contact-dialog');$('#contact-open').addEventListener('click',()=>cd.showModal());
 let previousExtras;window.addEventListener('beforeprint',()=>{previousExtras=more.getAttribute('aria-expanded')==='true';showExtra(true);});window.addEventListener('afterprint',()=>showExtra(previousExtras));
 $('#share-profile').addEventListener('click',async()=>{const url='https://somendra-chatterjee.github.io/Portfolio/';try{if(navigator.share)await navigator.share({title:'Somendra Chatterjee | Operations & Quality Leadership',url});else{await navigator.clipboard.writeText(url);$('#toast').textContent='Profile link copied.';$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),4000);}}catch(e){if(e.name!=='AbortError'){const d=$('#copy-dialog');$('#copy-fallback').value=url;d.showModal();$('#copy-fallback').select();}}});
})();
