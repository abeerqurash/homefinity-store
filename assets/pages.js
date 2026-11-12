(function(){
const q=new URLSearchParams(location.search);
const CART='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2.2l1.6 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L19.6 8H6"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>';
const CHECK='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const card=p=>{const out=p.stock<=0,low=!out&&p.stock<=5;
 const bd=out?'<span class="bd out">Out of stock</span>':low?`<span class="bd low">Only ${p.stock} left</span>`:'';
 return `<article class="nc-card${out?" is-out":""}"><a class="im" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true"><img src="${p.imgs[0]||""}" alt="" loading="lazy">${bd}</a><div class="tx"><span class="cat">${esc(p.cat)}</span><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>${p.d?`<p class="ds">${esc(p.d)}</p>`:""}<div class="row"><span class="pr">${varies(p)?"From ":""}${rs(fromP(p))}</span>${out?"":hasV(p)?`<a class="add" href="product.html?id=${p.id}" aria-label="Choose an option for ${esc(p.name)}">${CART}<span>Options</span></a>`:`<form data-pid="${p.id}"><button class="add" type="submit" aria-label="Add ${esc(p.name)} to cart">${CART}<span>Add</span></button></form>`}</div></div></article>`};
const skel=n=>Array.from({length:n},()=>'<div class="nc-card sk" aria-hidden="true"><div class="im"></div><div class="tx"><span class="l s"></span><span class="l"></span><span class="l m"></span></div></div>').join("");
window.NC={card,skel,CART,CHECK};
const list=document.getElementById("nc-list"),det=document.getElementById("nc-detail");
let wired=false,cur=0,sel=q.get("cat")||"",selV=q.get("v")||null,kq=1;
function renderList(){
 const $q=document.getElementById("f-q"),$c=document.getElementById("f-c"),$s=document.getElementById("f-s"),$i=document.getElementById("f-i");
 if(!wired){wired=true;$q.value=q.get("q")||"";[$q,$c,$s,$i].forEach(e=>e.addEventListener("input",renderList))}
 if(!P.length){list.innerHTML=skel(8);document.getElementById("nc-n").textContent="Loading products…";return}
 const want=sel;
 const cats=catList();
 $c.innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option ${c==want?"selected":""}>${esc(c)}</option>`).join("");
 const ch=document.getElementById("nc-chips");
 if(ch){const n=c=>c?P.filter(p=>p.cat==c).length:P.length;ch.innerHTML=["",...cats].map(c=>`<button type="button" class="chip" data-c="${esc(c)}" aria-pressed="${c==want}">${c?esc(c):"All"}<small>${n(c)}</small></button>`).join("");
  ch.onclick=e=>{const b=e.target.closest("[data-c]");if(!b)return;sel=b.dataset.c;renderList()};let cd=document.getElementById("nc-catdesc");if(!cd){cd=document.createElement("p");cd.id="nc-catdesc";cd.className="nc-catdesc";ch.after(cd)}const cc=C.find(c=>c.name==want);cd.textContent=cc&&cc.desc?cc.desc:"";cd.hidden=!cd.textContent}
 const t=$q.value.trim().toLowerCase();
 let r=P.filter(p=>(!want||p.cat==want)&&(!$i.checked||p.stock>0)&&(!t||[p.name,p.cat,p.d,p.ing,...(p.vars||[]).map(v=>v.label+" "+(v.sku||""))].join(" ").toLowerCase().includes(t)));
 const s=$s.value;
 r.sort(s=="pa"?(a,b)=>fromP(a)-fromP(b):s=="pd"?(a,b)=>fromP(b)-fromP(a):s=="n"?(a,b)=>a.name.localeCompare(b.name):(a,b)=>b.id-a.id);
 document.getElementById("nc-n").textContent=r.length+" product"+(r.length==1?"":"s")+(want?" in "+want:"");
 list.innerHTML=r.length?r.map(card).join(""):'<div class="nc-empty"><strong>No products match</strong><span>Try a different word, or clear the category and stock filters.</span></div>';
}
const I={chev:'<svg viewBox="0 0 12 8" width="12" height="8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg>',
 chk:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5l-7 7 7 7"/></svg>',
 next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 5l7 7-7 7"/></svg>',
 zoom:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5"/></svg>',
 cod:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/></svg>',
 trk:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/></svg>',
 lock:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>'};

/* custom sort dropdown (replaces the browser's native list) */
function initSort(){
 const sel=document.getElementById("f-s");if(!sel||sel.dataset.dd)return;sel.dataset.dd=1;
 const opts=[...sel.options],w=document.createElement("div");w.className="dd";
 w.innerHTML=`<button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Sort products"><span></span>${I.chev}</button><ul class="dd-list" role="listbox" tabindex="-1" hidden>${opts.map((o,i)=>`<li role="option" id="dd-o${i}" data-v="${esc(o.value)}"><span>${esc(o.text)}</span>${I.chk}</li>`).join("")}</ul>`;
 sel.hidden=true;sel.after(w);
 const btn=w.querySelector(".dd-btn"),ul=w.querySelector(".dd-list"),li=[...ul.children];let act=0;
 const mark=()=>{const i=Math.max(0,opts.findIndex(o=>o.value==sel.value));btn.firstChild.textContent=opts[i].text;li.forEach((e,k)=>e.setAttribute("aria-selected",k==i))};
 const hl=i=>{act=(i+li.length)%li.length;li.forEach((e,k)=>e.classList.toggle("on",k==act));ul.setAttribute("aria-activedescendant",li[act].id);li[act].scrollIntoView({block:"nearest"})};
 const open=()=>{ul.hidden=false;btn.setAttribute("aria-expanded","true");hl(Math.max(0,opts.findIndex(o=>o.value==sel.value)));ul.focus()};
 const close=f=>{ul.hidden=true;btn.setAttribute("aria-expanded","false");if(f)btn.focus()};
 const pick=i=>{sel.value=opts[i].value;mark();close(true);sel.dispatchEvent(new Event("input",{bubbles:true}))};
 btn.onclick=()=>ul.hidden?open():close(true);
 ul.onclick=e=>{const k=li.indexOf(e.target.closest("li"));if(k>-1)pick(k)};
 ul.onmousemove=e=>{const k=li.indexOf(e.target.closest("li"));if(k>-1&&k!=act)hl(k)};
 ul.onkeydown=e=>{if(e.key=="ArrowDown"){e.preventDefault();hl(act+1)}else if(e.key=="ArrowUp"){e.preventDefault();hl(act-1)}else if(e.key=="Enter"||e.key==" "){e.preventDefault();pick(act)}else if(e.key=="Escape"){e.preventDefault();close(true)}else if(e.key=="Tab")close()};
 btn.onkeydown=e=>{if(e.key=="ArrowDown"||e.key=="ArrowUp"){e.preventDefault();open()}};
 document.addEventListener("click",e=>{if(!w.contains(e.target))close()});
 mark()}

/* product page: gallery + lightbox */
let G={n:0,show:()=>{}};
function lightbox(p){
 let o=document.getElementById("lb");
 if(!o){o=document.createElement("div");o.id="lb";o.className="lb";o.hidden=true;o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","Product photos");
  o.innerHTML=`<button type="button" class="lb-x" aria-label="Close">×</button><button type="button" class="lb-n prev" aria-label="Previous photo">${I.prev}</button><img alt=""><button type="button" class="lb-n next" aria-label="Next photo">${I.next}</button><span class="lb-c"></span>`;
  document.body.appendChild(o);
  const x=()=>{o.hidden=true;document.body.style.overflow=""};
  o.onclick=e=>{if(e.target==o||e.target.closest(".lb-x"))x();else if(e.target.closest(".prev"))G.show(cur-1);else if(e.target.closest(".next"))G.show(cur+1)};
  document.addEventListener("keydown",e=>{if(o.hidden)return;if(e.key=="Escape")x();else if(e.key=="ArrowLeft")G.show(cur-1);else if(e.key=="ArrowRight")G.show(cur+1)})}
 o.hidden=false;document.body.style.overflow="hidden";o.querySelector(".lb-x").focus();o.classList.toggle("one",p.imgs.length<2);G.show(cur)}

function renderDetail(){
 const p=pr(q.get("id"));
 if(!p){det.innerHTML=P.length?'<div class="nc-empty"><strong>This product could not be found</strong><a href="products.html">Back to all products</a></div>':'<div class="nc-empty"><strong>Loading…</strong></div>';return}
 document.title=p.name+" – homefinity.pk";
 const im=p.imgs.filter(Boolean);(p.vars||[]).forEach(x=>{if(x.img&&!im.includes(x.img))im.push(x.img)});const n=im.length;if(cur>=n)cur=0;
 const V=hasV(p);if(V){if(selV&&!vr(p,selV))selV=null;if(!selV&&p.vars.length==1&&+p.vars[0].stock>0)selV=p.vars[0].id}
 const sv=V?vr(p,selV):null,avail=V?(sv?uStock(p,selV):p.stock):p.stock,price=V?(sv?uPrice(p,selV):fromP(p)):p.price,pfx=V&&!sv&&varies(p)?"From ":"";
 if(kq>avail)kq=Math.max(1,avail);
 const st=avail<=0?'<span class="st out">Out of stock</span>':avail<=5?`<span class="st low">Only ${avail} left</span>`:'<span class="st">In stock</span>';
 const opts=V?`<div class="opts" role="radiogroup" aria-labelledby="opt-h"><div class="opt-h" id="opt-h">Choose an option<b>${sv?": "+esc(sv.label):""}</b></div><div class="opt-l">${p.vars.map(x=>{const o=+x.stock<=0,on=x.id==selV;return `<button type="button" role="radio" class="opt${on?" on":""}${o?" is-out":""}" data-v="${esc(x.id)}" aria-checked="${on}"${o?" disabled":""}>${esc(x.label)}${o?"<small>Sold out</small>":""}</button>`}).join("")}</div><p class="opt-err" id="opt-err" role="alert" hidden>Please choose an option first.</p></div>`:"";
 const gal=`<div class="gal"><div class="gal-main"><img id="nc-big" src="${im[cur]||""}" alt="${esc(p.name)}">${n>1?`<button type="button" class="gal-nav prev" aria-label="Previous photo">${I.prev}</button><button type="button" class="gal-nav next" aria-label="Next photo">${I.next}</button><span class="gal-count" id="gal-c">${cur+1} / ${n}</span>`:""}<button type="button" class="gal-zoom" aria-label="View larger photo">${I.zoom}</button></div>${n?`<div class="gal-th" role="list">${im.map((s,i)=>`<button type="button" role="listitem" data-i="${i}" aria-label="Show photo ${i+1} of ${n}" aria-current="${i==cur}"><img src="${s}" alt=""></button>`).join("")}</div>`:""}</div>`;
 const buy=p.stock>0?`${opts}<div class="buy"><div class="nc-qty"><button type="button" id="q-m" aria-label="Decrease quantity">−</button><span id="q-n" aria-live="polite">${kq}</span><button type="button" id="q-p" aria-label="Increase quantity">+</button></div><button type="button" class="add lg" id="q-add">${CART}<span>Add to cart</span></button></div>`:'<p class="soldout">This product is out of stock right now. Check back soon or <a href="contact.html">contact us</a>.</p>';
 det.innerHTML=`${gal}<div class="info"><span class="nc-crumb"><a href="index.html">Home</a> / <a href="products.html">Shop</a> / <a href="products.html?cat=${encodeURIComponent(p.cat)}">${esc(p.cat)}</a></span><h1>${esc(p.name)}</h1><div class="priceline"><span class="pr">${pfx}${rs(price)}</span>${st}</div>${p.d?`<p class="lead">${esc(p.d)}</p>`:""}${buy}<ul class="perks"><li>${I.cod}<span><b>Cash on delivery</b>Pay when your order arrives</span></li><li>${I.trk}<span><b>Track your order</b>Use the code from your confirmation</span></li><li>${I.lock}<span><b>Secure checkout</b>Prices and stock checked on our server</span></li></ul>${p.ing?`<details open><summary>Details</summary><p>${esc(p.ing)}</p></details>`:""}<details><summary>Delivery &amp; payment</summary><p>Cash on delivery. Delivery fee and free-delivery limit are shown at checkout.</p></details></div>${p.stock>0?`<div class="buybar"><div><small>Price</small><b>${pfx}${rs(price)}</b></div><button type="button" class="add lg" id="q-add2">${CART}<span>Add to cart</span></button></div>`:""}`;
 let LG=document.getElementById("nc-long");if(!LG){LG=document.createElement("div");LG.id="nc-long";LG.className="nc-long";document.getElementById("nc-rel").before(LG)}
 LG.innerHTML=(p.long?`<section class="prose">${cleanHTML(p.long)}</section>`:"")+(p.extra?`<section class="prose extra"><h2>Additional information</h2>${cleanHTML(p.extra)}</section>`:"");LG.hidden=!LG.innerHTML;
 const rel=P.filter(x=>x.cat==p.cat&&x.id!=p.id).slice(0,4);
 document.getElementById("nc-rel").innerHTML=rel.length?`<h2>More from ${esc(p.cat)}</h2><div class="nc-grid">${rel.map(card).join("")}</div>`:"";
 /* gallery behaviour */
 const big=document.getElementById("nc-big"),ths=[...det.querySelectorAll(".gal-th [data-i]")],cnt=document.getElementById("gal-c");
 G={n,show(i){if(!n)return;cur=(i+n)%n;big.src=im[cur];big.classList.remove("sw");void big.offsetWidth;big.classList.add("sw");ths.forEach((b,k)=>b.setAttribute("aria-current",k==cur));if(cnt)cnt.textContent=(cur+1)+" / "+n;
  const L=document.getElementById("lb");if(L){L.querySelector("img").src=im[cur];L.querySelector(".lb-c").textContent=(cur+1)+" / "+n} if(ths[cur])ths[cur].scrollIntoView({block:"nearest",inline:"nearest"})}};
 ths.forEach(b=>b.onclick=()=>G.show(+b.dataset.i));
 const pv=det.querySelector(".gal-nav.prev"),nx=det.querySelector(".gal-nav.next");if(pv){pv.onclick=()=>G.show(cur-1);nx.onclick=()=>G.show(cur+1)}
 det.querySelector(".gal-main").onclick=e=>{if(e.target.closest(".gal-nav"))return;lightbox(p)};
 /* buy box */
 const out=()=>document.getElementById("q-n").textContent=kq;
 const m=document.getElementById("q-m");
 det.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{selV=b.dataset.v;const x=vr(p,selV);if(x&&x.img){const i=im.indexOf(x.img);if(i>=0)cur=i}renderDetail();const nb=det.querySelector('.opt[data-v="'+selV+'"]');if(nb)nb.focus()});
 if(m){m.onclick=()=>{kq=Math.max(1,kq-1);out()};document.getElementById("q-p").onclick=()=>{kq=Math.min(Math.max(1,avail),kq+1);out()};
  const go=b=>{if(b.classList.contains("done"))return;if(V&&!sv){const er=document.getElementById("opt-err");if(er)er.hidden=false;const o1=det.querySelector(".opt:not([disabled])");if(o1){o1.focus();o1.scrollIntoView({block:"center",behavior:"smooth"})}return}if(sv&&avail<1)return;for(let i=0;i<kq;i++)add(p.id,V?selV:null);const h=b.innerHTML;b.classList.add("done");b.innerHTML=CHECK+"<span>Added</span>";setTimeout(()=>{b.classList.remove("done");b.innerHTML=h},1400)};
  document.getElementById("q-add").onclick=e=>go(e.currentTarget);const b2=document.getElementById("q-add2");if(b2)b2.onclick=e=>go(e.currentTarget)}
}
const render=()=>{if(list){initSort();renderList()}if(det)renderDetail()};
const _s=shop;shop=function(){_s.apply(this,arguments);render()};render();
document.addEventListener("submit",e=>{const f=e.target,b=f&&f.dataset&&f.dataset.pid&&f.querySelector(".add");if(!b||b.classList.contains("done"))return;
 const h=b.innerHTML;b.classList.add("done");b.innerHTML=CHECK+"<span>Added</span>";setTimeout(()=>{b.classList.remove("done");b.innerHTML=h},1400)},true);
})();
