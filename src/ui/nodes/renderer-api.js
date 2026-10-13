// The bridge sees only this facade, never the renderer's lexical state.
window.GenleNodeRenderer={
 getState(){const f=progress;return {type:'uber-node-state',ready,playing,progress,phase:[values.Loop1Start+(values.Loop1End-values.Loop1Start)*f,values.Loop2Start+(values.Loop2End-values.Loop2Start)*f],status:$('render-status').textContent,error:$('render-error').hidden?'':$('render-error').textContent};},
 setParameters(parameters){for(const [key,n]of Object.entries(parameters))if(schema.has(key)&&!LOCKED_PHASES.has(key)&&typeof n==='number'&&Number.isFinite(n))change(key,n);},
 setPlaying(value){playing=!!value;updateTransport();},
 view(name){const id={reference:'view-reference',top:'view-top',bottom:'view-bottom'}[name];if(id)$(id).click();},
 snapshot(){$('snapshot').click();},
 setQuality(value){if([0,1,2,3].includes(value)){quality=value;dirty=true;}},
 setProgress(value){if(Number.isFinite(value)){progress=Math.max(0,Math.min(1,value));playing=false;dirty=true;updateTransport();}}
};
