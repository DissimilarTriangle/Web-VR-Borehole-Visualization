# VR Borehole Visualization - Web Application

**Language / 语言选择**: [English](README.md) | [中文](README_CN.md) 

An immersive VR borehole visualization web application based on A-Frame, featuring real-time collaboration, speech recognition, and danmaku annotation system.

## 🎥 Project Demo

[![VR Borehole Visualization Demo](docs\web_vr_vision.png)](https://youtu.be/m6ddmVAsw4Q)


## ✨ Key Features

- 🥽 **VR Immersive Experience**: 360° VR video playback based on A-Frame
- 👥 **Multi-user Collaboration**: WebSocket real-time synchronization, supporting multiple users watching simultaneously
- 🎤 **Speech Recognition**: Web Speech API for voice-to-text annotations
- 💬 **Real-time Danmaku**: 3D spatial annotation system, supporting add/delete/jump functionality
- 📱 **Cross-platform**: Support for PC, mobile devices, and VR headsets
- 🎬 **Video Management**: Support for multi-video switching, upload, and online links
- ⚡ **Real-time Sync**: Video playback progress and annotations synchronized in real-time

## 🏗️ System Architecture

![Architecture](docs\system_architecture.png)

- **Frontend**: A-Frame VR + WebSocket Client
- **Backend**: Node.js + WebSocket Server
- **Deployment**: AWS EC2 + HTTPS + PM2


### Production Deployment

For detailed deployment instructions, please refer to [Setup Documentation](docs/setup-instructions.md)

## 🎮 Usage Guide

### Basic Operations
- **Playback Control**: Use bottom playback control buttons
- **View Control**: Mouse drag or VR headset rotation
- **Add Annotations**: Type in input box or use speech recognition 🎤
- **Switch Videos**: Click toggle button to switch between vid1/vid2

### VR Mode
1. Click VR icon in bottom-right corner to enter VR mode
2. Use VR controllers or gaze control for interaction
3. Support for mainstream VR devices like Oculus, HTC Vive

### Multi-user Collaboration
- Multiple users access the same link
- Video playback progress automatically synchronized
- Annotations broadcast to all users in real-time

## 📁 Project Structure

```
src/
├── client/           # Frontend code
│   └── index.html   # Main page
└── server/          # Backend code
    └── server.js    # WebSocket server

docs/                # Documentation and screenshots
assets/             # Asset files
deployment/         # Deployment related
```

## 🛠️ Tech Stack

### Frontend
- **A-Frame**: VR Web framework
- **Three.js**: 3D graphics library
- **WebSocket**: Real-time communication
- **Web Speech API**: Speech recognition

### Backend
- **Node.js**: Server runtime
- **WebSocket (ws)**: Real-time communication server
- **Formidable**: File upload handling
- **HTTPS**: Secure transmission

### Deployment
- **AWS EC2**: Cloud server
- **Let's Encrypt**: SSL certificate
- **PM2**: Process management
- **Apache**: Web server

## 🔧 Configuration

### WebSocket Connection

Modify the WebSocket address in [`src/client/index.html`](src/client/index.html):

```javascript
// Development environment
var ws = new WebSocket("wss://localhost:8080");

// Production environment (Note: This domain is currently deprecated)
var ws = new WebSocket("wss://vrdanmaku.uk:8080"); 

```

## 🙏 Acknowledgments

### Technical Frameworks
- [A-Frame](https://aframe.io/) - VR Web development framework
- [Three.js](https://threejs.org/) - 3D JavaScript library
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) - Real-time communication technology


### Special Thanks
- **Dr. Waleed Al-Nuaimy, Dr. Zong Nan, Mr. Xu Jiang**: Providing project guidance and technical support
