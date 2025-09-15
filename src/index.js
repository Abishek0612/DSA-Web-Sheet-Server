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

try {
  connectDB();
} catch (error) {
  console.error("Database connection failed:", error.message);
  process.exit(1);
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://dsa-web-app.netlify.app",
  process.env.CLIENT_URL,
].filter(Boolean);

if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
    origin.trim()
  );
  allowedOrigins.push(...envOrigins);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    console.log("CORS Check - Origin:", origin);
    console.log("CORS Check - Allowed Origins:", allowedOrigins);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(null, true);
    }
  },
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
    "x-access-token",
  ],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  maxAge: 86400,
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log("Origin:", req.get("Origin"));
    console.log("User-Agent:", req.get("User-Agent"));
    next();
  });
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://dsa-web-sheet-server.onrender.com",
          "wss://dsa-web-sheet-server.onrender.com",
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
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
  trustProxy: true,
  skip: (req) => {
    return (
      req.method === "OPTIONS" ||
      req.url === "/health" ||
      req.url === "/api/health"
    );
  },
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
    cors: {
      origin: req.get("origin"),
      clientUrl: process.env.CLIENT_URL,
      allowedOrigins: allowedOrigins,
    },
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    aiEnabled: !!process.env.GEMINI_API_KEY,
    emailEnabled: !!process.env.EMAIL_USER,
    cors: {
      origin: req.get("origin"),
      clientUrl: process.env.CLIENT_URL,
      allowedOrigins: allowedOrigins,
    },
  });
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// API Routes
const topicRoutes = require("./routes/topics")(io);
const progressRoutes = require("./routes/progress")(io);

app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/user", userRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

app.use(errorHandler);

// Socket authentication middleware
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
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(", ")}`);
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
