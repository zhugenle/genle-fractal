import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const files=['../../formulas/uber-bulb/nodes.js','../../formulas/spiked-cube/nodes.js','../registry.js','../compiler.js','../examples.js'];
const code=(await Promise.all(files.map(f=>fs.readFile(new URL(f,import.meta.url),'utf8')))).join('\n');
const context=vm.createContext({});vm.runInContext(code,context);const G=context.GenleGraph;
const plain=x=>JSON.parse(JSON.stringify(x));
for(const kind of ['uber','cube','hybrid']){
 const graph=G.example(kind),compiled=G.compile(graph),bindings={};compiled.upload((k,v)=>bindings[k]=v);
 assert(compiled.kernel.includes('for(int gi=0;gi<100;gi++)'));
 assert(!compiled.kernel.includes('@'));
 assert.equal(compiled.uniformNames.length,Object.keys(bindings).length);
 assert(Object.values(bindings).every(v=>v.length===4&&v.every(Number.isFinite)));
 assert.deepEqual(plain(G.unpack(G.package(graph))),plain(graph));
 const moved=plain(graph);moved.nodes[0].position=[124,567];assert.equal(G.compile(moved).kernel,compiled.kernel,'Layout must not compile new math');
 const changed=plain(graph);changed.nodes[0].params.Scale=1.25;assert.equal(G.compile(changed).kernel,compiled.kernel,'Uniform edits must not change shader');
 const b={};G.compile(changed).upload((k,v)=>b[k]=v);assert.notDeepEqual(plain(b),plain(bindings));
}
const original=G.example('uber'),cycle=plain(original);cycle.edges.push({from:'feedback',to:'radial',port:'state'});assert.throws(()=>G.validate(cycle),/只能连接一条线/);
cycle.edges=cycle.edges.filter(e=>!(e.from==='input'&&e.to==='radial'));assert.throws(()=>G.validate(cycle),/反馈环/);
const incomplete=plain(original);incomplete.edges=incomplete.edges.filter(e=>e.to!=='output');assert.throws(()=>G.compile(incomplete),/请连接/);
const outOfRange=plain(original);outOfRange.nodes.find(n=>n.id==='power').params.Power=1000;assert.throws(()=>G.compile(outOfRange),/范围/);
const unknown=plain(original);unknown.nodes[0].version=2;assert.throws(()=>G.compile(unknown),/版本/);
const nan=plain(original);nan.nodes[0].params.Scale=NaN;assert.throws(()=>G.compile(nan));
const p=G.package(original);p.dependencies=[];assert.throws(()=>G.unpack(p),/依赖声明/);
const invalidPublic=plain(original);invalidPublic.parameters[0].max=100;assert.throws(()=>G.compile(invalidPublic),/公开参数范围/);
const branches=G.example('hybrid');assert(G.compile(branches).kernel.includes('GraphOrbit gn'));
const changedOrder=plain(original);const a=changedOrder.edges.find(e=>e.to==='radial'),b=changedOrder.edges.find(e=>e.to==='rotate'),c=changedOrder.edges.find(e=>e.to==='power');a.from='rotate';b.from='input';c.from='radial';assert.notEqual(G.compile(changedOrder).kernel,G.compile(original).kernel,'Rewiring must change evaluated math');
const upload={};const comp=G.compile(original);comp.upload((k,v)=>upload[k]=v,{gp_power_Power:6});assert(Object.values(upload).some(v=>v.includes(6)));
assert.throws(()=>comp.upload(()=>{}, {gp_power_Power:100}),/范围/);
console.log('PASS: free iteration graphs, branching, cycle/type validation, uniform-only edits and formula-package roundtrip.');
// Exercise the real legacy preset Update callback with a custom graph active.
// It must neither mutate a saved item nor persist an unresolved custom-* ID.
const presetSource=await fs.readFile(new URL('../../state/studio-presets.js',import.meta.url),'utf8');
const presetContext=vm.createContext({});
vm.runInContext(`class El{constructor(){this.children=[];}append(...e){this.children.push(...e);}replaceChildren(){this.children=[];}setAttribute(){}}const els={};const $=id=>els[id]??=new El();const document={createElement:()=>new El()};let localPresets=[{id:'original',name:'keep me',state:{formulaId:'uber-bulb',parameters:{Power:8}}}],selectedPreset=null,presetTransition=null;let activeFormula={id:'custom-test',graphCompiled:{}};let writes=0;const localStorage={setItem(){writes++;}};const PRESET_STORAGE='uber-user-presets-v1';function capturePreset(){return {formulaId:activeFormula.id};}`,presetContext);
vm.runInContext(presetSource.slice(presetSource.indexOf('function persistPresets'),presetSource.indexOf('function cancelPresetTransition')),presetContext);
vm.runInContext('renderLocalPresets();',presetContext);
assert.equal(vm.runInContext("$('local-preset-list').children[0].children[1].disabled",presetContext),true);
vm.runInContext("$('local-preset-list').children[0].children[1].onclick();",presetContext);
assert.equal(vm.runInContext('writes',presetContext),0);
assert.equal(vm.runInContext('localPresets[0].state.formulaId',presetContext),'uber-bulb');
vm.runInContext("activeFormula={id:'uber-bulb'};renderLocalPresets();$('local-preset-list').children[0].children[1].onclick();",presetContext);
assert.equal(vm.runInContext('writes',presetContext),1);
assert.equal(vm.runInContext("$('local-preset-list').children[0].children[1].disabled",presetContext),false);
console.log('PASS: custom graph cannot overwrite legacy presets; native preset updates remain usable.');
