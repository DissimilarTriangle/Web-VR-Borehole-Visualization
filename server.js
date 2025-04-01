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

// Video storage directory
const VIDEOS_DIR = path.join(__dirname, "videos");
// Make sure the video directory exists 
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR);
}
// Files that store video information
const VIDEO_INFO_FILE = path.join(__dirname, "video_info.json");
// If the video information file does not exist, create an empty one
if (!fs.existsSync(VIDEO_INFO_FILE)) {
  fs.writeFileSync(VIDEO_INFO_FILE, JSON.stringify({ videos: [] }), "utf-8");
}

// Load video information
let videoInfo = JSON.parse(fs.readFileSync(VIDEO_INFO_FILE, "utf-8"));

// Http request processing
server.on("request", (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  res.setHeader('Access-Control-Allow-Origin', 'https://vrdanmaku.uk');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle options preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Process video upload
  if (req.method === "POST" && parsedUrl.pathname === "/upload") {
    const form = new formidable.IncomingForm({
      uploadDir: VIDEOS_DIR,
      keepExtensions: true,
      maxFileSize: 2000 * 1024 * 1024, // Set video limitation 2GB  
      multiples: true
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Detail upload error:", err);
        // The error message is correctly sent back to the client
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: err.message }));
        return;
      }

      try {
        // Make sure files.video exists and is an array
        if (!files.video || !Array.isArray(files.video) || files.video.length === 0) {
          console.error("No video file found in request");
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("No video file in request");
          return;
        }

        const file = files.video[0];
        console.log("Uploaded file:", file); // Debugging information

        // Use the correct file name
        const newFileName = file.originalFilename || `video_${Date.now()}${path.extname(file.filepath)}`;
        const newPath = path.join(VIDEOS_DIR, newFileName);

        // Correctly rename uploaded files
        fs.renameSync(file.filepath, newPath);
        console.log(`File renamed from ${file.filepath} to ${newPath}`);

        // Add video information
        const videoId = Date.now().toString();
        const videoUrl = `https://vrdanmaku.uk/videos/${newFileName}`;

        const newVideo = {
          id: videoId,
          name: fields.name?.[0] || newFileName, // formidable 3.x
          url: videoUrl,
          tags: fields.tags?.[0] || "",
          uploadDate: new Date().toISOString()
        };

        videoInfo.videos.push(newVideo);
        fs.writeFileSync(VIDEO_INFO_FILE, JSON.stringify(videoInfo), "utf-8");

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

  // Get a video list
  if (req.method === "GET" && parsedUrl.pathname === "/videos") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(videoInfo));
    return;
  }
});

// Broadcast video list to all clients 
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
  try {
    fs.writeFileSync(filepath, JSON.stringify(library, null, 2), "utf-8");
    console.log("Annotation library saved successfully");
  } catch (error) {
    console.error("Error saving annotation library:", error);
  }
}

wss.on("connection", (ws) => {
  console.log("New client connected");  
  // Send the video list to the new client 
  ws.send(
    JSON.stringify({
      type: "video_list",
      data: videoInfo.videos
    })
  );

  // Send existing annotations to the new client
  const library = loadAnnotationLibrary();
  console.log("Sending existing annotations to new client");
  ws.send(JSON.stringify({
    type: "existing_annotation",
    data: library
  }));

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    console.log("Received message type:", parsedMessage.type);
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
      // Check if the annotation already exists
      const exists = library.some(anno =>
        anno.text === annotationMessage.text &&
        anno.time === annotationMessage.time &&
        anno.videoLink === annotationMessage.videoLink
      );
      // Add and broadcast only if it does not exist
      if (!exists) {
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
    }
    else if (parsedMessage.type === "delete_annotation") {
      // Load existing annotations
      const library = loadAnnotationLibrary();
      console.log("Received delete request:", parsedMessage);  
      console.log("Current library before deletion:", library);  

      // Find and delete the specified annotation
      const EPSILON = 0.001; //Permitted time error range
      const annotationIndex = library.findIndex(a =>
        Math.abs(a.time - parsedMessage.time) < EPSILON &&
        a.text === parsedMessage.text
      );

      console.log("Found annotation at index:", annotationIndex);  

      if (annotationIndex !== -1) {
        library.splice(annotationIndex, 1);//Remove annotation from the library
        saveAnnotationLibrary(library);//Save updated annotation library
        console.log("Library after deletion:", library);  

        // Broadcast delete events to all clients
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
      }else {
        console.log("Annotation not found for deletion:", parsedMessage);  
      }
    }
    else if (parsedMessage.type === "update_video_name") {
      //Update video name
      const { videoId, newName } = parsedMessage;
      const videoIndex = videoInfo.videos.findIndex(v => v.id === videoId);

      if (videoIndex !== -1) {
        videoInfo.videos[videoIndex].name = newName;
        fs.writeFileSync(VIDEO_INFO_FILE, JSON.stringify(videoInfo), "utf-8");
        broadcastVideoList();
      }
    }
    else if (parsedMessage.type === "delete_video") {
      // delete video
      const { videoId } = parsedMessage;
      const videoIndex = videoInfo.videos.findIndex(v => v.id === videoId);

      if (videoIndex !== -1) {
        const video = videoInfo.videos[videoIndex];
        const videoPath = path.join(__dirname, video.url);

        // Try to delete the video file 
        try {
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        } catch (err) {
          console.error("Error deleting video file:", err);
        }

        // Remove video from the list  
        videoInfo.videos.splice(videoIndex, 1);
        fs.writeFileSync(VIDEO_INFO_FILE, JSON.stringify(videoInfo), "utf-8");
        broadcastVideoList();
      }
    }
    else if (parsedMessage.type === "request_video_list") {
      // Send video list
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