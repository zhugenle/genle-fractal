# 本地预览旧构建器回写修复

2026-10-13。用户页面无模型，控制台 restoreStudioOpening 报 profile.camera 缺失。dist/uber.js 的公式 descriptor 没有 profile，但磁盘 scripts/build.mjs 已包含 profile 输出。原因是长期运行的 dev 服务静态 import 了旧 buildSite；后续 src/config 改动触发旧模块回写产物。

修复：重启本任务 4177 服务；dev 每次构建按 build.mjs 的 SHA256 导入对应模块版本，监听 scripts 变动；构建/检查增加必需的公式启动相机配置校验。未修改公式、材质、相机默认值或发布配置。

验证：在服务启动后修改构建脚本的配置校验，无手动 build 介入，自动重建结果通过 check:dist，证明加载了新构建器；LAN 用户页面刷新后恢复模型与播放。
