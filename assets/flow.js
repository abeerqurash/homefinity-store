/* homefinity.pk – cart + checkout: count-up totals, change feedback and checkout progress */
(function(){"use strict";
var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var rs=function(n){return "Rs. "+Number(n).toLocaleString("en-PK")};
var num=function(t){return parseInt(String(t).replace(/[^\d]/g,""),10)||0};
function count(el,from,to){if(rm||from===to)return;var s=performance.now();(function f(n){var k=Math.min(1,(n-s)/560),e=1-Math.pow(1-k,3);el.textContent=rs(Math.round(from+(to-from)*e));if(k<1)requestAnimationFrame(f)})(s)}

/* ----- cart ----- */
var body=document.getElementById("ct-body");
if(body){
 var qty={},tot=0,first=true;
 var sync=function(){
  body.querySelectorAll(".ct-line").forEach(function(li,i){li.style.setProperty("--i",i)});
  body.querySelectorAll(".ct-q").forEach(function(q){
   var b=q.querySelector("[data-id]"),o=q.querySelector("output");if(!b||!o)return;
   var id=b.getAttribute("data-id");
   if(qty[id]!=null&&qty[id]!==o.textContent){o.classList.add("pop");var t=q.parentNode.querySelector(".ct-total");if(t)t.classList.add("pop")}
   qty[id]=o.textContent});
  var d=body.querySelectorAll(".os-tot dd");
  if(d.length){var sub=d[0],all=body.querySelector(".os-tot .t dd"),to=num(all.textContent);
   count(all,first?0:tot,to);if(!first&&tot!==to)all.classList.add("pop");
   count(sub,first?0:num(sub.getAttribute("data-prev")||0),num(sub.textContent));sub.setAttribute("data-prev",num(sub.textContent));
   tot=to;first=false}};
 new MutationObserver(sync).observe(body,{childList:true});
 setTimeout(function(){body.classList.add("seen")},1600);
 if(body.querySelector(".ct-line"))sync();
}

/* ----- checkout ----- */
var f=document.getElementById("cf");
if(f){
 var grid=document.getElementById("ck-grid");
 var req=["name","phone","province","city","area","addr"],total=req.length+1;
 var m=document.createElement("div");m.className="ck-meter";
 m.innerHTML='<div class="ck-meter-top"><b id="ckm-t">Let\u2019s get started</b><span id="ckm-n">0 of '+total+' done</span></div><div class="ck-meter-bar" role="progressbar" aria-label="Checkout progress" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="0"><i></i></div>';
 f.insertBefore(m,f.firstChild);
 var bar=m.querySelector(".ck-meter-bar"),fill=bar.firstChild,tt=m.querySelector("#ckm-t"),nn=m.querySelector("#ckm-n");
 var cards=f.querySelectorAll(".ck-card");
 var ok=function(n){var e=f.elements[n];return !!(e&&String(e.value||"").trim())};
 var update=function(){
  var n=req.filter(ok).length+(f.elements.terms&&f.elements.terms.checked?1:0);
  fill.style.width=Math.round(n/total*100)+"%";bar.setAttribute("aria-valuenow",n);nn.textContent=n+" of "+total+" done";
  tt.textContent=n===total?"Ready to place your order":n>=4?"Almost there":n>0?"Good start":"Let\u2019s get started";
  f.classList.toggle("ready",n===total);
  if(cards[0])cards[0].classList.toggle("done",ok("name")&&ok("phone"));
  if(cards[1])cards[1].classList.toggle("done",["province","city","area","addr"].every(ok));
  if(cards[2])cards[2].classList.toggle("done",!!f.querySelector('[name="pay"]:checked'))};
 f.addEventListener("input",update);f.addEventListener("change",update);update();
 if(grid)setTimeout(function(){grid.setAttribute("data-seen","1")},1500);
}
})();
