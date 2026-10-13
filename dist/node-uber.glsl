// Generated shader: formula + shared renderer + compatibility profile.

/* source: src/renderer/profiles/node-legacy/prologue.glsl */
/* UBER BULB V3.0 -- WebGL port of supplied Octane OSL formula.
 * Original formula Copyright (c) 2020 Machina-Infinitum.
 * Core iteration order, bailout, orbit trap and history updates are preserved.
 * Additional lighting is a procedural studio approximation, not an Octane renderer.
 */
precision highp float;
uniform vec2 resolution;
uniform vec4 camera;
uniform vec4 A,B,C,D,E,F,G,H,I,J;
uniform vec4 M,L,N,T;
uniform vec4 K0,K1,K2,K3,MG;
uniform int quality;
const float PI=3.141592653589793;


/* source: src/renderer/shaders/rotation.glsl */
vec3 rotateY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}


/* source: src/formulas/uber-bulb/kernel.glsl */
/* UBER BULB V3.0 — original formula © 2020 Machina-Infinitum. */
vec3 sineMul(vec3 a,vec3 b){float r1=length(a.xy),r2=length(b.xy);float aa=1.-a.z*b.z/max(r1*r2,1e-8);return vec3(aa*(a.x*b.x-a.y*b.y),aa*(a.x*b.y+a.y*b.x),a.z*r2+b.z*r1);}
vec2 evaluateFormula(vec3 world){vec3 P=vec3(world.x,world.z,world.y);vec3 pos=A.w*(P-A.xyz),zv=pos,csph=vec3(H.zw,I.x),oldz=vec3(0.),prevz=vec3(0.);float dr=1.,r=0.,trap=10000.;if(E.w>.5)pos=F.xyz;if(E.y>.5){float x=zv.x;zv.xy=zv.y*vec2(cos(x),sin(x));}if(E.z>.5){float x=pos.x;pos.xy=pos.y*vec2(cos(x),sin(x));}vec3 ang=radians(D.xyz),s=sin(ang),c=cos(ang);
for(int i=0;i<100;i++){if(float(i)>=B.x)break;zv+=csph;r=length(zv);if(r<.001)break;float k=G.w/r;if(G.z>.5)k=2.*H.y-k;k=clamp(k,H.x,H.y)/max(G.w,.000001);zv=zv*k-csph;r=length(zv);if(r>B.y)break;float powr=pow(max(r,1e-10),B.w);if(powr>B.y)break;float x=zv.x,y=zv.y,z=zv.z,t=y;y=c.y*t+s.y*z;z=-s.y*t+c.y*z;t=x;x=c.z*t-s.z*z;z=s.z*t+c.z*z;t=x;x=c.x*t+s.x*y;y=-s.x*t+c.x*y;vec3 oz=vec3(x,-y,z);float theta=D.w+asin(clamp(z/max(r,1e-10),-1.,1.));float phi=E.x+atan(y,x);dr=pow(max(r,1e-10),B.w-1.)*B.w*dr+1.;theta*=B.w;phi*=B.w;zv=powr*vec3(cos(theta)*cos(phi),sin(phi)*cos(theta),B.z*sin(theta))+pos+prevz*C.x+oldz*C.y;if(F.w>.5){if(F.w<1.5)zv.x=sin(G.x*zv.x);else if(F.w<2.5)zv.y=sin(G.x*zv.y);else zv.z=sin(G.x*zv.z);}if(G.y>.5)zv=sineMul(zv,oz/max(dot(oz,oz),1e-8));prevz=oldz;oldz=zv;r=powr;pos=C.z*zv+C.w*pos;if(float(i)<I.y)trap=min(trap,r*r);if(dr>1e25)break;}
float dist=.5*log(max(r,1e-8))*r/max(dr,1e-8);return vec2(dist/max(A.w,.0001),trap);}


/* source: src/renderer/shaders/surface.glsl */
float scene(vec3 p){return evaluateFormula(p).x;}
vec3 normalAt(vec3 p,float e){vec2 v=vec2(e,0.);return normalize(vec3(scene(p+v.xyy)-scene(p-v.xyy),scene(p+v.yxy)-scene(p-v.yxy),scene(p+v.yyx)-scene(p-v.yyx)));}
float coordinate(float trap,float mode,float scale,float fallback){if(mode<.5)return sqrt(max(trap,0.))*scale;if(mode<1.5)return log(max(trap,1e-8))*scale;if(mode<2.5)return scale;return fallback;}



/* source: src/renderer/shaders/lighting-math.glsl */
vec3 keyDirection(){float az=radians(N.x),el=radians(N.y);return vec3(cos(el)*sin(az),sin(el),cos(el)*cos(az));}
float card(vec3 ray,vec3 axis,float sx,float sy,float blur){vec3 tx=normalize(cross(axis,vec3(0.,1.,0.))),ty=cross(tx,axis);float facing=dot(ray,axis);if(facing<=0.)return 0.;vec2 q=vec2(dot(ray,tx),dot(ray,ty))/facing;vec2 d=abs(q)-vec2(sx,sy);float feather=max(.006,blur);float energy=sx*sy/((sx+blur)*(sy+blur));return energy*(1.-smoothstep(-feather,feather,d.x))*(1.-smoothstep(-feather,feather,d.y));}
vec3 fresnel(vec3 f0,float cosine){return f0+(1.-f0)*pow(1.-clamp(cosine,0.,1.),5.);}
vec3 brdf(vec3 n,vec3 v,vec3 l,vec3 base,vec3 radiance,float metal,float rough){float nl=max(dot(n,l),0.),nv=max(dot(n,v),.0001);vec3 h=normalize(v+l);float nh=max(dot(n,h),0.),vh=max(dot(v,h),0.);float a=max(.006,rough*rough),a2=a*a,den=nh*nh*(a2-1.)+1.;float dist=a2/max(PI*den*den,1e-8);float gv=nl*sqrt(nv*nv*(1.-a2)+a2),gl=nv*sqrt(nl*nl*(1.-a2)+a2);vec3 f=fresnel(mix(vec3(.04),base,metal),vh);vec3 spec=dist*f*.5/max(gv+gl,.0001);vec3 diffuse=(1.-f)*(1.-metal)*base/PI;return (diffuse+spec)*radiance*nl;}


/* source: src/renderer/profiles/node-legacy/surface.glsl */
// Port of the supplied Octane gradient node. Types0..7 use orbit U/V;
// spatial types8..10 use the selected coordinate frame.
float gradientMask(vec2 uv,vec3 world,vec3 center,vec3 ro,vec3 uu,vec3 vv,vec3 ww){vec2 p=uv-.5;float a=radians(-K0.z),c=cos(a),s=sin(a);p=mat2(c,s,-s,c)*p+.5;float m=0.,kind=K0.x;if(kind<.5)m=p.x;else if(kind<1.5)m=p.y;else if(kind<2.5)m=.5*(p.x-p.y)+.5;else if(kind<3.5){vec2 q=p-.5;q=vec2(-q.y,q.x)+.5;m=.1594*atan(.5-q.x,.5-q.y)+.5;}else if(kind<4.5)m=1.420*length(p-.5);else if(kind<5.5)m=max(2.*abs(p.x-.5),2.*abs(p.y-.5));else if(kind<6.5){vec2 corner=step(.5,p);m=1.420*length(p-corner);}else if(kind<7.5)m=0.;else{vec3 P=vec3(world.x,world.z,world.y);if(K0.y>.5&&K0.y<1.5){vec3 d=world-center;P=vec3(d.x,d.z,d.y);}else if(K0.y>2.5&&K0.y<3.5){vec3 d=world-ro;P=vec3(dot(d,uu),dot(d,vv),dot(d,ww));}else if(K0.y>3.5&&K0.y<4.5)P=vec3(gl_FragCoord.x,resolution.y-gl_FragCoord.y,0.);else if(K0.y>4.5)P=vec3(gl_FragCoord.x/resolution.x,1.-gl_FragCoord.y/resolution.y,0.);vec3 start=K2.xyz,end=vec3(K2.w,K3.xy),d=P-start;if(kind<8.5){vec3 b=end-start;m=dot(b,d)/max(dot(b,b),1e-8);}else if(kind<9.5){vec3 b=end-start;m=length(cross(d,b))/max(length(b),1e-8)/max(K1.y,1e-8);}else m=length(d)/max(K1.y,1e-8);m=fract(abs(m));}m=clamp(m+2.*K1.x*(K1.z-.250),0.,1.);m=pow(m,K0.w);return K1.w>.5?1.-m:m;}


// Black studio with finite rectangular emitters. R: detail, fill, reflection gain, light size.
uniform vec4 R;
uniform vec4 S; // specular environment fill, reflection occlusion, blue bounce, normal filter

vec3 environment(vec3 ray,float roughness){ray=rotateY(ray,radians(N.z));float blur=roughness*roughness*.8;float size=R.w;float top=pow(max(dot(ray,normalize(vec3(-.3,.75,.5))),0.),2.);float side=pow(max(dot(ray,normalize(vec3(.8,.25,.4))),0.),4.);float gradient=.2+.8*pow(.5+.5*ray.y,2.);vec3 surround=vec3(.48,.42,.31)*S.x*gradient+vec3(1.8,1.7,1.4)*top*L.x*.13+vec3(.62,.68,.74)*side*L.z;return surround+vec3(5.,4.8,4.1)*card(ray,keyDirection(),size*1.25,size*2.8,blur)*L.x+vec3(.03,.48,.75)*card(ray,normalize(vec3(-.65,.15,.9)),size*1.8,size*2.,blur)*L.y+vec3(2.6,2.7,2.8)*card(ray,normalize(vec3(.6,.5,-.8)),size*1.2,size*2.5,blur)*L.z;}
float shadow(vec3 p,vec3 l,float e){float visibility=1.,t=e*5.;for(int j=0;j<40;j++){if(quality==0&&j>=12)break;if(quality==1&&j>=14)break;float d=scene(p+l*t);if(d<e*.35)return 0.;visibility=min(visibility,8.*d/max(t,e));t+=clamp(d*.65,e*2.,.16/A.w);if(t>2.4/A.w)break;}return clamp(visibility,0.,1.);}
vec3 reflection(vec3 p,vec3 ray,float rough,float e,vec3 ro,vec3 uu,vec3 vv,vec3 ww){vec3 env=environment(ray,rough);if(quality<2)return env;float t=e*8.;for(int j=0;j<64;j++){if(quality==2&&j>=32)break;vec3 q=p+ray*t;float d=scene(q);if(d<e){vec3 n=normalAt(q,e*.65);float trap=evaluateFormula(q).y;float u=coordinate(trap,I.z,I.w,q.x*A.w);float w=coordinate(trap,J.x,J.y,q.y*A.w);float mask=gradientMask(vec2(u,w),q,vec3(A.x,A.z,A.y),ro,uu,vv,ww);vec3 base=mix(vec3(.003,.19,.38),vec3(.95,.72,.34),mask);float lit=max(dot(n,keyDirection()),0.);vec3 bounce=base*(.04*R.y+.32*L.x*lit)+environment(reflect(ray,n),rough)*.32;return mix(env,bounce,S.y);}t+=max(d*.45,e*.5);if(t>4./A.w)return env;}return env;}
vec3 renderSample(vec2 pixel){vec2 uv=(pixel-.5*resolution)/resolution.y;vec3 center=vec3(A.x,A.z,A.y);vec3 ro=center+camera.z*vec3(cos(camera.y)*sin(camera.x),sin(camera.y),cos(camera.y)*cos(camera.x));vec3 ww=normalize(center-ro),uu=vec3(cos(camera.x),0.,-sin(camera.x)),vv=cross(uu,ww);float cr=cos(camera.w),sr=sin(camera.w);vec3 rotatedU=uu*cr+vv*sr;vv=vv*cr-uu*sr;uu=rotatedU;vec3 rd=normalize(uv.x*uu+uv.y*vv+1.7*ww);float radius=J.z/max(A.w,.0001);vec3 oc=ro-center;float b=dot(oc,rd),c=dot(oc,oc)-radius*radius,dis=b*b-c;float travel=0.,e=.0001;bool hit=false;if(dis>0.){travel=max(0.,-b-sqrt(dis));float end=-b+sqrt(dis);if(J.w>0.){float extent=min(radius,1.2/max(A.w,.0001));float plane=camera.z-extent+2.*extent*J.w;travel=max(travel,plane/max(dot(rd,ww),.0001));}for(int i=0;i<560;i++){if(travel>end)break;if(quality==0&&i>=120)break;if(quality==1&&i>=240)break;if(quality==2&&i>=400)break;vec3 p=ro+rd*travel;float d=scene(p);float pixelSize=travel/resolution.y;e=max(.000008/A.w,pixelSize*(quality>=2?.09:.22)*R.x);if(d<e&&(J.w<=0.||d> -e)){hit=true;break;}travel+=max(abs(d)*T.w,e*.15);if(travel>end)break;}}
vec3 color=vec3(0.);if(hit){vec3 p=ro+rd*travel,n=normalAt(p,max(.0004/A.w,travel/resolution.y*S.w)),v=-rd;vec2 orbit=evaluateFormula(p);float u=coordinate(orbit.y,I.z,I.w,p.x*A.w),w=coordinate(orbit.y,J.x,J.y,p.y*A.w);float mask=gradientMask(vec2(u,w),p,center,ro,uu,vv,ww);vec3 blue=vec3(.003,.19,.38),gold=vec3(.95,.72,.34);vec3 key=keyDirection(),cyan=normalize(vec3(-.65,.15,.9)),rim=normalize(vec3(.6,.5,-.8));float occ=0.,weight=1.;for(int j=0;j<7;j++){float h=(.003*pow(1.8,float(j)))/A.w;occ+=max(0.,h-scene(p+n*h))/h*weight;weight*=.58;}float ao=clamp(1.-occ*.6,0.,1.);vec3 origin=p+n*max(e*8.,.0015/A.w);float vk=shadow(origin,key,e),vc=quality>=2?shadow(origin,cyan,e):ao,vr=quality>=2?shadow(origin,rim,e):ao;float goldR=sqrt(MG.y*MG.y+R.w*R.w*.12),blueR=sqrt(MG.w*MG.w+R.w*R.w*.12);vec3 warm=vec3(5.5,5.2,4.5)*L.x*vk,cool=vec3(.02,3.6,6.)*L.y*vc,edge=vec3(2.,2.1,2.2)*L.z*vr;vec3 goldLight=brdf(n,v,key,gold,warm,MG.x,goldR)+brdf(n,v,cyan,gold,cool,MG.x,goldR)+brdf(n,v,rim,gold,edge,MG.x,goldR);vec3 blueLight=brdf(n,v,key,blue,warm,MG.z,blueR)+brdf(n,v,cyan,blue,cool,MG.z,blueR)+brdf(n,v,rim,blue,edge,MG.z,blueR);color=mix(blueLight,goldLight,mask);vec3 ray=reflect(-v,n);vec3 goldF=fresnel(mix(vec3(.04),gold,MG.x),max(dot(n,v),0.)),blueF=fresnel(mix(vec3(.04),blue,MG.z),max(dot(n,v),0.));vec3 reflected=reflection(origin,ray,mix(MG.w,MG.y,mask),e,ro,uu,vv,ww);color+=reflected*mix(blueF,goldF,mask)*R.z*mix(ao,1.,mask*.85);color+=mix(blue*(1.-MG.z),gold*(1.-MG.x),mask)*R.y*.06*ao;float coat=pow(max(dot(n,normalize(key+v)),0.),200.)*M.z*.12; color+=vec3(coat)*L.x*vk*mask;float bounceFacing=.25+.75*max(dot(n,cyan),0.);color+=blue*S.z*L.y*bounceFacing*mix(ao,1.,.25)*(1.-mask);color+=blue*N.w*(1.-mask)*ao;}
return color;}
void main(){vec3 color=renderSample(gl_FragCoord.xy);color*=pow(2.,L.w);color=(color*(2.51*color+.03))/(color*(2.43*color+.59)+.14);color=pow(clamp(color,0.,1.),vec3(1./2.2));gl_FragColor=vec4(color,1.);}
