function evaluate(P,v={},safe=false){
 const p={AbsoluteScale:1,Iterations:16,Bailout:100,CubeScale:2.1,BoxLimit:1,SpikeHeight:1.2,SpikeSharpness:.85,RidgeBevel:.3,TwistAngle:0,AngXY:0,AngYZ:0,AngXZ:0,OffsetX:.8,OffsetY:.8,OffsetZ:.8,JuliaMode:0,JuliaX:0,JuliaY:0,JuliaZ:0,ColorIterations:16,...v};
 let z=P.map(x=>x*p.AbsoluteScale),c=p.JuliaMode?[p.JuliaX,p.JuliaY,p.JuliaZ]:[...z],scale=1,derivative=1,trap=10000;
 if(p.CubeSymmetry&&!p.JuliaMode)c=c.map(Math.abs).sort((a,b)=>b-a);
 p.TwistAngle=((p.TwistAngle+180)%360+360)%360-180;
 const rot=(a,b,angle,sign)=>{const t=z[a],r=angle*Math.PI/180,co=Math.cos(r),si=Math.sin(r);z[a]=co*t+sign*si*z[b];z[b]=-sign*si*t+co*z[b];};
 for(let i=0;i<p.Iterations;i++){
 z=z.map(Math.abs).sort((a,b)=>b-a);
 const f=z[0]-p.SpikeHeight;z[0]=f>0?p.SpikeHeight-f*p.SpikeSharpness:z[0]+f*(1-p.SpikeSharpness);
 z[1]-=Math.max(-p.BoxLimit,Math.min(p.BoxLimit,z[1]))*p.RidgeBevel;z[2]=Math.abs(z[2]-p.SpikeHeight*.5);
 z=z.map((x,j)=>x*p.CubeScale-[p.OffsetX,p.OffsetY,p.OffsetZ][j]*(p.CubeScale-1)+c[j]*.15);
 scale*=p.CubeScale;derivative=derivative*p.CubeScale*Math.max(1,p.SpikeSharpness,Math.abs(2-p.SpikeSharpness))+(p.JuliaMode?0:.15);
 if(Math.abs(p.TwistAngle)>.001)rot(0,1,p.TwistAngle,-1);
 rot(1,2,p.AngYZ,1);rot(0,2,p.AngXZ,-1);rot(0,1,p.AngXY,1);
 if(i<p.ColorIterations)trap=Math.min(trap,...[Math.max(...z.map(Math.abs))]);
 if(z.reduce((a,x)=>a+x*x,0)>p.Bailout)break;
 }
 return {distance:(Math.max(...z.map(Math.abs))-.5)/(safe?derivative:scale)/p.AbsoluteScale,trap};
}
export {evaluate};

function evaluateWorld(world,v={},twist=v.TwistAngle||0,yaw=0){
 const x=world[0]-(v.AbsoluteX||0),y=world[1]-(v.AbsoluteZ||0),z=world[2]-(v.AbsoluteY||0),a=((yaw%(2*Math.PI))+2*Math.PI)%(2*Math.PI),c=Math.cos(a),s=Math.sin(a);
 return evaluate([c*x-s*z,s*x+c*z,y],{...v,TwistAngle:twist},true);
}
export {evaluateWorld};
