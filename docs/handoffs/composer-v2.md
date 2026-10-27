# Composer v2 本地交付（2026-10-28）

本轮在 codex/composable-formula-nodes 工作树实现。未发布、未推送。原工作室与旧 nodes 页面保留。

## 已实现

- 文档工作区：空白/UBER/CUBE/混合起步图、多个标签、独立撤销与相机、复制实验、关闭恢复。
- 草稿与可执行公式分离。不完整/未知算子草稿可保存；只编译输出可达的有效节点。
- IndexedDB 保存，localStorage 回退和离页同步检查点；首次复制迁移旧键，保留旧原文；恢复失败禁止覆盖原存储。
- 独立 GraphPreview 直接复用公共 GLSL 与 studio 光照配置，替代旧整页 iframe。连续参数编辑逐帧 uniform 更新；结构编辑编译最新请求，文档/版本回执隔离，最多缓存四份 GPU 程序。
- 左 3D / 右节点，可拖分隔条；常用参数在节点中，高级检查器可折叠；390px 窗口同时保留预览和画布。
- 端口点击/拖线、拖到空白添加算子、选线插入、显式删除、框选、平移缩放、整理与定位、复制粘贴、局部快捷键。
- 项目 JSON、节点草稿 JSON、原公式包导入导出；项目导入保留相机/画质/编辑视图；公式包继续使用旧 schema。

## 验证

- scripts/check.mjs：原公式/legacy 预设/MP4 检查及新增文档事务、独立性、空白草稿、导入恢复检查通过。
- scripts/build.mjs --check：产物与源码一致。
- workspace-gpu-check.html：8 次连续参数修改、9 次实际绘制、0 次参数重编译，实际 readPixels 哈希改变；快速切空白不串图。
- graph-gpu-check.html：UBER/CUBE 各64点距离与轨道对照通过，hybrid/catalog 编译与有限性通过。
- 本地 UI：点击接线/撤销、占用输入替换、空白与未完成图保存刷新、文档复制/关闭恢复、桌面和390px响应式画布。
- 手机截图使用390×844同源 iframe，浏览器 viewport override 在本环境没有生效；未声明真机触控验收。
- 独立 finish review 结论为 **pass / ship**，范围仅限以下三项修复，不构成全站或全部交互无缺陷声明。
- 当前 Composer 浏览器无console错误且实际更新；主工作室烟测标题/两个canvas正常、console错误0。旧nodes页显示8节点和动画相位，但有既存 `MutationObserver.observe` 非Node参数console错误；其legacy editor/iframe路径本轮未修改，保留为后续调查项。

## Finish review：三项修复已解决

1. 两次点击端口接线：保留第一次选择的端点，拖线完成后抑制合成点击。浏览器确认输入→球坐标幂接线，并确认可撤销。
2. 从占用输入拖到空白后添加：原子移除同一目标/端口旧边后接入新节点。浏览器确认从幂节点输入拖出并添加“三轴排序”后，幂节点保持一条入边。
3. 复制文档：独立克隆编辑视图及预览相机、设置、画质。状态测试确认修改副本预览不改变原文档。

上述三项处置均为 resolved，交付处置为 ship。复审仅覆盖这些发现及对应修复。

## 表面文档与系统对照

- `.impeccable/surfaces/composer.md` 已从v1更新为最终v2：可调左右布局、节点内参数、抽屉检查器、独立预览、逐帧数值更新、空白/多文档、草稿与导入导出边界。
- 核对 `.impeccable/review/composer-v2-desktop.png`（1280×720）及 `composer-v2-mobile.png`（390×844）。手机截图为同源iframe宽度证据，未声称真机触控验证。
- 对照 `PRODUCT.md`、`DESIGN.md`、`.impeccable/design.json` 与完成源码。保留全局系统文件；代码字体、黑灰、强调色、方角和材质分工一致。
- 既有漂移仅记录：`DESIGN.md`描述的主工作室预设共享外框在现有 `.saved-preset`/sidecar示例中不存在；sidecar折叠示例没有底线，而实际 `.param-group`有灰色分隔线。本轮未修复这些差异，也未将composer局部布局推广为全局规则。

## 模块与入口

契约：src/contracts/COMPOSER-V2.md。
状态：src/state/graph-workspace.js。
GPU：src/renderer/graph-preview.js。
UI：src/ui/nodes/composer/{controls,workspace-editor,canvas,bootstrap}.js。
构建：config/build.json。旧 editor.js 保留但不进入 composer.js。
本地入口 http://127.0.0.1:4186/composer.html 。

## 边界与后续

结构变化仍需要 GPU 驱动编译，复杂图可能短暂占用主线程；数值拖动不重编译。
当前为提取算子的状态图；细粒度 scalar/vector/time 类型节点、子图封装、时间轴与新导出语言属于后续阶段，未宣称本轮完成。
本轮保留原数学核心和材质 profile，不统一旧节点页4档与主工作室5档编码。
