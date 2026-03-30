document.addEventListener("DOMContentLoaded", () => {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const statusEl = document.getElementById("auth-status");

  function setStatus(text, isError = false) {
    statusEl.textContent = text;
    statusEl.classList.toggle("error", isError);
  }

  async function readApiResponse(response) {
    const raw = await response.text();
    const contentType = response.headers.get("content-type") || "";

    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (_) {
        parsed = null;
      }
    }

    if (parsed && typeof parsed === "object") {
      return { payload: parsed, isJson: true };
    }

    return {
      isJson: false,
      error: raw.includes("<!DOCTYPE")
        ? "Backend API is not reachable. Ensure the Express server is running on port 5001 and MongoDB is started."
        : contentType.includes("application/json")
          ? "Invalid JSON returned by server."
          : raw || "Unexpected server response."
    };
  }

  function showLoginTab() {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    setStatus("");
  }

  function showRegisterTab() {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    setStatus("");
  }

  tabLogin.addEventListener("click", showLoginTab);
  tabRegister.addEventListener("click", showRegisterTab);

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const identifier = document.getElementById("login-identifier").value.trim();
    const password = document.getElementById("login-password").value;

    setStatus("Logging in...");
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      const result = await readApiResponse(response);
      if (!result.isJson) {
        throw new Error(result.error);
      }
      if (!response.ok) {
        throw new Error(result.payload?.error || "Login failed.");
      }
      window.location.href = "/";
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userId = document.getElementById("register-userid").value.trim();
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value;

    setStatus("Creating account...");
    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, username, password })
      });
      const result = await readApiResponse(response);
      if (!result.isJson) {
        throw new Error(result.error);
      }
      if (!response.ok) {
        throw new Error(result.payload?.error || "Registration failed.");
      }
      window.location.href = "/";
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  (async function checkSession() {
    try {
      const response = await fetch("/auth/me");
      if (response.ok) {
        window.location.href = "/";
      }
    } catch (_) {
      // ignore
    }
  })();
});
