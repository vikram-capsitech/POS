const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const URL=process.env.FRONTEND_URL || '*';

const io = new Server(server, {
  cors: {
    origin: [
      URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
   console.log("Socket connected:", socket.id); 
  socket.on("JOIN_ADMIN", ({ restaurantID }) => {
    socket.join(`ADMIN_${restaurantID}`);
    console.log("Admin joined room:", restaurantID);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ⭐ make io available everywhere
app.set("io", io);

module.exports = { app, server };
