// Normalize newly generated artwork; existing Kokomi idle/kick pixels are preserved.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/manifest.json')));
async function normalize(file,rows,fw,fh,anchorX,hasAlpha){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const W=info.width,H=info.height;
 if(!hasAlpha){
  const seen=new Uint8Array(W*H),queue=new Int32Array(W*H);let a=0,b=0;
  const add=i=>{if(i<0||i>=W*H||seen[i])return;const j=i*4;const lo=Math.min(data[j],data[j+1],data[j+2]),hi=Math.max(data[j],data[j+1],data[j+2]);if(lo<225||hi-lo>24)return;seen[i]=1;queue[b++]=i;};
  for(let x=0;x<W;x++){add(x);add((H-1)*W+x);}for(let y=0;y<H;y++){add(y*W);add(y*W+W-1);}while(a<b){const i=queue[a++],x=i%W;add(i-W);add(i+W);if(x)add(i-1);if(x<W-1)add(i+1);}for(let i=0;i<W*H;i++)if(seen[i])data[i*4+3]=0;
 }
 for(let i=3;i<data.length;i+=4)data[i]=data[i]>=128?255:0;
 if(!hasAlpha){
  // Remove fire fragments spilling from adjacent source cells, keeping the body
  // and connected fist/flame silhouette in each cell.
  for(let row=0;row<rows.length-1;row++)for(let col=0;col<6;col++){
   const left=Math.round(col*W/6),right=Math.round((col+1)*W/6),top=rows[row],bottom=rows[row+1],seen=new Set(),parts=[];
   for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const start=y*W+x;if(!data[start*4+3]||seen.has(start))continue;const part=[start];seen.add(start);for(let n=0;n<part.length;n++){const i=part[n],px=i%W,py=Math.floor(i/W);for(const [nx,ny]of [[px-1,py],[px+1,py],[px,py-1],[px,py+1]]){const j=ny*W+nx;if(nx>=left&&nx<right&&ny>=top&&ny<bottom&&data[j*4+3]&&!seen.has(j)){seen.add(j);part.push(j);}}}parts.push(part);}
   parts.sort((a,b)=>b.length-a.length);for(const part of parts.slice(1))for(const i of part)data[i*4+3]=0;
  }
 }
 const frames=[];
 for(let row=0;row<rows.length-1;row++)for(let col=0;col<6;col++){
  const left=Math.round(col*W/6),right=Math.round((col+1)*W/6),top=rows[row],bottom=rows[row+1];let x0=right,y0=bottom,x1=left,y1=top;
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(data[(y*W+x)*4+3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  frames.push({row,col,left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});
 }
 const scale=Math.min((fh-20)/Math.max(...frames.map(f=>f.height)),(fw-12)/Math.max(...frames.map(f=>f.width)));
 const pieces=[];
 for(const f of frames){
  const w=Math.round(f.width*scale),h=Math.round(f.height*scale);const raw=await sharp(data,{raw:{width:W,height:H,channels:4}}).extract({left:f.left,top:f.top,width:f.width,height:f.height}).resize(w,h,{kernel:'nearest'}).raw().toBuffer();
  for(let i=0;i<raw.length;i+=4)for(let c=0;c<3;c++)raw[i+c]=Math.min(255,Math.round(raw[i+c]/16)*16);
  // Use upper-body center, avoiding fist/flame offsets when centering a punch.
  const mids=[];for(let y=f.top+Math.floor(f.height*.12);y<f.top+Math.floor(f.height*.38);y++){let a=f.left+f.width,b=f.left;for(let x=f.left;x<f.left+f.width;x++)if(data[(y*W+x)*4+3]){a=Math.min(a,x);b=Math.max(b,x);}if(b>a)mids.push((a+b)/2-f.left);}mids.sort((a,b)=>a-b);
  const x=Math.max(3,Math.min(fw-w-3,Math.round(anchorX-(mids[Math.floor(mids.length/2)]??f.width/2)*scale)));
  const jump=hasAlpha&&f.row===1&&[1,2,3].includes(f.col)?10:0;
  pieces.push({input:raw,raw:{width:w,height:h,channels:4},left:f.col*fw+x,top:f.row*fh+fh-4-h-jump});
 }
 return sharp({create:{width:fw*6,height:fh*(rows.length-1),channels:4,background:'#00000000'}}).composite(pieces).png({palette:true,colours:64,dither:0}).toBuffer();
}
const catPath=path.join(root,'assets/source-sheets/cat.png'),firePath=path.join(root,'assets/source-sheets/koko-fire.png');
const catMeta=await sharp(catPath).metadata(),fireMeta=await sharp(firePath).metadata();
const cat=await normalize(catPath,[0,325,667,catMeta.height],112,112,56,true);
fs.writeFileSync(path.join(root,'assets/cat.png'),cat);
manifest.sheets.cat={file:'assets/cat.png',width:112,height:112,columns:6,anchor:[56,108],animations:Object.fromEntries(['idle','toss','bless'].map((name,i)=>[name,{frames:Array.from({length:6},(_,j)=>i*6+j),fps:name==='idle'?5:12,loop:name==='idle'}]))};
const fire=await normalize(firePath,[0,Math.round(fireMeta.height/2),fireMeta.height],144,112,52,false);
const original=await sharp(path.join(root,'assets/koko.png')).extract({left:0,top:0,width:864,height:224}).toBuffer();
const koko=await sharp({create:{width:864,height:448,channels:4,background:'#00000000'}}).composite([{input:original,top:0,left:0},{input:fire,top:224,left:0}]).png().toBuffer();
fs.writeFileSync(path.join(root,'assets/koko.png'),koko);
delete manifest.sheets.koko.animations.transform;delete manifest.sheets.koko.animations.punch;
for(const [i,name]of ['fireWindup','firePunch'].entries())manifest.sheets.koko.animations[name]={frames:Array.from({length:6},(_,j)=>12+i*6+j),fps:12,loop:false};
fs.writeFileSync(path.join(root,'assets/manifest.json'),JSON.stringify(manifest,null,2));
console.log('Added 18 cat frames; replaced 12 Kokomi frames, retaining idle/kick.');
