/* homefinity.pk – full checkout page (the order itself is placed by the store script through form #cf) */
(function(){
"use strict";
var grid=document.getElementById("ck-grid");if(!grid)return;
var sum=document.getElementById("ck-sum"),empty=document.getElementById("ck-empty"),notice=document.getElementById("ck-notice");
var rs=function(n){return "Rs. "+Number(n).toLocaleString("en-PK")};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]})};
var PROV={karachi:"Sindh",hyderabad:"Sindh",sukkur:"Sindh",lahore:"Punjab",rawalpindi:"Punjab",faisalabad:"Punjab",multan:"Punjab",sialkot:"Punjab",gujranwala:"Punjab",bahawalpur:"Punjab",islamabad:"Islamabad Capital Territory",peshawar:"Khyber Pakhtunkhwa",abbottabad:"Khyber Pakhtunkhwa",quetta:"Balochistan"};
var A=null;
function render(msgs){
var L=A.cart.lines(),t=A.cart.totals();
if(notice){notice.hidden=!(msgs&&msgs.length);notice.innerHTML=(msgs||[]).map(esc).join("<br>")}
if(!L.length){grid.hidden=true;if(empty)empty.hidden=false;return}
grid.hidden=false;if(empty)empty.hidden=true;
var left=Math.max(0,t.free-t.sub);
sum.innerHTML='<ul class="ck-items">'+L.map(function(l){return '<li><span class="ck-th"><img src="'+esc(l.img||"")+'" alt=""><b aria-hidden="true">'+l.q+'</b></span><span class="ck-nm">'+esc(l.p.name)+(l.vl?' <small>('+esc(l.vl)+')</small>':'')+'<span class="sr-only"> quantity '+l.q+'</span></span><b>'+rs(l.price*l.q)+'</b></li>'}).join("")+'</ul>'+
'<dl class="os-tot"><div><dt>Subtotal</dt><dd>'+rs(t.sub)+'</dd></div>'+(t.disc?'<div class="cp-d"><dt>Discount ('+esc(t.coupon)+')</dt><dd>− '+rs(t.disc)+'</dd></div>':'')+'<div><dt>Delivery</dt><dd>'+(t.ship?rs(t.ship):"Free")+'</dd></div><div class="t"><dt>Total, pay on delivery</dt><dd>'+rs(t.total)+'</dd></div></dl>'+
'<p class="ct-free'+(left?"":" ok")+'">'+(left?"Add <b>"+rs(left)+"</b> more for free delivery":"<b>Free delivery</b> applied")+'</p>'}
function start(){A=window.NC_API;
var f=document.getElementById("cf"),city=f&&f.elements.city,prov=f&&f.elements.province;
if(city&&prov)city.addEventListener("change",function(){var p=PROV[String(city.value||"").trim().toLowerCase()];if(p&&!prov.value)prov.value=p});
A.cart.ready().then(function(){render(A.cart.fixStock())})}
window.addEventListener("pageshow",function(e){if(e.persisted&&A)render([])});
var tries=0;(function wait(){if(window.NC_API&&window.NC_API.cart)return start();if(++tries>60){grid.hidden=true;if(notice){notice.hidden=false;notice.textContent="The page did not finish loading. Please refresh."}return}setTimeout(wait,100)})();
})();
