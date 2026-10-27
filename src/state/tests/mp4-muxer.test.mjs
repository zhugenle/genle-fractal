import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile(new URL('../mp4-muxer.js',import.meta.url),'utf8');
const create=vm.runInNewContext(source+';createAVCMP4',{Uint8Array,Blob});
function boxes(b,start=0,end=b.length){const result=[];for(let p=start;p<end;){const size=b.readUInt32BE(p);assert(size>=8&&p+size<=end);result.push({type:b.toString('ascii',p+4,p+8),p,size});p+=size;}return result;}
function find(b,path){let range={p:-8,size:b.length+8};for(const name of path){range=boxes(b,range.p+8,range.p+range.size).find(x=>x.type===name);assert(range,name);}return range.p;}
const mux=create(1080,1080,30,600);
const description=new Uint8Array([1,66,0,40,255,225,0,0]);
// Decoder order can differ from presentation order; ctts preserves the timestamps.
const order=[0,2,1,...Array.from({length:597},(_,i)=>i+3)];
for(const frame of order)mux.add({byteLength:4,type:frame%60===0?'key':'delta',timestamp:Math.round(frame*1e6/30),copyTo(out){out.set([0,0,0,0]);}},{decoderConfig:{description}});
const b=Buffer.from(await mux.finish().arrayBuffer());
assert.deepEqual(boxes(b).map(x=>x.type),['ftyp','moov','mdat']);
const root=['moov','trak','mdia','minf','stbl'];
let p=find(b,[...root,'stts']);assert.equal(b.readUInt32BE(p+16),600);assert.equal(b.readUInt32BE(p+20),3000);
p=find(b,['moov','mvhd']);assert.equal(b.readUInt32BE(p+20),90000);assert.equal(b.readUInt32BE(p+24),1800000);
p=find(b,[...root,'stsz']);assert.equal(b.readUInt32BE(p+16),600);
p=find(b,[...root,'ctts']);assert.equal(b[p+8],1);assert.equal(b.readInt32BE(p+28),3000);assert.equal(b.readInt32BE(p+36),-3000);
p=find(b,[...root,'stco']);const payload=b.readUInt32BE(p+16);assert.equal(payload,find(b,['mdat'])+8);assert.equal(b.length-payload,600*4);
assert.throws(()=>create(1080,1080,30,600).finish(),/Incomplete/);
console.log('PASS: exact 600 samples / 20 seconds, signed composition timing, chunk offsets and incomplete-export rejection.');
