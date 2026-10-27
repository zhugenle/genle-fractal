// Headless graph preview: shared studio shaders/uniforms, no studio page or controls.
const graphRenderDefinitions=Object.values(RENDERER_GROUPS).flatMap(g=>g[3]);
const graphFormulaDefinitions=Object.values(FORMULA_GROUPS).flatMap(g=>g[3]);
const graphDefaultValues={...Object.fromEntries([...graphFormulaDefinitions,...graphRenderDefinitions].map(d=>[d[0],typeof d[2]==='string'?d[3]:d[5]])),...REFERENCE_FORMULA_PARAMETERS,AbsoluteScale:1,AbsoluteX:0,AbsoluteY:0,AbsoluteZ:0};
const graphColorLinear=n=>[n>>16&255,n>>8&255,n&255].map(c=>{const s=c/255;return s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4);});
class GraphPreview{
 constructor(canvas,{onState=()=>{},onFrame=()=>{},onCamera=()=>{}}={}){
  this.canvas=canvas;this.gl=GenleWebGL.context(canvas);this.onState=onState;this.onFrame=onFrame;this.onCamera=onCamera;this.cache=new Map();this.epoch=0;this.docId=null;this.target=null;this.active=null;this.pending=null;this.busy=false;this.dirty=false;this.raf=0;this.quality=1;this.settings={...graphDefaultValues};this.camera={yaw:.8,pitch:.65,distance:10.5,roll:-35};this.stats={compiles:0,draws:0,patches:0,revision:0,docId:null,latency:0};this.contextGeneration=0;this.interactingUntil=0;this.disposed=false;
  this.ready=this.gl?fetch('graph-template.glsl').then(r=>{if(!r.ok)throw Error('无法加载预览着色器。');return r.text();}):Promise.reject(Error('WebGL 不可用，请启用硬件加速。'));
  this.ready.catch(e=>this.state('error',e.message));
  this.resizeObserver=new ResizeObserver(()=>this.requestFrame());this.resizeObserver.observe(canvas);this.bindCamera();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.contextLost=true;this.epoch++;this.state('error','图形连接中断，草稿已保留。点击恢复预览。');});
  canvas.addEventListener('webglcontextrestored',()=>{this.contextLost=false;this.contextGeneration++;this.cache.clear();this.active=null;const target=this.target;if(target)this.setGraph(target.draft,target.revision);});
 }
 state(kind,message,extra={}){this.lastState={kind,message,documentId:this.docId,...extra};this.onState(this.lastState);}
 disposeDevice(device){if(!device||this.contextLost)return;this.gl.deleteProgram(device.program);this.gl.deleteBuffer(device.buffer);}
 setDocument(id,draft,preview,revision=0){this.epoch++;this.pending=null;this.docId=id;this.stats.docId=id;this.target=null;this.active=this.cache.get(id)||null;this.camera={...GenleDocuments.defaultPreview(draft).camera,...preview?.camera};this.quality=[0,1,1.5,2,3].includes(preview?.quality)?preview.quality:1;this.settings={...graphDefaultValues,...GenleDocuments.defaultPreview(draft).settings};if(this.active)this.requestFrame();else this.clear();this.setSettings(preview?.settings||{});this.setGraph(draft,revision);}
 clear(){this.canvas.dataset.documentId=this.docId||'';this.canvas.dataset.revision='';if(this.gl&&!this.contextLost){this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);this.gl.clearColor(0,0,0,1);this.gl.clear(this.gl.COLOR_BUFFER_BIT);}this.dirty=false;}
 setGraph(draft,revision){
  this.target={draft:GenleGraph.clone(draft),revision,requested:performance.now()};
  let graph;try{graph=GenleDocuments.renderable(draft);}catch(e){this.epoch++;this.pending=null;if(!draft.nodes.length||!this.active){this.active=null;this.clear();}this.state(draft.nodes.length?'invalid':'empty',e.message,{stale:!!this.active});return;}
  const signature=GenleDocuments.structure(graph);this.target.graph=graph;this.target.signature=signature;
  const cached=this.cache.get(this.docId);
  if(cached?.signature===signature){this.epoch++;this.pending=null;this.active=cached;this.applyGraphValues(graph,revision);return;}
  if(this.busy&&this.compiling?.docId===this.docId&&this.compiling.signature===signature)return;
  const job={docId:this.docId,signature,token:++this.epoch,graph};this.pending=job;this.state('compiling','正在编译新连接…',{stale:!!this.active});this.runQueue();
 }
 applyGraphValues(graph,revision){
  const byId=new Map(graph.nodes.map(n=>[n.id,n]));for(const n of this.active.compiled.graph.nodes){const value=byId.get(n.id);if(value)n.params={...value.params};}
  this.active.compiled.graph.parameters=graph.parameters;this.active.revision=revision;this.active.requested=this.target?.requested||performance.now();this.requestFrame();
 }
 patchParameters(changes,revision){
  if(!this.target)return;this.target.revision=revision;this.target.requested=performance.now();
  for(const change of changes){const node=this.target.draft.nodes.find(n=>n.id===change.nodeId);if(node){node.params[change.key]=change.value;const p=this.target.draft.parameters.find(p=>p.nodeId===node.id&&p.key===change.key);if(p)p.defaultValue=change.value;}}
  if(!this.active||this.active.signature!==this.target.signature){if(!this.busy&&!this.pending)this.setGraph(this.target.draft,revision);return;}
  let affected=false;for(const change of changes){const n=this.active.compiled.graph.nodes.find(n=>n.id===change.nodeId);if(n){n.params[change.key]=change.value;affected=true;}}
  this.stats.patches++;if(affected){this.active.revision=revision;this.active.requested=this.target.requested;this.interactingUntil=performance.now()+180;this.requestFrame();clearTimeout(this.settleTimer);this.settleTimer=setTimeout(()=>this.requestFrame(),200);}else this.state('unused','此节点未接入输出，不影响当前预览。');
 }
 async runQueue(){
  if(this.busy||!this.pending||this.disposed)return;const job=this.pending;this.pending=null;this.busy=true;this.compiling=job;let device;
  try{
   const template=await this.ready;await new Promise(r=>setTimeout(r,0));if(job.token!==this.epoch||job.docId!==this.docId)return;
   const latest=GenleDocuments.renderable(this.target.draft),compiled=GenleGraph.compile(latest);
   if(compiled.uniformNames.length+38>this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS))throw Error('超出当前设备的参数预算，请减少节点。');
   const source=template.replace(/\/\*__GENLE_GRAPH_KERNEL__\*\/[\s\S]*?vec2 evaluateFormula\(vec3 world\)\{return vec2\(10000\.,0\.\);\}/,compiled.kernel);
   device=GenleWebGL.createProgram(this.gl,source,[...compiled.uniformNames,...'A B C D E F G H I J M L N T K0 K1 K2 K3 MG R S resolution detailResolution mappingResolution camera quality ColorA ColorB LightKey LightFill LightRim'.split(' ')]);this.stats.compiles++;
   if(job.token!==this.epoch||job.docId!==this.docId){this.disposeDevice(device);device=null;return;}
   const old=this.cache.get(job.docId);this.active={signature:job.signature,compiled,device,revision:this.target.revision,requested:this.target.requested};device=null;this.cache.delete(job.docId);this.cache.set(job.docId,this.active);if(old)this.disposeDevice(old.device);
   while(this.cache.size>4){const [id,entry]=this.cache.entries().next().value;if(id===this.docId)break;this.cache.delete(id);this.disposeDevice(entry.device);}
   this.applyGraphValues(GenleDocuments.renderable(this.target.draft),this.target.revision);
  }catch(e){if(job.token===this.epoch&&job.docId===this.docId)this.state('error',e.message,{stale:!!this.active});if(device)this.disposeDevice(device);}
  finally{this.busy=false;this.compiling=null;if(this.pending)this.runQueue();}
 }
 requestFrame(){this.dirty=true;if(!this.raf&&!this.disposed)this.raf=requestAnimationFrame(()=>{this.raf=0;if(!this.dirty||!this.active||this.contextLost)return;try{this.draw();}catch(e){this.dirty=false;this.state('error','绘制失败：'+e.message,{stale:true});}});}
 draw(full=false){
  const gl=this.gl,entry=this.active;if(!entry||this.contextLost)return;const start=performance.now(),rect=this.canvas.getBoundingClientRect(),tier=[0,1,1.5,2,3].indexOf(this.quality),editing=!full&&start<this.interactingUntil;
  const factor=({0:.65,1:1,1.5:1.25,2:1.5,3:2})[this.quality]*Math.min(globalThis.devicePixelRatio||1,1.5),scale=editing?.75:1;
  const w=Math.max(1,Math.round(rect.width*factor*scale)),h=Math.max(1,Math.round(rect.height*factor*scale));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
  const loc=entry.device.locations,v=this.settings;GenleWebGL.bind(gl,entry.device);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.uniform2f(loc.resolution,w,h);gl.uniform1f(loc.detailResolution,Math.max(1,rect.height*factor));gl.uniform1f(loc.mappingResolution,Math.max(1,rect.height*factor));const c=this.camera;gl.uniform4f(loc.camera,c.yaw,c.pitch,c.distance*Math.max(1,rect.height/Math.max(1,rect.width)*1.12),c.roll*Math.PI/180);
  const set=(name,a)=>gl.uniform4f(loc[name],...a);uploadFormulaUniforms(set,v,0,0);entry.compiled.upload(set);uploadRenderUniforms(set,v);gl.uniform3fv(loc.ColorA,graphColorLinear(v.ColorA));gl.uniform3fv(loc.ColorB,graphColorLinear(v.ColorB));for(const [name,key]of [['LightKey','KeyColor'],['LightFill','FillColor'],['LightRim','RimColor']]){const base=graphColorLinear(graphDefaultValues[key]);gl.uniform3fv(loc[name],graphColorLinear(v[key]).map((x,i)=>x/base[i]));}
  gl.uniform1i(loc.quality,editing?Math.min(tier,1):tier);gl.drawArrays(gl.TRIANGLES,0,6);this.dirty=false;this.stats.draws++;this.stats.revision=entry.revision;this.stats.latency=performance.now()-(entry.requested||start);this.stats.cpuMs=performance.now()-start;
  const stale=this.target?.signature!==entry.signature;this.canvas.dataset.documentId=this.docId;this.canvas.dataset.revision=String(entry.revision);this.canvas.dataset.draws=String(this.stats.draws);this.canvas.dataset.compiles=String(this.stats.compiles);
  this.onFrame({...this.stats,documentId:this.docId,revision:entry.revision,editing,stale});if(!stale)this.state('updated','已更新 · 近似距离估计',{revision:entry.revision});
 }
 setQuality(q){if([0,1,1.5,2,3].includes(q)){this.quality=q;this.requestFrame();}}
 setSettings(patch){for(const [key,value]of Object.entries(patch)){const d=graphRenderDefinitions.find(d=>d[0]===key);if(!d||!Number.isFinite(value))continue;const min=typeof d[2]==='string'?0:d[2],max=typeof d[2]==='string'?(d[2]==='bool'?1:d[4].length-1):d[3];this.settings[key]=Math.max(min,Math.min(max,value));}this.requestFrame();}
 setCamera(camera){for(const key of ['yaw','pitch','distance','roll'])if(Number.isFinite(camera[key]))this.camera[key]=camera[key];this.camera.distance=Math.max(.5,Math.min(500,this.camera.distance));this.requestFrame();this.onCamera({...this.camera});}
 view(name){const reference=GenleDocuments.defaultPreview(this.target?.draft||{nodes:[]});this.setCamera(name==='top'?{pitch:Math.PI/2,roll:0}:name==='bottom'?{pitch:-Math.PI/2,roll:0}:reference.camera);}
 bindCamera(){const canvas=this.canvas;this.pointers=new Map();let pinch=0;canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});this.pointers.set(e.pointerId,[e.clientX,e.clientY]);if(this.pointers.size===2){const p=[...this.pointers.values()];pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);}});canvas.addEventListener('pointermove',e=>{if(!this.pointers.has(e.pointerId))return;const old=this.pointers.get(e.pointerId);this.pointers.set(e.pointerId,[e.clientX,e.clientY]);if(this.pointers.size===2){const p=[...this.pointers.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(d>0&&pinch>0)this.zoom(pinch/d);pinch=d;}else this.setCamera({yaw:this.camera.yaw-(e.clientX-old[0])*.007,pitch:Math.atan2(Math.sin(this.camera.pitch+(e.clientY-old[1])*.007),Math.cos(this.camera.pitch+(e.clientY-old[1])*.007))});this.interactingUntil=performance.now()+150;});for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{this.pointers.delete(e.pointerId);pinch=0;this.interactingUntil=0;this.requestFrame();});canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom(Math.exp(Math.max(-150,Math.min(150,e.deltaY))*.0015));},{passive:false});canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}[e.key];if(d){e.preventDefault();this.setCamera({yaw:this.camera.yaw+d[0],pitch:this.camera.pitch+d[1]});}if(['+','=','-'].includes(e.key)){e.preventDefault();this.zoom(e.key==='-'?1.1:.9);}});}
 zoom(factor){this.setCamera({distance:Math.max(.5,Math.min(500,this.camera.distance*factor))});}
 async snapshot(){if(!this.active)throw Error('尚无可保存的画面。');this.draw(true);return new Promise(resolve=>this.canvas.toBlob(resolve,'image/png'));}
 diagnostics(){return {...this.stats,busy:this.busy,pending:!!this.pending,state:this.lastState};}
 dispose(){this.disposed=true;this.epoch++;cancelAnimationFrame(this.raf);clearTimeout(this.settleTimer);this.resizeObserver.disconnect();for(const entry of this.cache.values())this.disposeDevice(entry.device);this.cache.clear();}
}
globalThis.GenleGraphPreview=GraphPreview;

globalThis.GenlePreviewParameters=graphRenderDefinitions;
