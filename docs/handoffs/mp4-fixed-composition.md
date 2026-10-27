# 固定 MP4 导出构图

2026-10-28，本地实现，未发布。

原因：旧 viewport-capture 把 DOM getBoundingClientRect、computedStyle 字号和 Range 文本位置按 stage.width 缩放。CSS媒体查询、浏览器缩放和窗口尺寸会改变导出的字体大小、按钮换行和读数位置，即使编码尺寸始终1440也无法固定UI。

改为固定1440×1440设计坐标，直接合成GPU方形画布，再绘制标题、视角按钮、全屏图标、双相位、caption和底部时间轴/画质/关闭的自适应指示。标题/按钮两行、相位左上与右下、底栏单行均按用户提供截图比例。没有绘制截图查看器左右翻页箭头。UI固定本地StudioCode，开始前显式等待字体；颜色与语言在启动时快照，文字大小和位置不读取DOM布局。相位、帧号和时间从离线帧状态显式传入。长公式名和SPIKED度数在固定区域内适配，不影响其他元素。

renderer adapter的MP4尺寸元数据也不再接收CSS高度：Ultra2880采样、其他1440，输出1440，mappingHeight1440，固定方形cameraScale1.12。现有相机yaw/pitch/distance/roll、公式、材质灯光仍由用户设置决定；不同场景内容自然不同，同一场景不会受窗口尺寸改变。保持逐帧30fps及Ultra 2×SSAA、32Mbps H.264。

导出视窗的临时CSS方形仅用于操作预览，不再决定导出版式。参考GIF对照面板是网页辅助，不纳入固定参考构图。PNG和实时WebM路径未改。

验证：桌面1280×900及手机390×844，同页同参数/画质导出1秒30帧，H.264解码首帧1440×1440逐像素一致（ImageChops difference=None）。浏览器无错误；check/build/check:dist通过；设计检测器未发现问题。样片首帧 outputs/mp4-fixed-desktop.png、mp4-fixed-mobile.png 位于用户Documents输出目录，不进入发布包。

涉及UI compositor、state录制接线、studio render adapter和README；未修改公式、公共shader、预设格式或发布配置。
