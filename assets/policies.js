/* homefinity.pk – policies page: hash-driven tabs, reveals, live delivery numbers */
(function(){
const R=document.getElementById("pol-root");if(!R)return;
document.documentElement.classList.add("js-ab");
const H=window.HF||{},rs=n=>"Rs. "+Number(n).toLocaleString("en-PK");
R.querySelectorAll('[data-hf="free"]').forEach(e=>e.textContent=rs(H.freeDelivery||3000));
R.querySelectorAll('[data-hf="fee"]').forEach(e=>e.textContent=rs(H.deliveryFee||200));
const hh=()=>{const h=document.querySelector(".main-header");if(h)R.style.setProperty("--hf-hdr",h.offsetHeight+"px")};hh();addEventListener("resize",hh);
const tabs=[...R.querySelectorAll(".pol-tab")],panes=[...R.querySelectorAll(".pol-pane")];
function show(k,push){if(!panes.some(p=>p.dataset.k==k))k=panes[0].dataset.k;tabs.forEach(t=>{const on=t.dataset.k==k;t.classList.toggle("on",on);t.setAttribute("aria-selected",on)});panes.forEach(p=>p.classList.toggle("on",p.dataset.k==k));if(push&&history.replaceState)history.replaceState(null,"","#"+k)}
tabs.forEach(t=>t.addEventListener("click",e=>{e.preventDefault();show(t.dataset.k,true);if(innerWidth<=860)R.querySelector(".pol-body").scrollIntoView({behavior:"smooth",block:"start"})}));
addEventListener("hashchange",()=>show(location.hash.slice(1)));
show(location.hash.slice(1));
const els=[...R.querySelectorAll(".ab-rv")];
if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.1});els.forEach((e,i)=>{e.style.setProperty("--d",Math.min(i,4)*.08+"s");io.observe(e)})}else els.forEach(e=>e.classList.add("in"));
setTimeout(()=>els.forEach(e=>e.classList.add("in")),2500);
})();
