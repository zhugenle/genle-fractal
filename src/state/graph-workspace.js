const DRAFT_SCHEMA='genle-fractal-draft',PROJECT_SCHEMA='genle-fractal-project',WORKSPACE_KEY='genle-composer-workspace-v2';
const documentClone=o=>JSON.parse(JSON.stringify(o));
const newDocumentId=()=> 'd'+crypto.randomUUID().replaceAll('-','');
function validateDraft(raw){
 if(!raw||raw.schema!==DRAFT_SCHEMA||raw.schemaVersion!==1||typeof raw.name!=='string'||raw.name.length>80||!GenleGraph.clone||!/^[a-zA-Z][\w-]{0,63}$/.test(raw.id))throw Error('草稿格式无效。');
 if(!Array.isArray(raw.nodes)||raw.nodes.length>64||!Array.isArray(raw.edges)||raw.edges.length>128||!Array.isArray(raw.parameters)||raw.parameters.length>32)throw Error('草稿超出节点或连接数量限制。');
 const ids=new Set();for(const n of raw.nodes){if(!n||typeof n.id!=='string'||!/^[a-zA-Z][\w-]{0,63}$/.test(n.id)||ids.has(n.id)||typeof n.type!=='string'||!Number.isInteger(n.version)||!Array.isArray(n.position)||n.position.length!==2||!n.position.every(v=>Number.isFinite(v)&&Math.abs(v)<=100000)||!n.params||typeof n.params!=='object'||Array.isArray(n.params))throw Error('草稿节点格式无效。');ids.add(n.id);}
 for(const e of raw.edges)if(!e||!ids.has(e.from)||!ids.has(e.to)||typeof e.port!=='string')throw Error('草稿存在指向缺失节点的连线。');
 if(raw.output!==null&&!ids.has(raw.output))throw Error('草稿输出不存在。');return documentClone(raw);
}
function asDraft(graph,{fresh=false}={}){const g=documentClone(graph);g.schema=DRAFT_SCHEMA;g.schemaVersion=1;g.parameters??=[];if(fresh)g.id=newDocumentId();return validateDraft(g);}
function blankDraft(name='未命名公式'){return {schema:DRAFT_SCHEMA,schemaVersion:1,id:newDocumentId(),name,nodes:[],edges:[],parameters:[],output:null};}
function renderable(draft){
 validateDraft(draft);if(!draft.nodes.length)throw Error('空白画布：添加节点或选择起步图。');
 const nodes=new Map(draft.nodes.map(n=>[n.id,n]));if(!draft.output||!nodes.has(draft.output))throw Error('请添加并连接「循环与距离输出」。');
 const keep=new Set(),visiting=new Set();function visit(id){if(visiting.has(id))throw Error('存在直接反馈环。');if(keep.has(id))return;visiting.add(id);for(const e of draft.edges.filter(e=>e.to===id))visit(e.from);visiting.delete(id);keep.add(id);}visit(draft.output);
 const graph={...documentClone(draft),schema:'genle-fractal-graph',nodes:draft.nodes.filter(n=>keep.has(n.id)).map(n=>documentClone(n)).sort((a,b)=>a.id.localeCompare(b.id)),edges:draft.edges.filter(e=>keep.has(e.to)&&keep.has(e.from)).map(e=>({...e})),parameters:draft.parameters.filter(p=>keep.has(p.nodeId)).map(p=>({...p}))};
 if(graph.nodes.every(n=>['orbit-input','formula-output'].includes(n.type)))throw Error('输入与输出已连接，请加入幂变换或 IFS 等形态算子。');
 return GenleGraph.validate(graph).graph;
}
function graphStructure(graph){return JSON.stringify({output:graph.output,nodes:graph.nodes.map(n=>[n.id,n.type,n.version]),edges:[...graph.edges].sort((a,b)=>(a.to+a.port+a.from).localeCompare(b.to+b.port+b.from))});}
function connectDraft(draft,from,to,port){
 const next=documentClone(draft),a=next.nodes.find(n=>n.id===from),b=next.nodes.find(n=>n.id===to);
 if(!a||!b||a.type==='formula-output'||!GenleGraph.types[b.type]?.inputs.includes(port))throw Error('端口不兼容。');
 next.edges=next.edges.filter(e=>e.to!==to||e.port!==port);next.edges.push({from,to,port});
 const marks=new Map();function visit(id){if(marks.get(id)===1)throw Error('不能直接接成反馈环；请使用历史与常量反馈算子。');if(marks.get(id)===2)return;marks.set(id,1);for(const e of next.edges.filter(e=>e.to===id))visit(e.from);marks.set(id,2);}for(const n of next.nodes)visit(n.id);return next;
}
function defaultPreview(graph){const cube=graph.nodes.find(n=>n.id===graph.output)?.params.Estimator===1;return {camera:{yaw:.8,pitch:cube?.5:.65,distance:cube?28:10.5,roll:cube?0:-35},quality:1,settings:{Bounds:cube?10:4}};}
class FormulaDocument{
 constructor(draft,data={}){this.id=data.id||newDocumentId();this.graph=validateDraft(draft);const e=data.editor||{},p=data.preview||{},base=defaultPreview(draft);if(!/^[a-zA-Z][\w-]{0,63}$/.test(this.id))throw Error('文档 ID 无效。');this.editor={x:Number.isFinite(e.x)?e.x:30,y:Number.isFinite(e.y)?e.y:30,zoom:Number.isFinite(e.zoom)?Math.max(.2,Math.min(2,e.zoom)):.8,selection:Array.isArray(e.selection)?e.selection.filter(id=>draft.nodes.some(n=>n.id===id)):[],positioned:!!e.positioned,viewWidth:Number.isFinite(e.viewWidth)?e.viewWidth:null,viewHeight:Number.isFinite(e.viewHeight)?e.viewHeight:null};this.preview={camera:{...base.camera},quality:[0,1,1.5,2,3].includes(p.quality)?p.quality:base.quality,settings:{...base.settings}};for(const k of ['yaw','pitch','distance','roll'])if(Number.isFinite(p.camera?.[k]))this.preview.camera[k]=p.camera[k];this.preview.camera.distance=Math.max(.5,Math.min(500,this.preview.camera.distance));for(const [k,v]of Object.entries(p.settings||{}))if(Number.isFinite(v))this.preview.settings[k]=v;this.past=Array.isArray(data.past)?data.past.slice(-8).map(validateDraft):[];this.future=[];this.revision=0;this.transaction=null;}
 begin(){if(!this.transaction)this.transaction=documentClone(this.graph);}
 end(){if(!this.transaction)return false;const before=this.transaction;this.transaction=null;if(JSON.stringify(before)===JSON.stringify(this.graph))return false;this.past.push(before);if(this.past.length>40)this.past.shift();this.future=[];return true;}
 change(fn){this.end();this.begin();const next=documentClone(this.graph);fn(next);this.graph=validateDraft(next);this.revision++;this.end();}
 parameter(nodeId,key,value){const n=this.graph.nodes.find(n=>n.id===nodeId),d=GenleGraph.types[n?.type]?.params.find(p=>p[0]===key);if(!d||!Number.isFinite(value)||value<d[2]||value>d[3]||(d[4]===1&&!Number.isInteger(value)))throw Error('参数超出范围。');const p=this.graph.parameters.find(p=>p.nodeId===nodeId&&p.key===key);if(p&&(value<p.min||value>p.max))throw Error('参数超出公开范围。');this.begin();n.params[key]=value;if(p)p.defaultValue=value;this.revision++;}
 undo(){this.end();if(!this.past.length)return false;this.future.push(this.graph);this.graph=this.past.pop();this.revision++;return true;}
 redo(){this.end();if(!this.future.length)return false;this.past.push(this.graph);this.graph=this.future.pop();this.revision++;return true;}
 serialize(){return {id:this.id,graph:documentClone(this.graph),editor:documentClone(this.editor),preview:documentClone(this.preview),past:this.past.slice(-8).map(documentClone)};}
}
class FormulaWorkspace{
 constructor(data){this.documents=[];this.closed=[];this.activeId=null;this.serial=0;if(data)this.load(data);}
 get active(){return this.documents.find(d=>d.id===this.activeId);}
 add(kind='blank',source=null){if(this.documents.length>=32)throw Error('最多打开 32 份文档。');const graph=kind==='blank'?blankDraft('未命名公式 '+(this.documents.length+1)):asDraft(source||GenleGraph.example(kind),{fresh:true});const d=new FormulaDocument(graph);d.editor.needsLayout=!['blank','copy'].includes(kind);this.documents.push(d);this.activeId=d.id;this.serial++;return d;}
 duplicate(id=this.activeId){const source=this.documents.find(d=>d.id===id);if(!source)throw Error('文档不存在。');source.end();const copy=this.add('copy',source.graph);copy.editor=documentClone(source.editor);copy.preview=documentClone(source.preview);return copy;}
 activate(id){if(!this.documents.some(d=>d.id===id))throw Error('文档不存在。');this.active?.end();this.activeId=id;this.serial++;return this.active;}
 close(id){const i=this.documents.findIndex(d=>d.id===id);if(i<0)return;this.documents[i].end();this.closed.push(this.documents[i].serialize());this.closed=this.closed.slice(-8);this.documents.splice(i,1);if(!this.documents.length)this.add();else if(this.activeId===id)this.activeId=this.documents[Math.min(i,this.documents.length-1)].id;this.serial++;}
 reopen(){if(!this.closed.length)return null;if(this.documents.length>=32)throw Error('最多打开 32 份文档。');const data=this.closed.pop(),d=new FormulaDocument(data.graph,data);this.documents.push(d);this.activeId=d.id;this.serial++;return d;}
 serialize(){return {schema:PROJECT_SCHEMA,schemaVersion:1,activeId:this.activeId,documents:this.documents.map(d=>d.serialize()),closed:this.closed,serial:this.serial};}
 load(data){if(data?.schema!==PROJECT_SCHEMA||data.schemaVersion!==1||!Array.isArray(data.documents)||!data.documents.length||data.documents.length>32)throw Error('项目格式无效。');const docs=data.documents.map(d=>new FormulaDocument(d.graph,d));if(new Set(docs.map(d=>d.id)).size!==docs.length)throw Error('文档 ID 重复。');this.documents=docs;this.activeId=docs.some(d=>d.id===data.activeId)?data.activeId:docs[0].id;this.closed=Array.isArray(data.closed)?data.closed.slice(-8).filter(d=>{try{new FormulaDocument(d.graph,d);return true;}catch(_){return false;}}):[];this.serial=Number.isSafeInteger(data.serial)&&data.serial>=0?data.serial:0;}
}
class WorkspaceRepository{
 constructor(){this.db=null;this.kind='';}
 async open(){if(!globalThis.indexedDB)return;try{this.db=await new Promise((resolve,reject)=>{const q=indexedDB.open('genle-composer-workspaces',1);q.onupgradeneeded=()=>q.result.createObjectStore('workspace');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});this.kind='IndexedDB';}catch(_){}}
 async read(){await this.open();let backup=null;try{backup=JSON.parse(localStorage.getItem(WORKSPACE_KEY)||'null');}catch(_){}if(this.db){const data=await new Promise((resolve,reject)=>{const q=this.db.transaction('workspace').objectStore('workspace').get('current');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});if(data)return backup?.serial>data.serial?backup:data;}return backup;}
 checkpoint(data){if(!this.recovery)localStorage.setItem(WORKSPACE_KEY,JSON.stringify(data));}
 async write(data){if(this.recovery)throw Error('恢复模式保留原存储，请先下载项目。');if(this.db){await new Promise((resolve,reject)=>{const t=this.db.transaction('workspace','readwrite');t.objectStore('workspace').put(data,'current');t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});return 'IndexedDB';}localStorage.setItem(WORKSPACE_KEY,JSON.stringify(data));return '本地存储';}
}
globalThis.GenleDocuments=Object.freeze({FormulaDocument,FormulaWorkspace,WorkspaceRepository,validateDraft,asDraft,blankDraft,renderable,structure:graphStructure,connect:connectDraft,defaultPreview,download:graphDownload});
