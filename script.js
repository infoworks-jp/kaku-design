
const canvas = document.getElementById('inkCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
const blobs = [];
let pointer = { x: innerWidth * .72, y: innerHeight * .25, active: false };

function resize(){
  w = innerWidth; h = innerHeight;
  canvas.width = Math.floor(w*dpr);
  canvas.height = Math.floor(h*dpr);
  canvas.style.width = w+'px';
  canvas.style.height = h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resize); resize();

function addBlob(x,y,force=1){
  const count = Math.round(3 + force*4);
  for(let i=0;i<count;i++){
    blobs.push({
      x:x+(Math.random()-.5)*28,
      y:y+(Math.random()-.5)*28,
      r:10+Math.random()*38*force,
      vx:(Math.random()-.5)*.42,
      vy:(Math.random()-.5)*.35,
      life:0,
      max:220+Math.random()*260,
      shade:Math.random()>.86 ? 'rgba(120,18,12,.08)' : 'rgba(5,5,5,.065)'
    });
  }
  if(blobs.length>180) blobs.splice(0,blobs.length-180);
}

for(let i=0;i<30;i++) addBlob(Math.random()*w,Math.random()*h,.8);

function move(x,y){
  pointer.x=x; pointer.y=y; pointer.active=true;
  addBlob(x,y,.7);
}
window.addEventListener('pointermove',e=>move(e.clientX,e.clientY),{passive:true});
window.addEventListener('pointerdown',e=>addBlob(e.clientX,e.clientY,1.8),{passive:true});

function draw(){
  ctx.clearRect(0,0,w,h);
  ctx.filter='blur(16px) contrast(115%)';
  ctx.globalCompositeOperation='multiply';

  for(let i=blobs.length-1;i>=0;i--){
    const b=blobs[i];
    b.life++;
    const driftX=Math.sin((b.life+i)*.018)*.12;
    const driftY=Math.cos((b.life+i)*.014)*.08;
    b.x+=b.vx+driftX; b.y+=b.vy+driftY; b.r+=.035;
    const alpha=Math.max(0,1-b.life/b.max);
    const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*2.6);
    g.addColorStop(0,b.shade.replace(/[\d.]+\)$/,(.11*alpha)+')'));
    g.addColorStop(.35,b.shade.replace(/[\d.]+\)$/,(.075*alpha)+')'));
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(b.x,b.y,b.r*2.6,0,Math.PI*2);ctx.fill();
    if(b.life>b.max) blobs.splice(i,1);
  }
  ctx.filter='none';
  if(Math.random()<.08) addBlob(Math.random()*w,Math.random()*h,.5);
  requestAnimationFrame(draw);
}
draw();

const menuBtn=document.querySelector('.menu-button');
const drawer=document.querySelector('.drawer');
menuBtn.addEventListener('click',()=>{
  const open=drawer.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded',String(open));
  drawer.setAttribute('aria-hidden',String(!open));
});
drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>drawer.classList.remove('open')));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add('visible')});
},{threshold:.16});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
