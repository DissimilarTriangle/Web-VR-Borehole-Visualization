const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const path = require("path");

// Certificates obtained using Let's Encrypt
const server = https.createServer({
  cert: fs.readFileSync("/etc/letsencrypt/live/vrdanmaku.uk/fullchain.pem"),
  key: fs.readFileSync("/etc/letsencrypt/live/vrdanmaku.uk/privkey.pem"),
});

const wss = new WebSocket.Server({ server });

// Mapping of stored video links and annotation library files
const videoLibraryMapping = {};

// Generate unique file names
let fileCounter = 1;
function getNextFilename() {
  return `annotation_${fileCounter++}.json`;
}

// Load annotation library
function loadAnnotationLibrary(filename) {
  const filepath = path.join(__dirname, filename);
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  }
  return [];
}

// Save annotation library
function saveAnnotationLibrary(filename, library) {
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, JSON.stringify(library, null, 2), "utf-8");
}

wss.on("connection", (ws) => {
  let currentVideoLink = null;
  let currentLibraryFile = null;
  let currentVideoIndex = 1;

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "new_video") {
      currentVideoLink = parsedMessage.videoLink;
      currentVideoIndex = parsedMessage.videoIndex;

      // Check if the video link is already stored
      if (!videoLibraryMapping[`video${currentVideoIndex}`]) {
        videoLibraryMapping[`video${currentVideoIndex}`] = {};
      }

      // Check if the video link has an associated annotation library
      if (!videoLibraryMapping[`video${currentVideoIndex}`][currentVideoLink]) {
        currentLibraryFile = getNextFilename();
        videoLibraryMapping[`video${currentVideoIndex}`][currentVideoLink] =
          currentLibraryFile;
      } else {
        currentLibraryFile =
          videoLibraryMapping[`video${currentVideoIndex}`][currentVideoLink];
      }

      const library = loadAnnotationLibrary(currentLibraryFile);
      // Send existing annotation to the client
      ws.send(JSON.stringify({ type: "existing_annotation", data: library }));
    } else if (parsedMessage.type === "new_annotation") {
      const annotationMessage = {
        text: parsedMessage.text,
        time: parsedMessage.time,
        position: parsedMessage.position,
        videoLink: parsedMessage.videoLink,
      };

      if (currentLibraryFile) {
        const library = loadAnnotationLibrary(currentLibraryFile);
        library.push(annotationMessage);
        saveAnnotationLibrary(currentLibraryFile, library);

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
