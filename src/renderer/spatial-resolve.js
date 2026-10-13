// Rejected smoothing experiment; excluded from the studio build after clarity review.
// Retained only for comparison, not used by the current renderer.
class FractalSpatialResolve {
 constructor(gl){
  this.gl=gl;this.width=0;this.height=0;
  this.device=GenleWebGL.createProgram(gl,`
precision highp float;
uniform sampler2D image;
uniform vec2 texel;
float luminance(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){
 vec2 uv=gl_FragCoord.xy*texel;
 vec3 center=texture2D(image,uv).rgb;
 vec3 nw=texture2D(image,uv+vec2(-1.,1.)*texel).rgb;
 vec3 ne=texture2D(image,uv+vec2(1.,1.)*texel).rgb;
 vec3 sw=texture2D(image,uv+vec2(-1.,-1.)*texel).rgb;
 vec3 se=texture2D(image,uv+vec2(1.,-1.)*texel).rgb;
 float m=luminance(center),a=luminance(nw),b=luminance(ne),c=luminance(sw),d=luminance(se);
 float low=min(m,min(min(a,b),min(c,d))),high=max(m,max(max(a,b),max(c,d)));
 if(high-low<max(.025,high*.1)){gl_FragColor=vec4(center,1.);return;}
 vec2 direction=vec2(-((a+b)-(c+d)),(a+c)-(b+d));
 float reduction=max((a+b+c+d)*.03125,.0078125);
 direction=clamp(direction/(min(abs(direction.x),abs(direction.y))+reduction),vec2(-4.),vec2(4.))*texel;
 vec3 narrow=.5*(texture2D(image,uv-direction/6.).rgb+texture2D(image,uv+direction/6.).rgb);
 vec3 wide=narrow*.5+.25*(texture2D(image,uv-direction*.5).rgb+texture2D(image,uv+direction*.5).rgb);
 float w=luminance(wide);
 gl_FragColor=vec4(w<low||w>high?narrow:wide,1.);
}`,['image','texel']);
  this.texture=gl.createTexture();this.framebuffer=gl.createFramebuffer();
 }
 begin(width,height){
  const gl=this.gl;
  gl.bindTexture(gl.TEXTURE_2D,this.texture);
  if(width!==this.width||height!==this.height){
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);
   gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.texture,0);
   if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){gl.bindFramebuffer(gl.FRAMEBUFFER,null);return false;}
   this.width=width;this.height=height;
  }else gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);
  // The render texture must not also remain bound to a sampler while writing it.
  gl.bindTexture(gl.TEXTURE_2D,null);return true;
 }
 present(){
  const gl=this.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,null);GenleWebGL.bind(gl,this.device);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);
  gl.uniform1i(this.device.locations.image,0);gl.uniform2f(this.device.locations.texel,1/this.width,1/this.height);
  gl.drawArrays(gl.TRIANGLES,0,6);gl.bindTexture(gl.TEXTURE_2D,null);
 }
 dispose(){const gl=this.gl;gl.deleteTexture(this.texture);gl.deleteFramebuffer(this.framebuffer);gl.deleteBuffer(this.device.buffer);gl.deleteProgram(this.device.program);}
}
