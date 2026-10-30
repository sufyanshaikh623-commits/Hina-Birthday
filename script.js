/* ===== Yahan apni settings badlein ===== */
const FRIEND = "Hina";
const FROM   = "Tumhara Dost : Sufyan Shaikh";   // apna naam yahan likh dein
/* ======================================= */

const $ = id => document.getElementById(id);
$('spName').textContent = FRIEND + ", tumhare liye";
['heroName','ntName','finName'].forEach(i=>$(i).textContent = FRIEND);
$('from').textContent = FROM;

/* ---------- floating decorations ---------- */
(function(){
  const box = $('floaters');
  const cols = ['#ff9ac6','#c9b3ff','#ffd0b0','#f3d58a','#b6e3ff'];
  const emo = ['💗','✨','🌸','💖','⭐','🪻'];
  for(let i=0;i<22;i++){
    const d = document.createElement('div');
    d.className = 'fl';
    if(i%4===0){ d.classList.add('balloon'); d.style.background = cols[i%cols.length]; }
    else { d.textContent = emo[i%emo.length]; d.style.fontSize = (14+Math.random()*16)+'px'; }
    d.style.left = Math.random()*100+'%';
    d.style.animationDuration = (12+Math.random()*14)+'s';
    d.style.animationDelay = (-Math.random()*20)+'s';
    box.appendChild(d);
  }
})();

/* ---------- confetti ---------- */
const cv = $('confetti'), cx = cv.getContext('2d');
let parts = [], cfRun = false;
function sizeCv(){ cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', sizeCv); sizeCv();
function burst(n=140, ox=innerWidth/2, oy=innerHeight/2){
  const cols = ['#ff5c9d','#ffc4a3','#b79bff','#f3d58a','#c9a24b','#8fd3ff','#ffffff'];
  for(let i=0;i<n;i++){
    const a = Math.random()*Math.PI*2, s = 4+Math.random()*9;
    parts.push({x:ox,y:oy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-5,g:.18,w:6+Math.random()*6,h:4+Math.random()*5,
      c:cols[Math.floor(Math.random()*cols.length)],r:Math.random()*6,vr:(Math.random()-.5)*.4,life:140+Math.random()*60});
  }
  if(!cfRun){ cfRun = true; cfLoop(); }
}
function cfLoop(){
  cx.clearRect(0,0,cv.width,cv.height);
  parts = parts.filter(p=>p.life>0 && p.y<cv.height+30);
  for(const p of parts){
    p.vy+=p.g; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; p.life--;
    cx.save(); cx.translate(p.x,p.y); cx.rotate(p.r); cx.globalAlpha=Math.min(1,p.life/40);
    cx.fillStyle=p.c; cx.fillRect(-p.w/2,-p.h/2,p.w,p.h); cx.restore();
  }
  if(parts.length) requestAnimationFrame(cfLoop); else cfRun = false;
}

/* ---------- MUSIC HANDLER ---------- */
const audio = $('audio'), player = $('player'), pp = $('pp');
let mode = 'file', playing = false, fileBroken = false;

audio.addEventListener('error', ()=>{ fileBroken = true; });

let actx, synthOn = false, synthTimer;
function ensureCtx(){
  actx = actx || new (window.AudioContext||window.webkitAudioContext)();
  if(actx.state==='suspended') actx.resume();
  return actx;
}

let noiseBuf;
function boom(){
  if(!actx || actx.state!=='running') return;
  const t = actx.currentTime;
  if(!noiseBuf){
    noiseBuf = actx.createBuffer(1, actx.sampleRate*1.2, actx.sampleRate);
    const d = noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  }
  const out = actx.createGain(); out.gain.value = 1;
  if(actx.createStereoPanner){ const pn = actx.createStereoPanner(); pn.pan.value = (Math.random()-.5)*1.2; out.connect(pn).connect(actx.destination); }
  else out.connect(actx.destination);
  const o = actx.createOscillator(), og = actx.createGain();
  o.type='sine'; o.frequency.setValueAtTime(105,t); o.frequency.exponentialRampToValueAtTime(40,t+.5);
  og.gain.setValueAtTime(.0001,t); og.gain.exponentialRampToValueAtTime(.05,t+.02); og.gain.exponentialRampToValueAtTime(.0001,t+.7);
  o.connect(og).connect(out); o.start(t); o.stop(t+.75);
  const n = actx.createBufferSource(); n.buffer = noiseBuf;
  const lp = actx.createBiquadFilter(); lp.type='lowpass';
  lp.frequency.setValueAtTime(480,t); lp.frequency.exponentialRampToValueAtTime(90,t+.9);
  const ng = actx.createGain();
  ng.gain.setValueAtTime(.0001,t); ng.gain.exponentialRampToValueAtTime(.04,t+.03); ng.gain.exponentialRampToValueAtTime(.0001,t+1);
  n.connect(lp).connect(ng).connect(out); n.start(t); n.stop(t+1.1);
  for(let i=0;i<5;i++){
    const c = actx.createBufferSource(); c.buffer = noiseBuf;
    const hp = actx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value = 3500;
    const cg = actx.createGain(), ct = t+.18+i*.08+Math.random()*.05;
    cg.gain.setValueAtTime(.0001,ct); cg.gain.exponentialRampToValueAtTime(.008,ct+.005); cg.gain.exponentialRampToValueAtTime(.0001,ct+.05);
    c.connect(hp).connect(cg).connect(out); c.start(ct,Math.random()*.5); c.stop(ct+.06);
  }
}

const MEL = [[392,.75],[392,.25],[440,1],[392,1],[523,1],[494,2],
             [392,.75],[392,.25],[440,1],[392,1],[587,1],[523,2],
             [392,.75],[392,.25],[784,1],[659,1],[523,1],[494,1],[440,2],
             [698,.75],[698,.25],[659,1],[523,1],[587,1],[523,2]];

function note(f,t,d){
  const o = actx.createOscillator(), g = actx.createGain();
  o.type='triangle'; o.frequency.value=f;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.22,t+.03); g.gain.exponentialRampToValueAtTime(.001,t+d*.95);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t+d);
}

function playSynth(){
  ensureCtx(); synthOn = true;
  const beat = .52; let t = actx.currentTime+.05;
  MEL.forEach(([f,b])=>{ note(f,t,b*beat); t+=b*beat; });
  synthTimer = setTimeout(()=>{ if(synthOn) playSynth(); }, (t-actx.currentTime+1.2)*1000);
}

function stopSynth(){ synthOn=false; clearTimeout(synthTimer); if(actx) actx.suspend(); }
function setUI(on){ playing = on; pp.textContent = on ? '⏸' : '▶'; player.classList.toggle('playing', on); }

async function startMusic(){
  if(mode==='file' && !fileBroken){
    try{ await audio.play(); setUI(true); return; }catch(e){}
  }
  mode = 'synth'; $('songName').textContent = 'Happy Birthday 🎶';
  playSynth(); setUI(true);
}

function stopMusic(){ if(mode==='file') audio.pause(); else stopSynth(); setUI(false); }
pp.onclick = ()=> playing ? stopMusic() : startMusic();
audio.addEventListener('loadedmetadata', ()=>{ $('songName').textContent = 'Birthday Song'; });

/* ---------- NIGHT FIREWORKS ---------- */
const night = $('night'), fw = $('fw'), fx = fw.getContext('2d');
let W=0, H=0, rockets=[], sparks=[], fwOn=false, nightTimers=[];

(function(){ const s=$('stars'); for(let i=0;i<110;i++){ const e=document.createElement('i');
  e.style.left=Math.random()*100+'%'; e.style.top=Math.random()*100+'%';
  e.style.animationDelay=(Math.random()*3)+'s'; e.style.opacity=.4+Math.random()*.6; s.appendChild(e);} })();

function sizeFw(){ W = fw.width = innerWidth; H = fw.height = innerHeight; }
addEventListener('resize', sizeFw); sizeFw();
const rnd = (a,b)=>a+Math.random()*(b-a);

function launch(x){
  rockets.push({x: x ?? rnd(.12,.88)*W, y:H, ty:H*rnd(.12,.46), vy:-rnd(9,12), hue:Math.floor(rnd(0,360)), gold:Math.random()<.3});
}
function explode(r){
  boom();
  const n = 80+Math.floor(Math.random()*50), ring = Math.random()<.35;
  for(let i=0;i<n;i++){
    const a = (i/n)*Math.PI*2, sp = ring ? 4.2 : rnd(1.2,5.4);
    sparks.push({x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,decay:rnd(.008,.016),
      hue: r.gold ? rnd(38,50) : r.hue+rnd(-18,18), sat: r.gold?90:100, lit: r.gold?65:62, size:rnd(1.4,2.6)});
  }
  if(Math.random()<.5) for(let i=0;i<18;i++){ const a=rnd(0,Math.PI*2), sp=rnd(.4,2);
    sparks.push({x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,decay:.02,hue:50,sat:100,lit:88,size:1.4}); }
}
function fwLoop(){
  if(!fwOn) { fx.clearRect(0,0,W,H); return; }
  fx.globalCompositeOperation='destination-out';
  fx.fillStyle='rgba(0,0,0,.2)'; fx.fillRect(0,0,W,H);
  fx.globalCompositeOperation='lighter';
  for(const r of rockets){
    r.y += r.vy; r.vy *= .985;
    fx.fillStyle = r.gold ? 'hsl(45,100%,75%)' : `hsl(${r.hue},100%,75%)`;
    fx.beginPath(); fx.arc(r.x,r.y,2.2,0,6.283); fx.fill();
    if(r.y <= r.ty || r.vy > -2.2){ r.dead = true; explode(r); }
  }
  rockets = rockets.filter(r=>!r.dead);
  for(const s of sparks){
    s.vy += .045; s.vx *= .985; s.vy *= .985; s.x += s.vx; s.y += s.vy; s.life -= s.decay;
    fx.fillStyle = `hsla(${s.hue},${s.sat}%,${s.lit}%,${Math.max(0,s.life)})`;
    fx.beginPath(); fx.arc(s.x,s.y,s.size,0,6.283); fx.fill();
  }
  sparks = sparks.filter(s=>s.life>0);
  requestAnimationFrame(fwLoop);
}
function later(fn,ms){ nightTimers.push(setTimeout(fn,ms)); }

function startNight(){
  document.body.classList.add('locked');
  night.classList.remove('fade'); $('nt').classList.remove('in');
  night.classList.add('on');
  fwOn = true; rockets=[]; sparks=[]; fx.clearRect(0,0,W,H);
  later(()=>{ fwLoop(); },1300);
  for(let i=0;i<14;i++) later(()=>launch(), 1500 + i*520);
  later(()=>$('nt').classList.add('in'), 2600);
  for(let i=0;i<9;i++) later(()=>launch((.08+i*.105)*W), 8800 + i*170);
  later(endNight, 11200);
}
function endNight(){
  if(!night.classList.contains('on')) return;
  nightTimers.forEach(clearTimeout); nightTimers=[];
  night.classList.add('fade'); night.classList.remove('on');
  burst(160, innerWidth/2, innerHeight*.35);
  setTimeout(()=>burst(90, innerWidth*.2, innerHeight*.45), 500);
  setTimeout(()=>burst(90, innerWidth*.8, innerHeight*.45), 800);
  setTimeout(()=>{ fwOn=false; }, 2600);
  document.body.classList.remove('locked');
  document.querySelectorAll('#hero .reveal').forEach((el,i)=>setTimeout(()=>el.classList.add('in'), 700+i*220));
}
$('skip').onclick = endNight;

$('openBtn').onclick = ()=>{
  ensureCtx();
  $('splash').classList.add('hide');
  player.classList.add('show');
  startMusic();
  startNight();
};
$('replay').onclick = ()=>{ ensureCtx(); window.scrollTo({top:0,behavior:'smooth'}); setTimeout(startNight,400); };

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }),{threshold:.15});
document.querySelectorAll('section:not(#hero) .reveal').forEach(el=>io.observe(el));

/* ---------- gallery (gallery1.jpg ... gallery6.jpg) ---------- */
(function(){
  const g = $('gal'); let failed = 0;
  for(let i=1;i<=6;i++){
    const d = document.createElement('div');
    d.className = 'frame reveal';
    d.innerHTML = `<div class="fi"><img src="gallery${i}.jpg" alt=""></div>`;
    d.querySelector('img').onerror = ()=>{ d.remove(); if(++failed===6) $('gallery').style.display='none'; };
    g.appendChild(d); io.observe(d);
  }
})();

/* ---------- royal cake (SVG) ---------- */
(function(){
  const drips = (x,y,w)=>{
    let s = `<rect x="${x}" y="${y}" width="${w}" height="16" rx="8" fill="url(#cream)"/>`;
    const n = Math.max(2,Math.floor(w/24));
    for(let i=0;i<n;i++){
      const dx = x+16+i*((w-32)/(n-1)), h = 14+((i*7)%3)*9;
      s += `<rect x="${dx-6}" y="${y+6}" width="12" height="${h}" rx="6" fill="url(#cream)"/>`;
    }
    return s;
  };
  const pearls = (x,y,w)=>{
    let s=''; for(let px=x+14; px<=x+w-14; px+=17) s += `<circle cx="${px}" cy="${y}" r="4.6" fill="url(#pearl)"/>`;
    return s;
  };
  const flower = (cx,cy,c)=>{
    let s='';
    for(let a=0;a<5;a++){ const r=a*72*Math.PI/180; s += `<circle cx="${cx+Math.cos(r)*6.5}" cy="${cy+Math.sin(r)*6.5}" r="5" fill="${c}"/>`; }
    return s + `<circle cx="${cx}" cy="${cy}" r="3.6" fill="url(#goldG)"/>`;
  };
  const candle = cx => `
    <rect x="${cx-3.5}" y="60" width="7" height="38" rx="2" fill="url(#candleG)"/>
    <line x1="${cx}" y1="60" x2="${cx}" y2="55" stroke="#5a3a4a" stroke-width="1.4"/>
    <g transform="translate(${cx} 47)">
      <circle class="glow" r="19" fill="url(#glowG)"/>
      <g class="flame"><ellipse rx="5.6" ry="10" fill="url(#flameG)"/><ellipse cy="3" rx="2.4" ry="4.6" fill="#fff7cf"/></g>
    </g>`;
  const cherry = (cx,cy)=>`
    <path d="M${cx} ${cy-8} q6 -12 13 -13" stroke="#3f8a4a" stroke-width="2" fill="none"/>
    <ellipse cx="${cx+12}" cy="${cy-20}" rx="7" ry="3.2" fill="#4fae5d" transform="rotate(-25 ${cx+12} ${cy-20})"/>
    <circle cx="${cx}" cy="${cy}" r="10" fill="url(#cherryG)"/>
    <circle cx="${cx-3}" cy="${cy-3}" r="2.6" fill="#fff" opacity=".75"/>`;

  $('cakeSvg').innerHTML = `
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3d6ff"/><stop offset="1" stop-color="#b79bff"/></linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6d0"/><stop offset="1" stop-color="#ffb487"/></linearGradient>
    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd3e7"/><stop offset="1" stop-color="#ff8dbb"/></linearGradient>
    <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fff0f6"/></linearGradient>
    <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7dd96"/><stop offset=".5" stop-color="#c9a24b"/><stop offset="1" stop-color="#a8791f"/></linearGradient>
    <linearGradient id="candleG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff9ac6"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#ff9ac6"/></linearGradient>
    <radialGradient id="pearl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e8d5b4"/></radialGradient>
    <radialGradient id="cherryG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff5a7a"/><stop offset="1" stop-color="#a30f2d"/></radialGradient>
    <radialGradient id="flameG" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#fff2b0"/><stop offset=".55" stop-color="#ffb23f"/><stop offset="1" stop-color="#ff6a3d"/></radialGradient>
    <radialGradient id="glowG"><stop offset="0" stop-color="#ffd86b" stop-opacity=".75"/><stop offset="1" stop-color="#ffd86b" stop-opacity="0"/></radialGradient>
    <radialGradient id="plateG" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#fff3c9"/><stop offset=".6" stop-color="#d9b25a"/><stop offset="1" stop-color="#9c7020"/></radialGradient>
  </defs>

  <!-- stand -->
  <ellipse cx="160" cy="338" rx="62" ry="7" fill="url(#plateG)"/>
  <rect x="146" y="320" width="28" height="18" rx="4" fill="url(#goldG)"/>
  <ellipse cx="160" cy="314" rx="152" ry="17" fill="url(#plateG)"/>
  <ellipse cx="160" cy="310" rx="140" ry="12" fill="#fff6dc" opacity=".6"/>

  <!-- bottom tier -->
  <rect x="38" y="226" width="244" height="84" rx="14" fill="url(#g1)"/>
  <rect x="38" y="262" width="244" height="7" fill="url(#goldG)"/>
  ${drips(38,226,244)}
  ${pearls(38,302,244)}
  <text x="160" y="291" text-anchor="middle" font-family="'Great Vibes',cursive" font-size="30" fill="#5a2a66">Hina</text>
  <text x="68" y="290" font-size="14" fill="#c9a24b">♛</text><text x="240" y="290" font-size="14" fill="#c9a24b">♛</text>

  <!-- middle tier -->
  <rect x="70" y="160" width="180" height="74" rx="12" fill="url(#g2)"/>
  <rect x="70" y="196" width="180" height="6" fill="url(#goldG)"/>
  ${drips(70,160,180)}
  ${flower(100,222,'#ffffff')}${flower(130,222,'#ffd3e7')}${flower(160,222,'#ffffff')}${flower(190,222,'#ffd3e7')}${flower(220,222,'#ffffff')}

  <!-- top tier -->
  <rect x="102" y="98" width="116" height="66" rx="10" fill="url(#g3)"/>
  <rect x="102" y="128" width="116" height="6" fill="url(#goldG)"/>
  ${drips(102,98,116)}
  ${pearls(102,155,116)}
  <text x="160" y="149" text-anchor="middle" font-size="16" fill="#fff">♥</text>

  ${cherry(116,96)}${cherry(204,96)}
  ${[130,145,160,175,190].map(candle).join('')}
  `;
})();

let blown = false;
$('cake').onclick = ()=>{
  const c = $('cake'), w = $('wish');
  if(!blown){
    blown = true; c.classList.add('out');
    const r = c.getBoundingClientRect();
    burst(160, r.left+r.width/2, r.top+r.height*.2);
    w.classList.add('big');
    w.textContent = `Wish maang lo ${FRIEND}… tumhari har dua qabool ho! ✨`;
  }else{
    blown = false; c.classList.remove('out'); w.classList.remove('big');
    w.textContent = 'Candles dobara jala di gayi hain 🕯️ — phir se bujhao!';
  }
};

/* ---------- scroll progress + sparkle trail ---------- */
addEventListener('scroll',()=>{
  const h = document.documentElement.scrollHeight - innerHeight;
  $('prog').style.width = (h>0 ? scrollY/h*100 : 0) + '%';
},{passive:true});

function sparkle(x,y,n=1){
  for(let i=0;i<n;i++){
    const e = document.createElement('div'); e.className='sp'; e.textContent = ['✦','✧','✨'][Math.floor(Math.random()*3)];
    e.style.left = x+'px'; e.style.top = y+'px';
    e.style.setProperty('--dx',(Math.random()-.5)*(n>1?110:40)+'px'); e.style.setProperty('--dy',(Math.random()*-60-(n>1?20:0))+'px');
    document.body.appendChild(e); setTimeout(()=>e.remove(),950);
  }
}
let lastSp = 0;
addEventListener('pointermove',e=>{ if(e.pointerType==='touch') return; const n=Date.now(); if(n-lastSp>45){ lastSp=n; sparkle(e.clientX,e.clientY); } });
addEventListener('pointerdown',e=>sparkle(e.clientX,e.clientY,7));
