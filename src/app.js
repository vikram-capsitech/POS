import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { createServer } from "http";
import { config } from "dotenv";
import passport from "passport";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import ApiError from "./Utils/ApiError.js";
import bodyParser from "body-parser";
import { errorHandler } from "./Middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: "./.env" });

// const file = fs.readFileSync(path.resolve(__dirname, "./swagger.yaml"), "utf8");
// const swaggerDocument = YAML.parse(file);

const app = express();

app.use(express.static(path.join(__dirname, "../client/dist")));
const URL=process.env.FRONTEND_URL || '*';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

// global middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // Limit each IP to 1500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`,
      undefined,
      undefined,
      undefined,
      false
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Middleware to parse JSON with an increased limit
app.use(bodyParser.json({ limit: "20mb" }));

app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }) // session secret
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// api routes

// * App routes
import userRouter from "./Routes/user.route.js";
import workSpaceRouter from "./Routes/workSpace.route.js";
import chatRouter from "./Routes/chat.routes.js";
import messageRouter from "./Routes/message.routes.js";
import bugRouter from "./Routes/bug.route.js";
import discussionRouter from "./Routes/discussion.route.js";
import { initializeSocketIO } from "./Socket/index.js";

// * App apis
app.use("/scraawl/api/users", userRouter);
app.use("/scraawl/api/workspace", workSpaceRouter);
app.use("/scraawl/api/chats", chatRouter);
app.use("/scraawl/api/messages", messageRouter);
app.use("/scraawl/api/bug", bugRouter);
app.use("/scraawl/api/discussion", discussionRouter);
initializeSocketIO(io);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// // * API DOCS
// // ? Keeping swagger code at the end so that we can load swagger on "/" route
// app.use(
//   "/",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, {
//     swaggerOptions: {
//       docExpansion: "none", // keep all the sections collapsed by default
//     },
//     customSiteTitle: "API docs",
//   })
// );

// common error handling middleware
app.use(errorHandler);

export default httpServer;
