# Setup Instructions / 部署说明

**Language / 语言选择**: [English](#english-version) | [中文](#中文版本)

---

This guide provides detailed instructions for deploying the VR Borehole Visualization web application on AWS EC2.

### AWS Configuration

#### 1. Select Instance
- On the Amazon Machine Image (AMI) selection page, click **Ubuntu**

#### 2. Choose Instance Type
- Select **t2.micro** instance type (part of AWS Free Tier)
- Click "Next: Configure Instance Details"

#### 3. Default Configuration
- Use default settings for instance details

#### 4. Add Storage
- Default 8GB storage is sufficient

#### 5. Create Security Group
- Create a new security group with appropriate rules:
  - SSH (port 22) for server access
  - HTTP (port 80) for web traffic
  - HTTPS (port 443) for secure web traffic
  - Custom TCP (port 8080) for WebSocket server

#### 6. Launch Instance
- Review and launch the instance
- Download the private key (.pem file) for SSH access

### Server Configuration (Using MobaXterm)

#### 1. Update Instance
```bash
sudo apt update -y
sudo apt upgrade -y
```

#### 2. Install Apache Web Server
```bash
sudo apt install apache2 -y
```

#### 3. Start Apache Service
```bash
sudo systemctl start apache2
```

#### 4. Enable Apache Auto-start
```bash
sudo systemctl enable apache2
```

#### 5. Configure Firewall
```bash
sudo ufw allow 'Apache Full'
sudo ufw allow OpenSSH  # Preserve SSH access
sudo ufw enable
```

### Deploy A-Frame Frontend

#### 1. Web Root Directory
- Location: `/var/www/html`

#### 2. Configure File Permissions
```bash
sudo chown -R www-data:www-data /var/www/html
```

#### 3. Create HTML File
```bash
sudo nano /var/www/html/index.html
```

#### 4. Add Your Code
- Copy your A-Frame application code to complete frontend deployment

### Setup Backend WebSocket Server

The backend server setup follows similar AWS instance creation steps:

#### 1. Install Node.js and WebSocket Module
Connect to the EC2 instance and install Node.js:
```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_IP
sudo apt update
sudo apt install -y nodejs npm
```

#### 2. Create Directory and Install Dependencies
```bash
mkdir websocket-server
cd websocket-server
npm init -y
npm install ws formidable
```

#### 3. Create WebSocket Server
Create a file named `server.js` and add your WebSocket server code.

#### 4. Run Server
```bash
node server.js
```

### Production Considerations

#### SSL Certificate (Recommended)
For HTTPS support, install Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache
```

#### Process Management
Use PM2 for production deployment:
```bash
sudo npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

---

本指南提供在 AWS EC2 上部署 VR 钻孔可视化 Web 应用的详细说明。

### AWS 配置

#### 1. 选择实例
- 在选择 Amazon Machine Image (AMI) 的页面，点击 **Ubuntu**

#### 2. 选择实例类型
- 选择 **t2.micro** 实例类型，它是 AWS 免费套餐的一部分
- 点击"Next: Configure Instance Details"

#### 3. 选择默认配置
- 使用实例详细信息的默认设置

#### 4. 添加存储
- 默认 8GB 存储就够了

#### 5. 创建安全组
- 创建新的安全组并配置适当规则：
  - SSH (端口 22) 用于服务器访问
  - HTTP (端口 80) 用于 Web 流量
  - HTTPS (端口 443) 用于安全 Web 流量
  - 自定义 TCP (端口 8080) 用于 WebSocket 服务器

#### 6. 启动实例
- 检查并启动实例
- 下载私钥文件 (.pem) 用于 SSH 访问

### 配置服务器（以 MobaXterm 为例）

#### 1. 更新实例
```bash
sudo apt update -y
sudo apt upgrade -y
```

#### 2. 安装 Apache Web 服务器
```bash
sudo apt install apache2 -y
```

#### 3. 启动 Apache 服务
```bash
sudo systemctl start apache2
```

#### 4. 设置 Apache 开机启动
```bash
sudo systemctl enable apache2
```

#### 5. 调整防火墙设置
```bash
sudo ufw allow 'Apache Full'
sudo ufw allow OpenSSH  # 保留 SSH 访问
sudo ufw enable
```

### 部署 A-Frame 前端

#### 1. 网页根目录
- 位置：`/var/www/html`

#### 2. 配置文件权限
```bash
sudo chown -R www-data:www-data /var/www/html
```

#### 3. 在根目录创建 HTML 文件
```bash
sudo nano /var/www/html/index.html
```

#### 4. 添加代码
- 复制你的 A-Frame 应用代码即可完成前端部署

### 搭建后端 WebSocket 服务器

后端服务器搭建遵循相似的 AWS 实例创建步骤：

#### 1. 安装 Node.js 和 WebSocket 模块
连接到 EC2 实例并安装 Node.js：
```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_IP
sudo apt update
sudo apt install -y nodejs npm
```

#### 2. 创建目录并安装依赖
```bash
mkdir websocket-server
cd websocket-server
npm init -y
npm install ws formidable
```

#### 3. 创建 WebSocket 服务器
创建一个名为 `server.js` 的文件，并添加你的 WebSocket 服务器代码。

#### 4. 运行服务器
```bash
node server.js
```

### 生产环境考虑

#### SSL 证书（推荐）
为支持 HTTPS，安装 Let's Encrypt：
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache
```

#### 进程管理
使用 PM2 进行生产部署：
```bash
sudo npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

---

### Troubleshooting / 故障排除

**Common Issues / 常见问题:**

1. **Port Access Issues / 端口访问问题**
   - Check security group settings / 检查安全组设置
   - Verify firewall rules / 验证防火墙规则

2. **WebSocket Connection Failed / WebSocket 连接失败**
   - Ensure port 8080 is open / 确保端口 8080 已开放
   - Check server logs / 检查服务器日志

3. **HTTPS Required for Speech Recognition / 语音识别需要 HTTPS**
   - Install SSL certificate / 安装 SSL 证书
   - Use HTTPS URLs in code / 在代码中使用 HTTPS URL

For additional support, please refer to the main [README](../README.md) or create an issue in the project repository.

如需额外支持，请参考主 [README](../README.md) 或在项目仓库中创建问题。