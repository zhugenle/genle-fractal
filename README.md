# genle_fractal

实时分形工作室：调节形态、视角、双材质与灯光，保存本地预设，导出 PNG、WebM 和 JSON。独立于原分形展厅，采用本地代码字体、黑白灰与荧光绿，支持中英切换。

开发源码位于 src，dist 是统一生成的发布目录。渲染器通过 fetch 加载 shader，不能直接双击 HTML。使用 Node 22 或更新版本，无需安装第三方运行依赖。

```text
npm run check
npm run build
npm run dev -- --port 4173
```

各 Codex 工作树使用不同端口；服务的 /__dev 会显示对应源码目录。只查看已构建页面时用 `npm run preview -- --port 4173`。

需要同一局域网设备访问时，使用 `npm run dev -- --port 4177 --lan`（或 preview 加 `--lan`）。服务会同时接受本机与局域网连接，并打印各网卡的访问地址；选择实际 Wi-Fi/以太网地址。Windows 防火墙需允许该端口的局域网入站连接。

模块边界见 [ARCHITECTURE.md](docs/ARCHITECTURE.md)，Codex 分工和交接见 [CODEX-WORKFLOW.md](docs/CODEX-WORKFLOW.md)，任务规则见 [AGENTS.md](AGENTS.md)。功能开发修改 src，不手改或整包覆盖 dist；集成任务统一生成产物和发布。

入口：
- /：genle_fractal 主工作室。
- 工作室只有一个 HTML 入口：index.html。通过静态 HTTP 服务打开根路径 /。
- /gallery.html：旧版五种分形展厅留档。
- /nodes.html：既有公式节点工作室；支持无扩展路由时可用 /nodes。

拖动/方向键旋转，滚轮/双指/加减键缩放。手机默认细致（1.5），电脑默认精细（2），均以 20 秒持续双相位动画开始，可暂停或定位时间轴。切换本地预设以 0.8 秒过渡，动画继续播放；超精细画质用于静帧。

画质旁的“自适应”每次加载默认关闭，旧的开启记录不会自动恢复；可以手动勾选开启：动态浏览以约 30 fps 为目标，优先在所选画质上限内减少渲染档位，再适度降低像素数量，动态上限约 200 万像素。首次载入直接使用当前像素上限；最低比例为每个 CSS 像素 1.25 个采样像素（受所选画质、像素上限与硬件限制）。不使用空间模糊或放大法线采样范围，几何/法线及 Screen 材质映射保留完整参考尺度。精细/细致自动降档最低到标准；主动选择流畅仍保持流畅。画面状态显示暂时使用的动态档位，所选画质及预设不被改写。达到像素下限后允许帧率下降，暂停并停止操作后恢复所选完整分辨率和档位，PNG 同样使用完整画质。关闭“自适应”可持续使用所选完整画质。无 GPU 计时扩展时使用帧间隔回退，目标帧率不保证在所有设备达到。WebM 锁定开始时的尺寸、相机比例、采样尺度与动态档位。

语言存入当前浏览器，动态状态随语言切换。已有预设名保留原文，新建未命名预设按当前语言命名。原存储键 uber-user-presets-v1 保留；需要备份时导出 JSON。

工作室字体：JetBrains Mono，本地 studio-code.woff2，SIL Open Font License 授权见 dist/studio-code-LICENSE.txt。留档展厅沿用 DM Sans。

形态源于 UBER BULB V3.0 Octane OSL，原公式 © 2020 Machina-Infinitum。有限步进和数值距离估计影响细节，并非 Octane 路径追踪。说明见 UBER-PORT.md 与 NODE-STUDIO.md。

GitHub Pages 使用 `.github/workflows/pages.yml` 检查源码、构建并自动发布 `dist`，自定义域名来源为 `release/pages/CNAME`（当前 `art.genle.cc`）。推送 main 等同发布。各功能任务提交源码到独立分支，集成任务统一处理上线。本地预设和主题色偏好按浏览器与站点分别存储。

主工作室顶部公式下拉框支持 UBER BULB / SPIKED CUBE。预设包含可选 formulaId，旧 JSON 仍按 UBER BULB 读取；节点页保持旧公式。
