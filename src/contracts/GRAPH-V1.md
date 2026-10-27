# 迭代节点契约 v1

本实现为独立 composer，不修改旧 uber-node-graph-v1。图格式 `genle-fractal-graph`、schemaVersion=1；公式包为 `genle-fractal-formula`、schemaVersion=1。

图 nodes={id,type,version:1,params,position:[x,y],label?}[]，edges={from,to,port}[]，output 为唯一 output 节点 ID。input 节点表示显式 Iterate 容器的当前轮状态；output 管理最大 100 轮循环、距离收束。普通连接只允许 OrbitState，容器内为 DAG；跨轮反馈由 history-commit 等算子管理。

OrbitState 包含 z/c/oldz/prevz/oz、r/dr/acc/trap/scale/cDerivative、stopped、iteration。算子是无副作用的状态变换；混合节点从两个输入混合 z/c/dr，历史沿 A，可靠性为 heuristic。止步标记向后传播。

`GenleGraph.compile(graph)` 返回 kernel、uniformNames、upload(setVec4, exposedValues)、diagnostics、parameterDefinitions。普通参数通过 uniform 更新，拓扑改变才重新编译；不接受代码或未知节点版本。glsl 只由注册算子生成。所有节点距离估计均标记 heuristic，不提供 CSG 的有符号保证。

公开参数绑定稳定 id/nodeId/key；公式包包含原图与公开参数，不依赖 shader 缓存。控制范围必须是算子原范围的子集。引用依赖锁定 type/version。动画首期为静态图，用户可自由调整相位；不自动继承原工作室锁定动画。

工作室可选 `GenleGraphStudio.install(package)` 安装到当前会话并保留原 FORMULA-V1。动态程序在 GPU 编译成功后才替换，失败保留之前程序；每次替换释放旧图 GPU 对象。旧图/旧预设格式、储存键、质量编码不变。自定义图存储使用新的 genle-composer-graph-v1 键。
