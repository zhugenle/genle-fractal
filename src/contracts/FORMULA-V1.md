# 公式接入契约 v1

公式文件位于 `src/formulas/<id>/`，仅集成任务修改 `config/build.json` 的当前公式选择。

| 文件 | 职责 |
| --- | --- |
| definition.json | id、名称、版权、契约版本、uniform 名称与标准文件名 |
| kernel.glsl | `vec2 evaluateFormula(vec3 world)`；x 为世界空间距离估计，y 为轨道着色数据 |
| parameters.js | `FORMULA_GROUPS`、`REFERENCE_FORMULA_PARAMETERS`、`copyFormulaGroup` |
| animation.js | `referencePhases(progress, values)`，返回两个有限相位；进度 0 与 1 须闭合 |
| uniforms.js | `uploadFormulaUniforms(setVec4, values, phase1, phase2)`；只上传 definition 声明的映射 |

当前适配为 `uber-bulb-packed-v1`：A–I 延续原打包布局，世界/OSL 坐标转换与公式缩放在 kernel 内；公共渲染器通过 `scene()` 使用 x，通过着色 profile 使用 y。x 是距离估计，不能假定为严格 SDF。

公式组包含形态、相位、变换、Julia/实验和轨道映射；CameraRoll 由状态模块插入，材质/灯光/稳定性组由 renderer 提供。数组项格式维持现有 UI 与预设：`[key,label,min,max,step,default]`，布尔/枚举沿用原格式。

这是可运行的首轮拆分，尚不是任意 shader 的即插即用插件系统。现有页面启动/预设兼容层还要求 UBER 的变换、相位与参考字段。其他公式如需不同字段或不同着色返回值，先由公式任务提供 adapter 提案，集成任务更新页面接线及契约版本；无需回写公共光照数学或复制整个 renderer。

公式修改至少验证有限输出、参数上下限、相位端点、shader 编译和既有参考状态；新增公式自己的数值/图像用例放在自己的目录，避免所有任务改同一测试文件。
