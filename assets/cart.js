/* homefinity.pk – full cart page */
(function(){
"use strict";
var body=document.getElementById("ct-body");if(!body)return;
var live=document.getElementById("ct-live");
var rs=function(n){return "Rs. "+Number(n).toLocaleString("en-PK")};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]})};
var A=null,notices=[],focusKey=null,cpErr="";
function say(m){if(live)live.textContent=m}
function cpBox(t){
if(t.coupon)return '<div class="cp-on"><span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01"/></svg><b>'+esc(t.coupon)+'</b> applied</span><button type="button" class="cp-rm" data-cprm="1">Remove</button></div>'+(t.cpmsg?'<p class="cp-msg err">'+esc(t.cpmsg)+'</p>':'');
return '<form class="cp-form pform" id="cp-form" novalidate><label for="cp-in" class="cp-l">Have a coupon?</label><div class="cp-row"><input id="cp-in" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Enter code" maxlength="20"><button class="cp-go" type="submit">Apply</button></div><p class="cp-msg'+(cpErr?' err':'')+'" id="cp-msg" role="status" aria-live="polite">'+esc(cpErr)+'</p></form>'}
function render(){
var L=A.cart.lines(),t=A.cart.totals();
var warn=notices.length?'<p class="os-err" role="alert">'+notices.map(esc).join("<br>")+'</p>':"";
if(!L.length){
body.innerHTML=warn+'<section class="os-card ct-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2.2l1.6 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L19.6 8H6"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg><h2>Your cart is empty</h2><p>Add something useful and it will show up here.</p><a class="btn" href="products.html"><span>Browse products</span></a></section>';
return}
var n=L.reduce(function(a,l){return a+l.q},0),left=Math.max(0,t.free-t.sub),pct=t.free>0?Math.min(100,Math.round(t.sub/t.free*100)):100;
var lines=L.map(function(l){var p=l.p,max=l.max,nm=esc(p.name+(l.vl?" ("+l.vl+")":"")),key=esc(l.key);
return '<li class="ct-line"><a class="ct-im" href="product.html?id='+p.id+'" tabindex="-1" aria-hidden="true"><img src="'+esc(l.img||"")+'" alt=""></a>'+
'<div class="ct-info"><a class="ct-name" href="product.html?id='+p.id+'">'+nm+'</a><span class="ct-cat">'+esc(p.cat||"")+(l.vl?' · <b class="ct-var">'+esc(l.vl)+'</b>':"")+'</span><span class="ct-unit">'+rs(l.price)+' each</span>'+(max<=5?'<span class="ct-warn">'+(l.q>=max?"That is all we have in stock":"Only "+max+" left")+'</span>':"")+'</div>'+
'<div class="ct-q" role="group" aria-label="Quantity of '+nm+'"><button type="button" data-act="dec" data-id="'+key+'" aria-label="Decrease quantity of '+nm+'">\u2212</button><output>'+l.q+'</output><button type="button" data-act="inc" data-id="'+key+'" aria-label="Increase quantity of '+nm+'"'+(l.q>=max?" disabled":"")+'>+</button></div>'+
'<b class="ct-total">'+rs(l.price*l.q)+'</b>'+
'<button type="button" class="ct-rm" data-act="rm" data-id="'+key+'" aria-label="Remove '+nm+' from cart">Remove</button></li>'}).join("");
body.innerHTML=warn+'<div class="pg-grid"><ul class="ct-list">'+lines+'</ul><aside class="pg-side"><section class="os-card" aria-labelledby="ct-sh"><h2 id="ct-sh">Order summary</h2>'+cpBox(t)+'<dl class="os-tot"><div><dt>Subtotal ('+n+(n==1?" item":" items")+')</dt><dd>'+rs(t.sub)+'</dd></div>'+(t.disc?'<div class="cp-d"><dt>Discount ('+esc(t.coupon)+')</dt><dd>− '+rs(t.disc)+'</dd></div>':'')+'<div><dt>Delivery</dt><dd>'+(t.ship?rs(t.ship):"Free")+'</dd></div><div class="t"><dt>Total</dt><dd>'+rs(t.total)+'</dd></div></dl>'+
'<p class="ct-free'+(left?"":" ok")+'">'+(left?"Add <b>"+rs(left)+"</b> more for free delivery":"<b>Free delivery</b> applied to this order")+'<span class="ct-bar" aria-hidden="true"><i style="width:'+pct+'%"></i></span></p>'+
'<div class="ct-act"><a class="btn ck-go" href="checkout.html"><span>Proceed to checkout</span></a><a class="ct-link" href="products.html">Continue shopping</a></div>'+
'<p class="ct-note">Payment is cash on delivery. You can review everything at checkout before you place your order.</p></section></aside></div>';
if(focusKey){var b=body.querySelector('[data-act="'+focusKey.act+'"][data-id="'+focusKey.id+'"]');if(b&&b.disabled)b=body.querySelector('[data-act="dec"][data-id="'+focusKey.id+'"]');if(b)b.focus();focusKey=null}}
body.onclick=function(e){
var b=e.target.closest&&e.target.closest("[data-act]");if(!b||!A)return;
var id=b.getAttribute("data-id"),act=b.getAttribute("data-act"),l=A.cart.lines().filter(function(x){return x.key===id})[0];if(!l)return;
notices=[];
if(act==="rm"||(act==="dec"&&l.q<=1)){A.cart.remove(l.key);say(l.p.name+(l.vl?" ("+l.vl+")":"")+" removed from your cart.");focusKey=null;render();var h=document.getElementById("pg-h");if(h)h.focus();return}
focusKey={act:act,id:id};
A.cart.set(l.key,l.q+(act==="inc"?1:-1));
var nl=A.cart.lines().filter(function(x){return x.key===id})[0];
say("Quantity of "+l.p.name+" is now "+(nl?nl.q:0)+".");
render()};
body.addEventListener("submit",function(e){var f=e.target;if(!f||f.id!=="cp-form"||!A)return;e.preventDefault();
var code=f.code.value.trim();if(!code){cpErr="Enter a coupon code.";render();var i0=document.getElementById("cp-in");if(i0)i0.focus();return}
var btn=f.querySelector(".cp-go");btn.disabled=true;btn.textContent="Checking\u2026";
A.cart.applyCoupon(code).then(function(){cpErr="";say("Coupon applied.");render()}).catch(function(er){cpErr=(er&&er.message)||"That coupon code is not valid.";render();var i=document.getElementById("cp-in");if(i){i.value=code;i.focus()}})});
body.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("[data-cprm]")&&A){A.cart.removeCoupon();cpErr="";say("Coupon removed.");render()}});
function start(){A=window.NC_API;
A.cart.ready().then(function(){notices=A.cart.fixStock();render();var h=document.getElementById("pg-h");if(h)h.focus()})}
window.addEventListener("pageshow",function(e){if(e.persisted&&A)render()});
var tries=0;(function wait(){if(window.NC_API&&window.NC_API.cart)return start();if(++tries>60){body.innerHTML='<p class="os-err">The page did not finish loading. Please refresh.</p>';return}setTimeout(wait,100)})();
})();
