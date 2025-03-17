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

// Mapping of stored video links and danmaku library files
const videoLibraryMapping = {
  video1: {},
  video2: {},
};

// Generate unique file names
let fileCounter = 1;
function getNextFilename() {
  return `danmaku_${fileCounter++}.json`;
}

// Load pop-up library
function loadDanmakuLibrary(filename) {
  const filepath = path.join(__dirname, filename);
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  }
  return [];
}

// Save pop-up library
function saveDanmakuLibrary(filename, library) {
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

      if (!videoLibraryMapping[`video${currentVideoIndex}`][currentVideoLink]) {
        currentLibraryFile = getNextFilename();
        videoLibraryMapping[`video${currentVideoIndex}`][currentVideoLink] =
          currentLibraryFile;
      } else {
        currentLibraryFile =
          videoLibraryMapping[`video${currentVideoIndex}`][currentVideoLink];
      }

      const library = loadDanmakuLibrary(currentLibraryFile);
      // Send existing pop-ups to the client
      ws.send(JSON.stringify({ type: "existing_danmaku", data: library }));
    } else if (parsedMessage.type === "new_danmaku") {
      const danmakuMessage = {
        text: parsedMessage.text,
        time: parsedMessage.time,
        position: parsedMessage.position,
      };

      if (currentLibraryFile) {
        const library = loadDanmakuLibrary(currentLibraryFile);
        library.push(danmakuMessage);
        saveDanmakuLibrary(currentLibraryFile, library);

        // Broadcast pop-up messages to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "new_danmaku", data: danmakuMessage })
            );
          }
        });
      }
    }
  });

  ws.send(JSON.stringify({ text: "Welcome to the WebSocket server!" }));
});

server.listen(8080, () => {
  console.log("WebSocket server is running on wss://vrdanmaku.uk:8080");
});
