/* homefinity.pk – About page: live product tiles, counters, tabs, steps, FAQ, reveals */
(function(){
const R=document.getElementById("ab-root");if(!R)return;
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches,$=(s,c=R)=>c.querySelector(s),$$=(s,c=R)=>[...c.querySelectorAll(s)];
document.documentElement.classList.add("js-ab");
const hh=()=>{const h=document.querySelector(".main-header");if(h)R.style.setProperty("--hf-hdr",h.offsetHeight+"px")};hh();addEventListener("resize",hh);

/* scroll reveal (with a safety net so nothing can stay hidden) */
const io="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);if(e.target.hasAttribute("data-count"))count(e.target)}}),{threshold:.12,rootMargin:"0px 0px -5% 0px"}):null;
function watch(el,d){if(el.dataset.w)return;el.dataset.w=1;if(d!=null)el.style.setProperty("--d",d+"s");if(io)io.observe(el);else el.classList.add("in")}
$$(".ab-rv").forEach(el=>{const sib=[...el.parentNode.children].filter(x=>x.classList.contains("ab-rv")).indexOf(el);watch(el,Math.min(sib,5)*.08)});
setTimeout(()=>$$(".ab-rv").forEach(el=>el.classList.add("in")),2500);

/* counters */
function count(el){const box=el.querySelector("[data-to]");if(!box)return;const to=+box.dataset.to,suf=box.dataset.suf||"";
 if(reduce||isNaN(to)){box.textContent=(isNaN(to)?box.dataset.to:to)+suf;return}
 const t0=performance.now(),D=1300;(function f(t){const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,4);box.textContent=Math.round(to*e)+suf;if(k<1)requestAnimationFrame(f)})(t0)}
const set=(id,v)=>{const b=$("#"+id+" [data-to]");if(b){b.dataset.to=v;if(!b.textContent||b.textContent=="0")b.textContent="0"}};

/* live data */
const g=id=>document.getElementById(id),im=p=>(p.imgs&&p.imgs.find(Boolean))||"";
const ARW='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
let done=false;
function render(){
 const t=g("ab-tiles"),f=g("ab-feat"),c=g("ab-cats");if(!t)return;
 if(typeof P=="undefined"||!P.length){t.className="hf-tiles sk";t.innerHTML='<i class="hf-tile t1"></i><i class="hf-tile t2"></i><i class="hf-tile t3"></i>';if(f&&window.NC)f.innerHTML=NC.skel(4);return}
 const withImg=P.filter(p=>im(p)),hero=withImg.slice(0,3),cats=[...new Set(P.map(p=>p.cat))];
 t.className="hf-tiles n"+hero.length;
 t.innerHTML=hero.map((p,i)=>`<a class="hf-tile t${i+1}" href="product.html?id=${p.id}"><img src="${im(p)}" alt="${esc(p.name)}"${i?' loading="lazy"':""}><span class="tg"><b>${esc(p.name)}</b><em>${rs(p.price)}</em></span></a>`).join("");
 if(f&&window.NC)f.innerHTML=P.slice().sort((a,b)=>b.id-a.id).slice(0,4).map(NC.card).join("");
 if(c)c.innerHTML=cats.map(k=>{const L=P.filter(p=>p.cat==k),cover=L.find(p=>im(p));return `<a class="hf-cat ab-rv in" href="products.html?cat=${encodeURIComponent(k)}">${cover?`<img src="${im(cover)}" alt="" loading="lazy">`:""}<span class="tg"><span><b>${esc(k)}</b><small>${L.length} product${L.length==1?"":"s"}</small></span><i>${ARW}</i></span></a>`}).join("");
 set("st-p",P.length);set("st-c",cats.length);
 $$("[data-count]").forEach(el=>{if(el.classList.contains("in")||done)count(el)});done=true}

/* hero parallax */
const col=$(".ab-collage");
if(col&&!reduce&&matchMedia("(hover:hover)").matches){const h=col.closest(".ab-hero");h.addEventListener("pointermove",e=>{const r=h.getBoundingClientRect();col.style.setProperty("--px",((e.clientX-r.left)/r.width-.5).toFixed(3));col.style.setProperty("--py",((e.clientY-r.top)/r.height-.5).toFixed(3))});h.addEventListener("pointerleave",()=>{col.style.setProperty("--px",0);col.style.setProperty("--py",0)})}

/* values: tabs with auto-rotate until the visitor takes over */
const tabs=$$(".ab-tab"),panes=$$(".ab-pane");let cur=0,timer=null,user=false;
function pick(i,fromUser){if(fromUser)user=true;cur=i;tabs.forEach((b,k)=>{const on=k==i;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1;b.classList.remove("run");if(on&&!user&&!reduce){void b.offsetWidth;b.classList.add("run")}});panes.forEach((p,k)=>p.classList.toggle("on",k==i));
 clearTimeout(timer);if(!user&&!reduce)timer=setTimeout(()=>pick((cur+1)%tabs.length),6000)}
tabs.forEach((b,i)=>{b.addEventListener("click",()=>pick(i,true));b.addEventListener("keydown",e=>{if(e.key=="ArrowDown"||e.key=="ArrowRight"){e.preventDefault();pick((i+1)%tabs.length,true);tabs[cur].focus()}if(e.key=="ArrowUp"||e.key=="ArrowLeft"){e.preventDefault();pick((i+tabs.length-1)%tabs.length,true);tabs[cur].focus()}})});
if(tabs.length){pick(0);const vs=$(".ab-values");if(io&&vs){new IntersectionObserver(es=>es.forEach(e=>{if(!user&&!reduce){if(e.isIntersecting&&!timer)pick(cur);else if(!e.isIntersecting){clearTimeout(timer);timer=null}}}),{threshold:.2}).observe(vs)}}

/* steps: light up one by one when visible */
const steps=$$(".ab-step");
if(steps.length&&io&&!reduce){new IntersectionObserver((es,o)=>{if(es.some(e=>e.isIntersecting)){o.disconnect();steps.forEach((s,i)=>setTimeout(()=>{steps.forEach(x=>x.classList.remove("hot"));s.classList.add("hot");if(i==steps.length-1)setTimeout(()=>s.classList.remove("hot"),900)},i*650))}},{threshold:.35}).observe(steps[0].parentNode)}

/* faq */
$$(".ab-q").forEach(q=>{const b=q.querySelector("button");b.addEventListener("click",()=>{const o=!q.classList.contains("open");$$(".ab-q.open").forEach(x=>{x.classList.remove("open");x.querySelector("button").setAttribute("aria-expanded","false")});if(o){q.classList.add("open");b.setAttribute("aria-expanded","true")}})});

/* marquee: duplicate the track so the loop is seamless */
const mq=$(".ab-mq-t");if(mq)mq.innerHTML+=mq.innerHTML;

render();
if(typeof shop=="function"){const _s=shop;shop=function(){_s.apply(this,arguments);render()}}
})();
