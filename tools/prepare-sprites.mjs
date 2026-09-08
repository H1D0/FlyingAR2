// Deterministic game-asset normalization. Source artwork is newly generated,
// never the user's original photos. Removes ONLY the connected white backdrop,
// then nearest-neighbor samples and aligns isolated animation frames.
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const root=path.resolve(import.meta.dirname,'..');
const sourceFile=path.join(root,'assets/sources.json');const sources=JSON.parse(fs.readFileSync(sourceFile));const manifest={version:1,status:'approved original pixel art',sheets:{}};const audit=[];
function bands(counts,minGap=3){const runs=[];let start=null,last=0;for(let i=0;i<counts.length;i++){if(counts[i]>1){if(start===null)start=i;last=i;}else if(start!==null&&i-last>minGap){runs.push([start,last+1]);start=null;}}if(start!==null)runs.push([start,last+1]);return runs.filter(([a,b])=>b-a>5);}
for(const [key,s]of Object.entries(sources)){
 const {data,info}=await sharp(s.path).ensureAlpha().raw().toBuffer({resolveWithObject:true});const {width:W,height:H}=info;
 // Flood the neutral light background from every image edge.
 const seen=new Uint8Array(W*H),q=new Int32Array(W*H);let head=0,tail=0;
 const isBg=i=>{const j=i*4,r=data[j],g=data[j+1],b=data[j+2];return data[j+3]<32||(Math.min(r,g,b)>220&&Math.max(r,g,b)-Math.min(r,g,b)<22);};
 const add=i=>{if(i<0||i>=W*H||seen[i]||!isBg(i))return;seen[i]=1;q[tail++]=i;};
 for(let x=0;x<W;x++){add(x);add((H-1)*W+x);}for(let y=0;y<H;y++){add(y*W);add(y*W+W-1);}while(head<tail){const i=q[head++],x=i%W;add(i-W);add(i+W);if(x)add(i-1);if(x<W-1)add(i+1);}
 for(let i=0;i<W*H;i++)data[i*4+3]=seen[i]?0:255;
 // Discard isolated backdrop specks, preserving all substantive sprite pieces.
 const visits=new Uint8Array(W*H);for(let i=0;i<W*H;i++){if(visits[i]||!data[i*4+3])continue;let a=0,b=1;q[0]=i;visits[i]=1;while(a<b){const p=q[a++],x=p%W;for(const n of [p-W,p+W,x?p-1:-1,x<W-1?p+1:-1]){if(n>=0&&n<W*H&&!visits[n]&&data[n*4+3]){visits[n]=1;q[b++]=n;}}}if(b<25)for(let n=0;n<b;n++)data[q[n]*4+3]=0;}
 const ys=new Uint32Array(H);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(data[(y*W+x)*4+3])ys[y]++;
 let rows=bands(ys,Math.max(3,Math.round(H/200)));if(rows.length!==s.rows.length)throw Error(key+': expected '+s.rows.length+' rows, got '+JSON.stringify(rows));
 const allFrames=[];for(let row=0;row<rows.length;row++){const [top,bottom]=rows[row],xs=new Uint32Array(W);for(let y=top;y<bottom;y++)for(let x=0;x<W;x++)if(data[(y*W+x)*4+3])xs[x]++;let cols=bands(xs,key==='koko'?1:Math.max(3,Math.round(W/200)));while(cols.length>6){const small=cols.findIndex(b=>b[1]-b[0]<30);if(small<0)break;const prev=small>0?cols[small][0]-cols[small-1][1]:Infinity,next=small<cols.length-1?cols[small+1][0]-cols[small][1]:Infinity;if(prev<next){cols[small-1][1]=cols[small][1];cols.splice(small,1);}else{cols[small+1][0]=cols[small][0];cols.splice(small,1);}}if(key==='maid'&&row===3&&cols.length===7){cols[5][1]=cols[6][1];cols.pop();}if(cols.length!==6)throw Error(key+' row '+row+': expected 6 columns, got '+JSON.stringify(cols));for(let col=0;col<6;col++){const [left,right]=cols[col];let y0=bottom,y1=top;for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(data[(y*W+x)*4+3]){y0=Math.min(y0,y);y1=Math.max(y1,y+1);}allFrames.push({row,col,left,top:y0,width:right-left,height:y1-y0});}}
 const fw=s.width||96,fh=s.height||96;let scale=Math.min((fh-8)/Math.max(...allFrames.map(f=>f.height)),(fw-8)/Math.max(...allFrames.map(f=>f.width)));
 const pieces=[];const frameAudit=[];
 for(let idx=0;idx<allFrames.length;idx++){const f=allFrames[idx],w=Math.max(1,Math.round(f.width*scale)),h=Math.max(1,Math.round(f.height*scale));const crop=await sharp(data,{raw:{width:W,height:H,channels:4}}).extract({left:f.left,top:f.top,width:f.width,height:f.height}).resize(w,h,{kernel:'nearest'}).raw().toBuffer();
 // Track the head rather than the swinging kicking foot for horizontal alignment.
 const mids=[];for(let y=Math.floor(f.height*.12);y<Math.floor(f.height*.4);y++){let a=f.width,b=0;for(let x=0;x<f.width;x++)if(data[((y+f.top)*W+x+f.left)*4+3]){a=Math.min(a,x);b=Math.max(b,x);}if(b>a)mids.push((a+b)/2);}mids.sort((a,b)=>a-b);const anchor=s.bird?f.width/2:(mids[Math.floor(mids.length/2)]||f.width/2);let x=Math.round((s.anchorX??fw/2)-anchor*scale);x=Math.max(3,Math.min(fw-w-3,x));const y=fh-4-h;
 for(let i=0;i<crop.length;i+=4){crop[i+3]=crop[i+3]>=128?255:0;for(let c=0;c<3;c++)crop[i+c]=Math.min(255,Math.round(crop[i+c]/16)*16);}
 pieces.push({input:crop,raw:{width:w,height:h,channels:4},left:f.col*fw+x,top:f.row*fh+y});frameAudit.push({frame:idx,bounds:[x,y,x+w,y+h],anchor:[s.anchorX??fw/2,fh-4],clipped:x<1||y<1||x+w>=fw||y+h>=fh});}
 const file='assets/'+key+'.png';await sharp({create:{width:fw*6,height:fh*rows.length,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(pieces).png({palette:true,colours:64,dither:0}).toFile(path.join(root,file));
 const animations={};for(let i=0;i<s.rows.length;i++){const name=s.rows[i];animations[name]={frames:Array.from({length:6},(_,j)=>i*6+j),fps:name==='idle'?5:name==='run'?12:12,loop:['idle','run','flap','spin','fall'].includes(name)};}
 if(!animations.idle)animations.idle=animations.flap;manifest.sheets[key]={file,width:fw,height:fh,columns:6,anchor:[s.anchorX??fw/2,fh-4],animations};audit.push({key,sourceSize:[W,H],frameCount:allFrames.length,frameSize:[fw,fh],alpha:'binary 0/255',palette:64,scale,frames:frameAudit});console.log(key,allFrames.length+' frames',fw+'x'+fh);
}
fs.writeFileSync(path.join(root,'assets/manifest.json'),JSON.stringify(manifest,null,2));fs.writeFileSync(path.join(root,'assets/asset-audit.json'),JSON.stringify(audit,null,2));




