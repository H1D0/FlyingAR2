import {C} from './config.js';
export function random(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export class Field{
 constructor(seed){this.rand=random(seed);this.items=[];this.next=650;this.serial=0;this.last='';this.repeat=0;}
 fill(x,speed){while(this.next<x+C.field.ahead){let choices=Object.entries(C.field.weights).filter(([k])=>k!==this.last||this.repeat<C.field.maxRepeat);let n=this.rand()*choices.reduce((a,b)=>a+b[1],0);let kind=choices[0][0];for(const [k,w] of choices){n-=w;if(n<0){kind=k;break;}}this.add(kind,this.next);this.repeat=kind===this.last?this.repeat+1:1;this.last=kind;this.next+=C.field.gapMin+this.rand()*C.field.gapRange+Math.min(120,speed*.035+x*.001);}
 this.items=this.items.filter(e=>e.x>x-900);}
 add(kind,x){const e={id:++this.serial,kind,x,anim:'idle',animTime:0};this.items.push(e);return e;}
}
export function overlapping(p,e){const b=C.body;return Math.abs(p.x-e.x)<=b.human.rx+b.bird.rx&&p.y>=b.human.top-b.bird.ry&&p.y<=b.human.bottom+b.bird.ry;}
// Slab intersection against the expanded torso box. Returns time of entry in [0,1].
export function sweep(p,dx,dy,e){const b=C.body,rx=b.human.rx+b.bird.rx;let lo=0,hi=1;for(const [pos,delta,min,max] of [[p.x,dx,e.x-rx,e.x+rx],[p.y,dy,b.human.top-b.bird.ry,b.human.bottom+b.bird.ry]]){if(Math.abs(delta)<1e-10){if(pos<min||pos>max)return null;}else{let a=(min-pos)/delta,b=(max-pos)/delta;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return null;}}return lo>=0&&lo<=1?lo:null;}
