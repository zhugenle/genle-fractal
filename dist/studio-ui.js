'use strict';
(()=>{
const dictionary={
'文件过大':'file too large','预设格式不符':'invalid preset format','含有无效参数':'invalid parameters','MinRad 不能大于 MaxRad':'MinRad must not exceed MaxRad','动画设置无效':'invalid animation settings','无法启动 WebGL。请使用支持硬件加速的 Chrome 或 Edge。':'Cannot start WebGL. Use Chrome or Edge with hardware acceleration.','渲染启动失败。请刷新或更换支持 WebGL 的浏览器。':'Renderer failed to start. Reload or use a browser that supports WebGL.','图形连接已中断，请刷新页面重新启动。':'Graphics connection lost. Reload to restart.','实时相位读数':'live phase readouts','LoopPI 当前相位':'LoopPI current phase','LoopPI2 当前相位':'LoopPI2 current phase','全屏画面':'fullscreen image','下载全部预设':'download all presets','细致':'enhanced','全部预设已导入。':'all presets imported','预设最多24个':'maximum 24 presets','无法进入全屏；请使用支持全屏的浏览器。':'Fullscreen unavailable. Use a browser that supports fullscreen.','已导入到当前页面；本地存储不可用，请下载备份。':'Imported into this session. Browser storage is unavailable; download a backup.','调整主题色':'adjust theme color','界面主题色':'interface theme','主题色':'theme color','主题色色值':'theme color hex','恢复默认':'reset default','退出全屏':'exit fullscreen','参数':'parameters','我的预设':'presets','实时分形工作室':'real-time fractal studio','恢复参考参数':'reset parameters','对照原始 GIF':'reference GIF','参考视角':'reference view','正俯视':'top view','正仰视':'bottom view','重置视角':'reset view','周期':'cycle','秒':'s','循环位置':'timeline','视图修剪':'view clip','保留全部':'clear clip','画质':'quality','流畅':'draft','标准':'standard','精细':'fine','超精细 · 静帧':'ultra / still','保存图片':'save PNG','录制一圈 WebM':'record WebM','结束录制':'stop recording','播放动画':'play','暂停动画':'pause','回到起点':'rewind','复现依据与当前进度':'implementation notes','导出预设':'export JSON','导入预设':'import JSON','GIF 动画预设':'GIF preset','＋ 添加':'add preset','更新':'update','删除':'delete','预设名称（可选）':'preset name (optional)','预设名称':'preset name','添加当前画面为预设':'save current view as preset','调整画面后，点击＋保存。':'Adjust the view, then press + to save.','仅存此浏览器 · 切换以0.8秒缓入缓出过渡 · 动画持续播放':'browser storage / 0.8 s transition / continuous animation',
'拖动旋转 · 滚轮缩放':'drag: orbit / wheel: zoom','GIF 参数预设 · 双材质混合':'GIF formula / dual materials','正在启动三维渲染…':'initializing renderer…','原始 GIF · 360 × 360 · 4.8 秒':'reference GIF / 360 × 360 / 4.8 s','实时生成 · GIF 参数预设':'live render / GIF preset','三维渲染不可用':'renderer unavailable','主光方向':'key light direction','恢复参考打光':'reset lighting','拖动球体环绕光源 · 可转至背面':'drag to orbit light / front and back',
'已停止过渡，保留当前画面。':'transition stopped / current view retained','请先结束录制再切换预设。':'Stop recording before switching presets.','浏览器无法写入本地存储，本次打开仍可使用；请导出预设备份。':'Browser storage unavailable. Export JSON to keep your presets.','当前视角已保存。':'current view saved','预设已载入。':'preset loaded','画质已切换。':'quality updated','超精细：两倍分辨率超采样，已暂停动画；生成速度取决于设备。':'ultra / 2× resolution / animation paused / speed depends on device','此浏览器不支持 WebM 录制；可保存图片。':'WebM recording unavailable in this browser. Save a PNG instead.','录制已保存；流畅程度取决于当前设备的渲染速度。':'recording saved / frame rate depends on device','录制失败，请降低画质后重试。':'Recording failed. Lower quality and try again.','向右滑动，切掉镜头前方遮挡；修剪方向随视角变化。':'Slide right to remove foreground geometry. Clipping follows the view.',
'分形参数':'fractal parameters','本地预设':'local presets','可滚动参数':'scrollable parameters','UBER BULB 三维形态；拖动或方向键旋转，滚轮或加减键缩放':'UBER BULB 3D shape; drag or arrow keys to orbit, wheel or plus/minus to zoom','用户提供的双材质 UBER BULB 动态参考':'user-provided dual-material UBER BULB animation','主光方向球体，拖动或使用方向键调整360度入射角':'key light sphere; drag or use arrow keys to adjust direction through 360 degrees','平方根':'sqrt','对数':'log','常量':'constant','空间坐标':'position','Four corner · 原代码输出0':'Four corner / original returns 0'
};
const groupMap={'形态与相位':'shape / feedback','材质':'materials','灯光':'lighting','旋转与位置':'transform','球面变换':'sphere transform','Julia 与实验模式':'Julia / experimental','轨道着色':'orbit mapping','渲染稳定性':'render stability','动画关键帧':'phase animation','OSL 渐变混合':'OSL gradient'};
const labels={
Power:'power',ZMultiplier:'Z multiplier',PrevVecMul:'previous vector',OldVecMul:'old vector',Implode:'implode',Explode:'explode',Iterations:'iterations',Bailout:'bailout',
ColorA:'A / color',ColorB:'B / color',Metallic:'A / metallic',Roughness:'A / roughness',Clearcoat:'A / clearcoat',BlueMetallic:'B / metallic',BlueRoughness:'B / roughness',Emission:'B / emission',
KeyColor:'key / color',FillColor:'fill / color',RimColor:'rim / color',KeyIntensity:'key intensity',CyanIntensity:'fill intensity',RimIntensity:'rim intensity',KeyAzimuth:'azimuth',KeyElevation:'elevation',EnvironmentRotation:'environment angle',Exposure:'exposure EV',FillIntensity:'ambient fill',ReflectionGain:'reflection gain',LightSize:'light size',SpecularFill:'reflection fill',ReflectionOcclusion:'reflection occlusion',BlueBounce:'B / indirect fill',
CameraRoll:'camera roll',AngXY:'rotation XY',AngYZ:'rotation YZ',AngXZ:'rotation XZ',AbsoluteScale:'formula scale',AbsoluteX:'position X',AbsoluteY:'position Y',AbsoluteZ:'position Z',Xcen:'center X',Ycen:'center Y',Zcen:'center Z',nonconformal:'inverse sphere',
JuliaMode:'Julia mode',CylindricalMOD:'inverse cyl Z',CylindricalNegativeMOD:'inverse cyl C',BrotMOD:'Brot mode',BrotFreq:'Brot frequency',fractionary:'divide by Z',ColorIterations:'color iterations',UMode:'U mapping',VMode:'V mapping',UScale:'U scale',VScale:'V scale',
ViewClip:'view clip',Bounds:'search radius',StepScale:'step scale',DetailPrecision:'detail threshold',NormalFilter:'normal filter',
GradientType:'gradient type',GradientSpace:'space',GradientAngle:'angle',GradientGamma:'gamma',GradientDistort:'distortion',GradientRadius:'radius',GradientTex:'texture gray',GradientInvert:'invert mix',GradientStartX:'start X',GradientStartY:'start Y',GradientStartZ:'start Z',GradientEndX:'end X',GradientEndY:'end Y',GradientEndZ:'end Z'
};
const hints={
'形态与相位':'User-supplied formula parameters. Locked dual-phase animation loops continuously.',
'材质':'OSL mask mixes independent materials A and B.',
'灯光':'Black background and reflection lighting are independent. Ambient fill does not remove lightbox reflections.',
'旋转与位置':'Formula rotations occur within every iteration and change the geometry.',
'球面变换':'MinRad = MaxRad = Radius = 1 makes this transform an identity.',
'Julia 与实验模式':'Feedback and division use an approximate distance estimator. Lower step scale if surfaces are missing.',
'轨道着色':'UMode and VMode control the two orbit coordinates from the original formula.',
'渲染稳定性':'Lower detail threshold gives finer geometry. Ultra uses 2× resolution for stills.',
'OSL 渐变混合':'Reference: U / Texture / angle 0 / gamma 1 / distort 0. White maps to A; invert is available.',
'动画关键帧':'Phase animation is fixed to an exact periodic loop.'
};
for(const [name,hint,,items] of groups){dictionary[name]=groupMap[name]||name;dictionary[hint]=hints[name]||hint;for(const [key,label]of items)dictionary[label]=labels[key]||key;}
const notes=document.querySelectorAll('.port-notes p');
const noteEnglish=[
'Geometry is ported from the supplied Octane OSL UBER BULB V3.0 formula, © 2020 Machina-Infinitum. Core iteration, bailout, feedback vectors, sphere transforms, Julia and experimental modes are retained, with numerical safeguards.',
'The reference GIF lasts 4.8 s. This studio plays an exact 20 s dual-phase cycle: LoopPI traverses two angular periods and LoopPI2 four. Rounded reference endpoints were corrected to eliminate the seam. Material mixing uses orbit data. Studio lighting approximates metal reflection, highlights, shadows and indirect fill.',
'Fine and ultra modes add bounded reflection tracing. Ultra renders at twice the canvas dimensions. This is finite ray marching, without Octane path tracing, multiple refractions or full global illumination. Lower step scale for incomplete surfaces; increase search radius to find distant structure.'
];notes.forEach((p,i)=>dictionary[p.textContent.trim()]=noteEnglish[i]);
const symbols={'reference-toggle':'[ GIF ]','view-reference':'[ ref ]','view-top':'[ +Y ]','view-bottom':'[ −Y ]','view-reset':'[ home ]','rewind':'|<','clip-reset':'[ 0 ]','snapshot':'[ png ]','defaults':'reset()','save-preset':'↓ json','load-preset':'↑ json','preset-add':'+','light-reset':'reset light'};
let lang='zh';try{lang=localStorage.getItem('genle-fractal-language')==='en'?'en':'zh';}catch(_){}
const originals=new WeakMap(),attributes=new WeakMap();
function translate(s){
 if(dictionary[s])return dictionary[s];
 let m;if((m=s.match(/^(.*) 超出范围$/)))return m[1]+' is out of range';if((m=s.match(/^(.*) 必须是整数$/)))return m[1]+' must be an integer';
 if((m=s.match(/^已用当前画面更新 (.*)。$/)))return 'updated / '+m[1];
 if((m=s.match(/^已保存 (.*)，仅存储在此浏览器。$/)))return 'saved / '+m[1]+' / this browser only';
 if((m=s.match(/^正在切换到 (.*)…$/)))return 'switching / '+m[1]+'…';
 if((m=s.match(/^已切换到 (.*)。$/)))return 'active / '+m[1];
 if((m=s.match(/^(更新|删除) (.*)$/)))return (m[1]==='更新'?'update ':'delete ')+m[2];
 if((m=s.match(/^方位 (.*?)°\n仰角 (.*?)° · (前侧|背侧)$/)))return 'azimuth '+m[1]+'°\nelevation '+m[2]+'° / '+(m[3]==='前侧'?'front':'back');
 if((m=s.match(/^正在录制一个 (.*?) 秒循环…$/)))return 'recording / '+m[1]+' s cycle…';
 if((m=s.match(/^(GIF 参数预设|自定义参数) · (.*)$/)))return (m[1]==='GIF 参数预设'?'reference':'custom')+' / '+(m[2]==='实时三维'?'live 3D':m[2]);
 if((m=s.match(/^无法载入：(.*)。请选择此页面导出的 JSON 预设。$/)))return 'Import failed: '+translate(m[1])+'. Choose a JSON preset exported from this studio.';
 if(s.endsWith('色值'))return translate(s.slice(0,-2))+' hex color';
 return s;
}
function localizeNode(node){
 if(node.nodeType===3){
  const p=node.parentElement;if(!p||p.closest('script,style,#preset-name,#code-signal,.saved-preset button:first-child'))return;
  const current=node.nodeValue;let rec=originals.get(node);if(!rec||current!==rec.output)rec={source:current,output:current};
  const trimmed=rec.source.trim();let result=lang==='en'?translate(trimmed):trimmed;
  if(p.tagName==='BUTTON'){
   if(p.id==='play')result=trimmed==='暂停动画'?'||':'>';
   else if(p.id==='record')result=trimmed==='结束录制'?'[ stop ]':'[ webm ]';
   else if(p.classList.contains('preset-update'))result='[=]';
   else if(p.classList.contains('preset-remove'))result='×';
   else if(symbols[p.id])result=symbols[p.id];
   if(result!==trimmed){const name=lang==='en'?translate(trimmed):trimmed;if(p.closest('.saved-preset')){const record=attributes.get(p)?.['aria-label'];p.title=lang==='en'?translate(record?.source||p.getAttribute('aria-label')||trimmed):(record?.source||p.getAttribute('aria-label')||trimmed);}else{p.title=name;p.setAttribute('aria-label',name);}}
  }
  rec.output=rec.source.replace(trimmed,result);originals.set(node,rec);if(current!==rec.output)node.nodeValue=rec.output;
 }else if(node.nodeType===1){
  const el=node;if(el.matches('script,style'))return;
  for(const attr of ['title','aria-label','placeholder','alt']){
   if(!el.hasAttribute(attr)||el.id==='language-toggle')continue;
   let records=attributes.get(el)||{};const current=el.getAttribute(attr);let rec=records[attr];
   if(!rec||current!==rec.output)rec={source:current,output:current};
   rec.output=lang==='en'?translate(rec.source):rec.source;records[attr]=rec;attributes.set(el,records);if(current!==rec.output)el.setAttribute(attr,rec.output);
  }
  for(const child of [...el.childNodes])localizeNode(child);
 }
}
const observer=new MutationObserver(mutations=>{
 observer.disconnect();
 for(const m of mutations)if(m.type==='characterData')localizeNode(m.target);else if(m.type==='attributes')localizeNode(m.target);else for(const n of m.addedNodes)localizeNode(n);
 observe();
});
function observe(){observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt']});}
function apply(){observer.disconnect();localizeNode(document.body);document.documentElement.lang=lang==='en'?'en':'zh-CN';const toggle=$('language-toggle');toggle.textContent=lang==='zh'?'EN':'中';toggle.title=lang==='zh'?'Switch to English':'切换到中文';toggle.setAttribute('aria-label',toggle.title);try{localStorage.setItem('genle-fractal-language',lang);}catch(_){}observe();}
$('language-toggle').onclick=()=>{lang=lang==='zh'?'en':'zh';apply();};apply();

const accentDefault='#b1ff49',accentStorage='genle-fractal-accent',accentInput=$('ui-accent'),accentHex=$('ui-accent-hex'),accentPanel=$('accent-panel'),accentToggle=$('accent-toggle');
function setAccent(value){if(!/^#[0-9a-f]{6}$/i.test(value))return;const color=value.toLowerCase();document.documentElement.style.setProperty('--accent',color);accentInput.value=color;accentHex.value=color;accentHex.setAttribute('aria-invalid','false');try{localStorage.setItem(accentStorage,color);}catch(_){}drawLightBall();}
let savedAccent=accentDefault;try{const stored=localStorage.getItem(accentStorage);if(/^#[0-9a-f]{6}$/i.test(stored||''))savedAccent=stored;}catch(_){}setAccent(savedAccent);
accentToggle.onclick=()=>{accentPanel.hidden=!accentPanel.hidden;accentToggle.setAttribute('aria-expanded',String(!accentPanel.hidden));if(!accentPanel.hidden)accentHex.focus({preventScroll:true});};
accentInput.oninput=()=>setAccent(accentInput.value);
accentHex.oninput=()=>{const valid=/^#[0-9a-f]{6}$/i.test(accentHex.value);accentHex.setAttribute('aria-invalid',String(!valid));if(valid)setAccent(accentHex.value);};
$('accent-reset').onclick=()=>setAccent(accentDefault);
function closeAccent(){accentPanel.hidden=true;accentToggle.setAttribute('aria-expanded','false');}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.accent-control'))closeAccent();});
accentPanel.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAccent();accentToggle.focus();}});

const signal=$('code-signal'),frames=['{ 0 : 1 }','[ 1 / 0 ]','< 0 | 1 >','{ 1 : 0 }'],reduced=matchMedia('(prefers-reduced-motion: reduce)');let index=0;
setInterval(()=>{if(!document.hidden&&!reduced.matches)signal.textContent=frames[++index%frames.length];},1400);
})();
