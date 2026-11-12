/* homefinity.pk – home page: fills hero tiles, categories, featured grid and story photos from the live product list */
(function(){
const R=document.getElementById("hf-root");if(!R||!window.NC)return;
const g=id=>document.getElementById(id),im=p=>(p.imgs&&p.imgs.find(Boolean))||"";
const ARW='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function render(){
 const t=g("hf-tiles"),c=g("hf-cats"),f=g("hf-feat"),s=g("hf-sty");
 if(!P.length){t.className="hf-tiles sk";t.innerHTML='<i class="hf-tile t1"></i><i class="hf-tile t2"></i><i class="hf-tile t3"></i>';c.innerHTML='<i class="hf-cat sk"></i><i class="hf-cat sk"></i><i class="hf-cat sk"></i>';f.innerHTML=NC.skel(8);return}
 const withImg=P.filter(p=>im(p)),hero=withImg.slice(0,3);
 t.className="hf-tiles n"+hero.length;
 t.innerHTML=hero.map((p,i)=>`<a class="hf-tile t${i+1}" href="product.html?id=${p.id}"><img src="${im(p)}" alt="${esc(p.name)}"${i?' loading="lazy"':""}><span class="tg"><b>${esc(p.name)}</b><em>${rs(p.price)}</em></span></a>`).join("");
 const cats=[...new Set(P.map(p=>p.cat))];
 c.innerHTML=cats.map(k=>{const L=P.filter(p=>p.cat==k),cover=L.find(p=>im(p));return `<a class="hf-cat" href="products.html?cat=${encodeURIComponent(k)}">${cover?`<img src="${im(cover)}" alt="" loading="lazy">`:""}<span class="tg"><span><b>${esc(k)}</b><small>${L.length} product${L.length==1?"":"s"}</small></span><i>${ARW}</i></span></a>`}).join("");
 f.innerHTML=P.slice().sort((a,b)=>b.id-a.id).slice(0,P.length>=8?8:4).map(NC.card).join("");
 const st=withImg.filter((p,i)=>i>=0).slice(0,2);
 s.innerHTML=st.map((p,i)=>`<img class="${i?"b":"a"}" src="${im(p)}" alt="" loading="lazy">`).join("");
 s.classList.toggle("one",st.length<2);s.hidden=!st.length}
const hh=()=>{const h=document.querySelector(".main-header");if(h)R.style.setProperty("--hf-hdr",h.offsetHeight+"px")};hh();addEventListener("resize",hh);
const _s=shop;shop=function(){_s.apply(this,arguments);render()};render();
})();
