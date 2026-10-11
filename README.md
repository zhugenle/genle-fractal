# genle_fractal

实时分形工作室：调节形态、视角、双材质与灯光，保存本地预设，导出 PNG、WebM 和 JSON。独立于原分形展厅，采用本地代码字体、黑白灰与荧光绿，支持中英切换。

用任意静态 HTTP 服务运行 dist 文件夹。渲染器通过 fetch 加载 shader，不能直接双击 HTML。

入口：
- /：genle_fractal 主工作室。
- 工作室只有一个 HTML 入口：index.html。通过静态 HTTP 服务打开根路径 /。
- /gallery.html：旧版五种分形展厅留档。
- /nodes.html：既有公式节点工作室；支持无扩展路由时可用 /nodes。

拖动/方向键旋转，滚轮/双指/加减键缩放。默认精细画质与 20 秒持续双相位动画，可暂停或定位时间轴。切换本地预设以 0.8 秒过渡，动画继续播放；超精细画质用于静帧。

语言存入当前浏览器，动态状态随语言切换。已有预设名保留原文，新建未命名预设按当前语言命名。原存储键 uber-user-presets-v1 保留；需要备份时导出 JSON。

工作室字体：JetBrains Mono，本地 studio-code.woff2，SIL Open Font License 授权见 dist/studio-code-LICENSE.txt。留档展厅沿用 DM Sans。

形态源于 UBER BULB V3.0 Octane OSL，原公式 © 2020 Machina-Infinitum。有限步进和数值距离估计影响细节，并非 Octane 路径追踪。说明见 UBER-PORT.md 与 NODE-STUDIO.md。

GitHub Pages 使用 `.github/workflows/pages.yml` 自动发布 `dist`，自定义域名为 `art.genle.cc`。本地预设和主题色偏好按浏览器与站点分别存储。
