class GraphError extends Error{constructor(message,nodeId=null){super(message);this.name='GraphError';this.nodeId=nodeId;}}
const graphClone=o=>JSON.parse(JSON.stringify(o));
const graphSafeId=id=>typeof id==='string'&&/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(id);
function nodeParameters(node){const def=GRAPH_NODE_TYPES[node.type];return Object.fromEntries(def.params.map(p=>[p[0],Object.prototype.hasOwnProperty.call(node.params||{},p[0])?node.params[p[0]]:p[5]]));}
function validateGraph(raw){
 if(!raw||raw.schema!=='genle-fractal-graph'||raw.schemaVersion!==1)throw new GraphError('请选择自由节点图 v1 或公式包。');
 if(!Array.isArray(raw.nodes)||raw.nodes.length<2||raw.nodes.length>64||!Array.isArray(raw.edges)||raw.edges.length>128)throw new GraphError('节点数量须为 2–64，连线最多 128 条。');
 if(typeof raw.name!=='string'||raw.name.length>80)throw new GraphError('公式名称过长或缺失。');
 if(!graphSafeId(raw.id))throw new GraphError('图 ID 无效。');
 const graph=graphClone(raw),nodes=new Map(),incoming=new Map();
 for(const node of graph.nodes){
  if(!node||typeof node!=='object')throw new GraphError('节点格式无效。');
  if(!graphSafeId(node.id)||nodes.has(node.id))throw new GraphError('节点 ID 无效或重复。',node.id);
  const def=GRAPH_NODE_TYPES[node.type];if(!Object.hasOwn(GRAPH_NODE_TYPES,node.type)||!def||node.version!==1)throw new GraphError('未知算子或版本：'+node.type,node.id);
  if(!Array.isArray(node.position)||node.position.length!==2||!node.position.every(n=>Number.isFinite(n)&&Math.abs(n)<=100000))throw new GraphError('节点位置无效。',node.id);
  if(node.label!==undefined&&(typeof node.label!=='string'||node.label.length>80))throw new GraphError('节点名称无效。',node.id);
  if(node.params!==undefined&&(!node.params||typeof node.params!=='object'||Array.isArray(node.params)))throw new GraphError('参数格式无效。',node.id);
  const keys=new Set(def.params.map(p=>p[0]));for(const key of Object.keys(node.params||{}))if(!keys.has(key))throw new GraphError('未知参数：'+key,node.id);
  node.params=nodeParameters(node);
  for(const [key,label,min,max,step]of def.params){const v=node.params[key];if(!Number.isFinite(v)||v<min||v>max||(step===1&&!Number.isInteger(v)))throw new GraphError(label+' 超出范围或类型错误。',node.id);}
  if(node.type==='radial-remap'&&node.params.MinRad>node.params.MaxRad)throw new GraphError('MinRad 不能超过 MaxRad。',node.id);
  nodes.set(node.id,node);incoming.set(node.id,{});
 }
 const seeds=graph.nodes.filter(n=>n.type==='orbit-input'),outs=graph.nodes.filter(n=>n.type==='formula-output');
 if(seeds.length!==1||outs.length!==1||outs[0].id!==graph.output)throw new GraphError('每个循环须有一个状态输入和一个指定的距离输出。');
 for(const edge of graph.edges){
  if(!edge||!nodes.has(edge.from)||!nodes.has(edge.to))throw new GraphError('连线指向不存在的节点。');
  const to=nodes.get(edge.to),from=nodes.get(edge.from);if(from.type==='formula-output'||!GRAPH_NODE_TYPES[to.type].inputs.includes(edge.port))throw new GraphError('端口类型不兼容。',to.id);
  if(incoming.get(to.id)[edge.port])throw new GraphError('一个输入端口只能连接一条线。',to.id);
  incoming.get(to.id)[edge.port]=from.id;
 }
 const marks=new Map(),allOrder=[];
 function visit(id){if(marks.get(id)===1)throw new GraphError('不允许直接反馈环；使用历史提交和常量反馈节点。',id);if(marks.get(id)===2)return;marks.set(id,1);for(const source of Object.values(incoming.get(id)))visit(source);marks.set(id,2);allOrder.push(id);}
 for(const node of graph.nodes)visit(node.id);
 const reachable=new Set();function trace(id){if(reachable.has(id))return;reachable.add(id);for(const source of Object.values(incoming.get(id)))trace(source);}trace(graph.output);
 for(const id of reachable){const node=nodes.get(id);for(const port of GRAPH_NODE_TYPES[node.type].inputs)if(!incoming.get(id)[port])throw new GraphError('请连接 '+GRAPH_NODE_TYPES[node.type].label+' 的 '+port+' 输入。',id);}
 if(!reachable.has(seeds[0].id))throw new GraphError('距离输出必须连接到迭代状态输入。',graph.output);
 const order=allOrder.filter(id=>reachable.has(id));if(order.filter(id=>nodes.get(id).type==='bulb-power').length>2)throw new GraphError('首版每轮最多两个球坐标幂算子，避免过高计算成本。');
 if(graph.parameters===undefined)graph.parameters=[];if(!Array.isArray(graph.parameters)||graph.parameters.length>32)throw new GraphError('公开参数最多 32 项。');
 const exposedIds=new Set(),bindings=new Set();
 for(const p of graph.parameters){if(!p||typeof p!=='object')throw new GraphError('公开参数格式无效。');const node=nodes.get(p.nodeId),def=node&&GRAPH_NODE_TYPES[node.type].params.find(d=>d[0]===p.key);const binding=p.nodeId+':'+p.key;
  if(!graphSafeId(p.id)||exposedIds.has(p.id)||bindings.has(binding)||!def||typeof p.label!=='string'||!p.label.trim()||p.label.length>60)throw new GraphError('公开参数绑定无效或重复。',p.nodeId);
  if(![p.min,p.max,p.step,p.defaultValue].every(Number.isFinite)||p.min<def[2]||p.max>def[3]||p.min>p.max||p.step<=0||p.defaultValue<p.min||p.defaultValue>p.max||p.defaultValue!==node.params[p.key]||(def[4]===1&&![p.min,p.max,p.defaultValue,p.step].every(Number.isInteger)))throw new GraphError('公开参数范围必须在原算子范围内，默认值须与节点当前值一致。',p.nodeId);
  exposedIds.add(p.id);bindings.add(binding);
 }
 return {graph,nodes,incoming,order,seed:seeds[0],output:outs[0]};
}
function compileGraph(raw){
 const v=validateGraph(raw),{graph,nodes,incoming,order,seed,output}=v;
 const names=[],bindings=new Map(),declarations=[],source=[],mapping=[];
 for(const id of order){const n=nodes.get(id),def=GRAPH_NODE_TYPES[n.type],prefix='gn'+graph.nodes.indexOf(n),slots=new Map();for(let i=0;i<def.params.length;i++){const name=prefix+'p'+Math.floor(i/4);if(i%4===0){names.push(name);declarations.push('uniform vec4 '+name+';');}slots.set(def.params[i][0],name+'.'+'xyzw'[i%4]);}bindings.set(id,{prefix,slots});}
 const substitute=(id,code)=>code.replace(/@([A-Za-z0-9_]+)/g,(_,key)=>{const slot=bindings.get(id).slots.get(key);if(!slot)throw new GraphError('算子绑定缺失：'+key,id);return slot;});
 source.push(`struct GraphOrbit{vec3 z;vec3 c;vec3 oldz;vec3 prevz;vec3 oz;float dr;float acc;float trap;float r;float scale;float cDerivative;int iteration;bool stopped;};`);
 const init=substitute(seed.id,`GraphOrbit s;vec3 local=world-vec3(@X,@Z,@Y);float cy=cos(@Yaw),sy=sin(@Yaw);local.xz=vec2(cy*local.x-sy*local.z,sy*local.x+cy*local.z);s.z=@Scale*vec3(local.x,local.z,local.y);s.c=s.z;if(@Canonical>.5){s.c=abs(s.c);float t;if(s.c.y>s.c.x){t=s.c.x;s.c.x=s.c.y;s.c.y=t;}if(s.c.z>s.c.x){t=s.c.x;s.c.x=s.c.z;s.c.z=t;}if(s.c.z>s.c.y){t=s.c.y;s.c.y=s.c.z;s.c.z=t;}}if(@Julia>.5)s.c=vec3(@JuliaX,@JuliaY,@JuliaZ);s.cDerivative=@Julia>.5?0.:1.;s.oldz=vec3(0.);s.prevz=vec3(0.);s.oz=vec3(0.);s.dr=1.;s.acc=1.;s.trap=10000.;s.r=0.;s.scale=@Scale;s.iteration=0;s.stopped=false;`);
 // Linear paths mutate one state; fork edges get explicit snapshots. This avoids
 // chains of struct-returning GLSL functions and expensive driver inlining.
 const statements=[],states=new Map(),uses=new Map(order.map(id=>[id,0]));for(const edge of graph.edges)if(uses.has(edge.to))uses.set(edge.from,(uses.get(edge.from)||0)+1);
 for(const id of order){const n=nodes.get(id),def=GRAPH_NODE_TYPES[n.type];if(n.type==='orbit-input'){states.set(id,'s');continue;}if(n.type==='formula-output')continue;
  const inputs=def.inputs.map(port=>incoming.get(id)[port]),parent=inputs[0],reuse=uses.get(parent)===1,state=reuse?states.get(parent):bindings.get(id).prefix+'v';
  if(!reuse)statements.push('GraphOrbit '+state+'='+states.get(parent)+';');
  const math=substitute(id,def.glsl).replace(/\bs\b/g,state).replace(/\bother\b/g,states.get(inputs[1])||'s');
  mapping.push({nodeId:id,statement:statements.length});statements.push('{if(!'+state+'.stopped){'+math+'}}');states.set(id,state);
 }
 const result=states.get(incoming.get(output.id).state);
 source.push('vec2 graphField(vec3 world){'+init+'for(int gi=0;gi<100;gi++){if(float(gi)>='+bindings.get(output.id).slots.get('Iterations')+')break;s.iteration=gi;'+statements.join('')+'s='+result+';if(s.stopped||s.dr>1e25)break;}'+substitute(output.id,`float d;if(@Estimator<.5)d=.5*log(max(s.r,1e-8))*s.r/max(s.dr,1e-8);else{float axis=max(max(abs(s.z.x),abs(s.z.y)),abs(s.z.z));float divisor=mix(s.acc,max(s.acc,s.dr),@Safety);d=(axis-.5)/max(divisor,1e-12);}if(!(abs(d)<1e20)||!all(lessThan(abs(s.z),vec3(1e30))))return vec2(1e6,0.);return vec2(d/max(s.scale,.0001),s.trap);`)+'}');
 source.push('vec2 evaluateFormula(vec3 world){vec2 r=graphField(A.w*(world-vec3(A.x,A.z,A.y)));r.x/=max(A.w,.0001);return r;}');
 const kernel=declarations.join('\n')+'\n'+source.join('\n');
 function upload(set,exposed={}){for(const id of order){const node=nodes.get(id),defs=GRAPH_NODE_TYPES[node.type].params,params={...node.params};for(const p of graph.parameters.filter(p=>p.nodeId===id)){const value=exposed['gp_'+p.id]??params[p.key];if(!Number.isFinite(value)||value<p.min||value>p.max)throw new GraphError('公开参数超出范围。',id);params[p.key]=value;}const slots=bindings.get(id);for(let i=0;i<defs.length;i+=4)set(slots.prefix+'p'+i/4,Array.from({length:4},(_,j)=>defs[i+j]?params[defs[i+j][0]]:0));}}
 const unused=graph.nodes.length-order.length;return {graph,kernel,uniformNames:names,upload,mapping,parameterDefinitions:graph.parameters.map(p=>['gp_'+p.id,p.label,p.min,p.max,p.step,nodes.get(p.nodeId).params[p.key]]),diagnostics:{distanceKind:'heuristic',nodes:order.length,unused,uniformVectors:names.length,iterations:output.params.Iterations,warnings:[...(unused?[unused+' 个未接入输出的节点不参与计算。']:[]),'混合迭代使用近似距离估计；必要时降低步进系数。']}};
}
function graphConnect(raw,from,to,port){const next=graphClone(raw);next.edges=next.edges.filter(e=>e.to!==to||e.port!==port);next.edges.push({from,to,port});validateGraph(next);return next;}
function graphPackage(raw){const {graph}=validateGraph(raw);return {schema:'genle-fractal-formula',schemaVersion:1,manifest:{formulaId:'custom-'+(graph.id||'formula'),name:graph.name,engine:'genle-iterate-v1',distanceKind:'heuristic',attribution:['UBER BULB © 2020 Machina-Infinitum','SPIKED CUBE IFS: user-supplied OSL']},dependencies:[...new Set(graph.nodes.map(n=>n.type))].sort().map(type=>({type,version:1})),graph};}
function graphUnpack(raw){if(raw?.schema==='genle-fractal-graph')return validateGraph(raw).graph;if(raw?.schema!=='genle-fractal-formula'||raw.schemaVersion!==1||raw.manifest?.engine!=='genle-iterate-v1'||!Array.isArray(raw.dependencies))throw new GraphError('无法读取此公式包。');for(const dep of raw.dependencies)if(!dep||!Object.hasOwn(GRAPH_NODE_TYPES,dep.type)||dep.version!==1)throw new GraphError('缺少算子版本：'+dep.type);const graph=validateGraph(raw.graph).graph;for(const node of graph.nodes)if(!raw.dependencies.some(d=>d.type===node.type&&d.version===node.version))throw new GraphError('公式包缺少依赖声明：'+node.type);return graph;}
