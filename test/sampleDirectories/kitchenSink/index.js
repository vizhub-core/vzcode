<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cursor Tracker</title>
    <script src="/socket.io/socket.io.js"></script>
    <script>
      const socket = io();
      const room = 'Room1'; // Hardcoded for demonstration
      const user = prompt('Enter your username');

      socket.emit('joinRoom', { room, user });

      function sendCursorPosition(x, y) {
        socket.emit('cursorMove', { room, user, x, y });
      }

      socket.on('cursorUpdate', (data) => {
        moveRemoteCursor(data.user, data.x, data.y);
      });

      socket.on('userJoined', (data) => {
        const area = document.getElementById('cursors');
        if (!document.getElementById(data.id)) {
          const cursor = document.createElement('div');
          cursor.id = data.id;
          cursor.textContent = data.user;
          cursor.style.position = 'absolute';
          cursor.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
          cursor.style.color = 'white';
          cursor.style.padding = '5px';
          area.appendChild(cursor);
        }
      });

      document.addEventListener('mousemove', (event) => {
        sendCursorPosition(event.clientX, event.clientY);
      });

      function moveRemoteCursor(user, x, y) {
        const cursor = document.getElementById(user);
        if (cursor) {
          cursor.style.left = x + 'px';
          cursor.style.top = y + 'px';
        }
      }
    </script>
</head>
<body>
    <div id="cursors"></div>
</body>
</html>

