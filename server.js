const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const path = require("path");
const url = require("url");
const formidable = require("formidable");// need to install formidable package

// Certificates obtained using Let's Encrypt
const server = https.createServer({
  cert: fs.readFileSync("/etc/letsencrypt/live/vrdanmaku.uk/fullchain.pem"),
  key: fs.readFileSync("/etc/letsencrypt/live/vrdanmaku.uk/privkey.pem"),
});

const wss = new WebSocket.Server({ server });

// 视频存储目录  
const VIDEOS_DIR = path.join(__dirname, "videos");
// 确保视频目录存在  
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR);
}
// 存储视频信息的文件  
const VIDEO_INFO_FILE = path.join(__dirname, "video_info.json");
// 如果视频信息文件不存在，创建一个空的  
if (!fs.existsSync(VIDEO_INFO_FILE)) {
  fs.writeFileSync(VIDEO_INFO_FILE, JSON.stringify({ videos: [] }), "utf-8");
}

// 加载视频信息  
let videoInfo = JSON.parse(fs.readFileSync(VIDEO_INFO_FILE, "utf-8"));

// HTTP请求处理  
server.on("request", (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  res.setHeader('Access-Control-Allow-Origin', 'https://vrdanmaku.uk');  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');  
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');  
  res.setHeader('Access-Control-Allow-Credentials', 'true');  
  
  // 处理OPTIONS预检请求  
  if (req.method === 'OPTIONS') {  
    res.writeHead(200);  
    res.end();  
    return;  
  }  

  // 处理视频上传
  if (req.method === "POST" && parsedUrl.pathname === "/upload") {
    const form = new formidable.IncomingForm({
      uploadDir: VIDEOS_DIR,
      keepExtensions: true,
      maxFileSize: 2000 * 1024 * 1024, // 设置为2GB  
      multiples: true 
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Detail upload error:", err);  
        // 确保错误信息被正确发送回客户端  
        res.writeHead(500, { "Content-Type": "application/json" });  
        res.end(JSON.stringify({ success: false, message: err.message })); 
        return;
      }

      try {
        // 确保files.video存在且是数组
        if (!files.video || !Array.isArray(files.video) || files.video.length === 0) {
          console.error("No video file found in request");
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("No video file in request");
          return;
        }

        const file = files.video[0];
        console.log("Uploaded file:", file); // 调试信息

        // 使用正确的文件名
        const newFileName = file.originalFilename || `video_${Date.now()}${path.extname(file.filepath)}`;
        const newPath = path.join(VIDEOS_DIR, newFileName);

        // 正确重命名上传的文件
        fs.renameSync(file.filepath, newPath);
        console.log(`File renamed from ${file.filepath} to ${newPath}`);

        // 添加视频信息  
        const videoId = Date.now().toString();
        const videoUrl = `https://vrdanmaku.uk/videos/${newFileName}`;

        const newVideo = {
          id: videoId,
          name: fields.name?.[0] || newFileName, // 适配formidable 3.x的字段格式
          url: videoUrl,
          tags: fields.tags?.[0] || "",
          uploadDate: new Date().toISOString()
        };

        videoInfo.videos.push(newVideo);
        fs.writeFileSync(VIDEO_INFO_FILE, JSON.stringify(videoInfo), "utf-8");

        // 广播新视频通知  
        broadcastVideoList();

        console.log("Upload success, sending response:", { success: true, video: newVideo });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, video: newVideo }));
      } catch (error) {
        console.error("Error processing upload:", error);
        res.writeHead(500, { "Content-Type": "application/json" });  
        res.end(JSON.stringify({ success: false, message: error.message }));  
      }
    });
    return;
  }

  // 获取视频列表  
  if (req.method === "GET" && parsedUrl.pathname === "/videos") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(videoInfo));
    return;
  }

  // // 提供视频文件  
  // if (req.method === "GET" && parsedUrl.pathname.startsWith("/videos/")) {
  //   const videoName = parsedUrl.pathname.split("/videos/")[1];
  //   const videoPath = path.join(VIDEOS_DIR, videoName);

  //   if (fs.existsSync(videoPath)) {
  //     const stat = fs.statSync(videoPath);
  //     res.writeHead(200, {
  //       "Content-Type": "video/mp4",
  //       "Content-Length": stat.size
  //     });
  //     const readStream = fs.createReadStream(videoPath);
  //     readStream.pipe(res);
  //   } else {
  //     res.writeHead(404, { "Content-Type": "text/plain" });
  //     res.end("Video not found");
  //   }
  //   return;
  // }
});

// 广播视频列表给所有客户端  
function broadcastVideoList() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ type: "video_list", data: videoInfo.videos })
      );
    }
  });
}

const GLOBAL_ANNOTATION_FILE = "global_annotations.json";   // Global annotation file

// Load annotation library
function loadAnnotationLibrary() {
  const filepath = path.join(__dirname, GLOBAL_ANNOTATION_FILE);
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  }
  return [];
}

// Save annotation library
function saveAnnotationLibrary(library) {
  const filepath = path.join(__dirname, GLOBAL_ANNOTATION_FILE);
  fs.writeFileSync(filepath, JSON.stringify(library, null, 2), "utf-8");
}

wss.on("connection", (ws) => {

  // Send the video list to the new client 
  ws.send(
    JSON.stringify({
      type: "video_list",
      data: videoInfo.videos
    })
  );

  // Send existing annotations to the new client
  const library = loadAnnotationLibrary();
  ws.send(JSON.stringify({
    type: "existing_annotation",
    data: library
  }));

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "new_video") {
      const library = loadAnnotationLibrary();
      // Send existing annotation to the client
      ws.send(JSON.stringify({ type: "existing_annotation", data: library }));
    }
    else if (parsedMessage.type === "new_annotation") {
      const annotationMessage = {
        text: parsedMessage.text,
        time: parsedMessage.time,
        position: parsedMessage.position,
        videoLink: parsedMessage.videoLink,
      };

      // Save the annotation message to the library
      const library = loadAnnotationLibrary();
      library.push(annotationMessage);
      saveAnnotationLibrary(library);

      // Broadcast annotation messages to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({ type: "new_annotation", data: annotationMessage })
          );
        }
      });
    }
    else if (parsedMessage.type === "delete_annotation") {
      // 获取要删除的注释索引或ID  
      const annotationId = parsedMessage.annotationId;

      // 加载现有注释  
      const library = loadAnnotationLibrary();

      // 找到并删除指定的注释  
      const annotationIndex = library.findIndex(a =>
        a.time === parsedMessage.time &&
        a.text === parsedMessage.text &&
        a.videoLink === parsedMessage.videoLink
      );

      if (annotationIndex !== -1) {
        // 从库中移除注释  
        library.splice(annotationIndex, 1);

        // 保存更新后的注释库  
        saveAnnotationLibrary(library);

        // 向所有客户端广播删除事件  
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "annotation_deleted",
                data: { index: annotationIndex }
              })
            );
          }
        });
      }
    }
    else if (parsedMessage.type === "update_video_name") {
      // 更新视频名称  
      const { videoId, newName } = parsedMessage;
      const videoIndex = videoInfo.videos.findIndex(v => v.id === videoId);

      if (videoIndex !== -1) {
        videoInfo.videos[videoIndex].name = newName;
        fs.writeFileSync(VIDEO_INFO_FILE, JSON.stringify(videoInfo), "utf-8");
        broadcastVideoList();
      }
    }
    else if (parsedMessage.type === "delete_video") {
      // 删除视频  
      const { videoId } = parsedMessage;
      const videoIndex = videoInfo.videos.findIndex(v => v.id === videoId);

      if (videoIndex !== -1) {
        const video = videoInfo.videos[videoIndex];
        const videoPath = path.join(__dirname, video.url);

        // 尝试删除文件  
        try {
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        } catch (err) {
          console.error("Error deleting video file:", err);
        }

        // 从列表中移除  
        videoInfo.videos.splice(videoIndex, 1);
        fs.writeFileSync(VIDEO_INFO_FILE, JSON.stringify(videoInfo), "utf-8");
        broadcastVideoList();
      }
    }
    else if (parsedMessage.type === "request_video_list") {
      // 发送视频列表  
      ws.send(
        JSON.stringify({
          type: "video_list",
          data: videoInfo.videos
        })
      );
    }
  });

  ws.send(
    JSON.stringify({
      type: "welcome",
      data: "Welcome to the WebSocket server!",
    })
  );

});

server.listen(8080, () => {
  console.log("WebSocket server is running on wss://vrdanmaku.uk:8080");
});