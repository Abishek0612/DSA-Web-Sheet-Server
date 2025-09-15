const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://dsa-web-app.netlify.app",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
    origin.trim()
  );
  allowedOrigins.push(...envOrigins);
}

const uniqueOrigins = [...new Set(allowedOrigins)].filter(Boolean);

console.log("CORS Configuration - Allowed Origins:", uniqueOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    console.log(`CORS Request from origin: ${origin || "no-origin"}`);

    if (!origin) {
      console.log("CORS: Allowing request with no origin");
      return callback(null, true);
    }

    if (uniqueOrigins.includes(origin)) {
      console.log(`CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS: Origin ${origin} not in allowed list:`, uniqueOrigins);

      if (process.env.NODE_ENV === "development") {
        console.log("CORS: Development mode - allowing all origins");
        callback(null, true);
      } else {
        console.log(
          "CORS: Production mode - logging but allowing for debugging"
        );
        callback(null, true);
      }
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
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods",
  ],
  exposedHeaders: [
    "X-Total-Count",
    "X-Page-Count",
    "Access-Control-Allow-Origin",
  ],
  maxAge: 86400,
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

const corsMiddleware = cors(corsOptions);

const enhancedCorsMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `CORS Middleware - ${req.method} ${req.url} from ${
        req.get("origin") || "no-origin"
      }`
    );
  }

  corsMiddleware(req, res, (error) => {
    if (error) {
      console.error("CORS Error:", error.message);
      console.error("Request details:", {
        method: req.method,
        url: req.url,
        origin: req.get("origin"),
        headers: req.headers,
      });

      return res.status(403).json({
        error: "CORS Error",
        message: "This origin is not allowed to access this resource",
        origin: req.get("origin"),
        allowedOrigins: uniqueOrigins,
      });
    }

    next();
  });
};

const handlePreflightRequest = (req, res, next) => {
  if (req.method === "OPTIONS") {
    console.log("CORS: Handling preflight request");

    const origin = req.get("origin");

    if (
      !origin ||
      uniqueOrigins.includes(origin) ||
      process.env.NODE_ENV === "development"
    ) {
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,PATCH,OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        corsOptions.allowedHeaders.join(",")
      );
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Max-Age", "86400");
    }

    return res.sendStatus(200);
  }

  next();
};

module.exports = {
  corsOptions,
  corsMiddleware: enhancedCorsMiddleware,
  handlePreflightRequest,
  allowedOrigins: uniqueOrigins,
};
