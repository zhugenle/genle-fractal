function initialStudioQuality(){const mobile=navigator.userAgentData?.mobile===true||/Android|iPhone|iPod|Mobile/i.test(navigator.userAgent)||matchMedia('(max-width: 760px) and (pointer: coarse)').matches;return mobile?1.5:2;}
function restoreStudioOpening(){values={...reference,CameraRoll:activeFormula.profile.camera.roll};({yaw,pitch,distance}=activeFormula.profile.camera);progress=activeFormula.profile.animation?.progress??(activeFormula.id==='uber-bulb'?(1.695-reference.LoopPI)/(1.695-.129):0);playing=true;motion='reference';duration=activeFormula.profile.animation?.duration??20;easing='linear';quality=initialStudioQuality();referencePreset=true;$('duration').value=duration;$('uber-quality').value=quality;$('action-status').textContent='';}
function updateRangeTrack(input){const span=Number(input.max)-Number(input.min),fraction=span>0?Math.max(0,Math.min(1,(Number(input.value)-Number(input.min))/span)):0;input.style.setProperty("--range-position","calc("+fraction*100+"% + "+(1-2*fraction)+"px)");}
function sync(){for(const [key,{input,range}] of fields){if(input.type==='checkbox')input.checked=!!values[key];else if(input.type==='color'){input.value=colorHex(values[key]);$('hex-'+key).value=input.value;$('hex-'+key).setAttribute('aria-invalid','false');}else input.value=values[key];if(range){range.value=values[key];updateRangeTrack(range);}}drawLightBall();updatePhaseReadouts();}
function change(key,value){cancelPresetTransition();if(LOCKED_PHASES.has(key))return;const def=schema.get(key);if(!Number.isFinite(value)){sync();return;}if(typeof def[2]==='string')value=def[2]==='bool'?Number(!!value):Math.max(0,Math.min(def[4].length-1,Math.round(value)));else value=Math.max(def[2],Math.min(def[3],value));if(['Iterations','ColorIterations'].includes(key)||isMaterialColor(key)||(activeFormula.graphCompiled&&key.startsWith('gp_')&&def[4]===1))value=Math.round(value);values[key]=value;if(key==='MinRad'&&values.MinRad>values.MaxRad)values.MaxRad=values.MinRad;if(key==='MaxRad'&&values.MaxRad<values.MinRad)values.MinRad=values.MaxRad;if(key==='AbsoluteScale')distance*=Math.max(.01,fields.get(key).input.dataset.previous||.6)/value;fields.get('AbsoluteScale').input.dataset.previous=values.AbsoluteScale;if(key==='LoopPI'||key==='LoopPI2'){playing=false;motion='spin';$('motion').value=motion;progress=0;updateTransport();$('action-status').textContent='已暂停关键帧动画，现在直接调整相位。';}referencePreset=false;sync();dirty=true;}


function resetParameterGroup(name){
 const group=groups.find(g=>g[0]===name);if(!group)return;
 cancelPresetTransition();const previousScale=values.AbsoluteScale;
 for(const [key] of group[3])values[key]=key==='CameraRoll'?activeFormula.profile.camera.roll:reference[key];
 if(group[3].some(d=>d[0]==='AbsoluteScale'))distance=Math.max(.5,Math.min(500,distance*previousScale/values.AbsoluteScale));
 fields.get('AbsoluteScale').input.dataset.previous=values.AbsoluteScale;
 referencePreset=false;sync();dirty=true;updateTransport();
}
