# UBER BULB 节点版本

入口 /nodes，原版 /uber 保留。

公式分组：输入与球面变换 → 球面幂次（Power，与双相位角度输入共同运算）→ 笛卡尔重建（ZMultiplier）→ 历史混合（PrevVecMul、OldVecMul）→ 常量反馈（Implode、Explode）。迭代与逃逸（Iterations、Bailout）是整个循环的控制节点，不是反馈之后的串行运算：每轮球面变换后、重建与反馈前检查逃逸，退出后将距离估计交给原渲染器。实线表示数据依赖，虚线表示反馈或循环控制；迭代节点以独立控制虚线连接每轮输入与退出后的输出。

关闭历史：两项权重置0；关闭常量反馈：Implode=0、Explode=1，保持c。关闭不丢弃输入，重开恢复。相位范围固定，节点显示实时值。运算顺序固定，不支持任意重接线或新增算子；拖动仅改变排布。

## 操作与预设

双相位沿用原版锁定区间：LoopPI 1.695 → 0.129、LoopPI2 3.14 → 0，以 20 秒线性循环播放。相位节点显示当前值；时间轴可暂停并定位循环位置，不能修改区间或插值。形态可调参数为 Power、ZMultiplier、PrevVecMul、OldVecMul、Implode、Explode、Iterations、Bailout。

拖动节点标题改变排布，拖动空白平移画布，滚轮或加减按钮缩放。聚焦节点选择框用于以原始大小查看一个节点；“适应画布”显示整体关系。画布获得焦点后，方向键平移，加减键缩放。预览保留模型旋转、缩放、三种视角、播放、画质与图片导出。

导出的 `uber-node-graph.json` 使用 `uber-node-graph-v1` schema，包含形态参数、历史/常量反馈开关和节点位置，不包含相位区间、相机、画质或画布平移缩放。节点状态自动写入同名独立 localStorage 键；不读取原版工作室 JSON 预设。导入校验参数的有限数值和范围、Iterations 整数、开关布尔类型及节点位置，文件上限为 50,000 字节。“恢复参考”恢复节点参数、开关与排布。

## 实现边界

`nodes.html/css/js` 是节点界面；`node-render.html/css` 是嵌入式预览；`node-engine.js` 是原版渲染器的独立镜像，视角缓存使用独立 sessionStorage 键 `uber-node-render-v1`。渲染器加载独立 `node-uber.glsl`，本次从原版 `uber.glsl` 逐字复制，避免后续节点着色器变更影响原版。字体和基础样式沿用共享资源，蓝金材质配置沿用原版；本次不修改 `/uber` 文件。

`nodes.js` 持有节点图和参数编译；`node-bridge.js` 通过 postMessage 同步参数、播放与预览状态。父页面只接受同源且来自 renderer iframe 的状态；预览只接受同源且来自 parent 的命令。桥接拒绝未知参数、非有限数值与锁定相位字段，其余数字由渲染器按参数 schema 限幅。

视觉继承与此页面的局部排版见 `.impeccable/surfaces/nodes.md`。本次属于既有视觉世界的普通扩展，`DESIGN.md` 与 `.impeccable/design.json` 保持原样，不把节点布局或字号提升为全站设计规范。
