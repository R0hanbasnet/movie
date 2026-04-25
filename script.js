let inCall = false;

function toggleCall() {
  const btn = document.getElementById('callBtn');

  if (!inCall) {
    inCall = true;
    btn.textContent = 'Leave Call';
    btn.classList.add('danger');
  } else {
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
  input.value = '';
}

function syncVideo() {
  const url = document.getElementById('movieUrl').value;
  const player = document.getElementById('moviePlayer');

  if (url.trim() !== '') {
    player.src = url;
    player.load();
  }
}

document.getElementById('messageInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
