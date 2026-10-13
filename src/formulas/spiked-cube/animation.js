// One timeline drives formula twist (degrees) and world-Y object spin (radians).
// Object yaw runs in the reverse direction; internal twist keeps its original phase.
// Wrapped progress makes values at 0 and 1 exactly identical. No external clock.
function referencePhases(position,v){
 const f=((position%1)+1)%1;
 return [(v.TwistAngle??0)+(v.TwistLoop===0?0:360*f),-2*Math.PI*f];
}
