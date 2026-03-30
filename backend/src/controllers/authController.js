const bcrypt = require("bcryptjs");
const User = require("../models/User");

function validateCredential(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    return `${fieldName} is required.`;
  }
  if (value.trim().length < 3) {
    return `${fieldName} must be at least 3 characters.`;
  }
  return null;
}

async function registerHandler(req, res, next) {
  try {
    const { userId, username, password } = req.body || {};
    const userIdError = validateCredential(userId, "userId");
    const usernameError = validateCredential(username, "username");

    if (userIdError) return res.status(400).json({ error: userIdError });
    if (usernameError) return res.status(400).json({ error: usernameError });
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 characters." });
    }

    const normalizedUserId = userId.trim();
    const normalizedUsername = username.trim();

    const existing = await User.findOne({
      $or: [{ userId: normalizedUserId }, { username: normalizedUsername }]
    });

    if (existing) {
      return res.status(409).json({ error: "User ID or username already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId: normalizedUserId,
      username: normalizedUsername,
      passwordHash
    });

    req.session.userDbId = String(user._id);

    return res.status(201).json({
      id: user._id,
      userId: user.userId,
      username: user.username
    });
  } catch (error) {
    return next(error);
  }
}

async function loginHandler(req, res, next) {
  try {
    const { identifier, password } = req.body || {};
    if (typeof identifier !== "string" || !identifier.trim()) {
      return res.status(400).json({ error: "identifier is required." });
    }
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ error: "password is required." });
    }

    const normalizedIdentifier = identifier.trim();
    const user = await User.findOne({
      $or: [{ userId: normalizedIdentifier }, { username: normalizedIdentifier }]
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    req.session.userDbId = String(user._id);

    return res.json({
      id: user._id,
      userId: user.userId,
      username: user.username
    });
  } catch (error) {
    return next(error);
  }
}

async function meHandler(req, res, next) {
  try {
    if (!req.session?.userDbId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.session.userDbId).select("_id userId username");
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.json({
      id: user._id,
      userId: user.userId,
      username: user.username
    });
  } catch (error) {
    return next(error);
  }
}

function logoutHandler(req, res) {
  if (!req.session) {
    return res.json({ ok: true });
  }
  req.session.destroy(() => {
    res.clearCookie("wellness.sid");
    return res.json({ ok: true });
  });
}

module.exports = {
  registerHandler,
  loginHandler,
  meHandler,
  logoutHandler
};
