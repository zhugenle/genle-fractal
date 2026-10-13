float scene(vec3 p){return evaluateFormula(p).x;}
vec3 normalAt(vec3 p,float e){vec2 v=vec2(e,0.);return normalize(vec3(scene(p+v.xyy)-scene(p-v.xyy),scene(p+v.yxy)-scene(p-v.yxy),scene(p+v.yyx)-scene(p-v.yyx)));}
float coordinate(float trap,float mode,float scale,float fallback){if(mode<.5)return sqrt(max(trap,0.))*scale;if(mode<1.5)return log(max(trap,1e-8))*scale;if(mode<2.5)return scale;return fallback;}

