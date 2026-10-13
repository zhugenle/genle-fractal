import fs from 'node:fs/promises';
import {watch} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {networkInterfaces} from 'node:os';
import {createHash} from 'node:crypto';
import {ROOT,inProject} from './build.mjs';
async function buildSite(){
 // Reload the builder when its source changes; a long-lived server must not write an old bundle.
 const source=await fs.readFile(inProject('scripts/build.mjs'));
 const revision=createHash('sha256').update(source).digest('hex');
 const builder=await import('./build.mjs?revision='+revision);
 return builder.buildSite();
}
const index=process.argv.indexOf('--port'),port=index>=0?Number(process.argv[index+1]):4173;
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Use --port with a port from 1024 to 65535.');
const preview=process.argv.includes('--preview');
const lan=process.argv.includes('--lan'),host=lan?'0.0.0.0':'127.0.0.1';
if(!preview)await buildSite();
const output=inProject('dist'),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css; charset=utf-8','.glsl':'text/plain; charset=utf-8','.gif':'image/gif','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try{
  let route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(route==='/__dev'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({project:ROOT,port,mode:preview?'preview':'dev'}));return;}
  if(route==='/uber'||route==='/uber.html'){res.writeHead(302,{Location:'/'});res.end();return;}
  if(route==='/nodes')route='/nodes.html';
  const file=path.resolve(output,'.'+(route==='/'?'/index.html':route));
  if(!file.startsWith(output+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await fs.readFile(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:400);res.end('Resource unavailable.');}
});
const watchers=[];let timer,busy=false,again=false;
async function rebuild(){if(busy){again=true;return;}busy=true;try{await buildSite();}catch(e){console.error('Build failed: '+e.message);}finally{busy=false;if(again){again=false;await rebuild();}}}
if(!preview)for(const directory of ['src','public','config','release/pages','scripts'])watchers.push(watch(inProject(directory),{recursive:true},()=>{clearTimeout(timer);timer=setTimeout(rebuild,120);}));
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is in use. Choose another --port; do not stop another task's server.`:e.message);for(const w of watchers)w.close();process.exitCode=1;});
server.listen(port,host,()=>{
 console.log(`genle_fractal ${preview?'preview':'dev'}: http://127.0.0.1:${port}/\nProject: ${ROOT}\n${preview?'':'Source edits rebuild dist; refresh the browser to load them.'}`);
 if(lan)for(const addresses of Object.values(networkInterfaces()))for(const address of addresses||[])if(address.family==='IPv4'&&!address.internal&&!address.address.startsWith('169.254.'))console.log(`Network preview: http://${address.address}:${port}/`);
});
process.on('SIGINT',()=>{clearTimeout(timer);for(const w of watchers)w.close();server.close(()=>process.exit(0));});
