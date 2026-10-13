# 渲染器与页面契约 v1

- `GenleWebGL.context(canvas)`：统一 WebGL 上下文设置。
- `GenleWebGL.createProgram(gl, fragmentSource, uniformNames)`：编译/link、全屏三角形与 location 缓存；失败释放资源，不访问控件。
- `uploadRenderUniforms(setVec4, values)`：公共 J/M/L/N/T/K0–K3/MG/R/S 的灯光、双材质、渐变、搜索/修剪映射。
- `FractalRenderBudget`：GPU 异步计时、先降 shader 档位再降分辨率、性能回退及查询清理。`dimensions(..., selectedQuality)` 返回当前 `shaderQuality`；录制锁定返回值，暂停/PNG 恢复所选上限。GPU 样本校验质量和尺寸，避免旧帧数据干扰新档位。
- `detailHeight` 保留完整几何/法线参考高度；`mappingHeight` 保留 Screen 渐变坐标。录制保留高度和 shaderQuality，防止图像在录制中变糊或切换档位。
- 已撤销空间 resolve；主绘制通过 `GenleWebGL.bind` 绑定自身 program/buffer。实验代码未包含在当前 bundle 中。
- shader 由 profile prologue、共用旋转、单一 formula kernel、共用 surface、共用 lighting-math、profile surface 组合。

主页面 adapter 负责 DOM、进度、相机、颜色转换、完整 PNG 与固定 WebM 尺寸。节点 adapter 保留旧材质/四档编码，避免结构整理改变其画面。

|策略|主工作室|节点兼容 profile|
|---|---|---|
|quality|选项 0/1/1.5/2/3 → shader 0…4|选项与 shader 均 0…3|
|颜色|材质 A/B 与三种灯色 uniforms|固定材质/灯色|
|采样高度|detailResolution 保留锐利法线尺度，mappingResolution 固定材质映射|resolution.y|
|循环|精确角周期闭合|保留原起止线性插值|
|动态预算|自适应，目标约 30fps|原始策略|

节点消息桥只访问 `window.GenleNodeRenderer` 的 `getState/setParameters/setPlaying/view/snapshot/setQuality/setProgress` 方法，不读写 engine 的全局变量。保留 `uber-node-command`、`uber-node-state` 消息类型，发送/接收都校验同源和指定 parent/iframe。

页面代码为按职责划分的 source 片段，由构建在一个 IIFE 作用域组装。公共 GPU 模块通过函数边界共享；app controller 尚有词法状态依赖，调整构建顺序或替换状态 API 属于集成变更。后续可逐步转为显式 context/ES modules，不在本次迁移同时改动所有行为。
