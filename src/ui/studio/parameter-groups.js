// Studio registry selects formula-owned metadata; shared controls keep their identity.
let activeFormula=typeof STUDIO_FORMULAS==='undefined'?{id:'uber-bulb',groups:FORMULA_GROUPS,hidden:[],reference:REFERENCE_FORMULA_PARAMETERS,phases:referencePhases,upload:uploadFormulaUniforms}:STUDIO_FORMULAS[0];
function studioGroups(formula){
 const fg=Object.values(formula.groups).map(g=>JSON.parse(JSON.stringify(g)));
 const transform=fg.find(g=>g[0]==='旋转与位置');if(transform)transform[3].unshift([...CAMERA_ROLL_PARAMETER]);
 return [fg[0],...['材质','OSL 渐变混合','灯光'].map(copyRendererGroup),...fg.slice(1),copyRendererGroup('渲染稳定性')];
}
let groups=studioGroups(activeFormula);
