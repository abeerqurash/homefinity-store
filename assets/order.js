/* homefinity.pk – order page: success view after checkout + tracking by link/code + recent orders on this device */
(function(){
"use strict";
var q=new URLSearchParams(location.search),tk=(q.get("t")||"").trim(),isNew=q.get("new")==="1";
var root=document.getElementById("os-body");if(!root)return;
var rs=function(n){return "Rs. "+Number(n).toLocaleString("en-PK")};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]})};
var FLOW=["Placed","Confirmed","Packed","Dispatched","Delivered"];
var OK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function recents(){try{return JSON.parse(localStorage.getItem("hf_recent")||"[]")||[]}catch(e){return[]}}
function when(t){var d=new Date(t);return isNaN(d.getTime())?"":d.toLocaleString("en-PK",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}
function linkFor(t){return new URL("order.html?t="+encodeURIComponent(t),location.href).href}
function recentHtml(skip){
var r=recents().filter(function(x){return x&&x.t&&x.t!==skip});if(!r.length)return"";
return '<section class="os-card"><h2>Recent orders on this device</h2><ul class="os-rec">'+r.map(function(x){return '<li><a href="order.html?t='+encodeURIComponent(x.t)+'"><b>'+esc(x.n)+'</b><span>'+rs(x.total)+' · '+when(x.at)+'</span></a></li>'}).join("")+'</ul></section>'}
function focusH1(){var h=document.getElementById("os-h");if(h)h.focus({preventScroll:false})}
function entry(msg){
root.innerHTML='<h1 id="os-h" tabindex="-1">Track your order</h1><p class="os-sub">Open the link you saved when you ordered, or paste your tracking code below.</p>'+(msg?'<p class="os-err" role="alert">'+esc(msg)+'</p>':'')+'<form id="os-f" class="os-form"><label class="cf-f"><span>Tracking code or link</span><input name="t" required autocomplete="off" spellcheck="false"></label><button class="btn" type="submit"><span>Track order</span></button></form>'+recentHtml("");
document.getElementById("os-f").onsubmit=function(e){e.preventDefault();var v=e.target.t.value.trim();if(!v)return;var m=v.match(/[?&]t=([A-Za-z0-9]+)/);location.href="order.html?t="+encodeURIComponent(m?m[1]:v)};
focusH1()}
function render(o){
var link=linkFor(tk),no=o.order_no,cancelled=o.status==="Cancelled",idx=FLOW.indexOf(o.status);
var rec=recents().filter(function(x){return x.t===tk})[0],em=rec&&rec.email||"";
var cod=/cash/i.test(o.payment_method||"Cash on delivery");
var pay=(cod&&!cancelled&&o.status!=="Delivered")?"Please keep "+rs(o.total)+" ready to pay in cash when it arrives.":"";
var head=isNew?'<div class="os-ok">'+OK+'</div><h1 id="os-h" tabindex="-1">Thank you! Your order is placed.</h1><p class="os-sub">Your order number is <b>'+esc(no)+'</b>. '+esc(pay)+'</p>'
:'<h1 id="os-h" tabindex="-1">Order '+esc(no)+'</h1><p class="os-sub">'+(o.created_at?"Placed "+esc(when(o.created_at))+". ":"")+esc(pay)+'</p>';
var pill='<span class="os-pill '+esc(String(o.status).toLowerCase())+'">'+esc(o.status)+'</span>';
var prog=cancelled
?'<section class="os-card"><h2>Order history</h2><ul class="os-hist">'+(o.events||[]).map(function(e){return '<li><span>'+esc(e.status)+'</span><span>'+esc(when(e.created_at))+'</span></li>'}).join("")+'</ul></section>'
:'<section class="os-card"><h2>Progress</h2><ol class="os-steps" aria-label="Order progress">'+FLOW.map(function(s,i){var ev=(o.events||[]).filter(function(e){return e.status===s})[0];var st=i<idx?"done":i===idx?"now":"todo";return '<li class="'+st+'"'+(i===idx?' aria-current="step"':'')+'><i aria-hidden="true"></i><b>'+s+'</b><span>'+(ev?esc(when(ev.created_at)):"")+'</span></li>'}).join("")+'</ol></section>';
var items='<section class="os-card"><h2>Items</h2><ul class="os-items">'+(o.items||[]).map(function(i){return '<li><span>'+esc(i.name)+(i.vl?' <small>('+esc(i.vl)+')</small>':'')+' <small>× '+Number(i.q)+'</small></span><b>'+rs(i.price*i.q)+'</b></li>'}).join("")+'</ul><dl class="os-tot"><div><dt>Subtotal</dt><dd>'+rs(o.subtotal)+'</dd></div><div><dt>Delivery</dt><dd>'+(+o.shipping?rs(o.shipping):"Free")+'</dd></div><div class="t"><dt>Total</dt><dd>'+rs(o.total)+'</dd></div></dl></section>';
var subj=encodeURIComponent("My homefinity.pk order "+no),txt="My homefinity.pk order "+no+" – track it here: "+link;
var save='<section class="os-card os-save"><h2>Save your tracking link</h2><p>This link is how you check your order. Copy it now, or send it to yourself so you can find it again.</p><div class="os-link"><input id="os-link" readonly value="'+esc(link)+'" aria-label="Tracking link"><button type="button" class="btn" id="os-copy"><span>Copy link</span></button></div><div class="os-acts"><a class="btn o" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(txt)+'"><span>Send on WhatsApp</span></a><a class="btn o" href="mailto:'+esc(em)+'?subject='+subj+'&body='+encodeURIComponent(txt)+'"><span>Email it to me</span></a></div><p class="os-fine">Anyone who has this link can see this order\'s status, so please don\'t post it publicly. This browser also remembers it.</p></section>';
var demo=window.NC_API&&!window.NC_API.sb?'<p class="os-demo">Demo mode: this order exists only in this browser.</p>':"";
root.innerHTML=head+pill+(isNew?save+prog+items:prog+items+save)+'<div class="os-acts"><button type="button" class="btn o" id="os-ref"><span>Refresh status</span></button><a class="btn o" href="products.html"><span>Continue shopping</span></a></div>'+recentHtml(tk)+demo;
document.getElementById("os-copy").onclick=function(){var b=this,sp=b.querySelector("span"),i=document.getElementById("os-link");
function ok(){sp.textContent="Copied";setTimeout(function(){sp.textContent="Copy link"},1800)}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(link).then(ok,function(){i.select();try{document.execCommand("copy");ok()}catch(e){}})}else{i.select();try{document.execCommand("copy");ok()}catch(e){}}};
document.getElementById("os-ref").onclick=function(){isNew=false;load()};
document.getElementById("os-link").onfocus=function(){this.select()};
if(isNew&&window.history&&history.replaceState)history.replaceState(null,"","order.html?t="+encodeURIComponent(tk));
focusH1()}
function load(){
if(!tk){entry();return}
root.innerHTML='<p class="os-load" role="status">Loading your order…</p>';
window.NC_API.getOrder(tk).then(function(o){if(!o){entry("We could not find an order for that code. Please check the link or code and try again.");return}render(o)})
.catch(function(){root.innerHTML='<h1 id="os-h" tabindex="-1">We could not load your order</h1><p class="os-sub">Please check your connection and try again.</p><button class="btn" id="os-retry" type="button"><span>Try again</span></button>'+recentHtml(tk);document.getElementById("os-retry").onclick=load;focusH1()})}
var tries=0;(function wait(){if(window.NC_API)return load();if(++tries>60){root.innerHTML='<p class="os-err">The page did not finish loading. Please refresh.</p>';return}setTimeout(wait,100)})();
})();
