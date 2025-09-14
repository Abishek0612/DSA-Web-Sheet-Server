const { Server } = require("socket.io");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");

const socketConfig = {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
};

const setupSocketAuth = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      );
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      logger.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });
};

const setupSocketEvents = (io) => {
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    socket.join(`user-${socket.userId}`);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      logger.info(`User ${socket.userId} joined room: ${roomId}`);
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      logger.info(`User ${socket.userId} left room: ${roomId}`);
    });

    socket.on("progress-update", (data) => {
      socket.to(`user-${socket.userId}`).emit("progress-updated", data);
    });

    socket.on("disconnect", (reason) => {
      logger.info(`User ${socket.userId} disconnected: ${reason}`);
    });

    socket.on("error", (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  });
};

module.exports = { socketConfig, setupSocketAuth, setupSocketEvents };
