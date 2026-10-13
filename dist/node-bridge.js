'use strict';
(function(){
const renderer=window.GenleNodeRenderer;
function reportNodeState(){parent.postMessage(renderer.getState(),location.origin);}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent)return;
 const m=e.data;if(!m||m.type!=='uber-node-command')return;
 if(m.action==='parameters'&&m.parameters&&typeof m.parameters==='object')renderer.setParameters(m.parameters);
 else if(m.action==='play')renderer.setPlaying(m.value);
 else if(['reference','top','bottom'].includes(m.action))renderer.view(m.action);
 else if(m.action==='snapshot')renderer.snapshot();
 else if(m.action==='quality')renderer.setQuality(m.value);
 else if(m.action==='progress')renderer.setProgress(m.value);
 else if(m.action==='report')reportNodeState();
});
setInterval(reportNodeState,300);
})();
