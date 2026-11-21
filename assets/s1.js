const I={"stack": "assets/img/stack.jpg", "yellow": "assets/img/yellow.jpg", "blue": "assets/img/blue.jpg", "masala": "assets/img/masala.jpg", "chipper": "assets/img/chipper.jpg", "oil": "assets/img/oil.jpg", "garlic": "assets/img/garlic.jpg", "vac1": "assets/img/vac1.jpg", "vac2": "assets/img/vac2.jpg", "stackL": "assets/img/stackL.jpg", "ic1": "assets/img/ic1.svg", "ic3": "assets/img/ic3.svg", "ic4": "assets/img/ic4.svg", "ic5": "assets/img/ic5.svg", "ic6": "assets/img/ic6.svg", "line": "assets/img/line.svg", "line2": "assets/img/line2.svg", "close": "assets/img/close.svg", "menu": "assets/img/menu.svg", "quote": "assets/img/quote.svg", "avatar": "assets/img/avatar.svg", "play": "assets/img/play.svg", "soc": "assets/img/soc.svg"};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{alert("Browser storage is full. Use smaller images.")}}};
const seed=[
{id:1,name:"Food Carrier Double-Layer Tiffin",cat:"Lunch & Travel",price:950,stock:24,imgs:["stack","yellow","blue"],vars:[{id:"v1",label:"Yellow",sku:"TIF-YLW",price:null,stock:14,img:"yellow"},{id:"v2",label:"Blue",sku:"TIF-BLU",price:null,stock:10,img:"blue"}],ing:"Removable stainless-steel inner container.",d:"Double-layer lunch carrier in several colours."},
{id:2,name:"Vacuum Steel Water Bottle 1000 ml",cat:"Lunch & Travel",price:1500,stock:12,imgs:["vac1","vac2"],ing:"Stainless steel, 1000 ml, carry strap.",d:"Large vacuum bottle for work and travel."},
{id:3,name:"9-Portion Masala Storage Box",cat:"Kitchen Storage",price:750,stock:18,imgs:["masala"],ing:"9 compartments, 9 spoons and a lid.",d:"Multi-colour spice box for a tidy kitchen."},
{id:4,name:"Stainless Steel Potato Chipper",cat:"Kitchen Tools",price:1650,stock:9,imgs:["chipper"],ing:"Stainless steel, 2 blades.",d:"Cuts fries and vegetable sticks quickly."},
{id:5,name:"2-in-1 Oil Spray Jug",cat:"Kitchen Tools",price:650,stock:3,imgs:["oil"],ing:"Pours or sprays. Box packing.",d:"Oil dispenser for cooking and salads."},
{id:6,name:"Stainless Steel Garlic Press",cat:"Kitchen Tools",price:350,stock:40,imgs:["garlic"],ing:"Stainless steel, comfortable grip.",d:"Press garlic in one squeeze."}].map(p=>({...p,imgs:p.imgs.map(k=>I[k]),vars:(p.vars||[]).map(v=>({...v,img:v.img?I[v.img]:""}))}));
let P=LS.get("nc_p",null)||seed,O=LS.get("nc_o",[]),cart=LS.get("nc_c",[]),tab="dash";
/* ---- rich text (safe HTML) + product categories ---- */
const OKT=new Set(["P","BR","H2","H3","H4","STRONG","B","EM","I","U","UL","OL","LI","A","BLOCKQUOTE","HR"]);
function cleanHTML(h){const d=new DOMParser().parseFromString("<body>"+String(h||"")+"</body>","text/html");
const un=c=>{while(c.firstChild)c.parentNode.insertBefore(c.firstChild,c);c.remove()};
(function walk(n){[...n.childNodes].forEach(c=>{
if(c.nodeType==3)return;if(c.nodeType!=1){c.remove();return}
const t=c.tagName;
if(["SCRIPT","STYLE","IFRAME","OBJECT","EMBED","NOSCRIPT","TEMPLATE","SVG","FORM","INPUT","BUTTON","TEXTAREA","SELECT"].includes(t)){c.remove();return}
walk(c);
if(t=="H1"||t=="H5"||t=="H6"||t=="DIV"){const r=d.createElement(t=="DIV"?"p":t=="H1"?"h2":"h4");while(c.firstChild)r.appendChild(c.firstChild);c.replaceWith(r);return}
if(!OKT.has(t)){un(c);return}
[...c.attributes].forEach(a=>{if(!(t=="A"&&a.name=="href"))c.removeAttribute(a.name)});
if(t=="A"){const h=c.getAttribute("href")||"";if(!/^(https?:\/\/|mailto:|tel:)/i.test(h)){un(c);return}c.setAttribute("target","_blank");c.setAttribute("rel","noopener noreferrer nofollow")}
})})(d.body);
const INL=new Set(["A","B","STRONG","EM","I","U","BR"]);let run=[];const flush=()=>{if(!run.length)return;if(run.every(x=>x.nodeType==3&&!x.textContent.trim()||x.tagName=="BR")){run.forEach(x=>x.remove())}else{const w=d.createElement("p");run[0].before(w);run.forEach(x=>w.appendChild(x))}run=[]};
[...d.body.childNodes].forEach(c=>{if(c.nodeType==3||INL.has(c.tagName))run.push(c);else flush()});flush();
return d.body.innerHTML.trim()}
const rt=h=>{h=cleanHTML(h);return h.replace(/<(?!hr)[^>]*>|&nbsp;|\s/g,"")?h:""};
const slug=s=>String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const deriveC=()=>[...new Set(P.map(p=>p.cat).filter(Boolean))].map((n,i)=>({id:i+1,name:n,slug:slug(n),desc:"",sort:(i+1)*10}));
let C=LS.get("nc_cat",null)||deriveC(),catOK=true;
const cOrd=()=>[...C].sort((a,b)=>((+a.sort||0)-(+b.sort||0))||a.name.localeCompare(b.name));
const catList=()=>{const used=new Set(P.map(p=>p.cat)),o=cOrd().map(c=>c.name).filter(n=>used.has(n));used.forEach(n=>{if(n&&!o.includes(n))o.push(n)});return o};
const RTB=[["h2","H2","Heading 2"],["h3","H3","Heading 3"],["p","Text","Normal paragraph"],["b","B","Bold"],["i","I","Italic"],["ul","• List","Bullet list"],["ol","1. List","Numbered list"],["q","Quote","Quote"],["a","Link","Add link"],["x","Clear","Clear formatting"]];
const rte=(k,label,html,hint)=>`<div class="rte-w" data-rte="${k}"><label class="rte-l">${label}</label>${hint?`<p class="note">${hint}</p>`:""}<div class="rte"><div class="rte-t" role="toolbar" aria-label="${esc(label)} formatting">${RTB.map(([c,t,a])=>`<button type="button" class="rte-btn rb-${c}" data-rc="${c}" title="${a}" aria-label="${a}">${t}</button>`).join("")}</div><div class="rte-b" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${esc(label)}" data-ph="Write here. Use the buttons above for headings, bold and lists.">${cleanHTML(html)}</div></div></div>`;
const rget=(f,k)=>rt(f.querySelector('[data-rte="'+k+'"] .rte-b').innerHTML);
const rset=(f,k,h)=>{f.querySelector('[data-rte="'+k+'"] .rte-b').innerHTML=cleanHTML(h)};
const setCat=(f,v)=>{if(v&&![...f.cat.options].some(o=>o.value==v))f.cat.add(new Option(v+" (not in your categories)",v));f.cat.value=v||""};
document.addEventListener("mousedown",e=>{if(e.target.closest(".rte-btn"))e.preventDefault()});
document.addEventListener("focusin",e=>{if(e.target.closest&&e.target.closest(".rte-b")){try{document.execCommand("defaultParagraphSeparator",false,"p")}catch(_){}}});
document.addEventListener("click",e=>{const b=e.target.closest(".rte-btn");if(!b)return;e.preventDefault();const ed=b.closest(".rte").querySelector(".rte-b"),c=b.dataset.rc,x=(a,v)=>document.execCommand(a,false,v);ed.focus();
try{x("defaultParagraphSeparator","p")}catch(_){}
const blk=(tag)=>x("formatBlock",String(document.queryCommandValue("formatBlock")).toLowerCase()==tag.toLowerCase()?"P":tag);
if(c=="h2")blk("H2");else if(c=="h3")blk("H3");else if(c=="p")x("formatBlock","P");else if(c=="q")blk("BLOCKQUOTE");
else if(c=="b")x("bold");else if(c=="i")x("italic");else if(c=="ul")x("insertUnorderedList");else if(c=="ol")x("insertOrderedList");
else if(c=="x"){x("removeFormat");x("formatBlock","P");x("unlink")}
else if(c=="a"){const u=(prompt("Link address, starting with https://")||"").trim();if(u){if(/^(https?:\/\/|mailto:|tel:)/i.test(u))x("createLink",u);else alert("The link must start with https://")}}});
document.addEventListener("paste",e=>{const ed=e.target.closest&&e.target.closest(".rte-b");if(!ed)return;e.preventDefault();const cd=e.clipboardData,h=cd.getData("text/html"),t=cd.getData("text/plain");document.execCommand("insertHTML",false,h?cleanHTML(h):esc(t).replace(/\n/g,"<br>"))});
const _sh=LS.get("nc_ship",null),_H=window.HF||{};let SHIP=_sh?+_sh.fee:(_H.deliveryFee!=null&&_H.deliveryFee!==""?+_H.deliveryFee:200),FREE=_sh?+_sh.free:(+_H.freeDelivery>0?+_H.freeDelivery:3000);
function pubShip(){const H=window.HF=window.HF||{};H.deliveryFee=SHIP;H.freeDelivery=FREE;try{window.dispatchEvent(new Event("nc:ship"))}catch(e){}}pubShip();let shFlash=false;let CP=LS.get("nc_cp",[]),CPR=LS.get("nc_cpr",null);const STAT=["Placed","Confirmed","Packed","Dispatched","Delivered","Cancelled"];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],rs=n=>"Rs. "+Number(n).toLocaleString("en-PK"),pr=id=>P.find(x=>x.id==id);
/* ---- product options (colour / size): helpers. A cart line is {id,q} or {id,q,v}. ---- */
const hasV=p=>!!(p&&Array.isArray(p.vars)&&p.vars.length),vr=(p,v)=>p&&v?(p.vars||[]).find(x=>x.id==v)||null:null,
uPrice=(p,v)=>{const x=vr(p,v);return x&&x.price!=null&&x.price!==""?+x.price:p.price},
uStock=(p,v)=>hasV(p)?(vr(p,v)?+vr(p,v).stock:0):p.stock,lk=l=>l.id+(l.v?":"+l.v:""),
fromP=p=>hasV(p)?Math.min(...p.vars.map(x=>uPrice(p,x.id))):p.price,varies=p=>hasV(p)&&new Set(p.vars.map(x=>uPrice(p,x.id))).size>1;
let save=()=>{LS.set("nc_p",P);LS.set("nc_o",O)};
$$("img[data-k]").forEach(e=>e.src=I[e.dataset.k]);
const item=(p,i)=>`<div class="w-dyn-list${i?"":" act"}"><div class="w-dyn-items"><div class="w-dyn-item"><div class="menus-box"><div class="product-details-wrapper"><div class="product-details-wrap"><a class="product-img-wrap w-inline-block" href="products.html"><img class="menu-image" src="${p.imgs[0]||""}" alt="${esc(p.name)}"></a><div class="ingredients-box"><p class="ingredients-details">Details:</p><p class="product-ingredients">${esc(p.ing||"")}</p></div><div>${p.stock>0?(hasV(p)?`<a class="primary-button product-button" href="product.html?id=${p.id}">Choose option</a>`:`<form class="menu-cart-default-state" data-pid="${p.id}"><input class="primary-button product-button" type="submit" value="Add to Cart"></form>`):`<p class="ingredients-details">Out of stock</p>`}</div></div></div><div class="menu-list"><div class="menu-list-title-box"><a class="menu-list-title-link w-inline-block" href="products.html"><h3 class="menu-list-title${i?"":" active"}">${esc(p.name)}</h3></a><div class="menu-list-line nc-dots"></div><h4 class="menu-list-price">${varies(p)?"From ":""}${rs(fromP(p))}</h4></div><p class="menu-list-text">${esc(p.d||"")}</p></div></div></div></div></div>`;
function wire(){$$(".menu-content-box").forEach(b=>{const L=[...b.querySelectorAll(".w-dyn-list")],on=l=>L.forEach(x=>{x.classList.toggle("act",x==l);x.querySelector(".menu-list-title").classList.toggle("active",x==l)});L.forEach(l=>{l.addEventListener("mouseenter",()=>on(l));l.addEventListener("click",()=>on(l))})})}
function shop(){const cats=catList();
$$(".menu-dropdown").forEach((dd,k)=>{const c=cats[k];dd.style.display=c?"":"none";if(!c)return;dd.querySelector(".menu-title").textContent=c;dd.querySelector(".menu-content-box").innerHTML=P.filter(p=>p.cat==c).map(item).join("")});
$$(".product-section .w-dyn-item").forEach((el,k)=>{const p=P[k];el.style.display=p?"":"none";if(!p)return;
el.querySelector(".product-title").textContent=p.name;el.querySelector(".product-text").textContent=p.d;el.querySelector(".product-price").textContent=(varies(p)?"From ":"")+rs(fromP(p));el.querySelector(".product-img").src=p.imgs[0]||"";
let f=el.querySelector("form");if(f)f.dataset.pid=p.id});
$$(".team-image-link").forEach((a,k)=>{const p=P[k],w=a.closest(".team-block,.w-dyn-item,div")||a;if(!p)return;a.querySelector(".team-image").src=p.imgs[0]||"";const n=a.parentElement.querySelector(".team-name"),d=a.parentElement.querySelector(".team-designation");if(n)n.textContent=p.name.slice(0,26);if(d)d.textContent=p.cat});
const c=$$(".why-us-count");if(c.length>=4){c[0].textContent=P.length;c[1].textContent=cats.length;c[2].textContent="COD";c[3].textContent="0"}const sel=$("#enq-product");if(sel)sel.innerHTML='<option value="">Select product</option>'+P.map(p=>`<option>${esc(p.name)}</option>`).join("");wire()}
function cpEval(r,sub){if(!r||!sub)return{disc:0,free:false,msg:""};
if(sub<(+r.min||0))return{disc:0,free:false,msg:"Add Rs. "+Math.ceil((+r.min)-sub).toLocaleString("en-PK")+" more to use "+r.code+"."};
if(r.type=="percent")return{disc:Math.min(sub,Math.floor(sub*Math.min(+r.value,100)/100)),free:false,msg:""};
if(r.type=="fixed")return{disc:Math.min(sub,Math.floor(+r.value)),free:false,msg:""};
return{disc:0,free:true,msg:""}}
function cpCheckLocal(code,sub){const c=String(code||"").trim().toUpperCase(),r=CP.find(x=>x.code==c);
if(!r||!r.active)throw new Error("That coupon code is not valid.");
const n=Date.now();if(r.start&&n<+new Date(r.start))throw new Error("That coupon is not active yet.");
if(r.end&&n>+new Date(r.end))throw new Error("That coupon has expired.");
if(r.limit&&(r.used||0)>=r.limit)throw new Error("That coupon has been fully used.");
if(sub<(+r.min||0))throw new Error("This coupon needs an order of at least Rs. "+Number(r.min).toLocaleString("en-PK")+".");
return{code:r.code,type:r.type,value:+r.value,min:+r.min||0}}
function totals(){const sub=cart.reduce((a,l)=>{const p=pr(l.id);return a+l.q*(p?uPrice(p,l.v):0)},0),e=cpEval(CPR,sub),ship=sub==0||sub>=FREE||e.free?0:SHIP;return{sub,disc:e.disc,ship,total:sub-e.disc+ship,coupon:CPR&&sub?CPR.code:"",cpmsg:e.msg}}
const cw=()=>$(".w-commerce-commercecartcontainerwrapper"),tg=o=>{const w=cw();if(w)w.style.display=o?"flex":"none"};
function cartUI(){cart=cart.filter(l=>pr(l.id));LS.set("nc_c",cart);const n=cart.reduce((a,l)=>a+l.q,0);$$(".w-commerce-commercecartopenlinkcount").forEach(e=>e.textContent=n);
const L=$(".w-commerce-commercecartlist"),F=$(".w-commerce-commercecartform"),E=$(".w-commerce-commercecartemptystate"),T=$(".w-commerce-commercecartfooter");
if(L)L.innerHTML=cart.map(l=>{const p=pr(l.id),x=vr(p,l.v),k=lk(l);return `<div class="w-commerce-commercecartitem"><img class="w-commerce-commercecartitemimage" src="${(x&&x.img)||p.imgs[0]||""}" alt=""><div class="w-commerce-commercecartiteminfo"><div class="w-commerce-commercecartproductname">${esc(p.name)}${x?` <small>(${esc(x.label)})</small>`:""}</div><div>${rs(uPrice(p,l.v))}</div><a href="#" data-rm="${esc(k)}" class="w-commerce-commercecartremovelink">Remove</a></div><div class="nc-q"><button type="button" data-q="${esc(k)}" data-d="-1" aria-label="Decrease">−</button><span>${l.q}</span><button type="button" data-q="${esc(k)}" data-d="1" aria-label="Increase">+</button></div></div>`}).join("");
if(F)F.style.display=cart.length?"flex":"none";if(E)E.style.display=cart.length?"none":"block";if(T)T.style.display=cart.length?"":"none";
$$(".w-commerce-commercecartordervalue").forEach(e=>e.textContent=rs(totals().sub))}
function add(id,v){const p=pr(id);if(!p)return;if(hasV(p)&&!vr(p,v)){location.assign("product.html?id="+p.id);return}
const k=hasV(p)?v:null,f=cart.find(l=>l.id==id&&(l.v||null)==k),st=uStock(p,k);if(st<1)return alert("Sorry, this is out of stock.");if(f&&f.q>=st)return alert("Only "+st+" in stock.");f?f.q++:cart.push(k?{id,q:1,v:k}:{id,q:1});cartUI();tg(true)}
function trackLocal(tok){const o=O.find(x=>x.token==tok.trim());$("#tr").innerHTML=o?`<div class="box"><b>Order ${o.id}</b> · ${esc(o.status)} · ${rs(o.total)}<ol>${o.events.map(e=>`<li>${esc(e.s)} <span class="note">${new Date(e.t).toLocaleString()}</span></li>`).join("")}</ol><a class="btn o" href="order.html?t=${encodeURIComponent(o.token)}">Open order page</a></div>`:'<div class="empty">No order found for that tracking code.</div>'}
function tok(){const a=new Uint8Array(12);crypto.getRandomValues(a);return[...a].map(b=>b.toString(16).padStart(2,"0")).join("")}
function placeLocal(c,key){
if(c.hp)throw new Error("Something went wrong. Please try again.");
const ex=O.find(x=>x.idem&&x.idem==key);if(ex)return{order_no:ex.id,token:ex.token,total:ex.total};
const t1=totals();let t=t1,cpn="";if(CPR){const r=cpCheckLocal(CPR.code,t1.sub);CPR=r;LS.set("nc_cpr",r);t=totals();cpn=r.code}const items=[];
for(const l of cart){const p=pr(l.id);if(!p)throw new Error("A product in your cart is no longer available.");const x=vr(p,l.v);if(hasV(p)&&!x)throw new Error("Please choose an option for "+p.name+".");const nm=p.name+(x?" ("+x.label+")":""),st=uStock(p,l.v);if(st<l.q)throw new Error(st>0?"Only "+st+" left of "+nm+".":nm+" is out of stock.");items.push({id:p.id,name:p.name,price:uPrice(p,l.v),q:l.q,...(x?{v:x.id,vl:x.label,sku:x.sku||""}:{})})}
if(!items.length)throw new Error("Your cart is empty.");
items.forEach(i=>{const p=pr(i.id),x=vr(p,i.v);if(x){x.stock-=i.q;p.stock=p.vars.reduce((a,y)=>a+ +y.stock,0)}else p.stock-=i.q});
const o={id:"NC-"+String(1001+O.length),token:tok(),idem:key,cust:{name:c.name,phone:c.phone,email:c.email,province:c.province,city:c.city,area:c.area,addr:c.addr,landmark:c.landmark,postal:c.postal,note:c.note},items,sub:t.sub,total:t.total,ship:t.ship,disc:t.disc,coupon:cpn,pay:"Cash on delivery",status:"Placed",events:[{s:"Placed",t:Date.now()}]};
if(cpn){const c=CP.find(x=>x.code==cpn);if(c){c.used=(c.used||0)+1;LS.set("nc_cp",CP)}}O.unshift(o);save();return{order_no:o.id,token:o.token,total:o.total}}
/* ---- Admin ---- */
const imgs=f=>Promise.all([...f].map(file=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas"),s=Math.min(1,640/Math.max(i.width,i.height));c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",.75))};i.src=URL.createObjectURL(file)})));
/* Options editor: one option per line, "Name | stock | price (optional) | SKU (optional) | photo number (optional)". */
const varText=p=>(p.vars||[]).map(v=>[v.label,v.stock,v.price==null||v.price===""?"":v.price,v.sku||"",v.img&&(p.imgs||[]).indexOf(v.img)>=0?(p.imgs.indexOf(v.img)+1):""].join(" | ").replace(/(\s\|\s)+$/,"")).join("\n");
function parseVars(t,im,old){const out=[],seen=new Set();
String(t||"").split("\n").map(x=>x.trim()).filter(Boolean).forEach((ln,i)=>{const a=ln.split("|").map(x=>x.trim()),label=a[0]||"",nm='Option '+(i+1)+(label?' ("'+label+'")':"");
if(!label||label.length>80)throw new Error(nm+": the name is missing or longer than 80 characters.");
const stock=a[1]===undefined||a[1]===""?NaN:Number(a[1]);if(!Number.isInteger(stock)||stock<0)throw new Error(nm+": stock must be a whole number, 0 or more.");
let price=null;if(a[2]){price=Number(a[2]);if(!(price>=0))throw new Error(nm+": price must be a number, 0 or more (or leave it empty to use the product price).")}
let img="";if(a[4]){const n=parseInt(a[4],10);if(!(n>=1&&im[n-1]))throw new Error(nm+": photo number "+a[4]+" does not exist. This product has "+im.length+" photo(s).");img=im[n-1]}
const k=label.toLowerCase();if(seen.has(k))throw new Error(nm+": this name is used twice.");seen.add(k);
const o=(old||[]).find(x=>String(x.label).toLowerCase()==k);
out.push({id:o?o.id:"v"+Date.now().toString(36)+i,label,sku:a[3]||"",price,stock,img})});
if(out.length>40)throw new Error("A product can have at most 40 options.");return out}
/* ---- admin: packing slips, order timeline, CSV export ---- */
const oSub=o=>(o.items||[]).reduce((a,i)=>a+(+i.price||0)*(+i.q||0),0);
const oDate=o=>{const t=(o.events&&o.events[0]&&o.events[0].t)||Date.now();return new Date(t).toLocaleString("en-PK")};
const oAddr=c=>[c.addr,c.area,c.city,c.province,c.postal].filter(Boolean).join(", ");
function slipHTML(o){const sub=oSub(o)||o.total,ship=Math.max(0,o.total-sub+(o.disc||0)),c=o.cust||{};
return `<section class="sl"><header><div><h1>homefinity<span>.pk</span></h1><p>Packing slip</p></div><div class="r"><b>${esc(o.id)}</b><p>${esc(oDate(o))}</p><p class="st">${esc(o.status)}</p></div></header>
<div class="g"><div><h3>Deliver to</h3><p><b>${esc(c.name||"")}</b><br>${esc(c.phone||"")}${c.email?"<br>"+esc(c.email):""}<br>${esc(oAddr(c))}${c.landmark?"<br>Landmark: "+esc(c.landmark):""}</p></div><div><h3>Payment</h3><p><b>${esc(o.pay||"Cash on delivery")}</b><br>Collect <b>${rs(o.total)}</b> from the customer</p>${c.note?"<h3>Delivery note</h3><p>"+esc(c.note)+"</p>":""}</div></div>
<table><thead><tr><th></th><th>Item</th><th>SKU</th><th class="n">Qty</th><th class="n">Price</th><th class="n">Total</th></tr></thead><tbody>${(o.items||[]).map(i=>`<tr><td class="ck"></td><td>${esc(i.name)}${i.vl?" <i>("+esc(i.vl)+")</i>":""}</td><td>${esc(i.sku||"")}</td><td class="n">${i.q}</td><td class="n">${rs(i.price||0)}</td><td class="n">${rs((i.price||0)*i.q)}</td></tr>`).join("")}</tbody></table>
<div class="t"><p>Subtotal <span>${rs(sub)}</span></p>${o.disc?`<p>Discount (${esc(o.coupon||"")}) <span>− ${rs(o.disc)}</span></p>`:""}<p>Delivery <span>${rs(ship)}</span></p><p class="b">Total to collect <span>${rs(o.total)}</span></p></div>
<footer><p>Packed by: ________________ &nbsp; Checked by: ________________</p><p>Thank you for shopping with homefinity.pk</p></footer></section>`}
function printSlips(list){if(!list.length)return alert("No orders to print.");
const w=window.open("","_blank");if(!w)return alert("Please allow pop-ups for this page to print slips.");
w.document.write(`<!doctype html><meta charset="utf-8"><title>Packing slips</title><style>*{box-sizing:border-box}body{font:14px/1.5 Arial,sans-serif;color:#111;margin:0}.sl{padding:28px 34px;page-break-after:always;max-width:780px;margin:0 auto}header{display:flex;justify-content:space-between;border-bottom:3px solid #111;padding-bottom:12px}h1{margin:0;font-size:30px}h1 span{color:#d52b2b}header p{margin:2px 0}.r{text-align:right}.st{display:inline-block;border:1px solid #111;padding:1px 10px;border-radius:99px;font-size:12px}.g{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:18px 0}h3{margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#666}table{width:100%;border-collapse:collapse}th,td{padding:9px 8px;border-bottom:1px solid #ccc;text-align:left;vertical-align:top}th{font-size:12px;text-transform:uppercase;color:#666}.n{text-align:right}.ck{width:22px}.ck::before{content:"";display:block;width:16px;height:16px;border:2px solid #111;border-radius:3px}.t{margin:16px 0 0 auto;width:280px}.t p{display:flex;justify-content:space-between;margin:4px 0}.t .b{border-top:2px solid #111;padding-top:8px;font-size:17px;font-weight:700}footer{margin-top:40px;color:#444}@media print{.sl{padding:0}}</style>${list.map(slipHTML).join("")}`);
w.document.close();w.focus();setTimeout(()=>w.print(),350)}
function exportOrders(){const q=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';
const rows=[["Order","Date","Status","Name","Phone","Email","Address","City","Province","Postal","Items","Payment","Total"]].concat(O.map(o=>{const c=o.cust||{};return [o.id,oDate(o),o.status,c.name,c.phone,c.email,[c.addr,c.area,c.landmark].filter(Boolean).join(", "),c.city,c.province,c.postal,(o.items||[]).map(i=>i.name+(i.vl?" ("+i.vl+")":"")+" x"+i.q).join("; "),o.pay,o.total]}));
const b=new Blob(["\ufeff"+rows.map(r=>r.map(q).join(",")).join("\r\n")],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="homefinity-orders-"+new Date().toISOString().slice(0,10)+".csv";document.body.appendChild(a);a.click();a.remove()}
let ofilt="";
const IC={cpn:'<path d="M19 5 5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>',dash:'<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',prod:'<path d="M21 8 12 3 3 8l9 5zM3 8v8l9 5 9-5V8M12 13v8"/>',ord:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',money:'<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',bag:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18"/>',tag:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'};
const ico=k=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||(k=="cat"?IC.tag:"")}</svg>`;
const oT=o=>+new Date((o.events&&o.events[0]&&o.events[0].t)||Date.now());
const dKey=t=>{const d=new Date(t);d.setHours(0,0,0,0);return +d};
function dayData(n){const end=dKey(Date.now()),days=[],rev=Array(n).fill(0),cnt=Array(n).fill(0);for(let i=n-1;i>=0;i--)days.push(end-i*864e5);
O.forEach(o=>{const k=days.indexOf(dKey(oT(o)));if(k<0)return;cnt[k]++;if(o.status!="Cancelled")rev[k]+=o.total});return {days,rev,cnt}}
const sum=(a,f,t)=>a.slice(f,t).reduce((x,y)=>x+y,0);
const delta=(a)=>{const n=a.length,h=Math.floor(n/2),cur=sum(a,n-7,n),prev=sum(a,n-14,n-7);return prev?Math.round((cur-prev)/prev*100):(cur?100:null)};
const dlt=d=>d==null?'<em class="fl">no earlier data</em>':`<em class="${d>=0?"up":"dn"}">${d>=0?"▲":"▼"} ${Math.abs(d)}%</em> vs previous 7 days`;
function spark(a){const w=120,h=36,m=Math.max(...a,1),p=a.map((v,i)=>[(i/(a.length-1))*w,h-3-(v/m)*(h-8)]);const l=p.map(x=>x.join(",")).join(" ");return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,${h} ${l} ${w},${h}"/><polyline points="${l}"/></svg>`}
function revChart(d){const W=640,H=250,L=52,B=28,T=14,R=8,iw=W-L-R,ih=H-T-B,mx=Math.max(...d.rev,1),top=Math.ceil(mx/1000)*1000||1000,bw=iw/d.rev.length;
const grid=[0,.5,1].map(f=>{const y=T+ih-f*ih;return `<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-8}" y="${y+4}" text-anchor="end">${f?(top*f>=1000?Math.round(top*f/100)/10+"k":Math.round(top*f)):0}</text>`}).join("");
const bars=d.rev.map((v,i)=>{const bh=Math.max(v?3:0,v/top*ih),x=L+i*bw+bw*.18,y=T+ih-bh;return `<rect class="bar" style="animation-delay:${i*35}ms" x="${x}" y="${y}" width="${bw*.64}" height="${bh}" rx="5"><title>${new Date(d.days[i]).toLocaleDateString("en-PK",{day:"numeric",month:"short"})}: ${rs(v)} · ${d.cnt[i]} order${d.cnt[i]==1?"":"s"}</title></rect>`}).join("");
const xs=d.days.map((t,i)=>i%2?"":`<text x="${L+i*bw+bw/2}" y="${H-8}" text-anchor="middle">${new Date(t).getDate()}</text>`).join("");
return `<svg class="rc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue over the last 14 days">${grid}${bars}${xs}</svg>`}
const STC={Placed:"#d9a21b",Confirmed:"#2f6fdd",Packed:"#7a4fd6",Dispatched:"#0f9b9b",Delivered:"#1d8a4a",Cancelled:"#d03a3a"};
function siteBase(){const u=String((window.HF||{}).siteUrl||"").replace(/\/+$/,"");return u||(/^https?:$/.test(location.protocol)&&!/localhost|127\.0\.0\.1/.test(location.hostname)?location.origin:"https://homefinity.pk")}
function sitemapDownload(){const b=siteBase(),day=new Date().toISOString().slice(0,10),u=["","products.html","about.html","journal.html","contact.html","policies.html"].map(x=>b+"/"+x).concat(P.map(p=>b+"/product.html?id="+encodeURIComponent(p.id)));
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+u.map(x=>"  <url><loc>"+esc(x)+"</loc><lastmod>"+day+"</lastmod></url>").join("\n")+"\n</urlset>\n";
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([xml],{type:"application/xml"}));a.download="sitemap.xml";document.body.appendChild(a);a.click();a.remove()}
async function shSubmit(e){e.preventDefault();const f=e.target,fee=Math.floor(+f.fee.value),free=Math.floor(+f.free.value);
if(!(fee>=0&&fee<=10000))return alert("Enter a delivery fee between 0 and 10,000.");
if(!(free>=1))return alert("Enter the order amount for free delivery (1 or more).");
if(sb){const {error}=await sb.from("settings").upsert([{key:"ship_fee",value:String(fee)},{key:"free_over",value:String(free)}]);if(error)return alert(error.message)}
else LS.set("nc_ship",{fee,free});
SHIP=fee;FREE=free;pubShip();shFlash=true;await cpRefresh()}
const cpRefresh=async()=>{if(sb){await loadAll(true);adminDB()}else admin()};
async function cpSubmit(e){e.preventDefault();const f=e.target,code=f.code.value.trim().toUpperCase(),type=f.type.value,val=Math.floor(+f.value.value)||0,min=Math.floor(+f.min.value)||0,lim=f.limit.value?Math.floor(+f.limit.value):null,
st=f.start.value?new Date(f.start.value+"T00:00:00").toISOString():null,en=f.end.value?new Date(f.end.value+"T23:59:59").toISOString():null;
if(!/^[A-Z0-9_-]{3,20}$/.test(code))return alert("The code must be 3 to 20 letters or numbers (you can also use - and _).");
if(type!="freeship"&&!(val>0))return alert("Enter a discount value above 0.");
if(type=="percent"&&val>100)return alert("A percentage cannot be more than 100.");
if(st&&en&&en<st)return alert("The end date must be after the start date.");
if(lim!=null&&lim<1)return alert("The usage limit must be 1 or more.");
if(CP.some(c=>c.code==code))return alert("That code already exists.");
const v=type=="freeship"?0:val;
if(sb){const {error}=await sb.from("coupons").insert({code,type,value:v,min_order:min,starts_at:st,ends_at:en,usage_limit:lim});if(error)return alert(error.message)}
else{CP.push({code,type,value:v,min,start:st,end:en,limit:lim,used:0,active:true});LS.set("nc_cp",CP)}
await cpRefresh()}
async function cpToggle(code){const c=CP.find(x=>x.code==code);if(!c)return;
if(sb){const {error}=await sb.from("coupons").update({active:!c.active}).eq("code",code);if(error)return alert(error.message)}else{c.active=!c.active;LS.set("nc_cp",CP)}
await cpRefresh()}
async function cpDelete(code){if(!confirm("Delete coupon "+code+"? Orders that already used it keep their discount."))return;
if(sb){const {error}=await sb.from("coupons").delete().eq("code",code);if(error)return alert(error.message)}else{CP=CP.filter(x=>x.code!=code);LS.set("nc_cp",CP)}
await cpRefresh()}
function adminLocal(){const a=$("#admin"),on=!!window.NC_ADMIN;a.hidden=!on;document.querySelector(".page-wrapper").hidden=on;document.body.classList.toggle("adm-on",on);if(!on)return;
const rev=O.filter(o=>o.status!="Cancelled").reduce((s,o)=>s+o.total,0);
const openN=O.filter(o=>["Placed","Confirmed","Packed"].includes(o.status)).length;const tabs=[["dash","Dashboard"],["prod","Products"],["cat","Categories"],["ord","Orders"],["cpn","Coupons"],["set","Settings"]].map(([k,n])=>`<button data-t="${k}" aria-pressed="${tab==k}">${ico(k)}<span>${n}</span>${k=="ord"&&openN?`<em class="cnt">${openN}</em>`:""}</button>`).join("");let body="";
if(tab=="dash"){const d=dayData(14),all=O.filter(o=>o.status!="Cancelled"),openO=O.filter(o=>["Placed","Confirmed","Packed"].includes(o.status)),
avg=all.length?Math.round(rev/all.length):0,agg={};O.filter(o=>o.status!="Cancelled").forEach(o=>(o.items||[]).forEach(i=>{const a=agg[i.name]||(agg[i.name]={n:i.name,u:0,r:0});a.u+=+i.q||0;a.r+=(+i.price||0)*(+i.q||0)}));
const top=Object.values(agg).sort((a,b)=>b.u-a.u).slice(0,5),tm=Math.max(...top.map(x=>x.u),1);
const low=P.flatMap(p=>hasV(p)?p.vars.filter(v=>+v.stock<=5).map(v=>({n:p.name+" – "+v.label,s:+v.stock})):(p.stock<=5?[{n:p.name,s:p.stock}]:[])).sort((a,b)=>a.s-b.s);
const kpi=(t,ic,v,f,sp)=>`<div class="kpi"><div class="kpi-h"><span>${t}</span><i>${ico(ic)}</i></div><b>${v}</b><div class="kpi-f">${f}</div>${sp||""}</div>`;
const sc=STAT.map(k=>({k,n:O.filter(o=>o.status==k).length})),sm=Math.max(...sc.map(x=>x.n),1);
body=`<div class="kpis">${kpi("Revenue","money",rs(rev),dlt(delta(d.rev)),spark(d.rev))}${kpi("Orders","bag",O.length,dlt(delta(d.cnt)),spark(d.cnt))}${kpi("Average order","tag",all.length?rs(avg):"–",'<em class="fl">excludes cancelled</em>')}${kpi("Needs action","clock",openN,openN?'<button class="lnk" data-t="ord">Review open orders →</button>':'<em class="fl">All caught up</em>')}</div>
<div class="adm-row r21"><section class="card"><header><h3>Revenue</h3><span class="note">Last 14 days</span></header>${O.length?revChart(d):'<div class="empty">Revenue will appear here after your first order.</div>'}</section>
<section class="card"><header><h3>Orders by status</h3><span class="note">${O.length} total</span></header><ul class="sbars">${sc.map(x=>`<li><span>${x.k}</span><div><i style="width:${x.n/sm*100}%;background:${STC[x.k]}"></i></div><b>${x.n}</b></li>`).join("")}</ul></section></div>
<div class="adm-row r111"><section class="card"><header><h3>Top products</h3><span class="note">By units sold</span></header>${top.length?`<ol class="tops">${top.map((x,i)=>`<li><span class="rk">${i+1}</span><div><b>${esc(x.n)}</b><div class="tb"><i style="width:${x.u/tm*100}%"></i></div></div><span class="tv">${x.u} sold<small>${rs(x.r)}</small></span></li>`).join("")}</ol>`:'<div class="empty">No sales yet.</div>'}</section>
<section class="card"><header><h3>Low or out of stock</h3><span class="note">${low.length} item${low.length==1?"":"s"}</span></header>${low.length?`<ul class="lows">${low.map(x=>`<li><span>${esc(x.n)}</span><b class="${x.s<=0?"out":"low"}">${x.s<=0?"Out":x.s+" left"}</b></li>`).join("")}</ul>`:'<div class="empty">All products well stocked.</div>'}</section>
<section class="card wide"><header><h3>Recent orders</h3><button class="lnk" data-t="ord">View all →</button></header>${O.length?`<div class="tw"><table class="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th class="n">Total</th><th>Status</th></tr></thead><tbody>${O.slice(0,6).map(o=>`<tr><td><b>${esc(o.id)}</b></td><td>${esc((o.cust||{}).name||"")}<small>${esc((o.cust||{}).city||"")}</small></td><td>${esc(oDate(o))}</td><td class="n">${rs(o.total)}</td><td><span class="bd bd-${String(o.status).toLowerCase()}">${esc(o.status)}</span></td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">No orders yet.</div>'}</section></div>`}
if(tab=="set"){body=`<form id="shf" class="pform shf card"><h3>Delivery</h3><p class="note">These amounts are shown to customers in the cart, at checkout and on the Policies page, and are used when an order is placed.</p>${shFlash?'<p class="sh-ok" role="status">Saved. Customers see the new amounts straight away.</p>':""}<div class="cpn-2"><label>Delivery fee (Rs.)<input name="fee" type="number" min="0" max="10000" step="1" required value="${SHIP}"></label><label>Free delivery from (Rs.)<input name="free" type="number" min="1" step="1" required value="${FREE}"></label></div><p class="note sh-prev">Right now customers pay <b>${rs(SHIP)}</b> delivery, and delivery is free once their products total reaches <b>${rs(FREE)}</b> (before any coupon).</p><button class="btn">Save settings</button></form>
<section class="card shf seo-card"><h3>Search engines</h3><p class="note">Download a sitemap that lists your pages and every product, then upload it to your website's main folder in place of <b>sitemap.xml</b>. Do this again after you add or remove products.</p><p class="note sh-prev">Address used in the sitemap: <b>${esc(siteBase())}</b>${/localhost|127\.0\.0\.1|^file:/.test(siteBase())?" — this looks like a test address. Add <b>siteUrl</b> to config.js (see the setup guide) before you upload it.":""}</p><button class="btn" type="button" data-sitemap="1">Download sitemap.xml</button></section>`;shFlash=false}
if(tab=="cpn"){const now=Date.now(),sx=c=>!c.active?["Disabled","bd-cancelled"]:(c.end&&now>+new Date(c.end))?["Expired","bd-cancelled"]:(c.start&&now<+new Date(c.start))?["Scheduled","bd-confirmed"]:(c.limit&&(c.used||0)>=c.limit)?["Used up","bd-packed"]:["Active","bd-delivered"],
dt=v=>v?new Date(v).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}):"–",
off=c=>c.type=="percent"?c.value+"% off":c.type=="fixed"?rs(c.value)+" off":"Free delivery";
body=`<div class="cpn-grid"><form id="cpf" class="pform cpn-form"><h3>New coupon</h3><label>Code<input name="code" required maxlength="20" placeholder="WELCOME10" autocapitalize="characters" spellcheck="false" style="text-transform:uppercase"></label><label>Type<select name="type"><option value="percent">Percentage off</option><option value="fixed">Fixed amount off (Rs.)</option><option value="freeship">Free delivery</option></select></label><label>Value<input name="value" type="number" min="1" step="1" placeholder="10 (% or Rs.)"></label><label>Minimum order (Rs.)<input name="min" type="number" min="0" step="1" placeholder="0"></label><div class="cpn-2"><label>Starts<input name="start" type="date"></label><label>Ends<input name="end" type="date"></label></div><label>Usage limit<input name="limit" type="number" min="1" step="1" placeholder="Leave empty for unlimited"></label><button class="btn">Create coupon</button></form>
<section class="card"><header><h3>All coupons</h3><span class="note">${CP.filter(c=>sx(c)[0]=="Active").length} active</span></header>${CP.length?`<div class="tw"><table class="tbl"><thead><tr><th>Code</th><th>Offer</th><th>Min order</th><th>Valid</th><th>Used</th><th>Status</th><th></th></tr></thead><tbody>${CP.map(c=>{const z=sx(c);return `<tr><td><b>${esc(c.code)}</b></td><td>${off(c)}</td><td>${c.min?rs(c.min):"–"}</td><td>${dt(c.start)} → ${dt(c.end)}</td><td>${c.used||0}${c.limit?" / "+c.limit:""}</td><td><span class="bd ${z[1]}">${z[0]}</span></td><td class="n"><button class="btn o" data-cpt="${esc(c.code)}">${c.active?"Disable":"Enable"}</button> <button class="btn o" data-cpd="${esc(c.code)}">Delete</button></td></tr>`}).join("")}</tbody></table></div>`:'<div class="empty">No coupons yet. Create your first one on the left.</div>'}</section></div>`}
if(tab=="prod")body=`<form id="pf" class="box pform pf2"><input type="hidden" name="id">
<h3 class="fs">Basics</h3>
<div class="fld"><label class="rte-l" for="pname">Product name</label><input name="name" id="pname" required placeholder="e.g. NICE Pastel Insulated Bottle"><p class="note">Shown as the main heading (H1) of the product page.</p></div>
<div class="fg3"><div class="fld"><label class="rte-l" for="pcat">Category</label><select name="cat" id="pcat" required><option value="">Choose a category…</option>${cOrd().map(c=>`<option value="${esc(c.name)}">${esc(c.name)}</option>`).join("")}</select></div>
<div class="fld"><label class="rte-l" for="pprice">Price (Rs.)</label><input name="price" id="pprice" type="number" min="0" required placeholder="1500"></div>
<div class="fld"><label class="rte-l" for="pstock">Stock</label><input name="stock" id="pstock" type="number" min="0" placeholder="Total in stock"></div></div>
<p class="note fnote">${C.length?"Need another category?":"You have no categories yet."} <button type="button" class="lnk" data-t="cat">Manage categories</button> · Stock is ignored when the product has options.</p>
<div class="fld"><label class="rte-l" for="psum">Short summary</label><textarea name="d" id="psum" maxlength="300" rows="2" placeholder="One or two lines, plain text. Shown under the product title and on product cards."></textarea></div>
<h3 class="fs">Descriptions</h3>
${rte("ld","Full description","","Shown below the product photos and price. Use Heading 2 for section titles.")}
${rte("ex","Additional information","","Shown under an Additional information heading, for example size, material and care.")}
<h3 class="fs">Options and photos</h3>
<div class="fld"><label class="rte-l" for="vs">Options such as colour or size (optional)</label><p class="note">One option per line: <code>Name | stock | price | SKU | photo number</code>. Price, SKU and photo number can be left out. Example: <code>Pink | 12 | 1500 | NICE-PNK | 2</code></p><textarea name="vs" id="vs" rows="4" placeholder="Pink | 12 | 1500 | NICE-PNK | 2&#10;Mint | 8"></textarea></div>
<div class="fld"><label class="rte-l" for="pfiles">Photos</label><p class="note">The first photo is the main image. Choose new photos only if you want to replace the current ones.</p><input name="files" id="pfiles" type="file" accept="image/*" multiple></div>
<div class="savebar"><button class="btn">Save product</button><button type="reset" class="btn o" id="pfreset">Clear form</button></div></form>
${P.map(p=>`<div class="line"><img src="${p.imgs[0]||""}" alt=""><div><b>${esc(p.name)}</b><div class="note">${esc(p.cat)} · ${hasV(p)?"from "+rs(fromP(p))+" · "+p.vars.length+" option"+(p.vars.length==1?"":"s"):rs(p.price)} · stock ${p.stock}</div></div><span class="qty"><button class="btn o" data-e="${p.id}">Edit</button><button class="btn o" data-x="${p.id}">Delete</button></span></div>`).join("")}`;
if(tab=="cat"){const cnt=n=>P.filter(p=>p.cat==n).length;
body=`${sb&&!catOK?'<div class="box note">The categories table is missing. Run <code>supabase_migration_categories.sql</code> in Supabase, SQL Editor, then refresh this page.</div>':""}<form id="catf" class="box pform"><input type="hidden" name="cid"><input name="cname" required maxlength="60" placeholder="Category name, e.g. Insulated Bottles"><textarea name="cdesc" maxlength="400" placeholder="Short description (optional). Shown on the shop page when this category is chosen."></textarea><input name="csort" type="number" placeholder="Order (smaller shows first, e.g. 10). Leave empty to add at the end."><button class="btn">Save category</button><button type="button" class="btn o" id="catx" hidden>Cancel edit</button></form>${cOrd().map(c=>`<div class="line"><div><b>${esc(c.name)}</b><div class="note">${cnt(c.name)} product${cnt(c.name)==1?"":"s"} · order ${esc(c.sort)}${c.desc?" · "+esc(c.desc.slice(0,80)):""}</div></div><span class="qty"><button class="btn o" data-ce="${c.id}">Edit</button><button class="btn o" data-cx="${c.id}">Delete</button></span></div>`).join("")||'<div class="empty card">No categories yet. Add your first one above.</div>'}`}
if(tab=="ord"){const list=O.filter(o=>!ofilt||o.status==ofilt);
const card=o=>{const c=o.cust||{},n=(o.items||[]).reduce((a,i)=>a+(+i.q||0),0);return `<article class="oc"><header><div class="oc-l"><b class="oid">${esc(o.id)}</b><span class="bd bd-${String(o.status).toLowerCase()}">${esc(o.status)}</span></div><div class="oc-r"><b>${rs(o.total)}</b>${o.disc?`<span class="note">incl. ${rs(o.disc)} off (${esc(o.coupon||"coupon")})</span>`:""}<span class="note">${esc(oDate(o))} · ${esc(o.pay||"")}</span></div></header><div class="oc-g"><div><h4>Customer</h4><p><b>${esc(c.name||"")}</b><br>${esc(c.phone||"")}${c.email?"<br>"+esc(c.email):""}</p><p class="note">${esc(oAddr(c))}${c.landmark?"<br>Landmark: "+esc(c.landmark):""}${c.note?"<br>Note: "+esc(c.note):""}</p></div><div><h4>Items (${n})</h4><ul class="oi">${(o.items||[]).map(i=>`<li><span>${esc(i.name)}${i.vl?" <i>("+esc(i.vl)+")</i>":""}</span><b>×${i.q}</b></li>`).join("")}</ul></div><div><h4>Progress</h4><ol class="otl">${(o.events||[]).map(e=>`<li><b>${esc(e.s)}</b><span>${new Date(e.t).toLocaleString("en-PK")}</span></li>`).join("")}</ol></div></div><footer><button class="btn o" data-slip="${o.id}">Print packing slip</button><label>Status <select data-o="${o.id}">${STAT.map(s=>`<option${s==o.status?" selected":""}>${s}</option>`).join("")}</select></label></footer></article>`};
body=`<div class="otools"><div class="chips">${["",...STAT].map(k=>`<button class="ofil${ofilt==k?" on":""}" data-of="${k}">${k||"All"}<em>${k?O.filter(o=>o.status==k).length:O.length}</em></button>`).join("")}</div><span class="grow"></span>${O.length?'<button class="btn" data-slipall="1">Print open slips</button><button class="btn o" data-csv="1">Export CSV</button>':""}</div>`+(list.map(card).join("")||'<div class="empty card">No orders'+(ofilt?" with status "+ofilt:" yet")+'.</div>')}
const TT={dash:"Dashboard",prod:"Products",cat:"Categories",ord:"Orders",cpn:"Coupons",set:"Settings"},SS={dash:new Date().toLocaleDateString("en-PK",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),prod:P.length+" product"+(P.length==1?"":"s")+" in your catalogue",ord:O.length+" order"+(O.length==1?"":"s")+" in total",cpn:CP.length+" coupon"+(CP.length==1?"":"s"),set:"Store settings",cat:C.length+" categor"+(C.length==1?"y":"ies")+" for your products"};
a.innerHTML=`<div class="adm"><aside class="adm-side"><div class="adm-brand">homefinity<span>.pk</span><small>Admin</small></div><nav class="tabs" aria-label="Admin">${tabs}</nav><a class="adm-back" href="index.html">← Back to store</a></aside><section class="adm-main"><header class="adm-top"><div><h2>${TT[tab]}</h2><p class="note">${SS[tab]}</p></div>${sb?"":'<span class="adm-demo">Demo mode · data stays in this browser</span>'}</header>${body}</section></div>`;
const cpf=$("#cpf");if(cpf)cpf.onsubmit=cpSubmit;
const shf=$("#shf");if(shf)shf.onsubmit=shSubmit;
bindCat();const sf=$("#sf");if(sf)sf.onsubmit=e=>{e.preventDefault();LS.set("nc_video",sf.v.value.trim());alert("Saved")};const f=$("#pf");if(f)f.onsubmit=async e=>{e.preventDefault();const id=+f.id.value||Date.now(),old=pr(id),n=await imgs(f.files.files);
const im=n.length?n:(old?.imgs||[]);let vars;try{vars=parseVars(f.vs.value,im,old?.vars)}catch(er){return alert(er.message)}
const p={id,name:f.name.value,cat:f.cat.value,price:+f.price.value,stock:vars.length?vars.reduce((a,v)=>a+v.stock,0):(+f.stock.value||0),d:f.d.value,long:rget(f,"ld"),extra:rget(f,"ex"),ing:old?.ing||"",imgs:im,vars};
P=old?P.map(x=>x.id==id?p:x):[...P,p];save();admin();shop()}}
function openVid(){const u=LS.get("nc_video",""),m=u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);let h;
if(m)h=`<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1" allow="autoplay;encrypted-media;fullscreen" allowfullscreen style="aspect-ratio:16/9;border:0"></iframe>`;
else if(/^https?:|^data:|\.mp4|\.webm/.test(u))h=`<video src="${esc(u)}" controls autoplay></video>`;
else h='<p style="padding:24px">No video added yet. Open Admin &rarr; Settings and paste a YouTube or .mp4 link.</p>';
$("#vbody").innerHTML=h;$("#vid").showModal()}

const CFG=window.NC_CONFIG||{},sb=(CFG.url&&window.supabase)?supabase.createClient(CFG.url,CFG.key):null;
const admin=()=>sb?adminDB():adminLocal(),place=f=>submitCheckout(f),track=t=>sb?trackDB(t):trackLocal(t);
/* ---- checkout: validation, double-submit guard, idempotency key, order page hand-off, NC_API for order.html ---- */
const CK={key:"",sig:"",busy:false};
const newKey=()=>(window.crypto&&crypto.randomUUID?crypto.randomUUID():tok()+tok());
function phoneNorm(v){let d=String(v||"").replace(/\D/g,"");if(d.startsWith("0092"))d=d.slice(4);else if(d.startsWith("92"))d=d.slice(2);else if(d.startsWith("0"))d=d.slice(1);return d?"0"+d:""}
const phoneOk=p=>/^03\d{9}$/.test(p)||/^0[12456789]\d{8,9}$/.test(p);
const PROVS=["Sindh","Punjab","Khyber Pakhtunkhwa","Balochistan","Islamabad Capital Territory","Azad Jammu & Kashmir","Gilgit-Baltistan"];
function vCheckout(f){
const g=n=>(f.elements[n]&&f.elements[n].value!=null?String(f.elements[n].value):"").trim().replace(/\s+/g," "),E={};
const c={name:g("name"),phone:phoneNorm(g("phone")),email:g("email").toLowerCase(),province:g("province"),city:g("city"),area:g("area"),addr:g("addr"),landmark:g("landmark"),postal:g("postal").replace(/\s/g,""),note:g("note"),hp:g("website")};
if(c.name.length<2||c.name.length>80||!/\p{L}/u.test(c.name))E.name="Please enter your full name.";
if(!phoneOk(c.phone))E.phone="Enter a valid Pakistani phone number, for example 0300 1234567.";
if(c.email&&(c.email.length>120||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)))E.email="That email address does not look right. You can also leave it empty.";
if(!PROVS.includes(c.province))E.province="Please choose your province.";
if(c.city.length<2||c.city.length>60||!/\p{L}{2}/u.test(c.city))E.city="Please enter your city.";
if(c.area.length<2||c.area.length>80||!/\p{L}/u.test(c.area))E.area="Please enter your area or neighbourhood.";
if(c.addr.length<6||c.addr.length>200||!/\p{L}/u.test(c.addr))E.addr="Please enter your house or flat number and street.";
if(c.landmark.length>100)E.landmark="Landmark is too long (100 characters at most).";
if(c.postal&&!/^\d{5}$/.test(c.postal))E.postal="Postal code should be 5 digits, or leave it empty.";
if(c.note.length>300)E.note="Delivery note is too long (300 characters at most).";
if(f.elements.terms&&!f.elements.terms.checked)E.terms="Please tick this box to place your order.";
return{ok:!Object.keys(E).length,E,c}}
function ckErr(f,E,msg){
f.querySelectorAll(".cf-e").forEach(x=>x.remove());
f.querySelectorAll("[aria-invalid]").forEach(x=>{x.removeAttribute("aria-invalid");x.removeAttribute("aria-describedby")});
let first=null;
for(const k in E){const el=f.elements[k];if(!el)continue;el.setAttribute("aria-invalid","true");const m=document.createElement("small");m.className="cf-e";m.id="cf-e-"+k;m.textContent=E[k];el.setAttribute("aria-describedby",m.id);el.after(m);first=first||el}
const s=document.getElementById("cf-err");if(s){s.textContent=msg||"";s.hidden=!msg}
if(first)first.focus()}
function ckBusy(f,on){const b=f.querySelector("#cf-go");if(b){b.disabled=!!on;const sp=b.querySelector("span");if(sp)sp.textContent=on?"Placing order…":"Place order"}f.setAttribute("aria-busy",on?"true":"false")}
function ckSum(){const el=document.getElementById("cf-sum");if(!el)return;const t=totals();
el.innerHTML='<div><span>Subtotal</span><b>'+rs(t.sub)+'</b></div><div><span>Delivery</span><b>'+(t.ship?rs(t.ship):"Free")+'</b></div><div class="t"><span>Total, pay on delivery</span><b>'+rs(t.total)+'</b></div>'}
function ckOpen(){const f=$("#cf"),sig=JSON.stringify(cart.map(l=>[l.id,l.v||"",l.q]));
if(!CK.key||CK.sig!=sig){CK.key=newKey();CK.sig=sig}
if(f){ckErr(f,{},"");ckBusy(f,false);CK.busy=false}
ckSum();$("#cko").showModal()}
function orderDone(r,c){
try{const rec=LS.get("hf_recent",[]).filter(x=>x.t!=r.token);rec.unshift({n:r.order_no,t:r.token,total:+r.total,at:Date.now(),email:c.email||""});localStorage.setItem("hf_recent",JSON.stringify(rec.slice(0,10)))}catch(e){}
CK.key="";CK.sig="";cart=[];CPR=null;LS.set("nc_cpr",null);cartUI();
try{$("#cko").close()}catch(e){}
location.assign("order.html?t="+encodeURIComponent(r.token)+"&new=1")}
async function submitCheckout(f){
if(CK.busy)return;
const v=vCheckout(f);
if(!v.ok){ckErr(f,v.E,"Please fix the highlighted fields.");return}
if(!cart.length){ckErr(f,{},"Your cart is empty.");return}
if(!CK.key)CK.key=newKey();
CK.busy=true;ckBusy(f,true);ckErr(f,{},"");
try{const r=await(sb?placeDB(v.c,CK.key):placeLocal(v.c,CK.key));orderDone(r,v.c)}
catch(err){ckErr(f,{},err&&err.message?err.message:"We could not place your order. Please check your connection and try again.");CK.busy=false;ckBusy(f,false)}}
window.NC_API={sb:!!sb,async getOrder(tk){tk=String(tk||"").trim();if(!tk)return null;
if(sb){const {data,error}=await sb.rpc("track_order",{p_token:tk});if(error)throw error;return data||null}
const o=O.find(x=>x.token==tk);if(!o)return null;
return{order_no:o.id,status:o.status,total:o.total,subtotal:o.sub!=null?o.sub:o.total-(o.ship||0),shipping:o.ship||0,discount:o.disc||0,coupon:o.coupon||"",payment_method:o.pay,created_at:(o.events[0]||{}).t,items:o.items,events:o.events.map(e=>({status:e.s,created_at:e.t}))}}};
window.NC_API.cart={
lines:()=>cart.map(l=>{const p=pr(l.id);if(!p)return null;const x=vr(p,l.v);return{key:lk(l),id:l.id,v:l.v||null,q:l.q,p,vr:x,vl:x?x.label:"",price:uPrice(p,l.v),max:uStock(p,l.v),img:(x&&x.img)||(p.imgs&&p.imgs[0])||""}}).filter(Boolean),
totals:()=>({...totals(),free:FREE,fee:SHIP}),
async applyCoupon(code){const sub=totals().sub;if(!sub)throw new Error("Your cart is empty.");let r;
if(sb){const {data,error}=await sb.rpc("validate_coupon",{p_code:String(code||"").trim(),p_subtotal:sub});
if(error)throw new Error("We could not check that coupon. Please try again in a moment.");
if(!data||!data.ok)throw new Error((data&&data.message)||"That coupon code is not valid.");
r={code:data.code,type:data.type,value:+data.value,min:+data.min||0}}else r=cpCheckLocal(code,sub);
CPR=r;LS.set("nc_cpr",r);cartUI();return totals()},
removeCoupon(){CPR=null;LS.set("nc_cpr",null);cartUI()},
set(key,q){const l=cart.find(x=>lk(x)==key);if(!l)return;const p=pr(l.id);if(!p)return;q=Math.floor(+q)||0;const m=uStock(p,l.v);if(q>m)q=m;if(q<1)cart=cart.filter(x=>x!==l);else l.q=q;cartUI()},
remove(key){cart=cart.filter(x=>lk(x)!=key);cartUI()},
fixStock(){const n=[];for(const l of [...cart]){const p=pr(l.id);if(!p)continue;const x=vr(p,l.v),nm=p.name+(x?" ("+x.label+")":""),st=uStock(p,l.v);if(hasV(p)&&!x){cart=cart.filter(y=>y!==l);n.push(nm+" is no longer available, so we removed it from your cart.")}else if(st<1){cart=cart.filter(y=>y!==l);n.push(nm+" is sold out, so we removed it from your cart.")}else if(l.q>st){l.q=st;n.push("Only "+st+" of "+nm+" are left, so we changed the quantity.")}}if(n.length)cartUI();return n},
ready:()=>new Promise(res=>{let n=0;(function w(){if(P.length||++n>100)res();else setTimeout(w,100)})()})};
/* ---- end checkout block ---- */


async function loadAll(full){const {data:pd}=await sb.from("products").select("*").order("id");
P=(pd||[]).map(r=>({id:r.id,name:r.name,cat:r.category,price:+r.price,stock:r.stock,imgs:r.images||[],ing:r.details||"",d:r.description||"",vars:Array.isArray(r.variants)?r.variants:[],long:r.long_description||"",extra:r.extra_info||""}));
const {data:cd,error:ce}=await sb.from("categories").select("*").order("sort").order("name");catOK=!ce;C=ce?deriveC():(cd||[]).map(r=>({id:r.id,name:r.name,slug:r.slug,desc:r.description||"",sort:r.sort||0}));
const {data:st}=await sb.from("settings").select("key,value");(st||[]).forEach(r=>{if(r.key=="ship_fee")SHIP=+r.value;if(r.key=="free_over")FREE=+r.value;if(r.key=="video_url")LS.set("nc_video",r.value)});pubShip();
if(full){const {data:od}=await sb.from("orders").select("*, order_events(status,created_at)").order("created_at",{ascending:false});
O=(od||[]).map(r=>({id:r.order_no,cust:r.customer,items:r.items,total:+r.total,disc:+r.discount||0,coupon:r.coupon||"",pay:r.payment_method,status:r.status,events:(r.order_events||[]).map(e=>({s:e.status,t:e.created_at}))}));
const {data:cd}=await sb.from("coupons").select("*").order("created_at",{ascending:false});CP=(cd||[]).map(r=>({code:r.code,type:r.type,value:+r.value,min:+r.min_order||0,start:r.starts_at,end:r.ends_at,limit:r.usage_limit,used:r.used_count||0,active:r.active}))}}
async function placeDB(c,key){
const {data,error}=await sb.rpc("place_order",{p_customer:c,p_items:cart.map(l=>({id:l.id,q:l.q,v:l.v||null})),p_idem:key,...(CPR&&CPR.code?{p_coupon:CPR.code}:{})});
if(error){const m=String(error.message||"");console.error("place_order failed",error);
if(/failed to fetch|network|load failed/i.test(m))throw new Error("Connection problem. Your order may not have gone through. It is safe to press Place order again; we will not create a duplicate.");
if(/could not find the function|schema cache/i.test(m))throw new Error("Checkout is being updated. Please try again in a few minutes.");
throw new Error(m||"We could not place your order. Please try again.")}
return data}
async function trackDB(tk){const {data}=await sb.rpc("track_order",{p_token:tk.trim()});
$("#tr").innerHTML=data?`<div class="box"><b>Order ${esc(data.order_no)}</b> · ${esc(data.status)} · ${rs(data.total)}<ol>${data.events.map(e=>`<li>${esc(e.status)} <span class="note">${new Date(e.created_at).toLocaleString()}</span></li>`).join("")}</ol><a class="btn o" href="order.html?t=${encodeURIComponent(tk.trim())}">Open order page</a></div>`:'<div class="empty">No order found for that tracking code.</div>'}
const toBlob=file=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas"),s=Math.min(1,900/Math.max(i.width,i.height));c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);c.toBlob(r,"image/jpeg",.82)};i.src=URL.createObjectURL(file)});
async function adminDB(){const a=$("#admin"),on=!!window.NC_ADMIN;document.querySelector(".page-wrapper").hidden=on;a.hidden=!on;if(!on)return;
const {data:{session}}=await sb.auth.getSession();
if(!session){a.innerHTML='<div class="wrap"><h2>Admin login</h2><form id="lf" class="box pform"><input name="em" type="email" required placeholder="Email" autocomplete="username"><input name="pw" type="password" required placeholder="Password" autocomplete="current-password"><button class="btn">Log in</button><p class="note" id="lm"></p></form><a class="btn o" href="index.html">Back to store</a></div>';
$("#lf").onsubmit=async e=>{e.preventDefault();const {error}=await sb.auth.signInWithPassword({email:e.target.em.value,password:e.target.pw.value});error?$("#lm").textContent=error.message:adminDB()};return}
const {data:ad}=await sb.from("admins").select("user_id");
if(!ad||!ad.length){a.innerHTML='<div class="wrap"><h2>Not an admin</h2><p>This account has not been added to the admins table.</p><button class="btn" id="lo">Log out</button></div>';$("#lo").onclick=async()=>{await sb.auth.signOut();location.href="index.html"};return}
await loadAll(true);adminLocal();$("#admin .tabs").insertAdjacentHTML("beforeend",'<button id="lo">Log out</button>');$("#lo").onclick=async()=>{await sb.auth.signOut();location.href="index.html"};
const pf=$("#pf");if(pf)pf.onsubmit=async e=>{e.preventDefault();const f=e.target,id=f.id.value,old=id?pr(id):null,urls=[];
try{parseVars(f.vs.value,urls.length||f.files.files.length?new Array(f.files.files.length).fill("x"):(old?.imgs||[]),old?.vars)}catch(er){return alert(er.message)}
for(const fl of f.files.files){const path=crypto.randomUUID()+".jpg",{error}=await sb.storage.from("product-images").upload(path,await toBlob(fl),{contentType:"image/jpeg"});if(error)return alert(error.message);urls.push(sb.storage.from("product-images").getPublicUrl(path).data.publicUrl)}
const im=urls.length?urls:(old?.imgs||[]);let vars;try{vars=parseVars(f.vs.value,im,old?.vars)}catch(er){return alert(er.message)}
const row={name:f.name.value,category:f.cat.value,price:+f.price.value,stock:vars.length?vars.reduce((a,v)=>a+v.stock,0):(+f.stock.value||0),description:f.d.value,long_description:rget(f,"ld"),extra_info:rget(f,"ex"),details:old?.ing||"",images:im,variants:vars};if(id)row.id=+id;
const {error}=await sb.from("products").upsert(row);if(error)return alert(error.message);await loadAll(true);adminDB();shop()};
const sf=$("#sf");if(sf)sf.onsubmit=async e=>{e.preventDefault();const {error}=await sb.from("settings").upsert({key:"video_url",value:sf.v.value.trim()});error?alert(error.message):(LS.set("nc_video",sf.v.value.trim()),alert("Saved"))}}
if(sb){document.addEventListener("click",async e=>{const x=e.target.closest("[data-x]");if(!x)return;e.stopImmediatePropagation();if(!confirm("Delete this product?"))return;const {error}=await sb.from("products").delete().eq("id",x.dataset.x);if(error)return alert(error.message);await loadAll(true);adminDB();shop()},true);
document.addEventListener("change",async e=>{const o=e.target.dataset&&e.target.dataset.o;if(!o)return;e.stopImmediatePropagation();const {error}=await sb.rpc("set_order_status",{p_order_no:o,p_status:e.target.value});if(error)alert(error.message);else{await loadAll(true);adminDB()}},true);
P=[];loadAll().then(()=>{shop();cartUI()})}
document.addEventListener("submit",e=>{const f=e.target;if(f.dataset&&f.dataset.pid){e.preventDefault();e.stopPropagation();add(+f.dataset.pid,f.dataset.v||null);return}
if(f.id=="cf"){e.preventDefault();e.stopPropagation();place(f);return}
if(f.id=="qf"){e.preventDefault();track(f.t.value);return}
if(f.tagName=="FORM"&&!f.classList.contains("pform")){e.preventDefault();e.stopPropagation();if(sb&&f.classList.contains("reservation-form")){const v=n=>(f.querySelector(`[name="${n}"]`)||{}).value||"";sb.from("enquiries").insert({name:v("name"),email:v("Email-address"),phone:v("Phone-number"),product:v("Product"),message:v("field")}).then(()=>{})}else if(sb&&f.classList.contains("newsletter-form")){const em=(f.querySelector('input[type="email"]')||{}).value||"";sb.from("enquiries").insert({name:"Newsletter signup",email:em,message:"Newsletter signup"}).then(()=>{})}const w=f.closest(".w-form"),d=w&&w.querySelector(".w-form-done");f.reset();if(d){f.style.display="none";d.style.display="block"}}},true);
document.addEventListener("click",e=>{const t=e.target.closest("a,button,[data-q]");if(!t)return;const d=t.dataset,c=t.classList;
if(c.contains("w-commerce-commercecartopenlink")||t.getAttribute("href")=="#cart"){e.preventDefault();const pg=location.pathname.split("/").pop();if(pg=="cart.html")scrollTo(0,0);else if(pg=="checkout.html")location.assign("cart.html");else tg(true)}
else if(c.contains("w-commerce-commercecartcloselink")){e.preventDefault();tg(false)}
else if(c.contains("w-commerce-commercecartcheckoutbutton")){e.preventDefault();if(cart.length){location.assign("checkout.html")}}
else if(c.contains("video-lightbox")){e.preventDefault();openVid()}
else if(t.getAttribute("href")=="#track"){e.preventDefault();$("#trk").showModal()}
if(d.q){const l=cart.find(x=>lk(x)==d.q),p=l&&pr(l.id);if(!l||!p)return;if(+d.d>0&&l.q>=uStock(p,l.v))return;l.q+=+d.d;if(l.q<1)cart=cart.filter(x=>x!==l);cartUI()}
if(d.rm){e.preventDefault();cart=cart.filter(x=>lk(x)!=d.rm);cartUI()}
if(d.of!==undefined&&t.classList.contains("ofil")){ofilt=d.of;admin()}
if(d.sitemap)sitemapDownload();
if(d.cpt)cpToggle(d.cpt);
if(d.cpd)cpDelete(d.cpd);
if(d.slip){const o=O.find(x=>x.id==d.slip);if(o)printSlips([o])}
if(d.slipall){printSlips(O.filter(o=>["Placed","Confirmed","Packed"].includes(o.status)))}
if(d.csv){exportOrders()}
if(d.t){tab=d.t;admin()}
if(d.x&&confirm("Delete this product?")){P=P.filter(p=>p.id!=d.x);save();admin();shop();cartUI()}
if(d.e){const p=pr(d.e),f=$("#pf");f.id.value=p.id;f.name.value=p.name;setCat(f,p.cat);f.price.value=p.price;f.stock.value=hasV(p)?"":p.stock;f.d.value=p.d;rset(f,"ld",p.long);rset(f,"ex",p.extra);f.vs.value=varText(p);f.scrollIntoView()}
if(t.id=="vx")$("#vid").close();if(t.id=="cx")$("#cko").close();if(t.id=="tx")$("#trk").close()});
cw()&&cw().addEventListener("click",e=>{if(e.target==cw())tg(false)});
document.addEventListener("change",e=>{const o=e.target.dataset.o;if(o){const x=O.find(y=>y.id==o);if(e.target.value=="Cancelled"&&x.status!="Cancelled"&&x.coupon){const c=CP.find(y=>y.code==x.coupon);if(c){c.used=Math.max(0,(c.used||0)-1);LS.set("nc_cp",CP)}}x.status=e.target.value;x.events.push({s:x.status,t:Date.now()});save();admin()}});
$("#vid").addEventListener("close",()=>$("#vbody").innerHTML="");addEventListener("hashchange",admin);shop();cartUI();tg(false);admin();

/* ---- admin: categories ---- */
function bindCat(){const f=$("#catf");if(f)f.onsubmit=e=>{e.preventDefault();catSave(f)}}
async function catSave(f){
const id=f.cid.value,name=f.cname.value.trim().replace(/\s+/g," "),desc=f.cdesc.value.trim(),sort=f.csort.value===""?(Math.max(0,...C.map(c=>+c.sort||0))+10):Math.floor(+f.csort.value);
if(!name)return alert("Please enter a category name.");
if(C.some(c=>c.name.toLowerCase()==name.toLowerCase()&&c.id!=id))return alert("A category with this name already exists.");
const old=id?C.find(c=>c.id==id):null,sl=slug(name)||("cat-"+Date.now().toString(36));
if(sb){const row={name,slug:sl,description:desc,sort};if(id)row.id=+id;
const {error}=await sb.from("categories").upsert(row);if(error)return alert(error.message);
if(old&&old.name!=name){const {error:e2}=await sb.from("products").update({category:name}).eq("category",old.name);if(e2)return alert(e2.message)}
await loadAll(true);adminDB();shop()}
else{if(old){P.forEach(p=>{if(p.cat==old.name)p.cat=name});Object.assign(old,{name,slug:sl,desc,sort})}else C.push({id:Date.now(),name,slug:sl,desc,sort});LS.set("nc_cat",C);save();admin();shop()}}
async function catDel(id){const c=C.find(x=>x.id==id);if(!c)return;const n=P.filter(p=>p.cat==c.name).length;
if(n)return alert(n+" product"+(n==1?" uses":"s use")+' "'+c.name+'". Move them to another category first, then delete it.');
if(!confirm('Delete the category "'+c.name+'"?'))return;
if(sb){const {error}=await sb.from("categories").delete().eq("id",c.id);if(error)return alert(error.message);await loadAll(true);adminDB();shop()}
else{C=C.filter(x=>x.id!=id);LS.set("nc_cat",C);admin();shop()}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ce],[data-cx],#catx");if(!b)return;
if(b.dataset.cx){catDel(b.dataset.cx);return}
if(b.id=="catx"){admin();return}
const f=$("#catf"),c=C.find(x=>x.id==b.dataset.ce);if(!f||!c)return;
f.cid.value=c.id;f.cname.value=c.name;f.cdesc.value=c.desc||"";f.csort.value=c.sort;$("#catx").hidden=false;f.scrollIntoView();f.cname.focus()});
