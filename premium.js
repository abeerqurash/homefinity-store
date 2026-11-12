(function(){
const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const cur=file=='product.html'?'products.html':file;
document.querySelectorAll('.header-menu,.footer-menu-link').forEach(a=>{const h=(a.getAttribute('href')||'').split('?')[0].toLowerCase();a.classList.toggle('w--current',h==cur)});
const hd=document.querySelector('.main-header');
if(hd){const f=()=>hd.classList.toggle('stuck',scrollY>10);addEventListener('scroll',f,{passive:true});f()}
const SEL='.nc-bar,.nc-wrap>h1,.nc-count,.nc-card,.nc-det>div,.nc-rel,.inner section .w-container,.inner section .w-layout-blockcontainer,.footer-widgets-box';
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'}):null;
let n=0;
function scan(){document.querySelectorAll(SEL).forEach(el=>{if(el.dataset.rv)return;el.dataset.rv=1;if(!io){return}
 const sib=el.classList.contains('nc-card')?[...el.parentNode.children].indexOf(el)%4:0;el.style.setProperty('--d',(sib*.08)+'s');el.classList.add('rv');io.observe(el)})}
scan();let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(scan,40)}).observe(document.body,{childList:true,subtree:true});
// smooth page-to-page transitions
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target||a.hasAttribute('download'))return;
 const u=new URL(a.href,location.href);if(u.origin!==location.origin&&location.protocol!='file:')return;if(!/\.html$/i.test(u.pathname)||(u.pathname==location.pathname&&u.search==location.search))return;
 if(u.protocol!==location.protocol)return;e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>location.href=a.href,230)});
addEventListener('pageshow',e=>{if(e.persisted)document.body.classList.remove('leaving')});
})();
