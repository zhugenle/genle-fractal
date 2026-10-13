// Proposed spiked-cube adapter: requires SC0/SC1/SC2 uniform discovery at integration.
function uploadFormulaUniforms(uniform,v,twistDeg,objectYawRad){
 uniform('A',[v.AbsoluteX,v.AbsoluteY,v.AbsoluteZ,v.AbsoluteScale]);
 uniform('B',[v.Iterations,v.Bailout,0,0]);
 uniform('C',[0,0,0,0]);uniform('D',[v.AngXY,v.AngYZ,v.AngXZ,0]);
 uniform('E',[0,0,0,v.JuliaMode]);uniform('F',[v.JuliaX,v.JuliaY,v.JuliaZ,0]);
 uniform('G',[0,0,0,1]);uniform('H',[1,1,0,0]);
 uniform('I',[0,v.ColorIterations,v.UMode,v.UScale]);
 uniform('SC0',[v.CubeScale,v.BoxLimit,v.SpikeHeight,v.SpikeSharpness]);
 uniform('SC1',[v.RidgeBevel,twistDeg,v.OffsetX,v.OffsetY]);
 uniform('SC2',[v.OffsetZ,v.DistanceSafety,v.CubeSymmetry,objectYawRad]);
}
