# 公共渲染任务

维护 GPU 底座、性能预算、材质/灯光数学、shader profile 和渲染参数定义。
公式迭代代码位于 `../formulas/`，页面 DOM 适配位于 `../ui/`。优化优先保持公式结果与既有视觉；不要以删掉反射、改迭代次数替代测量。
两种 profile 当前质量编号不同，参考 `../contracts/RENDERER-V1.md`。不得修改发布配置或把旧 node profile 当作主工作室的同一版本。
