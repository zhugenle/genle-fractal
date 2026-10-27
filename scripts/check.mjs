import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {assemble,inProject} from './build.mjs';
await import('../src/renderer/tests/render-budget.test.mjs');
const {outputs,config,formula}=await assemble();
assert(Array.isArray(formula.uniforms)&&new Set(formula.uniforms).size===formula.uniforms.length,'Formula uniforms must be unique');
assert(formula.uniforms.every(name=>typeof name==='string'&&/^[A-Za-z_]\w*$/.test(name)),'Invalid formula uniform name');
for(const [kind,file]of Object.entries({kernel:'kernel.glsl',parameters:'parameters.js',animation:'animation.js',uniforms:'uniforms.js'}))assert.equal(formula.files?.[kind],file,'v1 requires standard formula files');
for(const [name,bytes]of outputs)if(name.endsWith('.js'))new vm.Script(bytes.toString(),{filename:name});
for(const name of Object.keys(config.shaders)){
 const source=outputs.get(name).toString();
 assert.equal((source.match(/vec2 evaluateFormula\s*\(/g)||[]).length,1,name+' needs exactly one formula kernel');
 assert(source.includes('void main()'),name+' needs a renderer entrypoint');
 assert(source.includes('float scene('),name+' needs shared distance plumbing');
}
for(const profile of ['studio','node-legacy']){
 const parts=[`src/formulas/${formula.id}/parameters.js`,`src/formulas/${formula.id}/animation.js`,`src/formulas/${formula.id}/uniforms.js`,profile==='studio'?'src/renderer/parameters.js':'src/renderer/profiles/node-legacy/parameters.js','src/state/camera-parameters.js',profile==='studio'?'src/ui/studio/parameter-groups.js':'src/ui/nodes/parameter-groups.js'];
 const code=(await Promise.all(parts.map(p=>fs.readFile(inProject(p),'utf8')))).join('\n');
 const data=vm.runInNewContext('const TAU=Math.PI*2;\n'+code+`;const d={};const ids=new Set();for(const group of groups)for(const p of group[3]){if(ids.has(p[0]))throw Error('Duplicate parameter '+p[0]);ids.add(p[0]);d[p[0]]=typeof p[2]==='string'?p[3]:p[5];}const v={...d,...REFERENCE_FORMULA_PARAMETERS};const bindings={};uploadFormulaUniforms((name,value)=>bindings[name]=value,v,...referencePhases(0,v));({v,groups,bindings,phases:referencePhases(1,v),start:referencePhases(0,v)})`);
 for(const group of data.groups)for(const [key,label,min,max,step,value]of group[3]){
  assert(typeof key==='string'&&key&&typeof label==='string',profile+' has an invalid parameter label');
  if(typeof min==='string'){
   assert(['bool','select'].includes(min),'Invalid parameter kind '+key);
   const options=min==='bool'?[0,1]:step?.map(o=>o[1]);
   assert(Array.isArray(options)&&options.length&&new Set(options).size===options.length&&options.every((n,i)=>Number.isInteger(n)&&n===i),'Invalid enum '+key);
   assert(options.includes(max)&&options.includes(data.v[key]),'Invalid enum default '+key);
  }else{
   assert([min,max,step,value,data.v[key]].every(Number.isFinite)&&min<=max&&step>0,'Invalid numeric metadata '+key);
   assert(value>=min&&value<=max&&data.v[key]>=min&&data.v[key]<=max,'Out-of-range default '+key);
  }
 }
 assert.deepEqual(Object.keys(data.bindings).sort(),[...formula.uniforms].sort());
 for(const [name,value]of Object.entries(data.bindings))assert(value.length===4&&value.every(Number.isFinite),'Invalid binding '+name);
 assert(data.phases.every((n,i)=>Number.isFinite(n)&&n===data.start[i]),'Formula animation must close exactly');
 if(formula.id==='uber-bulb'){assert.equal(data.v.ZMultiplier,-.276102);assert.equal(data.v.Power,8);}
}
for(const [name,bytes]of outputs)if(name.endsWith('.html')){
 const html=bytes.toString();
 for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const ref=m[1];if(ref==='./'||ref.startsWith('http')||ref.startsWith('data:')||ref.startsWith('/'))continue;
  assert(outputs.has(ref.split(/[?#]/)[0]),name+' references missing asset '+ref);
 }
}
console.log('PASS: JavaScript bundles, shared formula contract, parameter bindings, closed phase loop and local asset references.');

const registrySource=outputs.get('uber.js').toString().split('/* source: src/renderer/webgl-device.js */')[0];
const registry=vm.runInNewContext(registrySource+'\nreturn STUDIO_FORMULAS;\n})();');
for(const entry of registry){
 assert(entry.profile&&['yaw','pitch','distance','roll'].every(k=>Number.isFinite(entry.profile.camera?.[k])),'Formula opening profile must reach the generated studio registry');
 const meta=JSON.parse(await fs.readFile(inProject('src/formulas/'+entry.id+'/definition.json'),'utf8'));
 const definitions=[...Object.values(entry.groups).flatMap(g=>g[3]),...entry.hidden];
 const values={...Object.fromEntries(definitions.map(d=>[d[0],typeof d[2]==='string'?d[3]:d[5]])),...entry.reference};
 assert.equal(new Set(definitions.map(d=>d[0])).size,definitions.length);
 const bindings={};entry.upload((name,v)=>bindings[name]=v,values,...entry.phases(0,values));
 assert.deepEqual(Object.keys(bindings).sort(),[...meta.uniforms].sort());
 for(const binding of Object.values(bindings))assert(binding.every(Number.isFinite));
 assert.deepEqual(Array.from(entry.phases(0,values)),Array.from(entry.phases(1,values)));
}
console.log('PASS: all studio formula registrations, hidden defaults, uniform adapters and closed animations.');

const context=vm.createContext({STUDIO_FORMULAS:registry,TAU:Math.PI*2});
for(const file of ['src/renderer/parameters.js','src/state/camera-parameters.js','src/ui/studio/parameter-groups.js'])vm.runInContext(await fs.readFile(inProject(file),'utf8'),context);
const formulaControl=await fs.readFile(inProject('src/ui/studio/formula-control.js'),'utf8');
vm.runInContext(formulaControl.slice(formulaControl.indexOf('function formulaById'),formulaControl.indexOf('function activateFormula'))+formulaControl.slice(formulaControl.indexOf('function presetMetadata')),context);
const presetSource=await fs.readFile(inProject('src/state/studio-presets.js'),'utf8');
vm.runInContext(presetSource.slice(presetSource.indexOf('function sanitizePreset'),presetSource.indexOf('function persistPresets')),context);
for(const entry of registry){
 const state={formulaId:entry.id,parameters:entry.reference,camera:{yaw:0,pitch:0,distance:28},animation:{duration:20,progress:.5,playing:true},quality:1.5};
 context.testState=state;const result=vm.runInContext('sanitizePreset(testState)',context);assert.equal(result.formulaId,entry.id);assert(Object.values(result.parameters).every(Number.isFinite));
 if(entry.id==='spiked-cube'){assert.equal(result.parameters.TwistLoop,1);context.testState={...state,parameters:{...entry.reference,CubeScale:10}};assert.equal(vm.runInContext('sanitizePreset(testState)',context),null);}
}
context.testState={parameters:{Power:8},camera:{yaw:0,pitch:0,distance:10},animation:{duration:20,progress:0,playing:true},quality:2};
assert.equal(vm.runInContext('sanitizePreset(testState).formulaId',context),'uber-bulb');
console.log('PASS: legacy presets, cross-formula identities and hidden SPIKED fields.');
await import('../src/graph/tests/graph.test.mjs');

await import('../src/state/tests/mp4-muxer.test.mjs');

await import('../src/state/tests/graph-workspace.test.mjs');
