import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    socket.to(room).emit("new-user", socket.id);
  });

  socket.on("signal", ({ room, data, to }) => {
    socket.to(to || room).emit("signal", { from: socket.id, data });
  });

  socket.on("disconnect", () => {
    io.emit("user-left", socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log("Server running on port", port));
