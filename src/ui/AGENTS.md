# 界面任务

主页只改 `studio/`，节点只改 `nodes/`，旧展厅只改 `gallery/`。
保留用户已确认的代码字体、黑白灰、可选主题色和 compact 控件。修改控件调用应通过对应的页面适配器/状态方法，不把分形算法移入 UI。
`render-adapter.js`、`render-loop.js` 是页面与公共 renderer 的兼容接线层。改共享调用约定时列出 renderer/state 影响；不自行修改公式 kernel 或发布配置。
