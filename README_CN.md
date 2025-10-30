# VR Borehole Visualization - Web Application

**Language / 语言选择**: [English](README.md) | [中文](README_CN.md) 

一个基于 A-Frame 的沉浸式 VR 钻孔可视化 Web 应用，支持实时协作、语音识别和弹幕注释功能。

## 🎥 项目演示

[![VR Borehole Visualization Demo](docs\web_vr_vision.png)](https://youtu.be/m6ddmVAsw4Q)


## ✨ 主要功能

- 🥽 **VR 沉浸式体验**: 基于 A-Frame 的 360° VR 视频播放
- 👥 **多用户协作**: WebSocket 实时同步，支持多用户同时观看
- 🎤 **语音识别**: Web Speech API 语音转文字注释
- 💬 **实时弹幕**: 3D 空间注释系统，支持添加/删除/跳转
- 📱 **跨平台**: 支持 PC、移动设备和 VR 头显
- 🎬 **视频管理**: 支持多视频切换、上传和在线链接
- ⚡ **实时同步**: 视频播放进度和注释实时同步

## 🏗️ 系统架构

![Architecture](docs\system_architecture.png)

- **前端**: A-Frame VR + WebSocket 客户端
- **后端**: Node.js + WebSocket Server
- **部署**: AWS EC2 + HTTPS + PM2


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

// 生产环境 （注意：该域名目前已弃用） 
var ws = new WebSocket("wss://vrdanmaku.uk:8080"); 

```

## 🙏 致谢

### 技术框架
- [A-Frame](https://aframe.io/) - VR Web 开发框架
- [Three.js](https://threejs.org/) - 3D JavaScript 库
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) - 实时通信技术


### 特别感谢
- **Dr. Waleed Al-Nuaimy，Dr. Zong Nan，Mr. Xu Jiang**: 提供项目指导和技术支持
