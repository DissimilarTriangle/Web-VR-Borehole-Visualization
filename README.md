# VR Borehole Visualization - Web Application

一个基于 A-Frame 的沉浸式 VR 钻孔可视化 Web 应用，支持实时协作、语音识别和弹幕注释功能。

## 🎥 项目演示

[![VR Borehole Visualization Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

[🔗 观看完整演示视频](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

## ✨ 主要功能

- 🥽 **VR 沉浸式体验**: 基于 A-Frame 的 360° VR 视频播放
- 👥 **多用户协作**: WebSocket 实时同步，支持多用户同时观看
- 🎤 **语音识别**: Web Speech API 语音转文字注释
- 💬 **实时弹幕**: 3D 空间注释系统，支持添加/删除/跳转
- 📱 **跨平台**: 支持 PC、移动设备和 VR 头显
- 🎬 **视频管理**: 支持多视频切换、上传和在线链接
- ⚡ **实时同步**: 视频播放进度和注释实时同步

## 🏗️ 系统架构

![Architecture](docs/architecture.png)

- **前端**: A-Frame VR + WebSocket 客户端
- **后端**: Node.js + WebSocket Server
- **部署**: AWS EC2 + HTTPS + PM2

## 📸 功能截图

| VR 钻孔视图 | 弹幕注释列表 |
|------------|-------------|
| ![VR View](docs/screenshots/vr-borehole.png) | ![Danmaku List](docs/screenshots/danmaku-list.png) |

| 语音识别输入 | 多视频同步 |
|-------------|-----------|
| ![Speech Recognition](docs/screenshots/speech-recognition.png) | ![Video Sync](docs/screenshots/synchronized-video.png) |

## 🚀 快速开始

### 环境要求

- Node.js 14+
- 支持 WebRTC 的现代浏览器
- HTTPS 环境（语音识别需要）

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/YOUR_USERNAME/VR-Borehole-Visualization.git
   cd VR-Borehole-Visualization
   ```

2. **安装依赖**
   ```bash
   cd src/server
   npm install ws formidable
   ```

3. **启动开发服务器**
   ```bash
   node server.js
   ```

4. **访问应用**
   ```
   打开浏览器访问: https://localhost:8080
   ```

### 生产部署

详细部署说明请参考 [部署文档](docs/setup-instructions.md)

## 🎮 使用说明

### 基本操作
- **播放控制**: 使用底部播放控制按钮
- **视角控制**: 鼠标拖拽或 VR 头显转动
- **添加注释**: 在输入框输入文字或使用语音识别 🎤
- **切换视频**: 点击切换按钮在 vid1/vid2 间切换

### VR 模式
1. 点击右下角 VR 图标进入 VR 模式
2. 使用 VR 手柄或视线控制进行交互
3. 支持 Oculus、HTC Vive 等主流 VR 设备

### 多用户协作
- 多个用户访问同一链接
- 视频播放进度自动同步
- 注释实时广播给所有用户

## 📁 项目结构

```
src/
├── client/           # 前端代码
│   └── index.html   # 主页面
└── server/          # 后端代码
    └── server.js    # WebSocket 服务器

docs/                # 文档和截图
assets/             # 资源文件
config/             # 配置文件
deployment/         # 部署相关
```

## 🛠️ 技术栈

### 前端
- **A-Frame**: VR Web 框架
- **Three.js**: 3D 图形库
- **WebSocket**: 实时通信
- **Web Speech API**: 语音识别

### 后端
- **Node.js**: 服务器运行时
- **WebSocket (ws)**: 实时通信服务器
- **Formidable**: 文件上传处理
- **HTTPS**: 安全传输

### 部署
- **AWS EC2**: 云服务器
- **Let's Encrypt**: SSL 证书
- **PM2**: 进程管理
- **Apache**: Web 服务器

## 🔧 配置说明

### WebSocket 连接

修改 [`src/client/index.html`](src/client/index.html) 中的 WebSocket 地址：

```javascript
// 开发环境
var ws = new WebSocket("wss://localhost:8080");

// 生产环境  
var ws = new WebSocket("wss://vrdanmaku.uk:8080");
```

### 视频文件

由于 GitHub 文件大小限制，视频文件需要单独获取：

1. 联系项目维护者获取示例视频
2. 或将你的 VR 视频文件放入 `assets/videos/` 目录
3. 支持格式：MP4, WebM (推荐)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 更新日志

- **v1.0.0** (2024-03-XX)
  - 初始版本发布
  - VR 视频播放功能
  - WebSocket 实时同步
  - 语音识别注释

## 🙏 致谢

### 技术框架
- [A-Frame](https://aframe.io/) - VR Web 开发框架
- [Three.js](https://threejs.org/) - 3D JavaScript 库
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) - 实时通信技术

### 开源贡献者
- 感谢所有为此项目提供建议和代码的贡献者

### 特别感谢
- **指导老师**: 提供项目指导和技术支持
- **测试用户**: 提供宝贵的用户体验反馈
- **AWS**: 提供云服务器支持

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **项目维护者**: [Your Name](mailto:your.email@example.com)
- **项目主页**: [GitHub Repository](https://github.com/YOUR_USERNAME/VR-Borehole-Visualization)
- **问题反馈**: [Issues](https://github.com/YOUR_USERNAME/VR-Borehole-Visualization/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个 star！