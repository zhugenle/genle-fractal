# MP4 H.264 正方形视窗导出

2026-10-15。本地实现，未发布。保留当前公式、材质、灯光、相机和 preset schema；原 WebM 仍为原画布录制。

新增 [mp4] 按钮：1080×1080、显式 avc1 H.264、12Mbps、30fps 请求帧、一次当前周期、无音轨。以 0 开始完成整个 loop。当前所选 shader 档位固定，避免自适应波动；低性能设备可能实际掉帧。

导出期间视窗暂时方形，按平方视窗重新构图，不拉伸画面；视窗 DOM 叠层由 UI adapter 合成到 origin-clean 2D canvas，包括字体/实时相位/时间轴/画质/select/checkbox/按钮/SVG/角标/打开的 GIF。编码器捕获合成画布，非只捕获 WebGL。右侧参数和视窗外 transport 不入画。

恢复先前播放/进度、视窗比例和控件 disabled 状态；取消、隐藏页面和 WebGL 丢失不下载残缺视频；停止所有 track。浏览器不支持显式 H.264 MP4 时给出提示，不把 WebM 改扩展名。数据仅浏览器本地处理。

涉及 state/studio-recording、studio/viewport-capture、render-loop/HTML/样式/i18n/bootstrap、构建清单；未改公式核、公共光照/材质、发布配置。

API 依据：https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static 和 https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream 。

验证：check/build/check:dist 通过；LAN URL 的 native MIME 为 video/mp4;codecs=avc1.420028。真实下载文件 stsd 样本编码为 avc1、1080×1080；浏览器视频解码尺寸一致，时长20.022秒（20秒循环，约一帧误差）。实际视频截图确认UI合成字体与实时相位。SPIKED录制/取消后 stage 方形类移除、控件恢复、原暂停状态恢复。示例保存在工作区外 outputs，未放入发布产物。
