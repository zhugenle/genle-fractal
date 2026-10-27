// Optional graph runtime. Existing formulas and legacy node renderer are unchanged.
let graphInstallRevision=0,graphTemplatePromise;
const graphPreviewMode=new URLSearchParams(location.search).get('composer-preview')==='1';
if(graphPreviewMode){const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='composer.css';document.head.append(stylesheet);document.documentElement.classList.add('graph-preview');playing=false;quality=1;$('uber-quality').value=quality;sync();updateTransport();}
function graphEntry(compiled){
 const base=STUDIO_FORMULAS[0],id='custom-'+compiled.graph.id;
 const transform=base.groups['旋转与位置'],orbit=base.groups['轨道着色'];
 const groups={'公开参数':['公开参数','来自自由节点图；完整计算逻辑保存在公式包中。',true,compiled.parameterDefinitions],
  '旋转与位置':[transform[0],'整个新公式的世界变换。',false,transform[3].filter(d=>['AbsoluteScale','AbsoluteX','AbsoluteY','AbsoluteZ'].includes(d[0]))],
  '轨道着色':[orbit[0],orbit[1],false,orbit[3].filter(d=>d[0]!=='ColorIterations')]};
 const visible=new Set(Object.values(groups).flatMap(g=>g[3]).map(d=>d[0]));
 const hidden=Object.values(base.groups).flatMap(g=>g[3]).filter(d=>!visible.has(d[0]));
 const cube=compiled.graph.nodes.find(n=>n.id===compiled.graph.output).params.Estimator===1;
 const entry={id,name:compiled.graph.name,groups,hidden,reference:{...base.reference,AbsoluteScale:1,...Object.fromEntries(compiled.parameterDefinitions.map(d=>[d[0],d[5]]))},profile:{camera:{yaw:.8,pitch:cube?.5:.65,distance:cube?28:10.5,roll:cube?0:-35},parameters:{Bounds:cube?10:4}},graphCompiled:compiled,
  phases:()=>[0,0],upload(uniform,v){base.upload(uniform,v,0,0);entry.graphCompiled.upload(uniform,v);}};
 return entry;
}
async function installGraphFormula(raw){
 if(!globalThis.GenleGraph)throw Error('图编译器未加载。');if(!gl)throw Error('WebGL 不可用。');if(recordState?.offline||recorder?.state==='recording')throw Error('请先结束录制。');
 const revision=++graphInstallRevision,graph=GenleGraph.unpack(raw),compiled=GenleGraph.compile(graph),entry=graphEntry(compiled);
 const oldEntry=STUDIO_FORMULAS.find(f=>f.id===entry.id),oldDevice=formulaDevices.get(entry.id);
 if(compiled.uniformNames.length+38>gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS))throw Error('此图超过当前设备的 uniform 预算，请减少参数节点。');
 let device=oldDevice;
 if(!oldEntry||oldEntry.graphCompiled.kernel!==compiled.kernel||!device){
  graphTemplatePromise??=fetch('graph-template.glsl').then(r=>{if(!r.ok)throw Error('无法加载图 shader 模板。');return r.text();});
  const template=await graphTemplatePromise;if(revision!==graphInstallRevision)return {superseded:true};
  const source=template.replace(/\/\*__GENLE_GRAPH_KERNEL__\*\/[\s\S]*?vec2 evaluateFormula\(vec3 world\)\{return vec2\(10000\.,0\.\);\}/,compiled.kernel);
  device=GenleWebGL.createProgram(gl,source,[...FORMULA_UNIFORMS,...compiled.uniformNames,'resolution','detailResolution','mappingResolution','camera','J','M','L','N','T','quality','K0','K1','K2','K3','MG','R','S','ColorA','ColorB','LightKey','LightFill','LightRim']);
 }
 if(revision!==graphInstallRevision){if(device!==oldDevice){gl.deleteProgram(device.program);gl.deleteBuffer(device.buffer);}return {superseded:true};}
 const existing=STUDIO_FORMULAS.findIndex(f=>f.id===entry.id);if(existing<0){STUDIO_FORMULAS.push(entry);const option=document.createElement('option');option.value=entry.id;option.textContent=entry.name;$('formula-select').append(option);}else{STUDIO_FORMULAS[existing]=entry;$('formula-select').querySelectorAll('option').forEach(o=>{if(o.value===entry.id)o.textContent=entry.name;});}
 ++formulaLoadVersion;formulaDevices.set(entry.id,device);
 if(activeFormula.id!==entry.id){activateFormula(entry.id);playing=false;progress=0;}
 else{const previous={...values};activeFormula=entry;groups=studioGroups(entry);renderParameterControls();fields.get('KeyAzimuth').input.closest('details').querySelector('.group-hint').after(lightWidget);values={...reference,...previous};renderDevice=device;program=device.program;locations=device.locations;ready=true;}
 for(const d of compiled.parameterDefinitions)values[d[0]]=d[5];
 if(oldDevice&&device!==oldDevice){gl.deleteProgram(oldDevice.program);gl.deleteBuffer(oldDevice.buffer);}
 $('phase-values').hidden=true;fields.get('AbsoluteScale').input.dataset.previous=values.AbsoluteScale;sync();updateTransport();renderLocalPresets();dirty=true;
 return {...compiled.diagnostics,formulaId:entry.id};
}
globalThis.GenleGraphStudio=Object.freeze({install:installGraphFormula,setQuality(value){if([0,1,1.5,2,3].includes(value)){quality=value;$('uber-quality').value=value;dirty=true;}},view(name){if(name==='reference')$('view-reference').click();else if(name==='top')$('view-top').click();else if(name==='bottom')$('view-bottom').click();},snapshot(){if(ready)$('snapshot').click();},status(){return {ready,formulaId:activeFormula.id,error:$('render-error').hidden?'':$('render-error').textContent};}});
const graphImport=document.createElement('button');graphImport.type='button';graphImport.textContent='载入公式包';graphImport.title='载入自由节点导出的公式包';graphImport.id='load-graph-formula';$('load-preset').after(graphImport);
const graphFile=document.createElement('input');graphFile.type='file';graphFile.accept='.json';graphFile.hidden=true;document.body.append(graphFile);graphImport.onclick=()=>graphFile.click();graphFile.onchange=async()=>{const file=graphFile.files[0];if(!file)return;try{if(file.size>500000)throw Error('公式包文件过大。');await installGraphFormula(JSON.parse(await file.text()));$('action-status').textContent='自定义公式已载入；可调整公开参数。';}catch(e){$('action-status').textContent='载入失败：'+e.message;}graphFile.value='';};
const composerLink=document.createElement('a');composerLink.href='composer.html';composerLink.textContent='[ 自由节点 ]';composerLink.className='composer-link';$('load-preset').parentElement.append(composerLink);
// Custom graphs are session-local; never put an unresolvable formula ID into
// legacy preset storage or export a legacy JSON that omits its graph dependency.
function currentGraphPackage(){const graph=GenleGraph.clone(activeFormula.graphCompiled.graph);for(const p of graph.parameters){const value=values['gp_'+p.id];graph.nodes.find(n=>n.id===p.nodeId).params[p.key]=value;p.defaultValue=value;}return GenleGraph.package(graph);}
$('save-preset').addEventListener('click',e=>{if(!activeFormula.graphCompiled)return;e.stopImmediatePropagation();download(new Blob([JSON.stringify(currentGraphPackage(),null,2)],{type:'application/json'}),'genle-formula.json');$('action-status').textContent='已导出包含当前公开参数的完整公式包。';},true);
$('preset-add').addEventListener('click',e=>{if(!activeFormula.graphCompiled)return;e.stopImmediatePropagation();$('preset-status').textContent='自由公式请使用导出 JSON 保存完整公式包；当前仅加载到本次会话。';},true);
const openGraph=new URLSearchParams(location.search).get('graph-session');if(openGraph){try{const data=sessionStorage.getItem('genle-graph-open-'+openGraph);if(data)installGraphFormula(JSON.parse(data)).catch(e=>{$('action-status').textContent=e.message;});}catch(_){} }
