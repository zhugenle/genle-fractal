(async()=>{
const result=document.getElementById('result'),frames=[];
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const wait=async(fn)=>{const start=performance.now();while(!fn()){if(performance.now()-start>45000)throw Error('等待绘制超时');await new Promise(r=>setTimeout(r,30));}};
const preview=new GenleGraphPreview(document.getElementById('preview'),{onFrame:f=>frames.push(f)});
const hash=()=>{preview.draw(true);const gl=preview.gl,data=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,data);let h=2166136261,lit=0;for(let i=0;i<data.length;i++){h=Math.imul(h^data[i],16777619);if(i%4!==3&&data[i]>8)lit++;}assert(lit>100,'预览不能只有黑色背景');return h>>>0;};
try{
const draft=GenleDocuments.asDraft(GenleGraph.example('uber'));preview.setDocument('first',draft,{...GenleDocuments.defaultPreview(draft),quality:0});
await wait(()=>frames.some(f=>f.documentId==='first'));const initial=hash(),compiles=preview.stats.compiles,startDraws=preview.stats.draws;
for(let i=0;i<8;i++){preview.patchParameters([{nodeId:'power',key:'Power',value:7-i*.1}],i+1);await new Promise(r=>requestAnimationFrame(r));}
await wait(()=>preview.stats.revision===8);const changed=hash();assert(initial!==changed,'连续调参必须改变实际像素');assert(preview.stats.compiles===compiles,'数值编辑不应触发着色器重编译');assert(preview.stats.draws>=startDraws+5,'拖动期间应持续绘制');
const firstFrames=frames.filter(f=>f.documentId==='first').length;
preview.setDocument('cube',GenleDocuments.asDraft(GenleGraph.example('cube')),null);
preview.setDocument('empty',GenleDocuments.blankDraft(),null);
await new Promise(r=>setTimeout(r,150));assert(preview.docId==='empty'&&!preview.active,'空白文档不得显示旧公式');assert(frames.filter(f=>f.documentId==='first').length===firstFrames,'旧文档不得产生新回执');
preview.setDocument('return',draft,null,11);await wait(()=>frames.some(f=>f.documentId==='return'&&f.revision===11));
result.textContent=JSON.stringify({status:'PASS',pixelHashBefore:initial,pixelHashAfter:changed,parameterPatches:8,parameterCompiles:preview.stats.compiles-compiles-1,drawsDuringEdits:preview.stats.draws-startDraws-1,isolatedDocumentSwitch:true},null,2);
result.dataset.status='pass';preview.dispose();
}catch(e){result.textContent='FAIL: '+e.message;result.dataset.status='fail';preview.dispose();}
})();