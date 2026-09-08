export class Audio{
 constructor(){this.muted=false;this.ctx=null;}
 unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume();}catch{}}
 play(type){if(this.muted||!this.ctx)return;const notes={launch:[160,65],jump:[520,980],power:[350,900],strong:[95,260],inori:[660,1100],null:[880,440],ppung:[220,100],revive:[440,1320],record:[660,1320],bounce:[120,65]};const [a,b]=notes[type]||[200,90];const o=this.ctx.createOscillator(),v=this.ctx.createGain(),t=this.ctx.currentTime;o.type=type==='strong'?'sawtooth':'triangle';o.frequency.setValueAtTime(a,t);o.frequency.exponentialRampToValueAtTime(b,t+.15);v.gain.setValueAtTime(.09,t);v.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(v).connect(this.ctx.destination);o.start();o.stop(t+.22);}
}
const storagePrefix=new URLSearchParams(location.search).has('qa')?'aeng-qa-':'aeng-';
export const storage={get(k,f){try{return JSON.parse(localStorage.getItem(storagePrefix+k))??f;}catch{return f;}},set(k,v){try{localStorage.setItem(storagePrefix+k,JSON.stringify(v));}catch{}}};
