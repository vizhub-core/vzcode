<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cursor Tracker</title>
    <script src="/socket.io/socket.io.js"></script>
    <script>
      const socket = io();

      // Function to send local cursor position to the server
      function sendCursorPosition(x, y) {
        socket.emit('cursorMove', { x, y });
      }

      // Listen for cursor updates from the server
      socket.on('cursorUpdate', (data) => {
        moveRemoteCursor(data.x, data.y);
      });

      document.addEventListener('mousemove', (event) => {
        sendCursorPosition(event.clientX, event.clientY);
      });

      // Function to update cursor position visually
      function moveRemoteCursor(x, y) {
        const follower = document.getElementById('follower');
        follower.style.left = x + 'px';
        follower.style.top = y + 'px';
      }
    </script>
</head>
<body>
    <div id="follower" style="position: absolute; width: 10px; height: 10px; background-color: red;"></div>
</body>
</html>
