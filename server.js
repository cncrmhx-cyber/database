const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', socket => {
  socket.on('join', room => {
    socket.join(room);
    socket.to(room).emit('new-user', socket.id);

    socket.on('signal', data => {
      io.to(data.to).emit('signal', { from: socket.id, data: data.data });
    });

    socket.on('disconnect', () => {
      socket.to(room).emit('user-left', socket.id);
    });
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Server running'));
