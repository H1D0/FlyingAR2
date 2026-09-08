export const C = {
  gauge:{halfPeriod:1.35,powerCurve:1.8,angleCurve:2.4},camera:{lowZoom:.07,heightZoom:.18,heightRange:900},width:390,height:844,step:1/120,gravity:370,airDrag:.012,
  groundBounce:.64,groundFriction:.52,bounceFriction:.95,settleVy:44,
  stopSpeed:19,stopDelay:1,maxSpeed:2800,metersPerPixel:.1,
  jumpBoost:1.08,jumpEpsilon:9,jumps:3,
  launchMin:520,launchRange:420,angleMin:22,angleMax:68,
  chargeTime:0,chargeBounce:4,chargeHit:22,manualDuration:5,reviveDuration:10,
  collisionHold:.25,maidHold:1.5,strongHolds:{maid:.75,koko:1,inori:.75,ppung:.65,cat:.65},
  bounceBuffDuration:5,bounceBuffBoost:1.04,reviveVx:370,reviveVy:-295,
  effects:{cat:{min:680,multiplier:1.08,angle:70},maid:{normal:0,strong:2.05,min:1100,angle:35},koko:{normal:1.14,strong:1.85,min:600,strongMin:1000,angle:45},inori:{strong:1.3,min:760,angle:67},ppung:{normal:.53,strong:.86}},
  field:{gapMin:252,gapRange:276,ahead:2300,weights:{cat:18,maid:7,koko:44,inori:27,ppung:17},maxRepeat:2},
  body:{bird:{x:0,y:0,rx:15,ry:15},human:{rx:19,top:-77,bottom:-2}},
  animations:{idle:{frames:4,fps:5,loop:true},run:{frames:6,fps:12,loop:true},prepare:{frames:4,fps:12},kick:{frames:6,fps:14},finish:{frames:4,fps:10},celebrate:{frames:6,fps:9},flap:{frames:4,fps:10,loop:true},spin:{frames:6,fps:12,loop:true},fall:{frames:4,fps:8,loop:true},jump:{frames:6,fps:16},hit:{frames:4,fps:16},bounce:{frames:4,fps:16},stop:{frames:4,fps:7},revive:{frames:6,fps:12},catch:{frames:6,fps:12},throw:{frames:6,fps:12},transform:{frames:6,fps:12},punch:{frames:6,fps:12},cast:{frames:6,fps:12},uppercut:{frames:6,fps:12},slow:{frames:4,fps:10},bless:{frames:6,fps:12}},
  characters:{cat:{name:'앵냥이',color:'#e96573'},uaeng:{name:'우앵두',color:'#ed596a'},bird:{name:'앵알이',color:'#ff4253'},maid:{name:'앵냥짱',color:'#f3628d'},koko:{name:'코코미',color:'#f2b448'},inori:{name:'이노리',color:'#b6a0ed'},ppung:{name:'뿡치',color:'#976fd1'}}
};
