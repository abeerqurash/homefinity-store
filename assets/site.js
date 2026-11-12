/* homefinity.pk – site-wide extras: top bar, mobile bottom nav, WhatsApp button, contact details */
(function(){
if(window.NC_ADMIN)return;
const hdr=document.querySelector(".main-header");if(!hdr)return;
const H=window.HF||{},ic=d=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const page=(location.pathname.split("/").pop()||"index.html").toLowerCase();
const pdp=!!document.getElementById("nc-detail");
document.body.classList.add("hf-pad");if(pdp)document.body.classList.add("hf-pdp");

/* header button + contact panel */
document.querySelectorAll(".header-info-btn-text,.header-info-btn .primary-button-text").forEach(e=>{if(/explore/i.test(e.textContent))e.textContent="Contact"});
document.querySelectorAll(".header-info-btn").forEach(e=>{if(/explore/i.test(e.textContent))e.innerHTML=e.innerHTML.replace(/Explore/gi,"Contact")});
const fw=document.querySelector(".find-wrapper");
if(fw){
 if(H.address||H.phone||H.email||H.hours){
  const t=fw.querySelectorAll(".find-text");
  if(t[0]&&(H.address||H.phone||H.email))t[0].innerHTML=[H.address,H.phone,H.email].filter(Boolean).map(x=>String(x).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))).join("<br>");
  if(t[1]&&H.hours)t[1].textContent=H.hours
 }else fw.style.display="none"}

/* mobile bottom navigation (not on the product page, which has its own buy bar) */
if(!pdp){
 const cur=(f)=>f.includes(page)||(f=="products.html"&&page=="product.html")?' aria-current="page"':"";
 const nav=document.createElement("nav");nav.className="hf-bnav";nav.setAttribute("aria-label","Main");
 nav.innerHTML=`<a href="index.html"${page=="index.html"?' aria-current="page"':""}>${ic('<path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5z"/>')}Home</a><a href="products.html"${cur("products.html")}>${ic('<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>')}Shop</a><button type="button" id="hf-bcart" aria-label="Open cart">${ic('<path d="M3 4h2.2l1.6 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L19.6 8H6"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>')}Cart<b data-n="0"></b></button><a href="order.html"${page=="order.html"?' aria-current="page"':""}>${ic('<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>')}Track</a>`;
 document.body.appendChild(nav);
 const badge=nav.querySelector("b"),src=document.querySelector(".w-commerce-commercecartopenlinkcount");
 const sync=()=>{const n=src?src.textContent.trim():"0";badge.textContent=n=="0"?"":n;badge.dataset.n=n};
 if(src){new MutationObserver(sync).observe(src,{childList:true,characterData:true,subtree:true});sync()}
 document.getElementById("hf-bcart").onclick=()=>{const o=document.querySelector(".w-commerce-commercecartopenlink");if(o)o.click()}
}

/* WhatsApp button, only when a number is set in assets/config.js */
const num=String(H.whatsapp||"").replace(/\D/g,"");
if(num){const a=document.createElement("a");a.className="hf-wa on";a.target="_blank";a.rel="noopener";a.setAttribute("aria-label","Chat with us on WhatsApp");
 a.href="https://wa.me/"+num+"?text="+encodeURIComponent(H.whatsappText||"Hi, I have a question about a product.");
 a.innerHTML='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a7.6 7.6 0 0 1-11.2 6.7L4 20l1.4-4.7A7.6 7.6 0 1 1 20 12z"/><path d="M9.2 8.9c.2-.4.5-.4.8-.3l.9 1.6c.1.3 0 .5-.2.7l-.5.5c.6 1.1 1.5 1.9 2.7 2.5l.6-.6c.2-.2.4-.2.7-.1l1.5.8c.3.2.3.5.1.9-.6 1.2-2 1.3-3.2.7-2-1-3.5-2.5-4.3-4.4-.3-.8-.2-1.7.4-2.3z"/></svg>';
 document.body.appendChild(a)}
})();

/* ===== homefinity.pk – cart drawer behaviour: portal to <body> (so nothing clips it), close on backdrop/Esc, free-delivery bar, nicer empty state ===== */
(function(){
if(window.NC_ADMIN)return;
const w=document.querySelector(".w-commerce-commercecartcontainerwrapper");if(!w)return;
document.body.appendChild(w);w.classList.add("hf-cart");
const H=window.HF||{},FREE=Number(H.freeDelivery)||3000,num=s=>Number(String(s||"").replace(/\D/g,""))||0,rs=n=>"Rs. "+Number(n).toLocaleString("en-PK");
const $=s=>w.querySelector(s),isOpen=()=>w.style.display!=="none"&&w.style.display!=="";
const hide=()=>{w.style.display="none"};
const head=$(".w-commerce-commercecartheader"),close=$(".w-commerce-commercecartcloselink");
if(head&&close){const n=document.createElement("span");n.className="hf-cart-n";head.insertBefore(n,close);close.setAttribute("aria-label","Close cart")}
const foot=$(".w-commerce-commercecartfooter"),line=$(".w-commerce-commercecartlineitem"),btn=$(".w-commerce-commercecartcheckoutbutton");
let ship;
if(foot&&line){ship=document.createElement("p");ship.className="hf-cart-ship";ship.setAttribute("aria-live","polite");foot.insertBefore(ship,foot.firstChild);
 const note=document.createElement("p");note.className="hf-cart-note";note.textContent="Cash on delivery. Delivery fee is shown at checkout.";line.after(note);
 const more=document.createElement("button");more.type="button";more.className="hf-cart-more";more.textContent="Continue shopping";more.onclick=hide;const vc=document.createElement("a");vc.className="hf-cart-more hf-cart-view";vc.href="cart.html";vc.textContent="View full cart";foot.appendChild(vc);foot.appendChild(more)}
if(btn)btn.textContent="Checkout";
const empty=$(".w-commerce-commercecartemptystate");
if(empty)empty.innerHTML='<div class="hf-cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2.2l1.6 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L19.6 8H6"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg><b>Your cart is empty</b><span>Add something useful and it will show up here.</span><a href="products.html">Browse products</a></div>';
const put=(el,k,v)=>{if(el&&el[k]!==v)el[k]=v};
function sync(){
 const n=num(document.querySelector(".w-commerce-commercecartopenlinkcount")?.textContent),c=$(".hf-cart-n");
 if(c){put(c,"textContent",n+(n==1?" item":" items"));c.style.display=n?"":"none"}
 if(ship){const sub=num($(".w-commerce-commercecartordervalue")?.textContent),left=Math.max(0,FREE-sub);
  ship.classList.toggle("ok",left==0&&sub>0);
  put(ship,"innerHTML",(left==0?"<b>Free delivery unlocked</b> on this order":"Add <b>"+rs(left)+"</b> more for free delivery")+'<span class="hf-cart-bar"><i style="width:'+Math.min(100,Math.round(sub/FREE*100))+'%"></i></span>')}
 w.querySelectorAll(".w-commerce-commercecartremovelink").forEach(a=>{if(!a.title){a.setAttribute("aria-label","Remove item");a.title="Remove"}})}
new MutationObserver(sync).observe(w,{childList:true,subtree:true,characterData:true});
const cnt=document.querySelector(".w-commerce-commercecartopenlinkcount");if(cnt)new MutationObserver(sync).observe(cnt,{childList:true,characterData:true,subtree:true});
sync();
new MutationObserver(()=>document.documentElement.classList.toggle("hf-lock",isOpen())).observe(w,{attributes:true,attributeFilter:["style"]});
w.addEventListener("click",e=>{if(e.target===w)hide()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&isOpen())hide()});
})();

/* ===== homefinity.pk – custom dropdown for the contact form's product select (follows live option changes) ===== */
(function(){
const sel=document.getElementById("enq-product");if(!sel||sel.dataset.fdd)return;sel.dataset.fdd=1;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const CH='<svg viewBox="0 0 12 8" width="12" height="8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg>',CK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const w=document.createElement("div");w.className="fdd";
w.innerHTML='<button type="button" class="fdd-btn" aria-haspopup="listbox" aria-expanded="false"><span></span>'+CH+'</button><ul class="fdd-list" role="listbox" tabindex="-1" hidden></ul>';
sel.hidden=true;sel.after(w);
const btn=w.querySelector(".fdd-btn"),ul=w.querySelector(".fdd-list");let opts=[],li=[],act=0;
const lab=sel.getAttribute("aria-label")||"Select product";btn.setAttribute("aria-label",lab);
function mark(){const i=Math.max(0,opts.findIndex(o=>o.value==sel.value));const o=opts[i];btn.firstChild.textContent=o?o.text:"Select product";btn.classList.toggle("ph",!o||!o.value);li.forEach((e,k)=>e.setAttribute("aria-selected",k==i))}
function build(){opts=[...sel.options];ul.innerHTML=opts.map((o,i)=>'<li role="option" id="fdd-o'+i+'"><span>'+esc(o.text)+'</span>'+CK+'</li>').join("");li=[...ul.children];mark()}
const hl=i=>{if(!li.length)return;act=(i+li.length)%li.length;li.forEach((e,k)=>e.classList.toggle("on",k==act));ul.setAttribute("aria-activedescendant",li[act].id);li[act].scrollIntoView({block:"nearest"})};
const open=()=>{ul.hidden=false;btn.setAttribute("aria-expanded","true");hl(Math.max(0,opts.findIndex(o=>o.value==sel.value)));ul.focus()};
const close=f=>{ul.hidden=true;btn.setAttribute("aria-expanded","false");if(f)btn.focus()};
const pick=i=>{sel.value=opts[i].value;mark();close(true);sel.dispatchEvent(new Event("input",{bubbles:true}));sel.dispatchEvent(new Event("change",{bubbles:true}))};
btn.onclick=()=>ul.hidden?open():close(true);
ul.onclick=e=>{const k=li.indexOf(e.target.closest("li"));if(k>-1)pick(k)};
ul.onmousemove=e=>{const k=li.indexOf(e.target.closest("li"));if(k>-1&&k!=act)hl(k)};
ul.onkeydown=e=>{if(e.key=="ArrowDown"){e.preventDefault();hl(act+1)}else if(e.key=="ArrowUp"){e.preventDefault();hl(act-1)}else if(e.key=="Enter"||e.key==" "){e.preventDefault();pick(act)}else if(e.key=="Escape"){e.preventDefault();close(true)}else if(e.key=="Tab")close()};
btn.onkeydown=e=>{if(e.key=="ArrowDown"||e.key=="ArrowUp"){e.preventDefault();open()}};
document.addEventListener("click",e=>{if(!w.contains(e.target))close()});
/* product list is filled in by the store script after load, and the form resets after sending */
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(build,0)}).observe(sel,{childList:true});
sel.form&&sel.form.addEventListener("reset",()=>setTimeout(mark,0));
build();
})();
