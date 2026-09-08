import {C} from './config.js';
export function launchVector(g,speed,angle){const s=Math.min(C.maxSpeed,speed),a=angle*Math.PI/180;g.p.vx=s*Math.cos(a);g.p.vy=-s*Math.sin(a);g.p.ground=false;}
export function stopOrRevive(g,reason){if(g.revive>0){g.revive=0;g.p.vx=C.reviveVx;g.p.vy=C.reviveVy;g.p.y=Math.min(-22,g.p.y);g.p.ground=false;g.still=0;g.stats.revives++;g.emit('revive','',g.p.x,g.p.y);return true;}g.p.vx=g.p.vy=0;g.state='result';g.reason=reason;g.emit('stop','',g.p.x,g.p.y);return false;}
export function characterEffect(g,e){
 const refresh=g.inori==='null'&&e.kind==='inori';
 const cancel=g.inori==='null'&&!refresh,strong=!refresh&&(g.inori==='next'||g.manual>0);
 g.stats.contacts++;
 // Consume only pre-collision state; effects below may grant fresh state.
 g.inori=null;g.manual=0;
 if(cancel){g.hitstop=C.collisionHold;g.lock=C.collisionHold;g.guard={targetX:e.x,elapsed:0,duration:C.collisionHold};g.emit('null','',e.x,-75);return;}
 g.charge=Math.min(100,g.charge+C.chargeHit);let s=Math.hypot(g.p.vx,g.p.vy),f=C.effects[e.kind];
 e.animTime=0;e.effectLabel=({cat:['높이UP','바운스UP'],inori:['무효화','UP+강화'],ppung:['속도DOWN','부활'],koko:['속도UP','속도UPUP'],maid:['','속도MAX']})[e.kind][strong?1:0];
 if(e.kind==='maid'){e.anim=strong?'throw':'catch';if(strong)launchVector(g,Math.max(f.min,s*f.strong),f.angle);else{g.caught=true;g.p.vx=g.p.vy=0;g.pendingGameOver='앵냥짱 품에 쏙!';}}
 if(e.kind==='koko'){e.anim=strong?'fireWindup':'kick';launchVector(g,Math.max(strong?f.strongMin:f.min,s*(strong?f.strong:f.normal)),f.angle);}
 if(e.kind==='inori'){e.anim=strong?'uppercut':'cast';if(strong){launchVector(g,Math.max(f.min,s*f.strong),f.angle);g.inori='next';g.manual=0;}else g.inori='null';}
 if(e.kind==='cat'){e.anim=strong?'bless':'toss';if(strong)g.bounceBuff=C.bounceBuffDuration;else launchVector(g,Math.max(f.min,s*f.multiplier),f.angle);}
 if(e.kind==='ppung'){e.anim=strong?'bless':'slow';g.p.vx*=strong?f.strong:f.normal;g.p.vy*=strong?f.strong:f.normal;if(strong)g.revive=C.reviveDuration;}
 const hold=!strong&&e.kind==='maid'?C.maidHold:strong?C.strongHolds[e.kind]:C.collisionHold;
 g.lock=hold;g.hitstop=hold;g.cinematic={kind:e.kind,pose:e.anim,strong,elapsed:0,duration:hold,x:e.x};
 g.emit(strong?'strong':e.kind,'',e.x,-75);
}
