/* homefinity.pk - SEO: canonical link, social-sharing tags and structured data (JSON-LD).
   Set your real address once in config.js:  window.HF = { siteUrl: "https://homefinity.pk", ogImage: "https://homefinity.pk/assets/share.jpg", ... } */
(function(){"use strict";
var D=document,W=window,file=(location.pathname.split("/").pop()||"index.html").toLowerCase();
var isWeb=/^https?:$/.test(location.protocol);
function H(){return W.HF||{}}
function base(){var u=String(H().siteUrl||"").replace(/\/+$/,"");return u||(isWeb?location.origin:"")}
function abs(u){u=String(u||"");if(!u)return"";if(/^(https?:)?\/\//i.test(u)||/^data:/i.test(u))return u;var b=base();return b?b+"/"+u.replace(/^\.?\/+/,""):u}
function noindex(){var m=D.querySelector('meta[name="robots"]');return !!(m&&/noindex/i.test(m.content))}
function head(){return D.head||D.getElementsByTagName("head")[0]}
function meta(attr,key,val){if(val==null||val==="")return;var m=D.querySelector("meta["+attr+'="'+key+'"]');if(!m){m=D.createElement("meta");m.setAttribute(attr,key);head().appendChild(m)}m.setAttribute("content",val)}
function link(rel,href){if(!href)return;var l=D.querySelector('link[rel="'+rel+'"]');if(!l){l=D.createElement("link");l.rel=rel;head().appendChild(l)}l.href=href}
function ld(id,obj){var s=D.getElementById(id);if(!s){s=D.createElement("script");s.type="application/ld+json";s.id=id;head().appendChild(s)}s.textContent=JSON.stringify(obj)}
function pageUrl(extra){var b=base();if(!b)return"";if(file==="index.html"||file==="")return b+"/"+(extra||"");return b+"/"+file+(extra||"")}
function desc(){var m=D.querySelector('meta[name="description"]');return m?m.content:""}
function social(o){o=o||{};var title=o.title||D.title,d=o.desc||desc(),url=o.url||pageUrl(),img=abs(o.image||H().ogImage||"");
meta("property","og:site_name","homefinity.pk");meta("property","og:type",o.type||"website");meta("property","og:title",title);meta("property","og:description",d);meta("property","og:url",url);meta("property","og:image",img);meta("property","og:locale","en_PK");
meta("name","twitter:card",img?"summary_large_image":"summary");meta("name","twitter:title",title);meta("name","twitter:description",d);meta("name","twitter:image",img)}

/* every public page */
function pageSetup(){if(noindex())return;
if(file==="product.html"){return}                       /* the product page is handled when the product loads */
link("canonical",pageUrl());social();
if(file==="index.html"||file===""){var b=base(),H0=H(),org={"@type":"Organization","@id":b+"/#org","name":"homefinity.pk","url":b+"/"};
if(H0.email||H0.phone)org.contactPoint={"@type":"ContactPoint","contactType":"customer support","email":H0.email||undefined,"telephone":H0.phone||undefined};
ld("ld-home",{"@context":"https://schema.org","@graph":[org,{"@type":"WebSite","@id":b+"/#site","url":b+"/","name":"homefinity.pk","publisher":{"@id":b+"/#org"}}]})}}
if(D.readyState==="loading")D.addEventListener("DOMContentLoaded",pageSetup);else pageSetup();

/* product page: fired by pages.js each time the product is drawn */
W.addEventListener("nc:product",function(e){var p=e.detail||{};if(!p.name||noindex())return;
var canon=pageUrl("?id="+encodeURIComponent(p.id)),d=(p.desc||"").replace(/\s+/g," ").trim(),short=d.length>155?d.slice(0,152).replace(/\s+\S*$/,"")+"…":d;
D.title=p.name+" – homefinity.pk";
if(short)meta("name","description",short);
link("canonical",canon);social({title:D.title,desc:short||desc(),url:canon,type:"product",image:(p.imgs||[])[0]});
if(p.lo!=null){meta("property","product:price:amount",String(p.lo));meta("property","product:price:currency","PKR")}
var avail="https://schema.org/"+(p.inStock?"InStock":"OutOfStock"),offers=(p.n>1&&p.hi!==p.lo)?{"@type":"AggregateOffer","priceCurrency":"PKR","lowPrice":p.lo,"highPrice":p.hi,"offerCount":p.n,"availability":avail,"url":canon}:{"@type":"Offer","priceCurrency":"PKR","price":p.lo,"availability":avail,"url":canon};
var b=base();
ld("ld-product",{"@context":"https://schema.org","@graph":[
{"@type":"Product","name":p.name,"description":d||p.name,"sku":String(p.id),"image":(p.imgs||[]).map(abs),"offers":offers,"url":canon},
{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":b+"/"},{"@type":"ListItem","position":2,"name":"Shop","item":b+"/products.html"},{"@type":"ListItem","position":3,"name":p.name}]}]})});
})();
