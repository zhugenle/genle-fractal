const GRAPH_STORAGE='genle-composer-graph-v1';
class GraphDocument{
 constructor(graph){this.graph=GenleGraph.clone(graph);this.past=[];this.future=[];}
 replace(next,{history=true}={}){if(history){this.past.push(GenleGraph.clone(this.graph));if(this.past.length>60)this.past.shift();this.future=[];}this.graph=GenleGraph.clone(next);}
 undo(){if(!this.past.length)return false;this.future.push(this.graph);this.graph=this.past.pop();return true;}
 redo(){if(!this.future.length)return false;this.past.push(this.graph);this.graph=this.future.pop();return true;}
 save(){try{GenleGraph.validate(this.graph);localStorage.setItem(GRAPH_STORAGE,JSON.stringify(this.graph));return true;}catch(_){return false;}}
 static restore(){try{const text=localStorage.getItem(GRAPH_STORAGE);if(text&&text.length<500000)return GenleGraph.unpack(JSON.parse(text));}catch(_){}return null;}
}
function graphDownload(object,name){const url=URL.createObjectURL(new Blob([JSON.stringify(object,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
