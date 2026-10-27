# 节点版跟随新 index UI

日期：2026-10-14。工作区 D:/CodeX/web_release/web_fractal，main。开始时已有架构迁移和公式集成修改；本任务不提交、推送或发布它们。

## 修改范围
- src/ui/nodes/index.html：使用 uber.css 基础样式，加入同款标题、主题色/语言控件、预览相位读数；质量/时间轴移到预览底部。
- src/ui/nodes/styles.css：黑白灰、StudioCode 等宽字体、compact 控件、细线连线、方形字段与节点；保留节点编辑构图与手机上下布局。
- src/ui/nodes/editor.js：主题和语言适配、range位置与相位展示；保持原参数编译、导入导出、节点开关和数据流。

## 接口与兼容
无 renderer/state/contracts 接口变更。复用 index 的 genle-fractal-accent 和 genle-fractal-language 键，节点原有 uber-node-graph-v1 schema、预设键、节点预览四档 0/1/2/3、旧相位及材质 profile 不变。不同页面间共享持久化设置，节点监听其他页 storage 更新；主页按原行为在刷新后读取。主页源码、公共 renderer、公式和发布配置没有修改。

## 验证
源码检查、构建、check:dist 通过。预览端口4186；浏览器实际加载主页与节点 GPU。节点Power=6在子预览控件中得到6；历史节点关闭权重归0，恢复参考正常。主题色在主页刷新后与节点一致，语言切换生效。桌面与390px模拟手机布局无横向溢出，手机可聚焦节点。未测试真实触屏硬件。

生成dist仅为本地验证，不提交产物。截图在 work/nodes-index-ui/desktop.jpg、mobile.jpg。本轮没有发布。
