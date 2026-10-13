let timelineScrubbing=false;
const phaseOutputs=['phase-loop1','phase-loop2'].map(id=>{const node=$(id);return {node,integer:node.querySelector('.phase-integer'),fraction:node.querySelector('.phase-fraction')};});
function updatePhaseReadouts(){const phases=activeFormula.phases(progress,values);for(let i=0;i<2;i++){const phase=phases[i],parts=Math.abs(phase).toFixed(4).split('.'),whole=(phase<0?'-':'+')+parts[0],fraction='.'+parts[1],output=phaseOutputs[i];if(output.integer.textContent!==whole)output.integer.textContent=whole;if(output.fraction.textContent!==fraction)output.fraction.textContent=fraction;}}
function updateTransport(){queueViewSave();$('play').textContent=playing?'暂停动画':'播放动画';$('play').setAttribute('aria-pressed',String(playing));if(!timelineScrubbing)$('timeline').value=progress;updateRangeTrack($('timeline'));let f=easing==='smooth'?progress*progress*(3-2*progress):progress;updatePhaseReadouts();$('time-value').textContent=(progress*duration).toFixed(2)+' / '+duration.toFixed(2)+' s';}

function configurePhaseReadouts(){
 const spiked=activeFormula.id==='spiked-cube';$('phase-values').hidden=false;
 for(let i=0;i<2;i++){
  const output=phaseOutputs[i],panel=output.node.closest('.phase-readout');
  const label=spiked?'Loop0'+(i+1):i===0?'LoopPI':'LoopPI2';
  panel.querySelector('.phase-label span').textContent=label;
  panel.querySelector('.phase-unit').textContent=spiked&&i===0?'deg':'rad';
  panel.querySelector('.phase-cycle').textContent=(i===0?'φ₁':'φ₂')+' / '+(spiked&&i===0?'360°':'2π');
  output.node.setAttribute('aria-label',label+' 当前相位');
 }
}
