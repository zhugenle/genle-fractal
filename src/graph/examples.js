function graphExample(kind='uber'){
 const cube=kind==='cube',hybrid=kind==='hybrid';const nodes=[],edges=[];
 function add(id,type,params={},x=0,y=0){nodes.push({id,type,version:1,params,position:[x,y]});return id;}
 function chain(ids){for(let i=1;i<ids.length;i++)edges.push({from:ids[i-1],to:ids[i],port:'state'});}
 add('input','orbit-input',{Scale:cube?1:.6,Canonical:cube?1:0},40,120);
 if(cube){
  add('absolute','absolute-fold',{},310,120);add('sort','axis-sort',{},580,120);add('spike','spike-fold',{},850,120);add('ridge','ridge-clamp',{},1120,120);add('offset','offset-fold',{},1390,120);add('affine','ifs-affine',{},1660,120);add('twist','twist',{},1930,120);add('rotate','rotate',{},2200,120);add('trap','orbit-trap',{Mode:1},2470,120);add('escape','escape',{},2740,120);add('output','formula-output',{Iterations:16,Estimator:1},3010,120);
  chain(nodes.map(n=>n.id));
 }else{
  add('radial','radial-remap',{},310,120);add('rotate','rotate',{},580,120);add('power','bulb-power',{},850,120);add('history','history-add',{},1120,120);add('commit','history-commit',{},1390,120);add('feedback','constant-feedback',{},1660,120);add('trap','orbit-trap',{},1930,120);add('output','formula-output',{},2200,120);chain(nodes.map(n=>n.id));
  if(hybrid){add('fold','absolute-fold',{},580,480);add('sort','axis-sort',{},850,480);add('spike','spike-fold',{SpikeHeight:.7,SpikeSharpness:1.2},1120,480);add('mix','state-mix',{Weight:.16},1390,480);edges.splice(edges.findIndex(e=>e.to==='history'),1);chain(['input','fold','sort','spike']);edges.push({from:'power',to:'mix',port:'a'},{from:'spike',to:'mix',port:'b'},{from:'mix',to:'history',port:'state'});}
 }
 const name=hybrid?'折叠 × 球面幂':cube?'SPIKED CUBE · 算子还原':'UBER BULB · 算子还原';
 nodes.forEach((node,i)=>{const row=Math.floor(i/3),col=row%2?2-i%3:i%3;node.position=[40+col*310,60+row*230];});
 const graph={schema:'genle-fractal-graph',schemaVersion:1,id:kind+'-study',name,nodes,edges,output:'output',parameters:[]};
 const published=cube?[['spike','SpikeHeight'],['spike','SpikeSharpness'],['affine','Scale']]:[['power','Power'],['power','LoopPI'],['power','LoopPI2']];
 for(const [nodeId,key]of published){const node=nodes.find(n=>n.id===nodeId),def=GRAPH_NODE_TYPES[node.type].params.find(d=>d[0]===key);graph.parameters.push({id:nodeId+'_'+key,label:def[1],nodeId,key,min:def[2],max:def[3],step:def[4],defaultValue:node.params[key]??def[5]});}
 return validateGraph(graph).graph;
}
globalThis.GenleGraph=Object.freeze({types:GRAPH_NODE_TYPES,GraphError,validate:validateGraph,compile:compileGraph,connect:graphConnect,package:graphPackage,unpack:graphUnpack,example:graphExample,parameters:nodeParameters,clone:graphClone});
