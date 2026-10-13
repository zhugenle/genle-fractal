# SPIKED CUBE 主工作室接入

2026-10-13，本地集成。仅从 3c58 工作树读取独立 src/formulas/spiked-cube/；不修改源工作树、不复制外部 dist。

- config/build.json 的 studioFormulas 注册主页面公式；formula 继续控制 UBER 节点兼容入口。
- 构建把各公式参数/动画/uniform 封装为独立 descriptor，生成独立 shader，切换时缓存 GPU program。无需每帧重编译，也不把两个复杂 kernel 合为单一 shader。
- 主页面 formula-control 管理公式与参数面板。公共灯光、材质、画质、时间轴保持；公式专属隐藏扭转参数保留在 schema 中，SPIKED 的 twist 与物体 Y 自转沿用交付相位函数，不改变相机和灯光。
- 原 localStorage 键、导出 schema 保留。新增可选 formulaId；缺失时按 uber-bulb 解释。预设参数按其公式校验；跨公式切换先换 kernel，然后现有 0.8 秒参数/相机过渡，时间进度不回到起点。不做两个拓扑的几何 morph。
- 节点/旧展厅未增加公式切换，保持旧兼容行为。
- 涉及公式模块、studio UI/adapter、state presets/file-io/session、构建与检查；未改光照数学/发布配置。

验证：npm run check / build / check:dist、5 项公式测试通过；浏览器实际编译两种主公式与节点 shader。验证公式来回切换、跨公式预设 0.8 秒过渡和持续播放、中英参数控件。专属采样默认 Bounds=10 / DetailPrecision=0.1 / NormalFilter=0.5、相机 distance=28 来自公式交付预览。仅本地，未提交或发布。

2026-10-13 后续调整：所有主工作室参数分栏新增局部 reset，恢复当前公式的参考默认值，保持动画进度与其他栏参数；SPIKED zoomMax=120（此前25小于初始相机距离28），兼容相机存储上限500。物体 Y 自转相位改为负方向，内部扭转相位方向保持。新增 Loop01(deg) / Loop02(rad) 实时读数，用户明确要求覆盖此前隐藏 telemetry 的呈现约定。涉及 studio UI/控件/遥测、相机输入、SPIKED animation/presentation、构建 profile；公共光照与 kernel 未修改。
