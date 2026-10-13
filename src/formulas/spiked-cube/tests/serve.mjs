import http from 'node:http';
import fs from 'node:fs/promises';
const port=Number(process.argv[2]||4184),base=new URL('../',import.meta.url);
const routes={
 '/':'tests/preview.html','/preview.js':'tests/preview.js','/kernel.glsl':'kernel.glsl',
 '/parameters.js':'parameters.js','/animation.js':'animation.js','/uniforms.js':'uniforms.js',
 '/numerics.html':'tests/numerics.html'
};
const server=http.createServer(async(req,res)=>{
 try{const name=new URL(req.url,'http://localhost').pathname;let file;
  if(name==='/shared-renderer.glsl'){
   const root=new URL('../../../../',import.meta.url);let text;
   try{
    const config=JSON.parse(await fs.readFile(new URL('config/build.json',root),'utf8'));
    text=(await Promise.all(config.shaders['uber.glsl'].map(p=>p==='{formula}/kernel.glsl'?'// FORMULA_BODY':fs.readFile(new URL(p,root),'utf8')))).join('\n');
   }catch(e){if(e.code!=='ENOENT')throw e;text=await fs.readFile(new URL('dist/studio.glsl',root),'utf8');}
   res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(text);return;
  }
  else if(routes[name])file=new URL(routes[name],base);
  else{res.writeHead(404);res.end('Not found');return;}
  const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':name==='/'||name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.js')?'text/javascript; charset=utf-8':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Missing test resource');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Formula test: http://127.0.0.1:${port}/`));
