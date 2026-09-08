import {C} from './config.js';
// Analytic position: identical timing at any rendering frame rate.
export function gaugeValue(mode,time){
 const phase=((time/C.gauge.halfPeriod)%2+2)%2;
 const u=phase<=1?phase:2-phase;
 if(mode==='power')return Math.expm1(C.gauge.powerCurve*u)/Math.expm1(C.gauge.powerCurve);
 return .5+Math.atan(C.gauge.angleCurve*(2*u-1))/(2*Math.atan(C.gauge.angleCurve));
}
