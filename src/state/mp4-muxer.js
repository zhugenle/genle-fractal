// Small ISO BMFF muxer for WebCodecs AVC output. One contiguous video chunk,
// explicit sample timing and signed composition offsets; no wall-clock timing.
function createAVCMP4(width,height,fps,expectedFrames){
 const samples=[];let description=null,bytes=0;
 const ascii=s=>Uint8Array.from(s,c=>c.charCodeAt(0));
 const u16=n=>new Uint8Array([(n>>>8)&255,n&255]);
 const u32=n=>new Uint8Array([(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]);
 function join(parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let i=0;for(const p of parts){out.set(p,i);i+=p.length;}return out;}
 const box=(type,...parts)=>{const body=join(parts);return join([u32(body.length+8),ascii(type),body]);};
 const full=(type,version,flags,...parts)=>box(type,new Uint8Array([version,flags>>>16&255,flags>>>8&255,flags&255]),...parts);
 const zeros=n=>new Uint8Array(n);
 const matrix=join([u32(65536),u32(0),u32(0),u32(0),u32(65536),u32(0),u32(0),u32(0),u32(1073741824)]);
 return {
  add(chunk,metadata){
   if(metadata?.decoderConfig?.description){const next=new Uint8Array(metadata.decoderConfig.description);if(description&&(description.length!==next.length||description.some((v,i)=>v!==next[i])))throw Error('AVC configuration changed');description=next.slice();}
   const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);bytes+=data.length;
   if(bytes>1024*1024*1024)throw Error('MP4 exceeds 1 GiB');
   samples.push({data,key:chunk.type==='key',frame:Math.round(chunk.timestamp*fps/1e6)});
  },
  finish(){
   if(!description||samples.length!==expectedFrames||new Set(samples.map(s=>s.frame)).size!==expectedFrames||samples.some(s=>s.frame<0||s.frame>=expectedFrames))throw Error('Incomplete AVC frames');
   const count=samples.length,timescale=90000,delta=timescale/fps,duration=count*delta;
   const ftyp=box('ftyp',ascii('isom'),u32(512),ascii('isomiso2avc1mp41'));
   function moov(offset){
    const mvhd=full('mvhd',0,0,zeros(8),u32(timescale),u32(duration),u32(65536),u16(256),zeros(10),matrix,zeros(24),u32(2));
    const tkhd=full('tkhd',0,7,zeros(8),u32(1),u32(0),u32(duration),zeros(8),zeros(8),matrix,u32(width*65536),u32(height*65536));
    const mdhd=full('mdhd',0,0,zeros(8),u32(timescale),u32(duration),u16(0x55c4),u16(0));
    const hdlr=full('hdlr',0,0,u32(0),ascii('vide'),zeros(12),ascii('genle_fractal\0'));
    const avc1=box('avc1',zeros(6),u16(1),zeros(16),u16(width),u16(height),u32(72*65536),u32(72*65536),u32(0),u16(1),zeros(32),u16(24),u16(65535),box('avcC',description));
    const stsd=full('stsd',0,0,u32(1),avc1);
    const stts=full('stts',0,0,u32(1),u32(count),u32(delta));
    const offsets=samples.map((s,i)=>s.frame*delta-i*delta);
    const ctts=offsets.some(Boolean)?full('ctts',1,0,u32(count),join(offsets.map(n=>join([u32(1),u32(n)])))):zeros(0);
    const keys=samples.flatMap((s,i)=>s.key?[u32(i+1)]:[]);
    const stbl=box('stbl',stsd,stts,ctts,full('stss',0,0,u32(keys.length),join(keys)),full('stsc',0,0,u32(1),u32(1),u32(count),u32(1)),full('stsz',0,0,u32(0),u32(count),join(samples.map(s=>u32(s.data.length)))),full('stco',0,0,u32(1),u32(offset)));
    const dinf=box('dinf',full('dref',0,0,u32(1),full('url ',0,1)));
    return box('moov',mvhd,box('trak',tkhd,box('mdia',mdhd,hdlr,box('minf',full('vmhd',0,1,zeros(8)),dinf,stbl))));
   }
   const header=moov(0),metadata=moov(ftyp.length+header.length+8);
   return new Blob([ftyp,metadata,u32(bytes+8),ascii('mdat'),...samples.map(s=>s.data)],{type:'video/mp4'});
  }
 };
}
