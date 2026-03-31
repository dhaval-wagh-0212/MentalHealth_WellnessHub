const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const chatRoutes = require("./routes/chatRoutes");
const moodRoutes = require("./routes/moodRoutes");
const historyRoutes = require("./routes/historyRoutes");
const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const { authGate, requirePageAuth } = require("./middleware/auth");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(
  session({
    name: "wellness.sid",
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 14
    }
  })
);
app.use(authGate);

app.use(chatRoutes);
app.use(moodRoutes);
app.use(historyRoutes);
app.use(authRoutes);
app.use(dataRoutes);

const frontendRoot = path.resolve(__dirname, "../..");
app.use(express.static(frontendRoot));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Mental health API is running." });
});

app.get("/login", (req, res) => {
  if (req.session?.userDbId) {
    return res.redirect("/");
  }
  return res.sendFile(path.join(frontendRoot, "login.html"));
});

app.get("/", requirePageAuth, (req, res) => {
  res.sendFile(path.join(frontendRoot, "index.html"));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
});

module.exports = app;
