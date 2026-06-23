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

/* ===== HERO PARTICLE SPHERE — full-bleed, breathing + reassembling ===== */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.getElementById('heroSphere');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  let W,H,DPR,cx,cy,scale;
  const mobile = innerWidth < 900;
  const N = mobile ? 950 : 1700;
  const still = new URLSearchParams(location.search).get('still') !== null;

  const home=new Float32Array(N*3);
  (function(){const off=2/N,inc=Math.PI*(3-Math.sqrt(5));
    for(let i=0;i<N;i++){const y=i*off-1+off/2,r=Math.sqrt(Math.max(0,1-y*y)),ph=i*inc;
      home[i*3]=Math.cos(ph)*r;home[i*3+1]=y;home[i*3+2]=Math.sin(ph)*r;}})();
  const scat=new Float32Array(N*3), stag=new Float32Array(N);
  for(let i=0;i<N;i++){let ux=Math.random()*2-1,uy=Math.random()*2-1,uz=Math.random()*2-1;
    const ul=Math.hypot(ux,uy,uz)||1;ux/=ul;uy/=ul;uz/=ul;const d=0.5+Math.random()*0.92;
    scat[i*3]=home[i*3]+ux*d;scat[i*3+1]=home[i*3+1]+uy*d;scat[i*3+2]=home[i*3+2]+uz*d;stag[i]=Math.random();}
  const cur=new Float32Array(N*3);cur.set(home);

  let phase='hold',f=0,m=0;
  const HOLD=mobile?480:600, OUT=150, CLOUD=54, IN=168, SPREAD=0.30;
  const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, easeOut=t=>1-Math.pow(1-t,3);

  let pX=0,pY=0,tX=0,tY=0;
  addEventListener('pointermove',e=>{tX=(e.clientX/innerWidth-.5);tY=(e.clientY/innerHeight-.5);},{passive:true});
  addEventListener('deviceorientation',e=>{if(e.gamma!=null){tX=Math.max(-.6,Math.min(.6,e.gamma/45));tY=Math.max(-.4,Math.min(.4,(e.beta-40)/60));}},true);

  function resize(){DPR=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;
    cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
    cx=W*0.5; cy=mobile?H*0.46:H*0.5; scale=Math.min(W,H)*(mobile?0.40:0.44);}
  resize();addEventListener('resize',resize);

  function step(){
    if(!still&&!reduce){f++;
      if(phase==='hold'){m=0;if(f>=HOLD){phase='out';f=0;}}
      else if(phase==='out'){m=easeInOut(Math.min(1,f/OUT));if(f>=OUT){phase='cloud';f=0;m=1;}}
      else if(phase==='cloud'){m=1;if(f>=CLOUD){phase='in';f=0;}}
      else if(phase==='in'){m=1-easeInOut(Math.min(1,f/IN));if(f>=IN){phase='hold';f=0;m=0;}}
    }else{m=0;}
    const t=performance.now();
    const breath=(still||reduce)?1:1+Math.sin(t*0.00126)*0.052;
    for(let i=0;i<N;i++){let mi=(m-stag[i]*SPREAD)/(1-SPREAD);mi=mi<0?0:mi>1?1:mi;
      const b=i*3,hx=home[b]*breath,hy=home[b+1]*breath,hz=home[b+2]*breath;
      cur[b]=hx+(scat[b]-hx)*mi;cur[b+1]=hy+(scat[b+1]-hy)*mi;cur[b+2]=hz+(scat[b+2]-hz)*mi;}
    return t;
  }
  function frame(){
    const t=step();pX+=(tX-pX)*.05;pY+=(tY-pY)*.05;
    const sway=(still||reduce)?0:(Math.sin(t*0.00026)*0.40 + t*0.00007);
    const ay=sway+pX*0.8, ax=((still||reduce)?0:(Math.sin(t*0.00020)*0.06+0.05))+pY*0.45;
    const cosY=Math.cos(ay),sinY=Math.sin(ay),cosX=Math.cos(ax),sinX=Math.sin(ax);
    ctx.clearRect(0,0,W,H);
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*1.8);
    const gi=Math.max(0,(0.14+Math.sin(t*0.0012)*0.05)*(1-m*0.7));
    glow.addColorStop(0,'rgba(80,150,255,'+gi+')');glow.addColorStop(1,'rgba(80,150,255,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<N;i++){let x=cur[i*3],y=cur[i*3+1],z=cur[i*3+2];
      let x1=x*cosY+z*sinY,z1=-x*sinY+z*cosY;let y1=y*cosX-z1*sinX,z2=y*sinX+z1*cosX;
      const dz=1.9-z2; const persp=1.9/(dz<0.45?0.45:dz);const sx=cx+x1*scale*persp,sy=cy+y1*scale*persp;
      const depth=(z2+1)/2;let r=(mobile?1.0:1.15)*persp*(0.5+depth*0.9);if(!(r>0.05))r=0.05;let a=0.18+depth*0.62;if(a<0)a=0;else if(a>1)a=1;
      const cr=Math.round(40+depth*60),cg=Math.round(120+depth*100),cb=Math.round(235+depth*20);
      ctx.beginPath();ctx.fillStyle='rgba('+cr+','+cg+','+cb+','+a+')';ctx.arc(sx,sy,r,0,7);ctx.fill();}
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(frame);
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
    .to({},{duration:0.2});

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

  // Event delegation: robust against timing, scroll clones, re-renders
  document.addEventListener("click", function(e){
    var link = e.target.closest(".case-card-link[data-case]");
    if(!link) return;
    if(e.target.closest("a")) return; // inner links (client) work normally
    e.preventDefault();
    openCase(link.getAttribute("data-case"));
  });
  // visual: pointer cursor on case cards
  document.querySelectorAll(".case-card-link[data-case]").forEach(function(c){ c.style.cursor="pointer"; });

  closeBtn.addEventListener("click", closeCase);
  overlay.addEventListener("click", function(e){
    if(e.target === overlay) closeCase();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && overlay.classList.contains("open")) closeCase();
  });
})();

/* ===== CASE RING CARDS: count-up + arc on view ===== */
(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R=42, C=2*Math.PI*R;
  const cards=document.querySelectorAll('.cases .case-card[data-case]');
  cards.forEach(card=>{const p=card.querySelector('.mr-prog'); if(p){p.style.strokeDasharray=C;p.style.strokeDashoffset=C;}});
  function run(card){
    const arc=+(card.getAttribute('data-arc')||0), p=card.querySelector('.mr-prog');
    if(p){p.style.transition='stroke-dashoffset 1.3s cubic-bezier(.2,.7,.2,1)';requestAnimationFrame(()=>{p.style.strokeDashoffset=0;});}
    card.querySelectorAll('.mr-num[data-to]').forEach(n=>{const to=+n.dataset.to;
      if(reduce){n.textContent=to;return;}
      const dur=1100,t0=performance.now();
      (function tick(t){const k=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-k,3);n.textContent=Math.round(to*e);if(k<1)requestAnimationFrame(tick);})(t0);});
  }
  if(!('IntersectionObserver' in window)){cards.forEach(run);return;}
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){run(e.target);io.unobserve(e.target);}});},{threshold:.35});
  cards.forEach(c=>io.observe(c));
})();
