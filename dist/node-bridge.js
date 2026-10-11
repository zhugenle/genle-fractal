
'use strict';
function reportNodeState(){let f=progress;parent.postMessage({type:'uber-node-state',ready,playing,progress,phase:[values.Loop1Start+(values.Loop1End-values.Loop1Start)*f,values.Loop2Start+(values.Loop2End-values.Loop2Start)*f],status:$('render-status').textContent,error:$('render-error').hidden?'':$('render-error').textContent},location.origin);}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;const m=e.data;if(!m||m.type!=='uber-node-command')return;
if(m.action==='parameters'&&m.parameters){for(const [key,n] of Object.entries(m.parameters))if(schema.has(key)&&!LOCKED_PHASES.has(key)&&typeof n==='number'&&Number.isFinite(n))change(key,n);}
else if(m.action==='play'){playing=!!m.value;updateTransport();}
else if(m.action==='reference')$('view-reference').click();
else if(m.action==='top')$('view-top').click();
else if(m.action==='bottom')$('view-bottom').click();
else if(m.action==='snapshot')$('snapshot').click();
else if(m.action==='quality'&&[0,1,2,3].includes(m.value)){quality=m.value;dirty=true;}
else if(m.action==='progress'&&Number.isFinite(m.value)){progress=Math.max(0,Math.min(1,m.value));playing=false;dirty=true;updateTransport();}
else if(m.action==='report')reportNodeState();
});
setInterval(reportNodeState,300);
