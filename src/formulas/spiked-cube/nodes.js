// Extracted SPIKED CUBE IFS operators. Source: user-supplied gemini_01.txt.
const CUBE_GRAPH_NODES={
 'absolute-fold':{label:'绝对值折叠',category:'CUBE',description:'把 z 的三个分量折叠到正半轴。',inputs:['state'],params:[],glsl:`s.z=abs(s.z);`},
 'axis-sort':{label:'三轴排序',category:'CUBE',description:'按 x ≥ y ≥ z 排序，形成八分体对称折叠。',inputs:['state'],params:[],glsl:`float t;if(s.z.y>s.z.x){t=s.z.x;s.z.x=s.z.y;s.z.y=t;}if(s.z.z>s.z.x){t=s.z.x;s.z.x=s.z.z;s.z.z=t;}if(s.z.z>s.z.y){t=s.z.y;s.z.y=s.z.z;s.z.z=t;}`},
 'spike-fold':{label:'尖刺分段折叠',category:'CUBE',description:'围绕尖刺高度分段折叠 x，同时传播该步骤的导数上界。',inputs:['state'],params:[['SpikeHeight','尖刺高度',0,3,.001,1.2],['SpikeSharpness','尖锐度',.1,2,.001,.85]],glsl:`float fold=s.z.x-@SpikeHeight;s.z.x=fold>0.?@SpikeHeight-fold*@SpikeSharpness:s.z.x+fold*(1.-@SpikeSharpness);s.dr*=max(1.,max(@SpikeSharpness,abs(2.-@SpikeSharpness)));`},
 'ridge-clamp':{label:'脊线夹取',category:'CUBE',description:'沿 y 轴夹取后回减，控制脊线与倒角。',inputs:['state'],params:[['BoxLimit','夹取范围',.2,2,.001,1],['RidgeBevel','倒角权重',0,1,.001,.3]],glsl:`s.z.y-=clamp(s.z.y,-@BoxLimit,@BoxLimit)*@RidgeBevel;`},
 'offset-fold':{label:'轴向偏移折叠',category:'CUBE',description:'z.z ← abs(z.z − offset)，折叠中心独立可调。',inputs:['state'],params:[['Offset','折叠中心',-3,3,.001,.6]],glsl:`s.z.z=abs(s.z.z-@Offset);`},
 'ifs-affine':{label:'IFS 缩放与注入',category:'CUBE',description:'缩放、三轴偏移、常量注入；同时累计 acc 和 dr。',inputs:['state'],params:[['Scale','迭代缩放',1.1,4,.001,2.1],['OffsetX','偏移 X',-3,3,.001,.8],['OffsetY','偏移 Y',-3,3,.001,.8],['OffsetZ','偏移 Z',-3,3,.001,.8],['ConstantWeight','常量注入',-1,1,.001,.15]],glsl:`s.z=s.z*@Scale-vec3(@OffsetX,@OffsetY,@OffsetZ)*(@Scale-1.)+s.c*@ConstantWeight;s.acc=min(s.acc*@Scale,1e30);s.dr=min(s.dr*@Scale+abs(@ConstantWeight)*s.cDerivative,1e30);`}
};
