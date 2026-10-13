const formulaSessions=new Map();
function formulaById(id){return STUDIO_FORMULAS.find(f=>f.id===id);}
function activateFormula(id,{remember=true}={}){
 const formula=formulaById(id);if(!formula)return false;if(formula===activeFormula)return true;
 if(recorder?.state==='recording'){$('action-status').textContent='请先结束录制再切换公式。';$('formula-select').value=activeFormula.id;return false;}
 if(remember)formulaSessions.set(activeFormula.id,{values:{...values},yaw,pitch,distance});
 activeFormula=formula;groups=studioGroups(formula);renderParameterControls();fields.get('KeyAzimuth').input.closest('details').querySelector('.group-hint').after(lightWidget);
 const common={};for(const g of Object.values(RENDERER_GROUPS))for(const d of g[3])common[d[0]]=values[d[0]];
 const saved=formulaSessions.get(id);values=saved?{...saved.values}:{...reference,...common,...formula.profile.parameters,CameraRoll:formula.profile.camera.roll};
 if(saved)({yaw,pitch,distance}=saved);else ({yaw,pitch,distance}=formula.profile.camera);
 $('formula-select').value=id;configurePhaseReadouts();$('reference-toggle').hidden=id!=='uber-bulb';$('reference-panel').hidden=true;gifButton.hidden=id!=='uber-bulb';
 canvas.setAttribute('aria-label',formula.name+' 3D');
 fields.get('AbsoluteScale').input.dataset.previous=values.AbsoluteScale;
 loadFormulaDevice();renderBudget.resetSamples();submittedFrame=false;dirty=true;sync();updateTransport();return true;
}
$('formula-select').onchange=e=>{cancelPresetTransition();if(activateFormula(e.target.value)){playing=true;referencePreset=false;updateTransport();}};

function presetMetadata(id){const formula=formulaById(id);if(!formula)return null;const definitions=[...studioGroups(formula).flatMap(g=>g[3]),...formula.hidden];const schema=new Map(definitions.map(d=>[d[0],d]));const defaults=Object.fromEntries(definitions.map(d=>[d[0],typeof d[2]==='string'?d[3]:d[5]]));return {schema,reference:{...defaults,...formula.reference,...formula.profile.parameters}};}
