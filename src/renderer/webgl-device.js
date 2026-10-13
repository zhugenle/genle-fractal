'use strict';
// Shared GPU setup has no parameter controls, formula choice or publishing logic.
const GenleWebGL={
 context(canvas){return canvas.getContext('webgl',{antialias:false,preserveDrawingBuffer:true});},
 createProgram(gl,fragmentSource,uniformNames){
  const shaders=[];let program,buffer;
  try{
   function compile(type,source){const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;}
   program=gl.createProgram();
   gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
   gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const attribute=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
   const locations={};for(const name of new Set(uniformNames))locations[name]=gl.getUniformLocation(program,name);
   return {program,locations,buffer,attribute};
  }catch(error){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);throw error;}
  finally{for(const shader of shaders)gl.deleteShader(shader);}
 },
 bind(gl,device){gl.useProgram(device.program);gl.bindBuffer(gl.ARRAY_BUFFER,device.buffer);gl.enableVertexAttribArray(device.attribute);gl.vertexAttribPointer(device.attribute,2,gl.FLOAT,false,0,0);}
};
