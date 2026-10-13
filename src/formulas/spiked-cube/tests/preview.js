// Independent formula test only. Common renderer is loaded read-only, not maintained here.
(async()=>{
 const canvas=document.getElementById('view'),slider=document.getElementById('timeline'),time=document.getElementById('time');
 const gl=canvas.getContext('webgl',{antialias:false,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL unavailable');
 const shared=await(await fetch('shared-renderer.glsl')).text(),kernel=await(await fetch('kernel.glsl')).text();
 const source=shared.replace('// FORMULA_BODY',kernel+'\nvec2 fractal(vec3 world){return evaluateFormula(world);}\n');
 const compile=(type,s)=>{const shader=gl.createShader(type);gl.shaderSource(shader,s);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,source));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
 const locations=new Map(),location=n=>{if(!locations.has(n))locations.set(n,gl.getUniformLocation(program,n));return locations.get(n);},uniform=(n,v)=>gl.uniform4fv(location(n),v);
 const sharedValues={camera:[.8,.5,28,0],J:[0,2,10,0],M:[1,.2,.08,0],L:[2.1,1.1,.25,-.3],N:[-35,55,0,0],T:[0,0,0,.3],K0:[0,0,0,1],K1:[0,1,0,0],K2:[1,1,1,1],K3:[1,1,0,0],MG:[1,.2,.02,.6],R:[.1,.025,1,.38],S:[.32,.3,.8,.5]};
 for(const [n,v]of Object.entries(sharedValues))uniform(n,v);
 const linear=n=>[n>>16&255,n>>8&255,n&255].map(x=>{const s=x/255;return s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4);});
 for(const [n,v]of Object.entries({ColorA:linear(0xf9dc9e),ColorB:linear(0x0a79a6),LightKey:[1,1,1],LightFill:[1,1,1],LightRim:[1,1,1]}))gl.uniform3fv(location(n),v);
 gl.uniform1i(location('quality'),3);let progress=0,last=0;
 slider.oninput=()=>{progress=Number(slider.value);last=performance.now();};
 document.addEventListener('visibilitychange',()=>{last=0;});
 function frame(now){const dt=last?(now-last)/1000:0;last=now;if(!document.hidden){progress=(progress+dt/20)%1;const phases=referencePhases(progress,REFERENCE_FORMULA_PARAMETERS);uploadFormulaUniforms(uniform,REFERENCE_FORMULA_PARAMETERS,...phases);const rect=canvas.getBoundingClientRect();const width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(location('resolution'),canvas.width,canvas.height);gl.uniform2f(location('detailResolution'),canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLES,0,6);slider.value=progress;time.textContent=(progress*20).toFixed(2)+' / 20.00 s';}requestAnimationFrame(frame);}
 document.body.dataset.ready='true';requestAnimationFrame(frame);
})().catch(e=>{const error=document.getElementById('error');error.hidden=false;error.textContent=e.message;});
