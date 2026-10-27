$('record').onclick=()=>{if(!ready||mp4Preparing)return;if(recorder?.state==='recording'){recorder.stop();return;}const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>typeof MediaRecorder!=='undefined'&&MediaRecorder.isTypeSupported(m));if(!mime||!canvas.captureStream){$('action-status').textContent='此浏览器不支持 WebM 录制；可保存图片。';return;}recordState={started:performance.now(),playing,progress};progress=0;playing=true;updateTransport();recordingDimensions=null;draw();recordingDimensions={...lastRenderDimensions};$('snapshot').disabled=true;$('record-mp4').disabled=true;const stream=canvas.captureStream(30),chunks=[];recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());download(new Blob(chunks,{type:mime}),activeFormula.id+'-loop.webm');playing=recordState.playing;progress=recordState.progress;dirty=true;updateTransport();$('record').textContent='录制一圈 WebM';$('action-status').textContent='录制已保存；流畅程度取决于当前设备的渲染速度。';recorder=null;recordingDimensions=null;$('snapshot').disabled=false;$('record-mp4').disabled=false;renderBudget.resetSamples();};recorder.onerror=()=>{$('action-status').textContent='录制失败，请降低画质后重试。';};recorder.start();$('record').textContent='结束录制';$('action-status').textContent='正在录制一个 '+duration.toFixed(1)+' 秒循环…';};


const mp4Button=$('record-mp4');let mp4Preparing=false;
function abortMP4Export(){if(recordState?.offline)recordState.cancelled=true;}
mp4Button.dataset.codec='webcodecs-avc';
mp4Button.onclick=async()=>{
 if(recordState?.offline){abortMP4Export();return;}
 if(!ready||recorder||mp4Preparing)return;
 if(typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined'){
  $('action-status').textContent=window.isSecureContext?'此浏览器不支持逐帧 H.264 编码，请使用新版 Chrome 或 Edge。':'逐帧导出需要安全连接，请在本机打开 http://127.0.0.1:4177/ 或使用 HTTPS。';return;
 }
 mp4Preparing=true;mp4Button.disabled=true;
 const stage=canvas.closest('.studio-stage');let session,encoder,encodingError;
 try{
  const config={codec:'avc1.420029',width:1440,height:1440,framerate:30,bitrate:32000000,latencyMode:'realtime',avc:{format:'avc'}};
  const supported=await VideoEncoder.isConfigSupported(config);
  if(!supported.supported)throw Error('此浏览器不支持逐帧 H.264 编码，请使用新版 Chrome 或 Edge。');
  await document.fonts.load('400 30px StudioCode');await document.fonts.ready;if(!ready||document.hidden)throw Error('MP4 导出失败，请降低画质后重试。');
  cancelPresetTransition();
  const fps=30,total=Math.round(duration*fps);
  session={offline:true,playing,progress,duration,formulaId:activeFormula.id,cancelled:false,controls:[],adaptive:adaptiveRendering};recordState=session;
  stage.classList.add('mp4-export-square');stage.style.setProperty('--export-width',stage.getBoundingClientRect().width+'px');
  const rect=canvas.getBoundingClientRect();viewportSize.width=rect.width;viewportSize.height=rect.height;
  playing=true;adaptiveRendering=false;adaptiveControl.checked=false;
  recordingDimensions=mp4RenderDimensions(quality);
  if(recordingDimensions.width>renderBudget.maxDimension)throw Error('GPU export size unsupported');
  for(const el of document.querySelectorAll('.studio button,.studio input,.studio select')){if(el===mp4Button)continue;session.controls.push([el,el.disabled]);el.disabled=true;}
  mp4Button.disabled=false;mp4Button.textContent='取消 MP4 导出';
  mp4Button.dataset.frames='0';mp4Button.dataset.totalFrames=String(total);
  const capture=createViewportCapture(1440,{accent:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),language:document.documentElement.lang}),muxer=createAVCMP4(1440,1440,fps,total);
  const exportQualityLabel=$('uber-quality').selectedOptions[0].textContent;
  encoder=new VideoEncoder({output(chunk,metadata){try{muxer.add(chunk,metadata);}catch(e){encodingError=e;}},error(e){encodingError=e;}});encoder.configure(supported.config);
  for(let i=0;i<total;i++){
   // Yield between frames for input/cancel and DOM layout, never for video timing.
   await new Promise(resolve=>setTimeout(resolve,0));
   if(session.cancelled)break;
   if(!ready)throw Error('图形连接已中断，请刷新页面重新启动。');
   if(encodingError)throw encodingError;
   progress=i/total;updateTransport();
   $('render-status').textContent=activeFormula.name+' · '+(quality===3?'ULTRA · 2× SSAA':'Q'+recordingDimensions.shaderQuality)+' · '+(i+1)+' / '+total+' frames';
   draw();
   if(lastRenderAdaptive||lastRenderDimensions.width!==recordingDimensions.width||lastRenderDimensions.height!==recordingDimensions.height||lastRenderDimensions.shaderQuality!==recordingDimensions.shaderQuality)throw Error('Export quality mismatch');
   mp4Button.dataset.renderSize=canvas.width+'×'+canvas.height;mp4Button.dataset.shaderQuality=String(lastRenderDimensions.shaderQuality);mp4Button.dataset.adaptive=String(lastRenderAdaptive);
   capture.paint({formulaName:activeFormula.name,spiked:activeFormula.id==='spiked-cube',phases:activeFormula.phases(progress,values),frame:i+1,total,progress,duration,qualityLabel:exportQualityLabel});
   const timestamp=Math.round(i*1e6/fps),frameDuration=Math.round((i+1)*1e6/fps)-timestamp;
   const videoFrame=new VideoFrame(capture.canvas,{timestamp,duration:frameDuration});
   try{encoder.encode(videoFrame,{keyFrame:i%60===0});}finally{videoFrame.close();}
   // Flush bounded batches: renderer/encoder speed only changes elapsed export time.
   if(i%4===3)await encoder.flush();
   mp4Button.dataset.frames=String(i+1);mp4Button.dataset.totalFrames=String(total);
   $('action-status').textContent='逐帧导出 MP4 · '+(i+1)+' / '+total+' · '+Math.round((i+1)/total*100)+'%';
  }
  if(!session.cancelled){await encoder.flush();if(encodingError)throw encodingError;download(muxer.finish(),session.formulaId+'-loop-ui-1440.mp4');$('action-status').textContent='MP4 已保存 · H.264 · 1440 × 1440 · 含视窗 UI。';}
  else $('action-status').textContent='已取消 MP4 导出。';
 }catch(e){console.error(e);$('action-status').textContent=session?.cancelled?'已取消 MP4 导出。':e.message==='此浏览器不支持逐帧 H.264 编码，请使用新版 Chrome 或 Edge。'?e.message:'MP4 导出失败，请降低画质后重试。';}
 finally{
  if(encoder&&encoder.state!=='closed')encoder.close();
  stage.classList.remove('mp4-export-square');stage.style.removeProperty('--export-width');
  if(session){playing=session.playing;progress=session.progress;adaptiveRendering=session.adaptive;adaptiveControl.checked=adaptiveRendering;for(const [el,disabled]of session.controls)el.disabled=disabled;}
  recordState=null;recordingDimensions=null;mp4Preparing=false;mp4Button.disabled=!ready;mp4Button.textContent='导出一圈 MP4';
  if(!ready)for(const id of ['play','record','snapshot'])$(id).disabled=true;
  const rect=canvas.getBoundingClientRect();viewportSize.width=rect.width;viewportSize.height=rect.height;
  last=0;lastDrawTime=-Infinity;submittedFrame=false;dirty=true;renderBudget.resetSamples();updateTransport();
 }
};
