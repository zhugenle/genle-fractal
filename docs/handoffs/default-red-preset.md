# 新默认预设

2026-10-28，按用户提供的 uber-bulb-preset (6).json 更新本地主页默认状态，未发布。

`config/build.json` 的 UBER studioDefaults.parameters 保存全部原始参数，camera保存yaw/pitch/distance与CameraRoll=0，animation保存20秒周期和起始progress=0.8818967296297242。无需运行时读取Downloads路径。`restoreStudioOpening`消费可选profile.animation，无该字段的其他公式保留原默认行为。初始仍自动播放双相位；电脑精细、手机细致、自适应默认关闭，既有用户预设存储与schema不变。公式kernel、节点页旧profile和发布配置未改。

主页默认载入和恢复默认使用新参数，参考视角使用新camera。逐栏reset使用此profile的参考值。API类型仍为可选animation字段，不迁移JSON格式。

验证：check/build/check:dist通过；浏览器实际渲染红色形态且无错误；从新页面导出JSON，与用户原文件逐项比对全部parameters和camera完全一致。起始进度由profile载入后继续播放。截图位于用户Documents输出目录 default-red-preset-verified.png。
