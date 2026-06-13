/* ===== GSAP REGISTER ===== */
gsap.registerPlugin(ScrollTrigger);

/* ===== CURSOR ===== */
const cursor = document.getElementById("cursor");
const cring = document.getElementById("cursorRing");
let mx=0, my=0, rx=0, ry=0, shown=false;
document.addEventListener("mousemove", e => {
  mx=e.clientX; my=e.clientY;
  if(!shown){ shown=true; cursor.style.opacity="1"; cring.style.opacity="0.5"; }
});
(function loop(){ cursor.style.transform=`translate(${mx-5}px,${my-5}px)`; rx+=(mx-rx)*.14; ry+=(my-ry)*.14; cring.style.transform=`translate(${rx-18}px,${ry-18}px)`; requestAnimationFrame(loop); })();
document.querySelectorAll("a,button,.case-card,.service-card,.sci-card").forEach(el=>{
  el.addEventListener("mouseenter",()=>{ cursor.style.transform+=" scale(1.8)"; cring.style.opacity="0.9"; });
  el.addEventListener("mouseleave",()=>{ cring.style.opacity="0.5"; });
});

/* ===== PARALLAX BG ===== */
const pbs=[
  {el:document.getElementById("pbs1"),d:18},
  {el:document.getElementById("pbs2"),d:12},
  {el:document.getElementById("pbs3"),d:8}
];
document.addEventListener("mousemove",e=>{
  const px=(e.clientX/window.innerWidth-.5);
  const py=(e.clientY/window.innerHeight-.5);
  pbs.forEach(({el,d})=>{ el.style.transform=`translate(${px*d}px,${py*d}px)`; });
});

/* ===== PARTICLE SYSTEM (Canvas2D, no Three.js) ===== */
(function initParticles(){
  const wrap = document.querySelector(".canvas-wrap");
  const canvas = document.getElementById("threeCanvas");
  if(!wrap || !canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, DPR;
  function resize(){
    DPR = Math.min(window.devicePixelRatio||1, 2);
    W = wrap.clientWidth; H = wrap.clientHeight;
    canvas.width = W*DPR; canvas.height = H*DPR;
    canvas.style.width = W+"px"; canvas.style.height = H+"px";
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();
  window.addEventListener("resize", resize);

  const COUNT = Math.min(110, Math.floor(W*H/6500)); // density-based, capped
  const COLORS = [
    "rgba(230,240,255,", // ice white
    "rgba(122,184,255,", // light blue
    "rgba(6,182,212,"    // cyan
  ];
  const parts = [];
  for(let i=0;i<COUNT;i++){
    parts.push({
      x: Math.random()*W, y: Math.random()*H,
      bx: 0, by: 0,
      vx: (Math.random()-0.5)*0.12,
      vy: -(0.10+Math.random()*0.18), // drift up
      r: 1.1+Math.random()*1.6,
      c: COLORS[Math.floor(Math.random()*COLORS.length)],
      a: 0.45+Math.random()*0.45,
      ph: Math.random()*6.28
    });
  }

  let mx=-999, my=-999;
  wrap.addEventListener("mousemove", e=>{
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX-rect.left; my = e.clientY-rect.top;
  });
  wrap.addEventListener("mouseleave", ()=>{ mx=-999; my=-999; });

  const LINK = 88, LINK2 = LINK*LINK;
  const REPEL = 70, REPEL2 = REPEL*REPEL;
  let t = 0;
  function frame(){
    t += 0.01;
    ctx.clearRect(0,0,W,H);

    // update
    for(const p of parts){
      p.y += p.vy;
      p.x += p.vx + Math.sin(t+p.ph)*0.08;
      if(p.y < -5){ p.y = H+5; p.x = Math.random()*W; }
      if(p.x < -5) p.x = W+5;
      if(p.x > W+5) p.x = -5;
      // mouse repulsion
      if(mx>-900){
        const dx = p.x-mx, dy = p.y-my, d2 = dx*dx+dy*dy;
        if(d2 < REPEL2 && d2>0.5){
          const d = Math.sqrt(d2), f = (REPEL-d)/REPEL*2.2;
          p.x += (dx/d)*f; p.y += (dy/d)*f;
        }
      }
    }
    // lines
    for(let i=0;i<parts.length;i++){
      const a = parts[i];
      for(let j=i+1;j<parts.length;j++){
        const b = parts[j];
        const dx=a.x-b.x; if(dx*dx>LINK2) continue;
        const dy=a.y-b.y; if(dy*dy>LINK2) continue;
        const d2 = dx*dx+dy*dy;
        if(d2<LINK2){
          const op = (1 - d2/LINK2)*0.16;
          ctx.strokeStyle = "rgba(122,184,255,"+op.toFixed(3)+")";
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    // dots
    for(const p of parts){
      ctx.beginPath();
      ctx.fillStyle = p.c + p.a + ")";
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ===== PRELOADER + HERO ANIMATION ===== */
window.addEventListener("load",()=>{
  const pre=document.getElementById("preloader");
  const preLogo=pre.querySelector(".pre-logo");
  const preFill=document.getElementById("preFill");
  const preSub=pre.querySelector(".pre-sub");

  const tl=gsap.timeline({onComplete:()=>{
    gsap.to(pre,{opacity:0,duration:0.6,onComplete:()=>{ pre.style.display="none"; runHero(); }});
  }});
  tl.to(preLogo,{y:0,opacity:1,duration:0.6,ease:"power3.out"})
    .to(preSub,{opacity:1,duration:0.4},"-=0.2")
    .to(preFill,{width:"100%",duration:1.4,ease:"power2.inOut"},"-=0.3")
    .to({},"+=0.2");

  function runHero(){
    const htl=gsap.timeline();
    htl.to(".hero-badge",{opacity:1,y:0,duration:0.5,ease:"power3.out"},0.1)
       .to(".hero-title .line-inner",{y:"0%",duration:0.7,stagger:0.12,ease:"power3.out"},0.3)
       .to(".hero-sub",{opacity:1,y:0,duration:0.6,ease:"power3.out"},0.6)
       .to(".hero-btns",{opacity:1,y:0,duration:0.5,ease:"power3.out"},0.8)
       .to(".hero-stats",{opacity:1,y:0,duration:0.5,ease:"power3.out"},0.95);
  }
});

/* ===== SCROLL REVEAL (GSAP ScrollTrigger) — hardened ===== */
const gsEls = gsap.utils.toArray(".gs");
gsEls.forEach(el=>{
  gsap.set(el,{opacity:0,y:48,filter:"blur(6px)"});
  gsap.to(el,{
    opacity:1,y:0,filter:"blur(0px)",duration:0.75,ease:"power3.out",
    scrollTrigger:{trigger:el,start:"top 92%",toggleActions:"play none none none"}
  });
});
/* Refresh after load + safety net: any element still hidden after 2s gets revealed */
window.addEventListener("load",()=>{
  setTimeout(()=>{
    ScrollTrigger.refresh();
    setTimeout(()=>{
      gsEls.forEach(el=>{
        if(getComputedStyle(el).opacity==="0"){
          gsap.to(el,{opacity:1,y:0,filter:"blur(0px)",duration:0.6,ease:"power2.out"});
        }
      });
    },1500);
  },200);
});


/* ===== CASE CARD CLICK (avoiding nested anchor) ===== */
document.querySelectorAll(".case-card-link[data-link]").forEach(card=>{
  card.style.cursor = "none";
  card.addEventListener("click", e=>{
    /* if clicked on inner <a> (e.g. client link), let it work normally */
    if(e.target.closest("a")) return;
    const target = card.getAttribute("data-link");
    if(target && target.startsWith("#")){
      const el = document.querySelector(target);
      if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
    }
  });
});

/* ===== CONTACT FORM ===== */
const cf=document.getElementById("contactForm");
if(cf){
  cf.addEventListener("submit",async e=>{
    e.preventDefault();
    const btn=cf.querySelector(".form-submit");
    const status=document.getElementById("formStatus");
    const origText=btn.textContent;
    btn.disabled=true; btn.textContent=lang==="en"?"Sending...":"Отправка...";
    status.className="form-status"; status.textContent="";
    try{
      const res=await fetch(cf.action,{method:"POST",body:new FormData(cf),headers:{"Accept":"application/json"}});
      if(res.ok){
        cf.reset();
        status.className="form-status success";
        status.textContent=lang==="en"?"Thank you! We'll get back within 48 hours.":"Спасибо! Свяжемся в течение 48 часов.";
      } else throw new Error("fail");
    }catch(err){
      status.className="form-status error";
      status.textContent=lang==="en"?"Send error. Please email us directly.":"Ошибка отправки. Напишите на email напрямую.";
    } finally {
      btn.disabled=false; btn.textContent=origText;
    }
  });
}

/* ===== PLACEHOLDER LANG SWITCH ===== */
function updatePlaceholders(){
  document.querySelectorAll("[data-ru-ph]").forEach(el=>{
    el.placeholder=el.getAttribute("data-"+lang+"-ph");
  });
}

/* ===== LANG TOGGLE ===== */
let lang="ru";
document.querySelectorAll(".lang-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    lang=btn.dataset.lang;
    document.querySelectorAll(".lang-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
    document.querySelectorAll("[data-ru]").forEach(el=>{
      const v=el.getAttribute("data-"+lang);
      if(v) el.innerHTML=v;
    });
    document.documentElement.lang=lang;
    // SEO: swap title + description per language
    var META = {
      ru: {
        title: "Инноватикс — агентство цифровых решений | XR · VR · AI",
        desc: "Инноватикс — бутиковое агентство полного цикла. XR, VR и AI-продукты для бизнеса, культуры и образования: от стратегии до запуска. Кейсы с ROI 150%+."
      },
      en: {
        title: "Innovatix — Digital Solutions Agency | XR · VR · AI",
        desc: "Innovatix — a full-cycle boutique agency. XR, VR and AI products for business, culture and education: from strategy to launch. Proven cases with 150%+ ROI."
      }
    };
    if(META[lang]){
      document.title = META[lang].title;
      var md = document.querySelector('meta[name="description"]');
      if(md) md.setAttribute("content", META[lang].desc);
      var ogt = document.querySelector('meta[property="og:title"]');
      if(ogt) ogt.setAttribute("content", META[lang].title);
    }
    updatePlaceholders();
  });
});

/* ===== CASE MODAL ===== */
(function(){
  var overlay = document.getElementById("caseModal");
  var content = document.getElementById("caseModalContent");
  var closeBtn = document.getElementById("caseModalClose");
  var details = document.getElementById("caseDetails");
  if(!overlay || !content || !details) return;

  function applyLangTo(root){
    // Re-apply current language to freshly injected content
    var lang = document.documentElement.lang === "en" ? "en" : "ru";
    root.querySelectorAll("[data-ru],[data-en]").forEach(function(el){
      var val = el.getAttribute("data-" + lang);
      if(val !== null) el.innerHTML = val;
    });
  }

  function openCase(slug){
    var tpl = document.getElementById("detail-" + slug);
    if(!tpl) return;
    content.innerHTML = tpl.innerHTML;
    applyLangTo(content);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden","false");
    document.body.classList.add("modal-open");
    content.scrollTop = 0;
    overlay.scrollTop = 0;
  }
  function closeCase(){
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden","true");
    document.body.classList.remove("modal-open");
    setTimeout(function(){ content.innerHTML = ""; }, 350);
  }

  document.querySelectorAll(".case-card-link[data-case]").forEach(function(card){
    card.style.cursor = "pointer";
    card.addEventListener("click", function(e){
      if(e.target.closest("a")) return; // let inner links work
      openCase(card.getAttribute("data-case"));
    });
  });

  closeBtn.addEventListener("click", closeCase);
  overlay.addEventListener("click", function(e){
    if(e.target === overlay) closeCase();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && overlay.classList.contains("open")) closeCase();
  });
})();
