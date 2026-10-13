function frame(t){
if(!ready){const dt=last?(t-last)/1000:0;last=t;if(!document.hidden&&playing){progress=(progress+dt/duration)%1;updateTransport();}requestAnimationFrame(frame);return;}const dt=last?((t-last)/1000):0;last=t;
if(!document.hidden){
  const adapting=adaptiveRendering&&quality!==3&&moving(t)&&!recordingDimensions;
  if(submittedFrame?.adaptive&&adapting&&submittedFrame.shaderQuality===renderBudget.shaderQuality&&!renderBudget.timer&&dt>0&&Math.abs(submittedFrame.factor-renderBudget.factor)<.015)renderBudget.observe(Math.max(dt*1000,lastCpuMs),t);
  submittedFrame=false;renderBudget.poll(t,adapting);
  if(presetTransition)stepPresetTransition(t);
  if(playing){progress=(progress+dt/duration)%1;dirty=true;}
  const dynamic=adaptiveRendering&&quality!==3&&moving(t)&&!recordingDimensions;
  if(dynamic!==wasDynamic){dirty=true;wasDynamic=dynamic;renderBudget.resetSamples();}
  const interval=dynamic||recordingDimensions?1000/30:0;
  if(!snapshotBusy&&dirty&&t-lastDrawTime>=interval-.5){draw();lastDrawTime=t;submittedFrame={adaptive:lastRenderAdaptive,factor:lastRenderDimensions.factor,shaderQuality:lastRenderDimensions.shaderQuality};frameCount++;updateTransport();}
  if(t-fpsTime>1000){const elapsed=Math.max(1,t-fpsTime),fps=Math.round(frameCount*1000/elapsed),percent=lastRenderDimensions?Math.round(lastRenderDimensions.factor/lastRenderDimensions.nativeFactor*100):100;
    $('render-status').textContent=activeFormula.name+' · '+(playing?fps+' fps':'实时三维')+' · '+percent+'%'+(lastRenderAdaptive&&lastRenderDimensions.shaderQuality<[0,1,1.5,2,3].indexOf(quality)?' · 动态 '+['流畅','标准','细致','精细','超精细 · 静帧'][lastRenderDimensions.shaderQuality]:'');
    $('render-status').title=canvas.width+' × '+canvas.height+(renderBudget.gpuMs?' · GPU '+renderBudget.gpuMs.toFixed(1)+' ms':'');fpsTime=t;frameCount=0;
  }
  if(recorder?.state==='recording'&&performance.now()-recordState.started>=duration*1000)recorder.stop();
}
requestAnimationFrame(frame);}
