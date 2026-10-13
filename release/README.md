# 发布工作

发布任务维护 `.github/workflows/`、`release/pages/`、`.openai/hosting.json` 和发布记录，不负责公式与界面开发。

当前主链路为 GitHub Pages：工作流先检查源码，再生成 dist，然后上传产物；`release/pages/CNAME` 保留现有 `art.genle.cc` 域名。`.openai/hosting.json` 为原 Sites 站点配置，保留兼容，不自动向两个宿主同时发布。

交付顺序：确定待发布提交与目标宿主 → 构建/检查 → 查看主页及节点 → 在授权范围内触发发布 → 确认线上版本和域名 → 记录提交与结果。发布任务不得从公式工作树取整包 dist 覆盖集成目录。

推送 main 会自动上线；功能任务只提交自己的分支。回滚使用上一个已验证的提交重新构建/发布，不在生产目录手改 HTML 或 shader。密钥和访问凭据由宿主或环境管理，不写入源码、构建记录或预设。
