const W=800,H=500,R=8;
export function createInitialState(){return {status:'playing',leftPaddle:{x:30,y:210,width:12,height:80},rightPaddle:{x:758,y:210,width:12,height:80},ball:{x:400,y:250,vx:200,vy:150,radius:R},score:{left:0,right:0}}}
export const resetGame=()=>createInitialState();
export function updateGame(state,input={},dt){
 if(typeof dt!=='number'||!Number.isFinite(dt)||dt<0||dt>.1)throw new RangeError('dt');
 const n=structuredClone(state);
 if(input?.togglePause){n.status=n.status==='playing'?'paused':'playing';return n}
 if(n.status==='paused'||dt===0)return n;
 for(const [key,up,down] of [['leftPaddle','leftUp','leftDown'],['rightPaddle','rightUp','rightDown']]){
  const d=Number(!!input?.[down])-Number(!!input?.[up]);
  n[key].y=Math.max(0,Math.min(420,n[key].y+300*d*dt));
 }
 const b=n.ball;
 const score=()=>{
  if(b.x+b.radius<0)n.score.right++;
  else if(b.x-b.radius>W)n.score.left++;
  else return false;
  const total=n.score.left+n.score.right;
  Object.assign(b,{x:400,y:250,vx:total%2?-200:200,vy:150});
  return true;
 };
 if(score())return n;
 let t=dt;
 for(let iteration=0;iteration<12&&t>1e-12;iteration++){
  let events=[],best=t+1e-10;
  function candidate(time,kind){
   if(time>=-1e-10 && time<=t+1e-10){
    time=Math.max(0,time);
    if(time<best-1e-9){best=time;events=[kind]}
    else if(Math.abs(time-best)<1e-9)events.push(kind);
   }
  }
  if(b.vy<0)candidate((b.radius-b.y)/b.vy,'top');
  if(b.vy>0)candidate((H-b.radius-b.y)/b.vy,'bottom');
  if(b.vx<0)candidate((-b.radius-b.x)/b.vx,'scoreRight');
  if(b.vx>0)candidate((W+b.radius-b.x)/b.vx,'scoreLeft');
  // swept circle-vs-rectangle using expanded face plus corner quadratic.
  for(const [p,side] of [[n.leftPaddle,'left'],[n.rightPaddle,'right']]){
   if(side==='left'&&b.vx>=0 || side==='right'&&b.vx<=0)continue;
   const face=side==='left'?p.x+p.width+b.radius:p.x-b.radius;
   const time=(face-b.x)/b.vx;
   if(time>=-1e-10&&time<=t+1e-10){
    const y=b.y+b.vy*Math.max(0,time);
    if(y>=p.y&&y<=p.y+p.height)candidate(time,side);
   }
   for(const cy of [p.y,p.y+p.height]){
    const cx=side==='left'?p.x+p.width:p.x;
    const dx=b.x-cx,dy=b.y-cy;
    const a=b.vx*b.vx+b.vy*b.vy, bb=2*(dx*b.vx+dy*b.vy),c=dx*dx+dy*dy-b.radius*b.radius;
    const disc=bb*bb-4*a*c;
    if(a>0&&disc>=0){
      const hit=(-bb-Math.sqrt(disc))/(2*a);
      if(hit>=-1e-10&&hit<=t+1e-10){
       const xx=b.x+b.vx*Math.max(0,hit);
       if(side==='left'?xx>=cx:xx<=cx)candidate(hit,side);
      }
    }
   }
  }
  const advance=events.length?best:t;
  b.x+=b.vx*advance;b.y+=b.vy*advance;t-=advance;
  if(!events.length)break;
  if(events.includes('top')||events.includes('bottom'))b.vy=-b.vy;
  if(events.includes('left')||events.includes('right'))b.vx=-b.vx;
  if(events.includes('scoreLeft')||events.includes('scoreRight')){
    // strict boundary: score only if crossed, not merely touched
    if(t>1e-12){ b.x+=Math.sign(b.vx)*1e-7; if(score())return n; }
    else break;
  }
  if(advance<=1e-12&&!events.some(e=>e==='left'||e==='right'||e==='top'||e==='bottom'))break;
 }
 return n;
}
