(function(){
const q=new URLSearchParams(location.search);
const card=p=>`<article class="nc-card"><a class="im" href="product.html?id=${p.id}"><img src="${p.imgs[0]||""}" alt="${esc(p.name)}" loading="lazy"></a><div class="tx"><span class="cat">${esc(p.cat)}</span><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3><span class="pr">${rs(p.price)}</span>${p.stock>0?`<form data-pid="${p.id}"><input class="primary-button" type="submit" value="Add to Cart"></form>`:'<span class="oos">Out of stock</span>'}</div></article>`;
const list=document.getElementById("nc-list"),det=document.getElementById("nc-detail");
let wired=false,cur=0;
function renderList(){
 const $q=document.getElementById("f-q"),$c=document.getElementById("f-c"),$s=document.getElementById("f-s"),$i=document.getElementById("f-i");
 if(!wired){wired=true;$q.value=q.get("q")||"";[$q,$c,$s,$i].forEach(e=>e.addEventListener("input",renderList))}
 const want=$c.value||q.get("cat")||"";
 const cats=[...new Set(P.map(p=>p.cat))].sort();
 $c.innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option ${c==want?"selected":""}>${esc(c)}</option>`).join("");
 const t=$q.value.trim().toLowerCase();
 let r=P.filter(p=>(!want||p.cat==want)&&(!$i.checked||p.stock>0)&&(!t||[p.name,p.cat,p.d,p.ing].join(" ").toLowerCase().includes(t)));
 const s=$s.value;
 r.sort(s=="pa"?(a,b)=>a.price-b.price:s=="pd"?(a,b)=>b.price-a.price:s=="n"?(a,b)=>a.name.localeCompare(b.name):(a,b)=>b.id-a.id);
 document.getElementById("nc-n").textContent=r.length+" product"+(r.length==1?"":"s");
 list.innerHTML=r.length?r.map(card).join(""):'<div class="nc-empty">No products match your search. Try a different word or clear the filters.</div>';
}
function renderDetail(){
 const p=pr(q.get("id"));
 if(!p){det.innerHTML=P.length?'<div class="nc-empty">This product could not be found. <a href="products.html">Back to all products</a></div>':'<div class="nc-empty">Loading…</div>';return}
 document.title=p.name+" – homefinity.pk";
 const st=p.stock<=0?'<span class="st out">Out of stock</span>':p.stock<=5?`<span class="st low">Only ${p.stock} left</span>`:'<span class="st">In stock</span>';
 const th=p.imgs.length>1?`<div class="nc-th">${p.imgs.map((s,i)=>`<button type="button" data-i="${i}" aria-label="Photo ${i+1}" aria-current="${i==cur}"><img src="${s}" alt=""></button>`).join("")}</div>`:"";
 det.innerHTML=`<div><div class="nc-main"><img id="nc-big" src="${p.imgs[cur]||""}" alt="${esc(p.name)}"></div>${th}</div><div><span class="nc-crumb"><a href="index.html">Home</a> / <a href="products.html">Shop</a> / <a href="products.html?cat=${encodeURIComponent(p.cat)}">${esc(p.cat)}</a></span><h1>${esc(p.name)}</h1><div class="pr">${rs(p.price)}</div>${st}${p.stock>0?`<div class="buy"><div class="nc-qty"><button type="button" id="q-m" aria-label="Decrease">−</button><span id="q-n">1</span><button type="button" id="q-p" aria-label="Increase">+</button></div><button type="button" class="primary-button" id="q-add">Add to Cart</button></div>`:""}${p.d?`<h2>About this product</h2><p>${esc(p.d)}</p>`:""}${p.ing?`<h2>Details</h2><p>${esc(p.ing)}</p>`:""}<h2>Delivery &amp; payment</h2><p>Cash on delivery. Delivery fee and free-delivery limit are shown at checkout.</p></div>`;
 const rel=P.filter(x=>x.cat==p.cat&&x.id!=p.id).slice(0,4);
 document.getElementById("nc-rel").innerHTML=rel.length?`<h2>More from ${esc(p.cat)}</h2><div class="nc-grid">${rel.map(card).join("")}</div>`:"";
 let n=1;const s=()=>document.getElementById("q-n").textContent=n;
 const m=document.getElementById("q-m");if(m){m.onclick=()=>{n=Math.max(1,n-1);s()};document.getElementById("q-p").onclick=()=>{n=Math.min(p.stock,n+1);s()};document.getElementById("q-add").onclick=()=>{for(let i=0;i<n;i++)add(p.id)}}
 det.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{cur=+b.dataset.i;renderDetail()});
}
const render=()=>{if(list)renderList();if(det)renderDetail()};
const _s=shop;shop=function(){_s.apply(this,arguments);render()};render();
})();
