# genle_fractal 模块边界与当前实现

本次将可运行的源码从 `dist` 拆出，建立零第三方运行依赖的 Node 构建流程。保留当前主页面、节点、旧展厅的入口、预设格式和渲染策略；主页面与节点只共用可以保持行为的部分。

```text
src/
  formulas/uber-bulb/    kernel / 参数 / 相位 / uniform adapter
  renderer/             GPU 底座 / 性能预算 / 公共 uniforms
    shaders/            表面采样 / 光照数学 / 旋转
    profiles/           studio 与 node-legacy 着色策略
  state/                会话 / 预设 / 相机 / PNG / WebM
  ui/
    studio/             主页 / 控件 / 语言主题 / 页面适配器
    nodes/              节点编辑器 / 预览适配器 / 消息桥
    gallery/            旧展厅
  contracts/            接入契约
public/                 字体 / 许可 / 参考素材
config/build.json       集成任务维护的源码组装清单
scripts/                build / check / dev / preview
release/pages/          域名和 Pages 标记
.github/workflows/      检查、构建、上线
dist/                   生成文件，不能作为开发源
```

## 谁改哪里

|任务|主要修改范围|与其他任务的交接|
|---|---|---|
|公式算法|`src/formulas/<id>/`|距离估计、参数定义、相位函数、uniform 映射|
|公共渲染与性能|`src/renderer/`|公共 GPU/采样/灯光/材质/性能契约|
|主页 UI|`src/ui/studio/`|调用状态与 renderer 接口；不改 kernel|
|节点 UI|`src/ui/nodes/`|消息桥 facade；不复制原版 engine|
|状态、预设、导出|`src/state/`|预设 schema 与 controller 行为|
|集成、发布|`config/`、`scripts/`、`release/`、CI|统一组装、回归、生成产物、上线记录|

这些是文件职责，不要求同时开六个聊天。一个任务可以承担多种角色，关键是每次说明范围。并行任务各自使用独立工作树、分支与预览端口；共享接口或构建清单由一个集成任务更新。

## 已共用的运行代码

`uber.glsl` 和 `node-uber.glsl` 不再分别维护一份公式。构建把单一 `kernel.glsl` 与公共旋转、scene/normal/轨道映射、GGX/Fresnel/灯箱数学和不同 profile 拼装。公式入口统一为 `evaluateFormula(world)`。

两套页面使用同一个 `webgl-device.js` 初始化 GPU、编译 shader、建立全屏三角形和查找 uniform；公式 A–I 打包由公式目录维护，其余灯光/材质/渐变/修剪打包由 `renderer/uniforms.js` 维护。节点消息桥只通过 `GenleNodeRenderer` facade 调用预览。

## 保留的兼容适配

主工作室采用五档画质、可选颜色、精确闭合相位和自适应分辨率；节点原版使用四档、固定色及旧动画策略。本次不把它们的 quality 数字、phase 区间或材质强行混用。不同 shader profile、页面 adapter 与状态 controller 是明确的兼容层。

源码目前按职责分文件，再构建为一个页面 IIFE；它解决文件修改互相覆盖、重复公式、重复 GPU 初始化和发布直接搬文件的问题。页面 controller 之间仍有词法状态依赖，尚不是所有模块独立 ES import，也不是任意公式自动插件化。进一步消除该依赖应作为独立接口迁移任务，不与算法/UI/发布同时交叉改动。

## 开发与验证

```text
npm run dev -- --port 4174
```

服务会在启动及源码改变时重新构建；浏览器刷新后加载新产物。`/__dev` 可查看该端口服务的是哪个工作树，防止把另一个目录的预览误认为自己的修改。

修改本地服务 scripts/dev.mjs 后需重启服务；构建脚本 scripts/build.mjs、普通源码、资源与构建配置由文件监听重新构建，构建器按源码指纹重新加载。

`npm run check` 验证 JavaScript、公式接口与参数映射、相位闭合及页面资源引用；`npm run build` 生成 dist；`npm run check:dist` 比较生成产物与当前源码。shader 必须再通过浏览器实际编译/渲染，静态检查不能代替 GPU 验证。

`dist/build-manifest.json` 记录输入源文件和产物的 SHA256，可追溯某个部署包含哪些模块。manifest 无时间戳和工作树绝对路径；`.gitattributes` 固定文本为 LF，减少 Windows 与 CI 的换行差异。同一源码可重复构建。迁移前运行文件保存在忽略目录 `work/modular-baseline/dist/`，便于本机核对，不作为新的源码入口。

## 从旧工作树迁移

先保存或提交旧工作树内的公式工作，再以新的架构基线创建/同步工作分支。把新增算法、参数和适配内容迁入自己的 `src/formulas/<id>/`，不要用旧的 `uber.js`、HTML 或整包 dist 覆盖本项目。渲染契约改变写在交接说明里，由集成任务连同必要调用方一次完成。

本次没有操作其他工作树、创建其他 Codex 聊天、合并他人代码或发布。当前变更由集成任务提交为架构基线后，其他工作树才会通过 Git 同步到新目录与规则；已打开的 Codex 任务不会自动获得这些尚未提交的文件。

## 2026-10-13 多公式接入

主工作室通过 config/build.json 的 studioFormulas 注册 UBER BULB 与 SPIKED CUBE；构建在私有作用域封装各公式的元数据、相位函数与 uniform adapter。每种公式生成独立 shader 并按需缓存 GPU program。studioDefaults 记录公式自己的起始相机与必要采样默认值。原 formula 配置仍控制 node-legacy 的单公式，不受工作室选择影响。预设新增可选 formulaId，缺失时为 uber-bulb，原存储键与 schema 保留，并兼容调试窗口 genle-fractal-preset-v2 导出。完整接入说明见 docs/handoffs/spiked-cube-integration.md。
