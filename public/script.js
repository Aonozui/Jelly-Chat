const socket = io();


const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Ganti "Anonymous" dengan nama pengguna jika ingin (bisa pakai prompt atau login)
const username = prompt("Masukkan nama Anda:") || "Anonim";

form.addEventListener('submit', function (e) {
  e.preventDefault();
 
  if (input.value.length > 500) {
  alert("Too much, Too much la!");
  return;
}
  if (input.value.trim()) {
    socket.emit('chat message', {
      text: input.value,
      from: username,
      senderId: socket.id
    });
    input.value = '';
  }
});
input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

socket.on('chat message', function (msg) {
  messages.scrollTo({
  top: messages.scrollHeight,
  behavior: 'smooth'
});


const item = document.createElement('div');
  item.classList.add('message');

  // Posisi kanan/kiri
  if (msg.senderId === socket.id) {
  item.classList.add('sent');
} else {
  item.classList.add('received');
}

item.classList.add(getColorClass(msg.from)); //  ini penting


  // Tampilkan nama + waktu + isi pesan
  item.innerHTML = `
    <div class="meta">
      <span class="sender">${msg.from}</span>
      <span class="time">${msg.time || ''}</span>
    </div>
    <div class="text">${msg.text}</div>
  `;

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
socket.emit('set username', username);
socket.emit('chat message', {
  text: input.value,
  from: username,
  senderId: socket.id
});
function getColorClass(name) {
  const colors = ['color-red', 'color-blue', 'color-green', 'color-orange', 'color-purple'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index];
}

