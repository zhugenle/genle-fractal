// SPIKED CUBE IFS V1.0. Port of user-supplied gemini_01.txt.
// Source iteration order retained; optional canonical feedback restores cube symmetry.
uniform vec4 SC0; // CubeScale, BoxLimit, SpikeHeight, SpikeSharpness
uniform vec4 SC1; // RidgeBevel, TwistAngle, OffsetX, OffsetY
uniform vec4 SC2; // OffsetZ, DistanceSafety, CubeSymmetry, ObjectYaw (rad)
vec3 cubeCanonical(vec3 p){
 p=abs(p);float t;
 if(p.y>p.x){t=p.x;p.x=p.y;p.y=t;}
 if(p.z>p.x){t=p.x;p.x=p.z;p.z=t;}
 if(p.z>p.y){t=p.y;p.y=p.z;p.z=t;}
 return p;
}
vec2 evaluateFormula(vec3 world){
 // Inverse object transform about the formula center; camera and lights stay fixed.
 vec3 local=world-vec3(A.x,A.z,A.y);
 float yaw=mod(SC2.w,6.283185307179586),cy=cos(yaw),sy=sin(yaw);
 local.xz=vec2(cy*local.x-sy*local.z,sy*local.x+cy*local.z);
 vec3 z=A.w*vec3(local.x,local.z,local.y),cp=z;
 if(SC2.z>.5)cp=cubeCanonical(cp);
 if(E.w>.5)cp=F.xyz;
 vec3 ang=radians(D.xyz),s=sin(ang),c=cos(ang);
 float tw=radians(mod(SC1.y+180.,360.)-180.),st=sin(tw),ct=cos(tw),acc=1.,dr=1.,trap=10000.;
 float lipschitz=SC0.x*max(1.,max(SC0.w,abs(2.-SC0.w)));
 for(int i=0;i<60;i++){
  if(float(i)>=B.x)break;
  z=abs(z);float t;
  if(z.y>z.x){t=z.x;z.x=z.y;z.y=t;}
  if(z.z>z.x){t=z.x;z.x=z.z;z.z=t;}
  if(z.z>z.y){t=z.y;z.y=z.z;z.z=t;}
  float fold=z.x-SC0.z;
  z.x=fold>0.?SC0.z-fold*SC0.w:z.x+fold*(1.-SC0.w);
  z.y-=clamp(z.y,-SC0.y,SC0.y)*SC1.x;
  z.z=abs(z.z-SC0.z*.5);
  z=z*SC0.x-vec3(SC1.zw,SC2.x)*(SC0.x-1.)+cp*.15;
  acc=min(acc*SC0.x,1e30);dr=min(dr*lipschitz+(E.w>.5?0.:.15),1e30);
  if(abs(mod(SC1.y+180.,360.)-180.)>.001){t=z.x;z.x=ct*t-st*z.y;z.y=st*t+ct*z.y;}
  t=z.y;z.y=c.y*t+s.y*z.z;z.z=-s.y*t+c.y*z.z;
  t=z.x;z.x=c.z*t-s.z*z.z;z.z=s.z*t+c.z*z.z;
  t=z.x;z.x=c.x*t+s.x*z.y;z.y=-s.x*t+c.x*z.y;
  if(float(i)<I.y)trap=min(trap,max(max(abs(z.x),abs(z.y)),abs(z.z)));
  if(dot(z,z)>B.y)break;
 }
 float axis=max(max(abs(z.x),abs(z.y)),abs(z.z));
 // Source DE is retained; blend in an analytic upper derivative bound for safety.
 float divisor=mix(acc,max(acc,dr),SC2.y);
 return vec2((axis-.5)/max(divisor*A.w,1e-12),trap);
}
