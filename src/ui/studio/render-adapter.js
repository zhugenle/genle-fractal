const canvas=$('uber-canvas'),gl=GenleWebGL.context(canvas);let program,locations={},renderDevice;
const renderBudget=new FractalRenderBudget(gl),adaptiveControl=$('adaptive-render');
let adaptiveRendering=false,interactionUntil=0,lastDrawTime=-Infinity,lastCpuMs=0,submittedFrame=false,wasDynamic=false,snapshotBusy=false,recordingDimensions=null,lastRenderDimensions=null,lastRenderAdaptive=false;
const viewportSize={width:0,height:0};
// Every opening starts with adaptation off, including browsers with an old saved "on".
adaptiveControl.checked=adaptiveRendering;
function moving(now=performance.now()){return playing||!!presetTransition||now<interactionUntil;}
function noteRenderInteraction(){interactionUntil=performance.now()+500;}
document.addEventListener('input',e=>{if(e.target.closest('.studio'))noteRenderInteraction();},true);
document.addEventListener('pointerdown',e=>{if(e.target.closest('canvas,input,.light-direction'))noteRenderInteraction();},true);
document.addEventListener('pointermove',e=>{if(e.buttons&&e.target.closest('.studio'))noteRenderInteraction();},true);
canvas.addEventListener('wheel',noteRenderInteraction,{passive:true});
adaptiveControl.onchange=()=>{adaptiveRendering=adaptiveControl.checked;renderBudget.resetSamples();lastDrawTime=-Infinity;try{localStorage.setItem('genle-fractal-adaptive-render',adaptiveRendering?'on':'off');}catch(_){}dirty=true;$('action-status').textContent=adaptiveRendering?'自适应渲染已开启。':'已固定为完整渲染精度。';};

function error(message){$('render-error').hidden=false;$('render-error').textContent=message;$('render-status').textContent='三维渲染不可用';ready=false;for(const id of ['play','record','snapshot'])$(id).disabled=true;}
const formulaDevices=new Map();let formulaLoadVersion=0;
async function loadFormulaDevice(){
 const token=++formulaLoadVersion,id=activeFormula.id;ready=false;
 try{
  let device=formulaDevices.get(id);
  if(!device){const r=await fetch(id==='uber-bulb'?'uber.glsl':'spiked-cube.glsl');if(!r.ok)throw Error('shader load');device=GenleWebGL.createProgram(gl,await r.text(),[...FORMULA_UNIFORMS,'resolution','detailResolution','mappingResolution','camera','J','M','L','N','T','quality','K0','K1','K2','K3','MG','R','S','ColorA','ColorB','LightKey','LightFill','LightRim']);formulaDevices.set(id,device);}
  if(token!==formulaLoadVersion)return;renderDevice=device;program=device.program;locations=device.locations;ready=true;dirty=true;
 }catch(e){if(token===formulaLoadVersion){console.error(e);error('渲染启动失败。请刷新或更换支持 WebGL 的浏览器。');}}
}
async function init(){if(!gl){error('无法启动 WebGL。请使用支持硬件加速的 Chrome 或 Edge。');return;}requestAnimationFrame(frame);await loadFormulaDevice();}

function draw(forceFull=false){if(!ready)return;const started=performance.now();
if(!viewportSize.width){const rect=canvas.getBoundingClientRect();viewportSize.width=rect.width;viewportSize.height=rect.height;}
const rect=viewportSize,nativeFactor=({0:.65,1:1,1.5:1.25,2:1.5,3:2})[quality]*Math.min(devicePixelRatio,quality>=2?2:1.5);
const adaptive=adaptiveRendering&&quality!==3&&moving(started)&&!forceFull&&!recordingDimensions;
const selectedShader=[0,1,1.5,2,3].indexOf(quality);
const dimensions=recordingDimensions&&!forceFull?recordingDimensions:renderBudget.dimensions(rect.width,rect.height,nativeFactor,adaptive,selectedShader);
let w=dimensions.width,h=dimensions.height;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
w=gl.drawingBufferWidth;h=gl.drawingBufferHeight;lastRenderDimensions={...dimensions,width:w,height:h,cameraScale:recordingDimensions?.cameraScale||Math.max(1,rect.height/rect.width*1.12)};lastRenderAdaptive=adaptive;
gl.bindFramebuffer(gl.FRAMEBUFFER,null);GenleWebGL.bind(gl,renderDevice);

gl.viewport(0,0,w,h);gl.uniform2f(locations.resolution,w,h);gl.uniform1f(locations.detailResolution,dimensions.detailHeight);gl.uniform1f(locations.mappingResolution,dimensions.mappingHeight);motion='reference';easing='linear';for(const key of LOCKED_PHASES)if(schema.has(key))values[key]=reference[key];const v=values,phase=progress*TAU/v.Power;let lp=v.LoopPI,lp2=v.LoopPI2,angle=yaw;let fraction=easing==='smooth'?progress*progress*(3-2*progress):progress;if(motion==='reference'){[lp,lp2]=activeFormula.phases(progress,v);}if(['spin','spinloop'].includes(motion))angle+=progress*TAU;if(['loop1','both','spinloop'].includes(motion))lp+=phase;if(['loop2','both'].includes(motion))lp2+=phase;gl.uniform4f(locations.camera,angle,pitch,distance*lastRenderDimensions.cameraScale,v.CameraRoll*Math.PI/180);const uniform=(name,a)=>gl.uniform4f(locations[name],...a);activeFormula.upload(uniform,v,lp,lp2);uploadRenderUniforms(uniform,v);gl.uniform3fv(locations.ColorA,colorLinear(v.ColorA));gl.uniform3fv(locations.ColorB,colorLinear(v.ColorB));for(const [uniformName,key] of [['LightKey','KeyColor'],['LightFill','FillColor'],['LightRim','RimColor']]){const base=colorLinear(reference[key]);gl.uniform3fv(locations[uniformName],colorLinear(v[key]).map((x,i)=>x/base[i]));}gl.uniform1i(locations.quality,dimensions.shaderQuality);renderBudget.begin(dimensions.factor,adaptive,dimensions.shaderQuality);gl.drawArrays(gl.TRIANGLES,0,6);renderBudget.end();lastCpuMs=performance.now()-started;dirty=false;queueViewSave();}
