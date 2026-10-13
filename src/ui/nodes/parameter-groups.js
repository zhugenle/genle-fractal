const groups=[
copyFormulaGroup("形态与相位"),
copyFormulaGroup("动画关键帧"),
copyRendererGroup("材质"),
copyRendererGroup("OSL 渐变混合"),
copyRendererGroup("灯光"),
(()=>{const g=copyFormulaGroup("旋转与位置");g[3].unshift([...CAMERA_ROLL_PARAMETER]);return g;})(),
copyFormulaGroup("球面变换"),
copyFormulaGroup("Julia 与实验模式"),
copyFormulaGroup("轨道着色"),
copyRendererGroup("渲染稳定性")
];
