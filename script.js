// REAL-TIME VIDEO CALL + CHAT (requires backend with Socket.io server)

const socket = io("http://localhost:3000");

let localStream;
let peerConnection;
let inCall = false;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

window.onload = () => {
  const input = document.getElementById("messageInput");

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  socket.on("chat-message", (data) => {
    addMessage(data.user, data.message);
  });

  socket.on("offer", async (offer) => {
    await createAnswer(offer);
  });

  socket.on("answer", async (answer) => {
    await peerConnection.setRemoteDescription(answer);
  });

  socket.on("ice-candidate", async (candidate) => {
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  });
};

async function toggleCall() {
  const btn = document.getElementById("callBtn");
  const yourCamera = document.querySelector(".your-camera");
  const friendCamera = document.querySelector(".friend-camera");

  if (!inCall) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const localVideo = document.createElement("video");
      localVideo.autoplay = true;
      localVideo.muted = true;
      localVideo.playsInline = true;
      localVideo.srcObject = localStream;
      localVideo.style.width = "100%";
      localVideo.style.height = "100%";
      localVideo.style.objectFit = "cover";
      localVideo.style.borderRadius = "20px";

      yourCamera.innerHTML = "";
      yourCamera.appendChild(localVideo);

      createPeerConnection(friendCamera);

      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", offer);

      btn.innerText = "Leave Call";
      btn.classList.add("danger");
      inCall = true;
    } catch (error) {
      alert("Please allow camera and microphone access.");
      console.error(error);
    }
  } else {
    location.reload();
  }
}

function createPeerConnection(friendCamera) {
  peerConnection = new RTCPeerConnection(servers);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    const remoteVideo = document.createElement("video");
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.style.width = "100%";
    remoteVideo.style.height = "100%";
    remoteVideo.style.objectFit = "cover";
    remoteVideo.style.borderRadius = "20px";

    friendCamera.innerHTML = "";
    friendCamera.appendChild(remoteVideo);
  };
}

async function createAnswer(offer) {
  const friendCamera = document.querySelector(".friend-camera");

  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const yourCamera = document.querySelector(".your-camera");
    const localVideo = document.createElement("video");
    localVideo.autoplay = true;
    localVideo.muted = true;
    localVideo.playsInline = true;
    localVideo.srcObject = localStream;
    localVideo.style.width = "100%";
    localVideo.style.height = "100%";
    localVideo.style.objectFit = "cover";
    localVideo.style.borderRadius = "20px";

    yourCamera.innerHTML = "";
    yourCamera.appendChild(localVideo);
  }

  createPeerConnection(friendCamera);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  await peerConnection.setRemoteDescription(offer);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("answer", answer);
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (text === "") return;

  socket.emit("chat-message", {
    user: "You",
    message: text
  });

  input.value = "";
}

function addMessage(user, message) {
  const chatBox = document.getElementById("chatBox");

  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<strong>${user}</strong><p>${message}</p>`;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function syncVideo() {
  const player = document.getElementById("moviePlayer");
  const url = document.getElementById("movieUrl").value.trim();

  if (url !== "") {
    player.src = url;
    player.load();
    socket.emit("video-sync", url);
  }
}

socket.on("video-sync", (url) => {
  const player = document.getElementById("moviePlayer");
  player.src = url;
  player.load();
});