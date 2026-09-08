import {C} from './config.js';
import {Field,overlapping,sweep} from './field.js';
import {characterEffect,launchVector,stopOrRevive} from './effects.js';
export class Game{
 constructor(seed=20260908){this.reset(seed);}
 reset(seed=this.seed){this.seed=seed>>>0;this.state='menu';this.paused=false;this.p={x:0,y:-20,vx:0,vy:0,ground:false};this.field=new Field(this.seed);this.contacts=new Set();this.jumps=C.jumps;this.inori=null;this.manual=0;this.revive=0;this.bounceBuff=0;this.charge=0;this.still=0;this.lock=0;this.hitstop=0;this.cinematic=null;this.guard=null;this.caught=false;this.pendingGameOver=null;this.time=0;this.maxX=0;this.events=[];this.stats={maxSpeed:0,contacts:0,jumps:0,revives:0};this.pendingJump=false;this.reason='';this.field.fill(0,0);}
 emit(type,text,x=this.p.x,y=this.p.y){this.events.push({type,text,x,y,time:this.time});}
 launch(angle,power){this.state='flight';launchVector(this,C.launchMin+power*C.launchRange,angle);this.emit('launch','날아라, 앵알이!');}
 canJump(){return this.state==='flight'&&!this.paused&&!this.p.ground&&this.p.y<-(C.body.bird.ry+.01)&&this.contacts.size===0&&this.p.vy>C.jumpEpsilon&&this.jumps>0&&this.lock<=0&&this.hitstop<=0;}
 jump(){if(!this.canJump())return false;this.p.vx*=C.jumpBoost;this.p.vy*=-C.jumpBoost;this.jumps--;this.stats.jumps++;this.emit('jump','');return true;}
 empower(){if(this.state!=='flight'||this.paused||this.charge<100||this.inori==='next'||this.manual>0||this.lock>0)return false;this.charge=0;if(this.inori==='null')this.inori=null;this.manual=C.manualDuration;this.emit('power',C.manualDuration+'초 안에 부딪쳐!');return true;}
 update(dt){if(this.paused||this.state!=='flight'){this.pendingJump=false;return;}
  if(this.hitstop>0){for(const e of this.field.items)e.animTime+=dt;if(this.cinematic)this.cinematic.elapsed+=dt;if(this.guard)this.guard.elapsed+=dt;this.hitstop=Math.max(0,this.hitstop-dt);this.pendingJump=false;if(this.hitstop===0){this.cinematic=null;if(this.pendingGameOver){this.p.vx=this.p.vy=0;this.state='result';this.reason=this.pendingGameOver;this.pendingGameOver=null;this.emit('stop','');}}return;}
  if(this.guard)this.guard.elapsed+=dt;
  this.time+=dt;this.lock=Math.max(0,this.lock-dt);this.manual=Math.max(0,this.manual-dt);this.revive=Math.max(0,this.revive-dt);this.bounceBuff=Math.max(0,this.bounceBuff-dt);
  for(const e of this.field.items)e.animTime+=dt;
  const p=this.p;p.vx*=Math.exp(-C.airDrag*dt);if(!p.ground)p.vy+=C.gravity*dt;
  let remain=dt;
  // Re-sweep the remaining path after every impact, including ground bounces.
  for(let n=0;remain>1e-8&&n<16&&this.state==='flight';n++){
   for(const id of this.contacts){const e=this.field.items.find(e=>e.id===id);if(!e||!overlapping(p,e))this.contacts.delete(id);}
   const dx=p.vx*remain,dy=p.vy*remain;let first=null,t=1,ground=false;
   if(dy>0&&p.y+dy>=-C.body.bird.ry){t=Math.max(0,(-C.body.bird.ry-p.y)/dy);ground=true;}
   for(const e of this.field.items){if(this.contacts.has(e.id))continue;const hit=sweep(p,dx,dy,e);if(hit!==null&&hit<=t){t=hit;first=e;ground=false;}}
   p.x+=dx*t;p.y+=dy*t;this.maxX=Math.max(this.maxX,p.x);remain*=1-t;
   if(first){this.contacts.add(first.id);characterEffect(this,first);if(this.hitstop>0)remain=0;}
   else if(ground){p.y=-C.body.bird.ry;if(p.vy>C.settleVy||this.bounceBuff>0){p.vy=-p.vy*(this.bounceBuff>0?C.bounceBuffBoost:C.groundBounce);p.vx*=this.bounceBuff>0?C.bounceBuffBoost:C.bounceFriction;p.ground=false;this.charge=Math.min(100,this.charge+C.chargeBounce);this.emit('bounce','');}else{p.vy=0;p.ground=true;}}
   else break;
   if(t===0)remain=Math.max(0,remain-1e-7);
  }
  if(p.ground){p.vx*=Math.exp(-C.groundFriction*dt);if(Math.abs(p.vx)<C.stopSpeed){this.still+=dt;if(this.still>=C.stopDelay)stopOrRevive(this,'잠깐 쉬어갈래!');}else this.still=0;}else this.still=0;
  for(const id of this.contacts){const e=this.field.items.find(e=>e.id===id);if(!e||!overlapping(p,e))this.contacts.delete(id);}
  if(this.pendingJump){this.pendingJump=false;this.jump();}
  const speed=Math.hypot(p.vx,p.vy);if(speed>C.maxSpeed){p.vx*=C.maxSpeed/speed;p.vy*=C.maxSpeed/speed;}
  this.stats.maxSpeed=Math.max(this.stats.maxSpeed,Math.hypot(p.vx,p.vy));this.maxX=Math.max(this.maxX,p.x);this.field.fill(p.x,p.vx);
 }
}

