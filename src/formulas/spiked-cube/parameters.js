// Formula-owned metadata. Hidden definitions still participate in preset validation.
const FORMULA_GROUPS={
 '形态与相位':['形态与相位','立方对称、尖刺与倒角。动画由唯一循环位置驱动。',true,[
  ['CubeSymmetry','立方对称','bool',1],['CubeScale','立方体倍率',1.1,4,.001,2.1],
  ['BoxLimit','折叠边界',.2,2,.001,1],['SpikeHeight','尖刺高度',0,3,.001,1.2],
  ['SpikeSharpness','尖刺锐度',.1,2,.001,.85],['RidgeBevel','棱边倒角',0,1,.001,.3],
  ['Iterations','迭代次数',1,60,1,16],['Bailout','逃逸阈值',10,300,.1,100],
  ['DistanceSafety','距离保护',0,1,.01,1]]],
 '偏置':['偏置','公式内的空间偏置。',false,[
  ['OffsetX','偏置 X',-3,3,.001,.8],['OffsetY','偏置 Y',-3,3,.001,.8],['OffsetZ','偏置 Z',-3,3,.001,.8]]],
 '旋转与位置':['旋转与位置','每次迭代内的旋转与公式中心。物体自转不改变相机或灯光。',false,[
  ['AngXY','迭代旋转 XY',-180,180,.1,0],['AngYZ','迭代旋转 YZ',-180,180,.1,0],['AngXZ','迭代旋转 XZ',-180,180,.1,0],
  ['AbsoluteScale','公式缩放',.01,5,.001,1],['AbsoluteX','位置 X',-10,10,.1,0],['AbsoluteY','位置 Y',-10,10,.1,0],['AbsoluteZ','位置 Z',-10,10,.1,0]]],
 'Julia 与实验模式':['Julia 与实验模式','Julia 常量。',false,[
  ['JuliaMode','Julia 模式','bool',0],['JuliaX','Julia X',-3,3,.01,0],['JuliaY','Julia Y',-3,3,.01,0],['JuliaZ','Julia Z',-3,3,.01,0]]],
 '轨道着色':['轨道着色','沿用原公式的轨道映射。',false,[
  ['ColorIterations','着色迭代次数',1,100,1,16],
  ['UMode','U 映射','select',0,[['平方根',0],['对数',1],['常量',2],['空间坐标',3]]],['UScale','U 缩放',0,10,.001,1],
  ['VMode','V 映射','select',0,[['平方根',0],['对数',1],['常量',2],['空间坐标',3]]],['VScale','V 缩放',0,10,.001,2]]]
};
const FORMULA_HIDDEN_PARAMETERS=[
 ['TwistAngle','迭代扭转',-90,90,.1,0],['TwistLoop','扭转循环','bool',1]
];
const REFERENCE_FORMULA_PARAMETERS={
 AbsoluteX:0,AbsoluteY:0,AbsoluteZ:0,AbsoluteScale:1,Iterations:16,Bailout:100,
 CubeSymmetry:1,CubeScale:2.1,BoxLimit:1,SpikeHeight:1.2,SpikeSharpness:.85,RidgeBevel:.3,
 OffsetX:.8,OffsetY:.8,OffsetZ:.8,DistanceSafety:1,AngXY:0,AngYZ:0,AngXZ:0,
 TwistAngle:0,TwistLoop:1,JuliaMode:0,JuliaX:0,JuliaY:0,JuliaZ:0,
 ColorIterations:16,UMode:0,UScale:1,VMode:0,VScale:2
};
const copyFormulaGroup=name=>JSON.parse(JSON.stringify(FORMULA_GROUPS[name]));
