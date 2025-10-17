const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir le front-end
app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', socket => {
  console.log('Nouvel utilisateur connecté');

  socket.on('join', room => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(socket.id);

    // Notifier les autres participants
    socket.to(room).emit('new-user', socket.id);

    // Déconnexion
    socket.on('disconnect', () => {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
      socket.to(room).emit('user-left', socket.id);
    });

    // Signaling
    socket.on('signal', ({ to, data }) => {
      io.to(to).emit('signal', { from: socket.id, data });
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
