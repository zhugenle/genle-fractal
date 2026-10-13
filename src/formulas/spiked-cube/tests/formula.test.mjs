import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {evaluateWorld} from './reference.mjs';
const dir=new URL('../',import.meta.url),ctx=vm.createContext({});
for(const file of ['parameters.js','animation.js','uniforms.js'])vm.runInContext(await fs.readFile(new URL(file,dir),'utf8'),ctx);
const defaults=vm.runInContext('REFERENCE_FORMULA_PARAMETERS',ctx),groups=vm.runInContext('FORMULA_GROUPS',ctx),hidden=vm.runInContext('FORMULA_HIDDEN_PARAMETERS',ctx);
test('visible controls omit twist; hidden schema retains old preset fields',()=>{
 const visible=Object.values(groups).flatMap(g=>g[3].map(d=>d[0]));assert.ok(!visible.includes('TwistAngle')&&!visible.includes('TwistLoop'));
 assert.deepEqual(Array.from(hidden,d=>d[0]),['TwistAngle','TwistLoop']);assert.equal(defaults.TwistAngle,0);assert.equal(defaults.TwistLoop,1);
 for(const d of [...Object.values(groups).flatMap(g=>g[3]),...hidden]){assert.ok(Number.isFinite(defaults[d[0]]));if(typeof d[2]==='number')assert.ok(defaults[d[0]]>=d[2]&&defaults[d[0]]<=d[3]);}
});
test('one timeline advances both twist and object yaw, with exact closed endpoints',()=>{
 const phases=p=>Array.from(ctx.referencePhases(p,defaults));assert.deepEqual(phases(0),phases(1));assert.deepEqual(phases(0),phases(-1));
 assert.deepEqual(phases(.5),[180,-Math.PI]);assert.deepEqual(phases(.25),[90,-Math.PI/2]);
 const old={...defaults,TwistAngle:17,TwistLoop:0};assert.deepEqual(Array.from(ctx.referencePhases(.5,old)),[17,-Math.PI]);
});
test('uniform mapping uploads both phases without changing stored parameters',async()=>{
 const before=JSON.stringify(defaults),calls=new Map();ctx.uploadFormulaUniforms((n,v)=>calls.set(n,Array.from(v)),defaults,90,Math.PI/2);
 assert.equal(calls.get('SC1')[1],90);assert.equal(calls.get('SC2')[3],Math.PI/2);assert.equal(JSON.stringify(defaults),before);
 const d=JSON.parse(await fs.readFile(new URL('definition.json',dir),'utf8'));assert.deepEqual([...calls.keys()].sort(),d.uniforms.sort());assert.ok([...calls.values()].every(v=>v.length===4&&v.every(Number.isFinite)));
});
test('Y spin rotates geometry about its center, without moving camera or lights',()=>{
 const v={...defaults,AbsoluteX:1,AbsoluteY:-.5,AbsoluteZ:.7},center=[1,.7,-.5];
 for(const p of [[5,2,1],[7,-3,4],[1,.6,.8]])for(const angle of [.4,Math.PI/2,Math.PI]){
  const world=p.map((x,i)=>x+center[i]),rotated=[center[0]+Math.cos(angle)*p[0]+Math.sin(angle)*p[2],world[1],center[2]-Math.sin(angle)*p[0]+Math.cos(angle)*p[2]];
  const a=evaluateWorld(world,v,30,0),b=evaluateWorld(rotated,v,30,angle);assert.ok(Math.abs(a.distance-b.distance)<1e-10);assert.ok(Math.abs(a.trap-b.trap)<1e-9);
 }
 assert.deepEqual(evaluateWorld([5,2,1],defaults,0,0),evaluateWorld([5,2,1],defaults,360,2*Math.PI));
});
test('GPU object rotation samples match CPU and full-turn endpoints',async()=>{
 const report=JSON.parse(await fs.readFile(new URL('gpu-result.json',import.meta.url),'utf8'));
 assert.equal(report.total,20);assert.equal(report.passed,20);assert.equal(report.glError,0);assert.ok(report.maxError<5e-5);
 for(let i=0;i<4;i++)assert.equal(report.results[i].actual,report.results[16+i].actual);
});
