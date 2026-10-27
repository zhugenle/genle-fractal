# 逐帧 MP4 导出

2026-10-16，本地实现，未发布。替代 `mp4-viewport-export.md` 中原实时 MP4 策略；WebM 保留实时捕获。

## 接口和职责

- `src/state/mp4-muxer.js`：零依赖 ISO BMFF AVC muxer，接收 WebCodecs 输出和 decoderConfig；生成 avc1/avcC、stts、stsz、stsc、stco、stss，重排输出支持 signed ctts。结束前校验完整且唯一的帧序列，超过 1 GiB 中止。
- `src/state/studio-recording.js`：WebCodecs H.264 1080方形、30fps、16Mbps。N=round(duration×30)，进度 i/N、时间戳 round(i×1e6/30)，不采样重复的终点。固定所选 shader 档位，暂时关闭自适应，复用原 viewport compositor。每帧 draw 后同步 drawImage 拷贝 GPU 结果到合成画布，再创建 VideoFrame/encode/close。每4帧 flush 以限制编码队列；帧间让出事件循环，耗时不参与视频时钟。
- `render-loop.js`：逐帧任务占用时跳过实时推进与 draw，避免重复画面与时钟干扰。
- camera/preset/graph adapter：导出期间阻止视角、预设和外部公式包切换；session 保存原播放位置；bootstrap 在隐藏或 contextlost 时取消。
- config/build、i18n/HTML/少量 stage 样式：接线、提示与固定方形构图。公式、公共着色算法不变。

完成/取消/异常均关闭编码器，恢复原播放位置、控件、自适应开关和视窗尺寸。中途失败不下载部分视频。VideoEncoder 需要安全上下文；localhost 可用，LAN HTTP 提示使用本机地址或 HTTPS。无 WebCodecs 或不支持 AVC 配置时明确提示，不回退掉帧实时 MP4。

## 验证

- check/build/check:dist 通过，muxer 回归涵盖600帧/20秒、composition offset、mdat位置、缺帧拒绝。
- 本机真实开启自适应后导出 UBER；文件 stsz=600、stts delta=3000、mdhd timescale=90000/duration=1800000；浏览器解码为1080×1080、20秒，首帧和中段模型/相位/UI正常，无视频错误。
- SPIKED 导出取消后方形类移除，公式选择恢复可用，自适应恢复开启。
- 样例 outputs/mp4-offline-loop-600f.mp4；播放截图 outputs/mp4-offline-frames-verified.png（位于用户 Documents 输出目录，不打入 dist）。

限制：浏览器本地内存封装，1GiB保护；导出时间依设备和所选画质；视窗参考 GIF 若打开仍使用 GIF 自身时钟，分形和相位/时间轴按固定帧推进。

API 依据：[VideoEncoder](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder)、[encode](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/encode)。

## 1440 更新

按用户要求，MP4 渲染、UI 合成、编码与容器尺寸统一改为1440×1440；保持30fps逐帧策略，文件名改为 loop-ui-1440.mp4。提示与 README 已同步。

## Ultra 精度修复

导出原来虽关闭自适应，但内部尺寸始终等于1440输出，遗漏Ultra的2倍SSAA。现由页面渲染适配器mp4RenderDimensions区分采样/输出尺寸：Ultra=2880、shader4，其他=1440/所选档位；detailHeight跟随采样，mappingHeight保持1440使Screen材质不随SSAA变化。每帧核对实际drawingBuffer与shader档位、自适应关闭状态，硬件不能满足时失败，不降级。合成器high quality缩采样，H.264配置改为level4.1/32Mbps以减少细节压缩。
实测：Ultra + 自适应开启的起始状态，导出1秒30帧。逐帧记录 renderSize=2880×2880、shaderQuality=4、adaptive=false；输出avc1/1440×1440，浏览器解码时长1秒，无错误，画面状态显示 ULTRA / 2× SSAA。完成后恢复自适应开启与Ultra选项。check/build/check:dist通过。
