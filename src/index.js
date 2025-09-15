require("dotenv").config();

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let connectDB, errorHandler, logger;
try {
  connectDB = require("./config/database");
} catch (error) {
  console.error("Error loading database config:", error.message);
  process.exit(1);
}

try {
  const errorHandlerModule = require("./middleware/errorHandler");
  errorHandler = errorHandlerModule.errorHandler;
} catch (error) {
  console.error("Error loading error handler:", error.message);
  process.exit(1);
}

try {
  const loggerModule = require("./utils/logger");
  logger = loggerModule.logger;
} catch (error) {
  console.error("Error loading logger:", error.message);
  logger = {
    info: console.log,
    error: console.error,
    warn: console.warn,
  };
}

let authRoutes, userRoutes, codeRoutes, uploadRoutes, aiRoutes;
try {
  authRoutes = require("./routes/auth");
  userRoutes = require("./routes/user");
  codeRoutes = require("./routes/code");
  uploadRoutes = require("./routes/upload");
  aiRoutes = require("./routes/ai");
} catch (error) {
  console.error("Error loading routes:", error.message);
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

try {
  connectDB();
} catch (error) {
  console.error("Database connection failed:", error.message);
  process.exit(1);
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "X-Access-Token",
    ],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.use(compression());
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

const topicRoutes = require("./routes/topics")(io);
const progressRoutes = require("./routes/progress")(io);

app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/user", userRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

app.use(errorHandler);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.error("Socket authentication failed: No token provided");
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );

    socket.userId = decoded.userId;
    logger.info(`Socket authenticated for user: ${socket.userId}`);
    next();
  } catch (error) {
    logger.error("Socket authentication error:", error.message);
    next(new Error("Authentication error"));
  }
});

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

const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  server.close((error) => {
    if (error) {
      console.error("Error during server shutdown:", error);
      process.exit(1);
    }

    console.log("HTTP server closed");

    if (require("mongoose").connection.readyState === 1) {
      require("mongoose").connection.close(() => {
        console.log("Database connection closed");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

const PORT = process.env.PORT || 5000;

server.listen(PORT, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }

  console.log(`DSA Sheet Server is running!`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(
    `AI Features: ${process.env.GEMINI_API_KEY ? "Enabled" : "Disabled"}`
  );
  console.log(
    `Email Service: ${process.env.EMAIL_USER ? "Enabled" : "Disabled"}`
  );
  console.log(`Ready to accept connections!`);

  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
