let inCall = false;
let localStream = null;

async function toggleCall() {
  const btn = document.getElementById('callBtn');
  const yourCamera = document.querySelector('.your-camera');

  if (!inCall) {
    try {
      // Access user's webcam + microphone
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const localVideo = document.createElement('video');
      localVideo.autoplay = true;
      localVideo.muted = true;
      localVideo.playsInline = true;
      localVideo.srcObject = localStream;
      localVideo.style.width = '100%';
      localVideo.style.height = '100%';
      localVideo.style.objectFit = 'cover';
      localVideo.style.borderRadius = '20px';

      yourCamera.innerHTML = '';
      yourCamera.appendChild(localVideo);

      inCall = true;
      btn.textContent = 'Leave Call';
      btn.classList.add('danger');
    } catch (error) {
      alert('Camera/Microphone permission denied or not available.');
      console.error(error);
    }
  } else {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    yourCamera.innerHTML = 'Your Camera';
    inCall = false;
    btn.textContent = 'Join Call';
    btn.classList.remove('danger');
  }
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const chatBox = document.getElementById('chatBox');

  if (input.value.trim() === '') return;

  const message = document.createElement('div');
  message.classList.add('message');
  message.innerHTML = `<strong>You</strong>${input.value}`;

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Save messages temporarily in browser
  let savedMessages = JSON.parse(localStorage.getItem('watchPartyMessages')) || [];
  savedMessages.push(input.value);
  localStorage.setItem('watchPartyMessages', JSON.stringify(savedMessages));

  input.value = '';
}

function loadMessages() {
  const chatBox = document.getElementById('chatBox');
  let savedMessages = JSON.parse(localStorage.getItem('watchPartyMessages')) || [];

  savedMessages.forEach(msg => {
    const message = document.createElement('div');
    message.classList.add('message');
    message.innerHTML = `<strong>You</strong>${msg}`;
    chatBox.appendChild(message);
  });
}

function syncVideo() {
  const url = document.getElementById('movieUrl').value;
  const player = document.getElementById('moviePlayer');

  if (url.trim() !== '') {
    player.src = url;
    player.load();
    player.play();
  }
}

document.getElementById('messageInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

window.onload = loadMessages;