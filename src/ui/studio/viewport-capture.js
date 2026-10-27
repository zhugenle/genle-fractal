// A fixed 1440-square design space. No DOM geometry, responsive CSS, DPR or zoom.
function createViewportCapture(size=1440,style={}){
 const output=document.createElement('canvas');output.width=output.height=size;
 const ctx=output.getContext('2d',{alpha:false});
 const accent=style.accent||'#b1ff49',english=style.language==='en';
 const muted='#aaaaaa',ink='#eeeeee',line='#555555';
 const family='StudioCode, "Microsoft YaHei", monospace';
 function text(value,x,y,fontSize=30,color=muted,align='left',maxWidth){
  ctx.font='400 '+fontSize+'px '+family;
  if(maxWidth&&ctx.measureText(value).width>maxWidth)ctx.font='400 '+(fontSize*maxWidth/ctx.measureText(value).width)+'px '+family;
  ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(value,x,y);
 }
 function stroke(points,color=line,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
 function phase(value,index,spiked){
  const right=index===1,x=right?1390:54,y=right?914:322;
  stroke([[x,y],[x,y+214]],line,2);stroke([[x-10,y+70],[x+10,y+70]],accent,3);
  const start=right?1044:88,end=right?1356:394;
  text(spiked?'Loop0'+(index+1):index?'LoopPI2':'LoopPI',start,y+32,30);
  text(spiked&&!index?'deg':'rad',end,y+32,30,muted,'right');
  const parts=Math.abs(value).toFixed(4).split('.'),whole=(value<0?'-':'+')+parts[0],fraction='.'+parts[1];
  ctx.font='400 88px '+family;const wholeWidth=ctx.measureText(whole).width;
  ctx.font='400 46px '+family;const fractionWidth=ctx.measureText(fraction).width;
  const total=wholeWidth+fractionWidth,available=end-start,shrink=Math.min(1,available/total);
  const left=right?end-total*shrink:start;
  text(whole,left,y+136,88*shrink,accent);text(fraction,left+wholeWidth*shrink,y+136,46*shrink,ink);
  text((index?'φ₂':'φ₁')+' / '+(spiked&&!index?'360°':'2π'),right?end:start,y+200,28,muted,right?'right':'left');
 }
 function paint(state){
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,size,size);
  ctx.save();ctx.scale(size/1440,size/1440);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(canvas,0,0,1440,1440);
  text(state.formulaName+' · '+state.frame+' / '+state.total+' frames',42,78,30,muted,'left',1350);
  for(const [label,x]of [['[ ref ]',68],['[ +Y ]',258],['[ −Y ]',438],['[ home ]',618]])text(label,x,162,32,ink);
  for(const [x,y,sx,sy]of [[820,130,1,1],[856,130,-1,1],[820,166,1,-1],[856,166,-1,-1]])stroke([[x,y+sy*11],[x,y],[x+sx*11,y]],ink,3);
  phase(state.phases[0],0,state.spiked);phase(state.phases[1],1,state.spiked);
  text(english?'drag: orbit / wheel: zoom':'拖动旋转 · 滚轮缩放',42,1250,30);
  const sliderX=42,sliderEnd=326,y=1354,thumb=sliderX+(sliderEnd-sliderX)*state.progress;
  if(thumb-8>sliderX)stroke([[sliderX,y],[thumb-8,y]],line,2);
  if(thumb+8<sliderEnd)stroke([[thumb+8,y],[sliderEnd,y]],line,2);
  stroke([[thumb,y-20],[thumb,y+20]],accent,5);
  text((state.progress*state.duration).toFixed(2)+' / '+state.duration.toFixed(2)+' s',375,1365,30);
  text(english?'quality':'画质',680,1365,30);
  ctx.fillStyle='#101010';ctx.fillRect(840,1316,324,78);
  text(state.qualityLabel,858,1365,30,muted,'left',264);
  stroke([[1131,1356],[1140,1365],[1149,1356]],muted,2);
  ctx.strokeStyle=muted;ctx.lineWidth=2;ctx.strokeRect(1200,1337,32,32);
  text(english?'adaptive':'自适应',1244,1365,28,muted,'left',166);
  for(const [x,y,sx,sy]of [[1,7,1,1],[1439,7,-1,1],[1,1439,1,-1],[1439,1439,-1,-1]])stroke([[x,y+sy*18],[x,y],[x+sx*18,y]],muted,1);
  ctx.restore();
 }
 return {canvas:output,paint};
}
