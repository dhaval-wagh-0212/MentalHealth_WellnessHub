function isPublicPath(pathname) {
  const publicPaths = new Set([
    "/login",
    "/login.html",
    "/auth/login",
    "/auth/register",
    "/health"
  ]);

  if (publicPaths.has(pathname)) return true;
  if (pathname.startsWith("/auth/me")) return true;
  if (pathname.startsWith("/style.css")) return true;
  if (pathname.startsWith("/script.js")) return true;
  if (pathname.startsWith("/login.js")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

function requireApiAuth(req, res, next) {
  if (req.session?.userDbId) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

function requirePageAuth(req, res, next) {
  if (req.session?.userDbId) return next();
  return res.redirect("/login");
}

function authGate(req, res, next) {
  if (isPublicPath(req.path)) return next();
  if (req.path.startsWith("/auth/")) return next();
  if (req.path.startsWith("/api/")) return requireApiAuth(req, res, next);
  if (req.path.endsWith(".css") || req.path.endsWith(".js") || req.path.endsWith(".png") || req.path.endsWith(".jpg")) {
    return next();
  }
  if (req.path === "/" || req.path === "/index.html") {
    return requirePageAuth(req, res, next);
  }
  return next();
}

module.exports = {
  requireApiAuth,
  requirePageAuth,
  authGate
};
