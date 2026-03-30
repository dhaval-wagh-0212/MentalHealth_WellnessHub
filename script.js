document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const openSidebarBtn = document.getElementById("open-sidebar-btn");
  const closeSidebarBtn = document.getElementById("close-sidebar-btn");
  const mobileOverlay = document.getElementById("mobile-overlay");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatMessages = document.getElementById("chat-messages");
  const chatMoodMonitor = document.getElementById("chat-mood-monitor");
  const chatApiIndicator = document.getElementById("chat-api-indicator");
  const chatFixedReplies = document.getElementById("chat-fixed-replies");
  const chatContinueBtn = document.getElementById("chat-continue-btn");
  const playlistExplorer = document.getElementById("playlist-explorer");
  const explorerTitle = document.getElementById("explorer-title");
  const closeExplorerBtn = document.getElementById("close-explorer");
  const songList = document.getElementById("song-list");
  const mainYtPlayer = document.getElementById("main-yt-player");
  const sttBtn = document.getElementById("stt-btn");
  const ttsToggle = document.getElementById("tts-toggle");
  const moodRange = document.getElementById("mood-range");
  const moodEmoji = document.getElementById("mood-emoji");
  const moodLabel = document.getElementById("mood-label");
  const saveMoodBtn = document.getElementById("save-mood-btn");
  const moodNote = document.getElementById("mood-note");
  const moodHistory = document.getElementById("mood-history");
  const dashboardMeterRing = document.getElementById("dashboard-meter-ring");
  const dashboardMeterValue = document.getElementById("dashboard-meter-value");
  const dashboardMeterLabel = document.getElementById("dashboard-meter-label");
  const dashboardMoodAvg = document.getElementById("dashboard-mood-avg");
  const dashboardMoodChartCanvas = document.getElementById("dashboard-mood-chart");
  const breathingStartBtn = document.getElementById("breathing-start");
  const breathingCircle = document.getElementById("breathing-circle");
  const breathingPhase = document.getElementById("breathing-phase");
  const breathingTimer = document.getElementById("breathing-timer");
  const soundButtons = Array.from(document.querySelectorAll(".sound-toggle"));
  const loopStatus = document.getElementById("loop-status");
  const currentUsernameLabel = document.getElementById("current-username-label");
  const userIdLabel = document.getElementById("user-id-label");
  const logoutBtn = document.getElementById("logout-btn");
  const deleteDataBtn = document.getElementById("delete-data-btn");
  const themeButtons = Array.from(document.querySelectorAll(".theme-btn"));
  const statMessagesEl = document.getElementById("stat-messages");
  const statMoodScoreEl = document.getElementById("stat-mood-score");
  const statSongsEl = document.getElementById("stat-songs");
  const statGamesEl = document.getElementById("stat-games");
  const statMessagesDeltaEl = document.getElementById("stat-messages-delta");
  const statMoodDeltaEl = document.getElementById("stat-mood-delta");
  const statSongsDeltaEl = document.getElementById("stat-songs-delta");
  const statGamesDeltaEl = document.getElementById("stat-games-delta");
  const activityListEl = document.getElementById("activity-list");
  const gameLaunchButtons = Array.from(document.querySelectorAll(".game-launch-btn"));
  const gameWorkspace = document.getElementById("game-workspace");
  const gameWorkspaceClose = document.getElementById("game-workspace-close");
  const gameWorkspaceTitle = document.getElementById("game-workspace-title");
  const gameWorkspaceSubtitle = document.getElementById("game-workspace-subtitle");
  const mindPuzzleGrid = document.getElementById("mind-puzzle-grid");
  const mindPuzzleMovesLabel = document.getElementById("mind-puzzle-moves");
  const mindPuzzleMessage = document.getElementById("mind-puzzle-message");
  const mindPuzzleReset = document.getElementById("mind-puzzle-reset");
  const mindfulMatchGrid = document.getElementById("mindful-match-grid");
  const mindfulMatchStats = document.getElementById("mindful-match-stats");
  const mindfulMatchReset = document.getElementById("mindful-match-reset");
  const zenGardenBoard = document.getElementById("zen-garden-board");
  const zenGardenLines = document.getElementById("zen-garden-lines");
  const zenToolButtons = Array.from(document.querySelectorAll(".zen-tool"));

  const API_BASE = "";
  let currentUser = null;
  let moodTrend = [54, 61, 58, 66, 72, 68, 60];
  let ttsEnabled = true;
  let recognition = null;
  let isListening = false;
  let breathingTickInterval = null;
  let breathingPhaseInterval = null;
  let breathingTimeout = null;
  let audioContext = null;
  let soundBuffers = null;
  let activeSoundId = null;
  let activeSoundSource = null;
  let moodChart = null;
  let userTheme = localStorage.getItem("wellness_theme") || "light";
  let voiceProfile = loadVoiceProfile();
  const appState = loadReactiveState();
  let chatContext = []; // Keep track of conversation for the backend
  let mindPuzzleTiles = [1, 2, 3, 4, 5, 6, 7, 8, null];
  let mindPuzzleMoves = 0;
  let mindfulCards = [];
  let mindfulFlipped = [];
  let mindfulMatched = 0;
  let mindfulMoves = 0;
  let zenTool = "rake";
  let zenDrawing = false;
  let zenPath = null;
  let lastChatRisk = null;
  let lastCheckinTurn = -10;
  let assistantTurnCount = 0;

  // New Games State
  let reactionTimer = null;
  let reactionStartTime = null;
  let reactionBest = Infinity;
  let reactionScore = 0;
  let zenCanvasCtx = null;
  let zenCanvasDrawing = false;
  let rhythmScore = 0;
  let rhythmInterval = null;
  let balloonSize = 50;
  let balloonInterval = null;

  const playlistsData = {
    calm: {
      title: "Calm Vibes",
      tracks: [
        { title: "Soft Rain & Piano", id: "jfKfPfyJRdk" },
        { title: "Deep Sleep Rain", id: "5qap5aO4i9A" },
        { title: "Gentle Morning", id: "77ZozI0rw7w" },
        { title: "Ambient Study", id: "DWcPDo09664" }
      ]
    },
    energy: {
      title: "Energy Boost",
      tracks: [
        { title: "Nature Walk", id: "6Zf_Of_it6U" },
        { title: "Sunrise Yoga", id: "2OEL4P1Rz04" },
        { title: "Positive Energy", id: "8X6j5EnGePc" },
        { title: "Focus Lofi", id: "5qap5aO4i9A" }
      ]
    },
    meditation: {
      title: "Meditation",
      tracks: [
        { title: "Zen Garden", id: "jfKfPfyJRdk" },
        { title: "Tibetan Bowls", id: "77ZozI0rw7w" },
        { title: "Deep Focus", id: "DWcPDo09664" },
        { title: "Spiritual Healing", id: "8X6j5EnGePc" }
      ]
    }
  };

  window.openPlaylist = (type) => {
    const data = playlistsData[type];
    if (!data || !playlistExplorer) return;

    explorerTitle.textContent = data.title;
    songList.innerHTML = data.tracks
      .map(
        (track, index) => `
        <li class="song-item" onclick="window.playTrack('${track.id}')">
          <span class="track-index">${index + 1}</span>
          <span class="track-name">${track.title}</span>
          <button class="play-mini-btn">▶</button>
        </li>
      `
      )
      .join("");

    playlistExplorer.classList.remove("hidden");
    // Play first track by default
    if (data.tracks.length > 0) {
      window.playTrack(data.tracks[0].id);
    }
  };

  window.playTrack = (id) => {
    if (!mainYtPlayer) return;
    mainYtPlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    // Update active state in list
    document.querySelectorAll(".song-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("onclick").includes(id));
    });
  };

  if (closeExplorerBtn) {
    closeExplorerBtn.addEventListener("click", () => {
      playlistExplorer.classList.add("hidden");
      if (mainYtPlayer) mainYtPlayer.src = ""; // Stop music on close
    });
  }

  function openSidebar() {
    sidebar.classList.add("open");
    mobileOverlay.classList.add("active");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("active");
  }

  if (openSidebarBtn) openSidebarBtn.addEventListener("click", openSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
  mobileOverlay.addEventListener("click", closeSidebar);

  window.switchView = (viewId) => {
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.remove("active");
    });
    document.getElementById(`view-${viewId}`).classList.add("active");

    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document.getElementById(`nav-${viewId}`).classList.add("active");

    if (window.innerWidth < 861) closeSidebar();
  };

  function currentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function loadReactiveState() {
    try {
      const raw = localStorage.getItem("wellness_reactive_state");
      if (!raw) {
        return {
          stats: { messages: 0, moodScore: 0, songs: 0, games: 0 },
          deltas: { messages: 0, moodScore: 0, songs: 0, games: 0 },
          activities: []
        };
      }
      const parsed = JSON.parse(raw);
      return {
        stats: {
          messages: Number(parsed?.stats?.messages) || 0,
          moodScore: Number(parsed?.stats?.moodScore) || 0,
          songs: Number(parsed?.stats?.songs) || 0,
          games: Number(parsed?.stats?.games) || 0
        },
        deltas: {
          messages: Number(parsed?.deltas?.messages) || 0,
          moodScore: Number(parsed?.deltas?.moodScore) || 0,
          songs: Number(parsed?.deltas?.songs) || 0,
          games: Number(parsed?.deltas?.games) || 0
        },
        activities: Array.isArray(parsed?.activities) ? parsed.activities.slice(0, 12) : []
      };
    } catch (_) {
      return {
        stats: { messages: 0, moodScore: 0, songs: 0, games: 0 },
        deltas: { messages: 0, moodScore: 0, songs: 0, games: 0 },
        activities: []
      };
    }
  }

  function saveReactiveState() {
    localStorage.setItem("wellness_reactive_state", JSON.stringify(appState));
  }

  function signedNumber(value, digits = 0) {
    const numeric = Number(value) || 0;
    return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(digits)}`;
  }

  function renderReactiveStats() {
    if (statMessagesEl) statMessagesEl.textContent = String(appState.stats.messages);
    if (statMoodScoreEl) statMoodScoreEl.textContent = appState.stats.moodScore.toFixed(1);
    if (statSongsEl) statSongsEl.textContent = String(appState.stats.songs);
    if (statGamesEl) statGamesEl.textContent = String(appState.stats.games);

    if (statMessagesDeltaEl) statMessagesDeltaEl.textContent = signedNumber(appState.deltas.messages);
    if (statMoodDeltaEl) statMoodDeltaEl.textContent = signedNumber(appState.deltas.moodScore, 1);
    if (statSongsDeltaEl) statSongsDeltaEl.textContent = signedNumber(appState.deltas.songs);
    if (statGamesDeltaEl) statGamesDeltaEl.textContent = signedNumber(appState.deltas.games);
  }

  function trackActivity(text, tag) {
    const timeLabel = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    appState.activities.unshift({ timeLabel, text, tag });
    appState.activities = appState.activities.slice(0, 10);
    renderActivity();
    saveReactiveState();
  }

  function renderActivity() {
    if (!activityListEl) return;
    if (!appState.activities.length) {
      activityListEl.innerHTML = `
        <div class="activity-row">
          <span>--</span><p>No activity yet. Start chatting or save your mood.</p><label>info</label>
        </div>
      `;
      return;
    }

    activityListEl.innerHTML = appState.activities
      .map(
        (item) => `
          <div class="activity-row">
            <span>${escapeHtml(item.timeLabel)}</span>
            <p>${escapeHtml(item.text)}</p>
            <label>${escapeHtml(item.tag)}</label>
          </div>
        `
      )
      .join("");
  }

  function incrementStat(key, by, tagText, tag) {
    if (!Object.prototype.hasOwnProperty.call(appState.stats, key)) return;
    appState.stats[key] = Math.max(0, (Number(appState.stats[key]) || 0) + by);
    appState.deltas[key] = (Number(appState.deltas[key]) || 0) + by;
    renderReactiveStats();
    if (tagText && tag) {
      trackActivity(tagText, tag);
    } else {
      saveReactiveState();
    }
  }

  function updateMoodScoreStatFromRiskTrend(riskValues) {
    const safeValues = riskValues.length ? riskValues : [50];
    const avgRisk = safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length;
    const nextScore = Number((avgRisk / 10).toFixed(1));
    const delta = Number((nextScore - appState.stats.moodScore).toFixed(1));
    appState.stats.moodScore = nextScore;
    appState.deltas.moodScore = Number((appState.deltas.moodScore + delta).toFixed(1));
    renderReactiveStats();
    saveReactiveState();
  }

  function addMessage(text, role) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${role}`;
    
    let contentHtml = `<p>${escapeHtml(text)}</p>`;
    
    // If AI suggests breathing exercise, add a shortcut button
    if (role === "assistant" && (text.toLowerCase().includes("breathing exercise") || text.toLowerCase().includes("breathe together"))) {
      contentHtml += `
        <div class="message-actions">
          <button class="mini-tool-btn" onclick="window.switchView('games'); setTimeout(() => document.querySelector('[data-game=\'breathe-focus\']')?.click(), 100);">
            Start Breathing Exercise 🧘
          </button>
        </div>
      `;
    }

    wrapper.innerHTML = `
      <div class="bubble">
        ${contentHtml}
        <small>${currentTime()}</small>
      </div>
    `;
    chatMessages.appendChild(wrapper);
    wrapper.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  function speakText(text, toneOverride = null) {
    if (!ttsEnabled || !("speechSynthesis" in window) || !text) {
      console.log("TTS disabled or not supported or no text.");
      return;
    }
    
    // Ensure voices are loaded
    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices.length === 0) {
      console.log("Voices not loaded yet, waiting...");
      window.speechSynthesis.addEventListener("voiceschanged", () => speakText(text, toneOverride), { once: true });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const activeTone = toneOverride || voiceProfile;
    utterance.rate = activeTone.rate || 1;
    utterance.pitch = activeTone.pitch || 1;
    
    // Simple language detection for common regions
    const isHindi = /[\u0900-\u097F]/.test(text);
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const isChinese = /[\u4e00-\u9fa5]/.test(text);
    const isJapanese = /[\u3040-\u30ff]/.test(text);
    const isKorean = /[\uac00-\ud7af]/.test(text);
    const isRussian = /[\u0400-\u04FF]/.test(text);
    
    // Check for some common Latin-based languages using common words/characters
    const isSpanish = /\b(hola|gracias|amigo|bien|estoy)\b/i.test(text);
    const isFrench = /\b(bonjour|merci|ami|bien|suis)\b/i.test(text);
    const isGerman = /\b(hallo|danke|freund|gut|bin)\b/i.test(text);
    
    let langHint = "en-US";
    if (isHindi) langHint = "hi-IN";
    else if (isArabic) langHint = "ar-SA";
    else if (isChinese) langHint = "zh-CN";
    else if (isJapanese) langHint = "ja-JP";
    else if (isKorean) langHint = "ko-KR";
    else if (isRussian) langHint = "ru-RU";
    else if (isSpanish) langHint = "es-ES";
    else if (isFrench) langHint = "fr-FR";
    else if (isGerman) langHint = "de-DE";
    
    utterance.lang = langHint;
    
    // Try to find a voice that matches the language
    const langVoices = allVoices.filter(v => v.lang.startsWith(langHint.split('-')[0]));
    const selectedVoice = pickVoiceByHint(activeTone.voiceHint, langVoices.length ? langVoices : allVoices);
    
    if (selectedVoice) {
      console.log("Speaking with voice:", selectedVoice.name, "Lang:", selectedVoice.lang);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    
    window.speechSynthesis.speak(utterance);
  }

  function updateChatMoodMonitor(mood, risk) {
    if (!chatMoodMonitor) return;
    const safeMood = mood || "--";
    const safeRisk = Number.isFinite(Number(risk)) ? Math.round(Number(risk)) : "--";
    chatMoodMonitor.textContent = `Mood: ${safeMood} | Risk: ${safeRisk}`;
    const isHigh = Number.isFinite(Number(risk)) && Number(risk) >= 70;
    chatMoodMonitor.classList.toggle("high", isHigh);
  }

  function maybeMidConversationCheckin(mood, risk) {
    const numericRisk = Number(risk);
    if (!Number.isFinite(numericRisk)) {
      lastChatRisk = null;
      return;
    }

    const risingFast = lastChatRisk !== null && numericRisk - lastChatRisk >= 12;
    const highRisk = numericRisk >= 70;
    const stressedMood = mood === "anxious" || mood === "stressed" || mood === "sad";
    const enoughGap = assistantTurnCount - lastCheckinTurn >= 2;

    if ((highRisk || risingFast) && stressedMood && enoughGap) {
      const checkin = "Quick check-in: I noticed things feel a bit intense right now. Would you like to do a quick breathing exercise to reset?";
      
      const wrapper = document.createElement("div");
      wrapper.className = "message assistant";
      wrapper.innerHTML = `
        <div class="bubble">
          <p>${escapeHtml(checkin)}</p>
          <div class="message-actions">
            <button class="mini-tool-btn" onclick="window.openGameWorkspace('breathe-focus')">Yes, let's breathe</button>
            <button class="mini-tool-btn secondary" onclick="this.closest('.message').remove()">No, I am fine</button>
          </div>
          <small>${currentTime()}</small>
        </div>
      `;
      chatMessages.appendChild(wrapper);
      wrapper.scrollIntoView({ behavior: "smooth", block: "end" });

      speakText(checkin, voiceFromCondition("anxious", Math.max(70, numericRisk)));
      chatContext.push({ role: "assistant", content: checkin });
      assistantTurnCount += 1;
      lastCheckinTurn = assistantTurnCount;
    }

    lastChatRisk = numericRisk;
  }

  function fixedFallbackReply(text) {
    const input = String(text || "").toLowerCase();
    if (/\bstory|kahani|kissa|once upon a time\b/.test(input)) {
      return {
        mood: "happy",
        risk: 25,
        reply:
          "Once there was a boy who thought he was failing because his progress looked small. Every day he wrote one honest line about what he learned, even on hard days. Months later, those tiny lines became a notebook full of courage, and he realized consistency was his superpower. Would you like another story that is funny, motivational, or emotional?"
      };
    }
    if (/\banxious|panic|worried|nervous\b/.test(input)) {
      return {
        mood: "anxious",
        risk: 70,
        reply:
          "I hear you. Let us slow down together with one gentle breath at a time. You are safe right now. What part is feeling most intense at this moment?"
      };
    }
    if (/\bsad|lonely|down|hopeless\b/.test(input)) {
      return {
        mood: "sad",
        risk: 65,
        reply:
          "I am really glad you shared this. Your feelings matter, and you do not have to carry this alone. Do you want to talk about what triggered this feeling today?"
      };
    }
    if (/\bstress|overwhelmed|pressure|burnout\b/.test(input)) {
      return {
        mood: "stressed",
        risk: 68,
        reply:
          "That sounds heavy. Let us pause and choose one small next step you can do right now. Which task do you want to tackle first together?"
      };
    }
    return {
      mood: "stressed",
      risk: 55,
      reply:
        "Thank you for opening up. I am here with you, and we can take this gently together. What would be most helpful for you right now?"
    };
  }

  function renderFixedReplyChips() {
    if (!chatFixedReplies) return;
    const chips = [
      "What is on your mind?",
      "Play relaxing music",
      "Let us take one slow breath together."
    ];
    chatFixedReplies.innerHTML = chips
      .map(
        (text) =>
          `<button type="button" class="fixed-reply-chip" data-fixed-reply="${escapeHtml(text)}">${escapeHtml(text)}</button>`
      )
      .join("");
    chatFixedReplies.querySelectorAll(".fixed-reply-chip").forEach((button) => {
      button.addEventListener("click", () => {
        const text = button.getAttribute("data-fixed-reply") || "";
        
        if (text === "Play relaxing music") {
          window.switchView("music");
          addMessage("Switching to music for you! 🎵", "assistant");
          return;
        }

        chatInput.value = text;
        handleSendMessage();
      });
    });
  }

  function setChatSafeMode(enabled, detail = "") {
    if (!chatApiIndicator || !chatFixedReplies) return;
    
    // Always show the indicator but change its state
    chatApiIndicator.classList.remove("hidden");
    
    // Always show chips for quick access
    chatFixedReplies.classList.remove("hidden");
    if (!chatFixedReplies.innerHTML.trim()) {
      renderFixedReplyChips();
    }
    
    if (enabled) {
      chatApiIndicator.textContent = "Disconnected";
      chatApiIndicator.classList.add("disconnected");
      chatApiIndicator.classList.remove("connected");
    } else {
      chatApiIndicator.textContent = "Connected";
      chatApiIndicator.classList.add("connected");
      chatApiIndicator.classList.remove("disconnected");
    }
  }

  async function readJsonSafe(response) {
    const raw = await response.text();
    try {
      return JSON.parse(raw);
    } catch (_) {
      return { error: raw || "Unexpected server response." };
    }
  }

  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    if (isListening && recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.error("Error stopping recognition on send:", e);
      }
    }

    const preferences = parseInputPreferences(text);
    if (preferences.theme) {
      setTheme(preferences.theme, true);
    }
    if (preferences.voiceHint || preferences.rate || preferences.pitch) {
      updateVoiceProfile(preferences, true);
    }

    addMessage(text, "user");
    chatContext.push({ role: "user", content: text });
    chatInput.value = "";
    chatInput.disabled = true;

    try {
      if (chatContinueBtn) chatContinueBtn.classList.add("hidden");
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, history: chatContext })
      });
      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = await readJsonSafe(response);
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to send message.");
      }

      const isFallback = payload?.source === "fallback";
      if (isFallback) {
        setChatSafeMode(true, "Safe mode active: API key unavailable, using caring fixed replies.");
      } else {
        setChatSafeMode(false);
        if (chatContinueBtn) chatContinueBtn.classList.remove("hidden");
      }

      if (!preferences.theme && payload?.mood) {
        setTheme(themeFromMood(payload.mood), true);
      }
      const responseTone = voiceFromCondition(payload?.mood, payload?.risk);
      if (!preferences.voiceHint && payload?.mood) {
        updateVoiceProfile(responseTone, true);
      }

      // Update the global mood trend and dashboard meter based on AI analysis
      if (payload?.risk !== undefined) {
        const aiRisk = Math.round(Number(payload.risk));
        moodTrend.push(aiRisk);
        if (moodTrend.length > 7) moodTrend.shift(); // Keep last 7 data points
        renderDashboardMood(); // Update the meter and chart
        trackActivity(`Mood updated by AI: ${payload.mood} (Risk: ${aiRisk}%)`, "mood");
      }

      const assistantReply = payload.reply || "I am here for you.";
      addMessage(assistantReply, "assistant");
      chatContext.push({ role: "assistant", content: assistantReply });
      speakText(assistantReply, responseTone);
      assistantTurnCount += 1;
      updateChatMoodMonitor(payload?.mood, payload?.risk);
      maybeMidConversationCheckin(payload?.mood, payload?.risk);
      incrementStat("messages", 1, "Chat session completed", "chat");
    } catch (error) {
      if (chatContinueBtn) chatContinueBtn.classList.add("hidden");
      setChatSafeMode(true, "Safe mode active: network/API issue, showing fixed supportive replies.");
      const fallback = fixedFallbackReply(text);
      addMessage(fallback.reply, "assistant");
      speakText(fallback.reply, voiceFromCondition(fallback.mood, fallback.risk));
      chatContext.push({ role: "assistant", content: fallback.reply });
      assistantTurnCount += 1;
      updateChatMoodMonitor(fallback.mood, fallback.risk);
      maybeMidConversationCheckin(fallback.mood, fallback.risk);
      console.error(error);
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleSendMessage();
    });
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", () => {
      handleSendMessage();
    });
  }

  if (chatInput) {
    chatInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSendMessage();
      }
    });
  }

  if (chatContinueBtn) {
    chatContinueBtn.addEventListener("click", () => {
      chatInput.value = "Tell me more about that...";
      handleSendMessage();
    });
  }

  function updateMoodPreview(value) {
    if (value < 35) {
      moodEmoji.textContent = "☹";
      moodLabel.textContent = "Low";
      return;
    }
    if (value < 70) {
      moodEmoji.textContent = "◔";
      moodLabel.textContent = "Okay";
      return;
    }
    moodEmoji.textContent = "☺";
    moodLabel.textContent = "Great";
  }

  function moodState(value) {
    if (value < 35) return "Low";
    if (value < 70) return "Steady";
    return "Great";
  }

  function parseInputPreferences(text) {
    const lower = String(text || "").toLowerCase();
    let theme = null;
    let voiceHint = null;
    let rate = null;
    let pitch = null;

    if (/\bdark\b/.test(lower)) theme = "dark";
    if (/\blight\b/.test(lower)) theme = "light";
    if (/\bcalm\b|\bsoft\b/.test(lower)) theme = "calm";
    if (/\bwarm\b|\bsunset\b/.test(lower)) theme = "warm";

    if (/\bfemale\b|\bwoman\b/.test(lower)) voiceHint = "female";
    if (/\bmale\b|\bman\b/.test(lower)) voiceHint = "male";
    if (/\bslow\b|\bgentle\b/.test(lower)) rate = 0.9;
    if (/\bfast\b|\bquick\b/.test(lower)) rate = 1.1;
    if (/\bdeep\b|\blower\b/.test(lower)) pitch = 0.85;
    if (/\bhigh\b|\bbrighter\b/.test(lower)) pitch = 1.15;

    return { theme, voiceHint, rate, pitch };
  }

  function themeFromMood(mood) {
    if (mood === "sad") return "calm";
    if (mood === "anxious") return "calm";
    if (mood === "stressed") return "warm";
    return "light";
  }

  function voiceFromMood(mood) {
    if (mood === "sad" || mood === "anxious") {
      return { rate: 0.85, pitch: 1.05, voiceHint: "female" };
    }
    if (mood === "stressed") {
      return { rate: 0.88, pitch: 0.95 };
    }
    if (mood === "happy") {
      return { rate: 0.95, pitch: 1.1, voiceHint: "female" };
    }
    return { rate: 0.9, pitch: 1.0 };
  }

  function voiceFromCondition(mood, risk) {
    const safeRisk = Number(risk);
    // Soft friend-like voice constants
    const softBase = { rate: 0.88, pitch: 1.02, voiceHint: "female" };
    
    if (mood === "anxious" || safeRisk >= 70) {
      return { rate: 0.82, pitch: 1.0, voiceHint: "female" }; // Extra slow and soft
    }
    if (mood === "sad" || safeRisk >= 55) {
      return { rate: 0.85, pitch: 1.02, voiceHint: "female" }; // Gentle and supportive
    }
    if (mood === "happy" || safeRisk < 35) {
      return { rate: 0.95, pitch: 1.08, voiceHint: "female" }; // Cheerful but still soft
    }
    if (mood === "stressed") {
      return { rate: 0.88, pitch: 0.98, voiceHint: "female" }; // Reassuring
    }
    return { ...softBase, voiceHint: voiceProfile.voiceHint || "female" };
  }

  function setTheme(theme, persist) {
    const allowedThemes = new Set(["light", "dark", "calm", "warm"]);
    const nextTheme = allowedThemes.has(theme) ? theme : "light";
    document.body.setAttribute("data-theme", nextTheme);
    userTheme = nextTheme;
    updateThemeButtonState(nextTheme);
    if (persist) {
      localStorage.setItem("wellness_theme", nextTheme);
    }
  }

  function updateThemeButtonState(activeTheme) {
    themeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.themeChoice === activeTheme);
    });
  }

  function loadVoiceProfile() {
    const raw = localStorage.getItem("wellness_voice_profile");
    if (!raw) return { rate: 1, pitch: 1, voiceHint: null };
    try {
      const parsed = JSON.parse(raw);
      return {
        rate: typeof parsed.rate === "number" ? parsed.rate : 1,
        pitch: typeof parsed.pitch === "number" ? parsed.pitch : 1,
        voiceHint: typeof parsed.voiceHint === "string" ? parsed.voiceHint : null
      };
    } catch (_) {
      return { rate: 1, pitch: 1, voiceHint: null };
    }
  }

  function updateVoiceProfile(patch, persist) {
    voiceProfile = {
      rate: typeof patch.rate === "number" ? patch.rate : voiceProfile.rate,
      pitch: typeof patch.pitch === "number" ? patch.pitch : voiceProfile.pitch,
      voiceHint: typeof patch.voiceHint === "string" ? patch.voiceHint : voiceProfile.voiceHint
    };

    if (persist) {
      localStorage.setItem("wellness_voice_profile", JSON.stringify(voiceProfile));
    }
  }

  function pickVoiceByHint(hint, sourceOverride = null) {
    if (!("speechSynthesis" in window)) return null;
    const voices = sourceOverride || window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const source = voices;
    if (!hint) return source[0] || null;

    const femaleKeywords = ["female", "woman", "zira", "samantha", "victoria", "karen", "moira", "soft", "google hindi"];
    const maleKeywords = ["male", "man", "david", "alex", "daniel", "fred", "jorge", "google hindi male"];
    const keywords = hint === "female" ? femaleKeywords : maleKeywords;
    return (
      source.find((voice) => {
        const name = voice.name.toLowerCase();
        return keywords.some((keyword) => name.includes(keyword));
      }) || source[0] || null
    );
  }

  function ensureMoodChart() {
    if (moodChart || !dashboardMoodChartCanvas || typeof Chart === "undefined") return;
    moodChart = new Chart(dashboardMoodChartCanvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Risk",
            data: [],
            borderColor: "#3f62dc",
            backgroundColor: "rgba(95,130,255,0.20)",
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 5,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#3f62dc",
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#657285", font: { weight: "600" } }
          },
          y: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20, color: "#657285", font: { weight: "600" } },
            grid: { color: "#e5ebf5" }
          }
        }
      }
    });
  }

  function renderDashboardMood(labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
    if (!moodTrend.length) {
      moodTrend = [50, 50, 50, 50, 50, 50, 50];
    }
    const latest = moodTrend[moodTrend.length - 1];
    const average = Math.round(moodTrend.reduce((sum, v) => sum + v, 0) / moodTrend.length);

    dashboardMeterValue.textContent = String(latest);
    dashboardMeterLabel.textContent = moodState(latest);
    dashboardMoodAvg.textContent = `Avg ${average}`;
    dashboardMeterRing.style.background = `conic-gradient(var(--accent) ${latest * 3.6}deg, #e3e8f1 0deg)`;
    ensureMoodChart();
    if (moodChart) {
      moodChart.data.labels = labels;
      moodChart.data.datasets[0].data = moodTrend;
      moodChart.update();
    }
    updateMoodScoreStatFromRiskTrend(moodTrend);
  }

  function setTtsUi() {
    if (!ttsToggle) return;
    ttsToggle.textContent = `Voice: ${ttsEnabled ? "On" : "Off"}`;
    ttsToggle.classList.toggle("active", ttsEnabled);
    ttsToggle.setAttribute("aria-pressed", ttsEnabled ? "true" : "false");
  }

  function setListeningUi(listening) {
    if (!sttBtn) return;
    sttBtn.classList.toggle("listening", listening);
    sttBtn.textContent = listening ? "⏺" : "🎤";
    sttBtn.title = listening ? "Stop listening" : "Speech to text";
  }

  const viewReportBtn = document.getElementById("view-report-btn");
  const downloadReportBtn = document.getElementById("download-report-btn");
  const moodQuoteText = document.getElementById("mood-quote-text");
  const moodQuoteAuthor = document.getElementById("mood-quote-author");

  const wellnessQuotes = [
    { text: "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity.", author: "Unknown" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
    { text: "You are enough just as you are.", author: "Meghan Markle" }
  ];

  function rotateQuote() {
    if (!moodQuoteText || !moodQuoteAuthor) return;
    const quote = wellnessQuotes[Math.floor(Math.random() * wellnessQuotes.length)];
    moodQuoteText.textContent = `"${quote.text}"`;
    moodQuoteAuthor.textContent = `— ${quote.author}`;
  }

  // Set interval to rotate quote every 30 seconds
  setInterval(rotateQuote, 30000);

  if (viewReportBtn) {
    viewReportBtn.addEventListener("click", () => {
      const reportText = `Wellness Report\n\nMessages Sent: ${appState.stats.messages}\nMood Score: ${appState.stats.moodScore}\nGames Played: ${appState.stats.games}\n\nRecent Moods: ${moodTrend.join(", ")}`;
      alert(reportText);
    });
  }

  if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", () => {
      const reportText = `Wellness Hub Report\nGenerated: ${new Date().toLocaleString()}\n\nStats:\n- Messages: ${appState.stats.messages}\n- Mood: ${appState.stats.moodScore}\n- Games: ${appState.stats.games}\n\nMood Trend (last 7): ${moodTrend.join(", ")}`;
      const blob = new Blob([reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wellness-report.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function setupSpeechToText() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !sttBtn) {
      if (sttBtn) {
        sttBtn.disabled = true;
        sttBtn.title = "Speech recognition not supported in this browser.";
        console.warn("SpeechRecognition not found.");
      }
      return;
    }

    try {
      recognition = new SpeechRecognition();
      // Setting lang to empty or navigator.language allows more flexibility, 
      // but continuous recognition usually works best with a specific lang or auto-detect if supported.
      recognition.lang = navigator.language || "en-US"; 
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        isListening = true;
        setListeningUi(true);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        chatInput.value = transcript;
        chatInput.scrollLeft = chatInput.scrollWidth;
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        isListening = false;
        setListeningUi(false);
        if (event.error === "not-allowed") {
          alert("Microphone access was denied. Please check your browser permissions.");
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        isListening = false;
        setListeningUi(false);
        chatInput.focus();
      };

      sttBtn.addEventListener("click", () => {
        if (!recognition) return;
        if (isListening) {
          try {
            recognition.stop();
          } catch (e) {
            console.error("Error stopping recognition:", e);
          }
        } else {
          try {
            recognition.start();
          } catch (e) {
            console.error("Error starting recognition:", e);
            isListening = false;
            setListeningUi(false);
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize SpeechRecognition:", e);
      if (sttBtn) {
        sttBtn.disabled = true;
        sttBtn.title = "Failed to initialize speech recognition.";
      }
    }
  }

  moodRange.addEventListener("input", (event) => {
    updateMoodPreview(Number(event.target.value));
  });

  saveMoodBtn.addEventListener("click", async () => {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      return;
    }

    const value = Number(moodRange.value);
    const summary = moodNote.value.trim() || `${moodState(value).toLowerCase()} check in`;
    const mood = moodFromRisk(value);
    setTheme(themeFromMood(mood), true);
    updateVoiceProfile(voiceFromMood(mood), true);

    saveMoodBtn.disabled = true;

    try {
      const response = await fetch(`${API_BASE}/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          risk: value,
          summary,
          date: new Date().toISOString()
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save mood.");
      }

      moodNote.value = "";
      await loadHistory();
      trackActivity(`Updated mood to ${mood}`, "mood");
    } catch (error) {
      console.error(error);
      alert("Could not save mood right now. Please try again.");
    } finally {
      saveMoodBtn.disabled = false;
    }
  });

  function moodFromRisk(risk) {
    if (risk >= 75) return "happy";
    if (risk >= 50) return "stressed";
    if (risk >= 35) return "anxious";
    return "sad";
  }

  function formatHistoryDate(dateInput) {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleString([], { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  function renderHistory(items) {
    moodHistory.innerHTML = "";
    const displayItems = items.slice(0, 12);

    if (!displayItems.length) {
      moodHistory.innerHTML = `
        <article class="history-card">
          <header><span>No logs yet</span><strong>--</strong></header>
          <div class="bar"><span style="width:0%"></span></div>
          <p>Save your first mood check-in.</p>
        </article>
      `;
      return;
    }

    displayItems.forEach((item) => {
      const risk = Number(item.risk) || 0;
      const card = document.createElement("article");
      card.className = "history-card";
      card.innerHTML = `
        <header><span>${escapeHtml(formatHistoryDate(item.date))}</span><strong>${risk}/100</strong></header>
        <div class="bar"><span style="width:${Math.max(0, Math.min(100, risk))}%"></span></div>
        <p>${escapeHtml(item.summary || "Mood check in")}</p>
      `;
      moodHistory.appendChild(card);
    });
  }

  function updateTrendFromHistory(items) {
    const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recent = sorted.slice(-7);
    const values = recent.map((item) => Math.max(0, Math.min(100, Number(item.risk) || 0)));
    const labels = recent.map((item) =>
      new Date(item.date).toLocaleDateString([], { month: "short", day: "numeric" })
    );
    if (values.length) {
      moodTrend = values;
    }
    renderDashboardMood(labels.length ? labels : undefined);
  }

  async function loadHistory() {
    try {
      const authenticated = await ensureAuthenticated();
      if (!authenticated) return;

      const response = await fetch(`${API_BASE}/history?limit=50`);
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch mood history.");
      }

      const history = Array.isArray(payload) ? payload : [];
      renderHistory(history);
      updateTrendFromHistory(history);
    } catch (error) {
      console.error(error);
      renderDashboardMood();
    }
  }

  function setUserLabels(user) {
    if (currentUsernameLabel) currentUsernameLabel.textContent = user?.username || "User";
    if (userIdLabel) userIdLabel.textContent = user?.userId ? `id: ${user.userId}` : "id: --";
  }

  function redirectToLogin() {
    window.location.href = "/login";
  }

  async function ensureAuthenticated() {
    if (currentUser) return true;
    try {
      const response = await fetch(`${API_BASE}/auth/me`);
      if (response.status === 401) {
        redirectToLogin();
        return false;
      }
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Authentication failed.");
      }

      currentUser = payload;
      setUserLabels(currentUser);
      return true;
    } catch (error) {
      console.error(error);
      redirectToLogin();
      return false;
    }
  }

  async function deleteMyData() {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) return;

    const confirmed = window.confirm(
      "Delete all your summarized mood history for this account?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/data`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete data.");
      }

      localStorage.removeItem("wellness_reactive_state");
      moodTrend = [50, 50, 50, 50, 50, 50, 50];
      appState.stats = { messages: 0, moodScore: 0, songs: 0, games: 0 };
      appState.deltas = { messages: 0, moodScore: 0, songs: 0, games: 0 };
      appState.activities = [];
      moodHistory.innerHTML = "";
      renderHistory([]);
      renderReactiveStats();
      renderActivity();
      renderDashboardMood();
      await loadHistory();
    } catch (error) {
      console.error(error);
      alert("Could not delete data right now. Please try again.");
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
    } catch (_) {
      // ignore
    }
    currentUser = null;
    redirectToLogin();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  function createRainBuffer(ctx, seconds = 8) {
    const frameCount = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let smooth = 0;
    for (let i = 0; i < frameCount; i += 1) {
      const noise = (Math.random() * 2 - 1) * 0.4;
      smooth = smooth * 0.93 + noise * 0.07;
      data[i] = smooth;
    }
    return buffer;
  }

  function createOceanBuffer(ctx, seconds = 10) {
    const frameCount = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let prev = 0;
    for (let i = 0; i < frameCount; i += 1) {
      const t = i / ctx.sampleRate;
      const wave = Math.sin(t * 2 * Math.PI * 0.12) * 0.3;
      const noise = (Math.random() * 2 - 1) * 0.15;
      prev = prev * 0.985 + (wave + noise) * 0.015;
      data[i] = prev;
    }
    return buffer;
  }

  function createPianoBuffer(ctx, seconds = 8) {
    const frameCount = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const notes = [
      { start: 0.0, freq: 261.63, dur: 1.8 },
      { start: 1.0, freq: 329.63, dur: 1.8 },
      { start: 2.0, freq: 392.0, dur: 1.8 },
      { start: 3.0, freq: 440.0, dur: 1.8 },
      { start: 4.0, freq: 392.0, dur: 1.8 },
      { start: 5.0, freq: 329.63, dur: 1.8 },
      { start: 6.0, freq: 293.66, dur: 1.8 }
    ];

    notes.forEach((note) => {
      const startIndex = Math.floor(note.start * ctx.sampleRate);
      const endIndex = Math.min(frameCount, Math.floor((note.start + note.dur) * ctx.sampleRate));

      for (let i = startIndex; i < endIndex; i += 1) {
        const t = (i - startIndex) / ctx.sampleRate;
        const envelope = Math.exp(-2.4 * t);
        const fundamental = Math.sin(2 * Math.PI * note.freq * t);
        const harmonic = 0.35 * Math.sin(2 * Math.PI * note.freq * 2 * t);
        data[i] += (fundamental + harmonic) * envelope * 0.22;
      }
    });

    return buffer;
  }

  function ensureSoundBuffers() {
    if (soundBuffers) return soundBuffers;
    const ctx = ensureAudioContext();
    soundBuffers = {
      rain: createRainBuffer(ctx),
      ocean: createOceanBuffer(ctx),
      piano: createPianoBuffer(ctx)
    };
    return soundBuffers;
  }

  function updateSoundButtons() {
    soundButtons.forEach((button) => {
      const isActive = button.dataset.sound === activeSoundId;
      button.classList.toggle("active", isActive);
      button.textContent = isActive ? "Pause" : "Play";
    });
  }

  function stopActiveSound() {
    if (!activeSoundSource) return;
    try {
      activeSoundSource.stop();
    } catch (_) {
      // no-op
    }
    activeSoundSource.disconnect();
    activeSoundSource = null;
    activeSoundId = null;
    updateSoundButtons();
  }

  async function playSound(soundId) {
    const ctx = ensureAudioContext();
    await ctx.resume();
    const buffers = ensureSoundBuffers();
    const source = ctx.createBufferSource();
    source.buffer = buffers[soundId];
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = soundId === "ocean" ? "lowpass" : "highpass";
    filter.frequency.value = soundId === "ocean" ? 700 : 300;

    const gain = ctx.createGain();
    gain.gain.value = soundId === "piano" ? 0.35 : 0.28;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    activeSoundSource = source;
    activeSoundId = soundId;
    updateSoundButtons();
    incrementStat("songs", 1, `Played ${soundId} sound`, "music");
  }

  function setupRelaxingPlayer() {
    if (!soundButtons.length) return;
    if (loopStatus) loopStatus.textContent = "Loop: On";

    soundButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const soundId = button.dataset.sound;
        if (!soundId) return;

        if (activeSoundId === soundId) {
          stopActiveSound();
          return;
        }

        stopActiveSound();
        try {
          await playSound(soundId);
        } catch (error) {
          console.error("Unable to play sound:", error);
        }
      });
    });
  }

  function hideAllGameScreens() {
    document.querySelectorAll(".game-screen").forEach((screen) => screen.classList.add("hidden"));
  }

  function openGameWorkspace(gameId) {
    if (!gameWorkspace) return;
    
    // Open in a popup window
    const popupWidth = 800;
    const popupHeight = 600;
    const left = (window.screen.width / 2) - (popupWidth / 2);
    const top = (window.screen.height / 2) - (popupHeight / 2);
    
    // Create a temporary container for the game if we were to open it in a real window
    // But since this is a single page app, we'll simulate a centered "popup" modal
    gameWorkspace.classList.remove("hidden");
    gameWorkspace.style.position = "fixed";
    gameWorkspace.style.zIndex = "10000";
    gameWorkspace.style.top = "50%";
    gameWorkspace.style.left = "50%";
    gameWorkspace.style.transform = "translate(-50%, -50%)";
    gameWorkspace.style.width = "90vw";
    gameWorkspace.style.maxWidth = "1000px";
    gameWorkspace.style.height = "85vh";
    gameWorkspace.style.boxShadow = "0 20px 50px rgba(0,0,0,0.3)";
    gameWorkspace.style.borderRadius = "20px";
    gameWorkspace.style.overflow = "hidden";
    gameWorkspace.style.background = "var(--surface)";

    hideAllGameScreens();

    if (gameId === "mind-puzzle") {
      document.getElementById("game-screen-mind-puzzle")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Mind Puzzle";
      gameWorkspaceSubtitle.textContent = "Slide tiles into the correct order.";
      initMindPuzzle();
      incrementStat("games", 1, "Started Mind Puzzle", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "mindful-match") {
      document.getElementById("game-screen-mindful-match")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Mindful Match";
      gameWorkspaceSubtitle.textContent = "Match all pairs to complete the game.";
      initMindfulMatch();
      incrementStat("games", 1, "Started Mindful Match", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "zen-garden") {
      document.getElementById("game-screen-zen-garden")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Zen Garden";
      gameWorkspaceSubtitle.textContent = "Rake patterns and place stones.";
      resetZenGarden();
      incrementStat("games", 1, "Started Zen Garden", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "reaction-tap") {
      document.getElementById("game-screen-reaction-tap")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Reaction Tap";
      gameWorkspaceSubtitle.textContent = "Click when the box turns green!";
      initReactionTap();
      incrementStat("games", 1, "Started Reaction Tap", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "thought-reframing") {
      document.getElementById("game-screen-thought-reframing")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Thought Reframing";
      gameWorkspaceSubtitle.textContent = "Challenge and rewrite negative thoughts.";
      initThoughtReframing();
      incrementStat("games", 1, "Started Thought Reframing", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "zen-canvas") {
      document.getElementById("game-screen-zen-canvas")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Zen Canvas";
      gameWorkspaceSubtitle.textContent = "Relax with some free drawing.";
      initZenCanvas();
      incrementStat("games", 1, "Started Zen Canvas", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "rhythm-tap") {
      document.getElementById("game-screen-rhythm-tap")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Rhythm Tap";
      gameWorkspaceSubtitle.textContent = "Tap in time with the beat.";
      initRhythmTap();
      incrementStat("games", 1, "Started Rhythm Tap", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "balloon-breather") {
      document.getElementById("game-screen-balloon-breather")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Balloon Breather";
      gameWorkspaceSubtitle.textContent = "Use your breath to inflate the balloon.";
      initBalloonBreather();
      incrementStat("games", 1, "Started Balloon Breather", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "box-breathing") {
      document.getElementById("game-screen-box-breathing")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Box Breathing";
      gameWorkspaceSubtitle.textContent = "Follow the 4-4-4-4 pattern.";
      initBoxBreathing();
      incrementStat("games", 1, "Started Box Breathing", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "affirmation-swipe") {
      document.getElementById("game-screen-affirmation-swipe")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Affirmation Swipe";
      gameWorkspaceSubtitle.textContent = "Absorb positive thoughts.";
      initAffirmationSwipe();
      incrementStat("games", 1, "Started Affirmation Swipe", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "gratitude-journal") {
      document.getElementById("game-screen-gratitude-journal")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Gratitude Journal";
      gameWorkspaceSubtitle.textContent = "Record your positive moments.";
      initGratitudeJournal();
      incrementStat("games", 1, "Started Gratitude Journal", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "water-plant") {
      document.getElementById("game-screen-water-plant")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Water a Plant";
      gameWorkspaceSubtitle.textContent = "Care for your virtual succulent.";
      initWaterPlant();
      incrementStat("games", 1, "Started Water a Plant", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "find-odd") {
      document.getElementById("game-screen-find-odd")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Find the Odd";
      gameWorkspaceSubtitle.textContent = "Spot the difference quickly.";
      initFindOdd();
      incrementStat("games", 1, "Started Find the Odd", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "mandala-coloring") {
      document.getElementById("game-screen-mandala-coloring")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Mandala Color";
      gameWorkspaceSubtitle.textContent = "Tap areas to fill with color.";
      initMandalaColoring();
      incrementStat("games", 1, "Started Mandala Color", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "shape-arrange") {
      document.getElementById("game-screen-shape-arrange")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Shape Arrange";
      gameWorkspaceSubtitle.textContent = "Arrange pieces to fill the box.";
      initShapeArrange();
      incrementStat("games", 1, "Started Shape Arrange", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "positive-quiz") {
      document.getElementById("game-screen-positive-quiz")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Positive Quiz";
      gameWorkspaceSubtitle.textContent = "Check your optimistic outlook.";
      initPositiveQuiz();
      incrementStat("games", 1, "Started Positive Quiz", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "relaxing-beats") {
      document.getElementById("game-screen-relaxing-beats")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Relaxing Beats";
      gameWorkspaceSubtitle.textContent = "Create your own calm soundscape.";
      initRelaxingBeats();
      incrementStat("games", 1, "Started Relaxing Beats", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "grow-tree") {
      document.getElementById("game-screen-grow-tree")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Grow a Tree";
      gameWorkspaceSubtitle.textContent = "Nurture your tree to maturity.";
      initGrowTree();
      incrementStat("games", 1, "Started Grow a Tree", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "compliment-gen") {
      document.getElementById("game-screen-compliment-gen")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Compliment Generator";
      gameWorkspaceSubtitle.textContent = "A little boost of kindness.";
      initComplimentGen();
      incrementStat("games", 1, "Started Compliment Gen", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "positivity-challenge") {
      document.getElementById("game-screen-positivity-challenge")?.classList.remove("hidden");
      gameWorkspaceTitle.textContent = "Positivity Challenge";
      gameWorkspaceSubtitle.textContent = "Complete your daily task.";
      initPositivityChallenge();
      incrementStat("games", 1, "Started Positivity Challenge", "game");
      gameWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (gameId === "breathe-focus") {
      document.getElementById("view-games")?.scrollIntoView({ behavior: "smooth", block: "start" });
      stopBreathingSession(false);
      startBreathingSession();
      incrementStat("games", 1, "Started Breathe & Focus", "game");
    }
  }

  function isSolvable(tiles) {
    const values = tiles.filter((item) => item !== null);
    let inversions = 0;
    for (let i = 0; i < values.length; i += 1) {
      for (let j = i + 1; j < values.length; j += 1) {
        if (values[i] > values[j]) inversions += 1;
      }
    }
    return inversions % 2 === 0;
  }

  function shuffleMindPuzzle() {
    do {
      mindPuzzleTiles = [1, 2, 3, 4, 5, 6, 7, 8, null].sort(() => Math.random() - 0.5);
    } while (!isSolvable(mindPuzzleTiles) || isMindPuzzleSolved());
    mindPuzzleMoves = 0;
  }

  function isMindPuzzleSolved() {
    const target = [1, 2, 3, 4, 5, 6, 7, 8, null];
    return target.every((value, index) => value === mindPuzzleTiles[index]);
  }

  function canMoveMindTile(index) {
    const emptyIndex = mindPuzzleTiles.indexOf(null);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;
    return Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
  }

  function renderMindPuzzle() {
    if (!mindPuzzleGrid) return;
    mindPuzzleGrid.innerHTML = "";
    mindPuzzleTiles.forEach((value, index) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = `mind-tile ${value === null ? "empty" : ""}`;
      tile.textContent = value === null ? "" : String(value);
      tile.disabled = value === null;
      tile.addEventListener("click", () => {
        if (!canMoveMindTile(index)) return;
        const emptyIndex = mindPuzzleTiles.indexOf(null);
        [mindPuzzleTiles[index], mindPuzzleTiles[emptyIndex]] = [mindPuzzleTiles[emptyIndex], mindPuzzleTiles[index]];
        mindPuzzleMoves += 1;
        mindPuzzleMovesLabel.textContent = `Moves: ${mindPuzzleMoves}`;
        renderMindPuzzle();
        if (isMindPuzzleSolved()) {
          mindPuzzleMessage.textContent = `Great job! Puzzle solved in ${mindPuzzleMoves} moves.`;
        }
      });
      mindPuzzleGrid.appendChild(tile);
    });
  }

  function initMindPuzzle() {
    shuffleMindPuzzle();
    if (mindPuzzleMovesLabel) mindPuzzleMovesLabel.textContent = "Moves: 0";
    if (mindPuzzleMessage) mindPuzzleMessage.textContent = "Arrange tiles 1 to 8 in order.";
    renderMindPuzzle();
  }

  function initMindfulMatch() {
    const symbols = ["🌿", "🌸", "🌊", "☀", "🍃", "🪨", "🌙", "🕊"];
    mindfulCards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    mindfulFlipped = [];
    mindfulMatched = 0;
    mindfulMoves = 0;
    renderMindfulMatch();
  }

  function renderMindfulMatch() {
    if (!mindfulMatchGrid || !mindfulMatchStats) return;
    mindfulMatchGrid.innerHTML = "";
    mindfulMatchStats.textContent = `Moves: ${mindfulMoves} | Matches: ${mindfulMatched}/8`;

    mindfulCards.forEach((symbol, index) => {
      const card = document.createElement("button");
      card.type = "button";
      const isFlipped = mindfulFlipped.includes(index);
      const isMatched = symbol === null;
      card.className = `match-card ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}`;
      card.textContent = isFlipped || isMatched ? symbol || "✓" : "•";
      card.disabled = isFlipped || isMatched;
      card.addEventListener("click", () => handleMindfulFlip(index));
      mindfulMatchGrid.appendChild(card);
    });
  }

  function handleMindfulFlip(index) {
    if (mindfulFlipped.length >= 2 || mindfulCards[index] === null || mindfulFlipped.includes(index)) return;
    mindfulFlipped.push(index);
    renderMindfulMatch();
    if (mindfulFlipped.length < 2) return;

    mindfulMoves += 1;
    const [first, second] = mindfulFlipped;
    if (mindfulCards[first] === mindfulCards[second]) {
      const matchedSymbol = mindfulCards[first];
      mindfulCards[first] = null;
      mindfulCards[second] = null;
      mindfulFlipped = [];
      mindfulMatched += 1;
      renderMindfulMatch();
      if (mindfulMatched === 8) {
        mindfulMatchStats.textContent = `Completed in ${mindfulMoves} moves`;
      }
      return;
    }

    setTimeout(() => {
      mindfulFlipped = [];
      renderMindfulMatch();
    }, 600);
  }

  function resetZenGarden() {
    if (!zenGardenBoard || !zenGardenLines) return;
    zenGardenBoard.querySelectorAll(".zen-stone").forEach((stone) => stone.remove());
    zenGardenLines.innerHTML = "";
    zenPath = null;
  }

  function setZenTool(tool) {
    zenTool = tool;
    zenToolButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.zenTool === tool);
    });
    zenGardenBoard.style.cursor = tool === "stone" ? "copy" : "crosshair";
  }

  function boardPoint(event) {
    const rect = zenGardenBoard.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function addZenStone(x, y) {
    const stone = document.createElement("div");
    stone.className = "zen-stone";
    stone.style.left = `${x}px`;
    stone.style.top = `${y}px`;
    zenGardenBoard.appendChild(stone);
  }

  function beginZenPath(point) {
    zenPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    zenPath.setAttribute("d", `M ${point.x} ${point.y}`);
    zenPath.setAttribute("stroke", "#b5aa8d");
    zenPath.setAttribute("stroke-width", "3");
    zenPath.setAttribute("fill", "none");
    zenPath.setAttribute("stroke-linecap", "round");
    zenPath.setAttribute("stroke-linejoin", "round");
    zenGardenLines.appendChild(zenPath);
  }

  function appendZenPath(point) {
    if (!zenPath) return;
    const current = zenPath.getAttribute("d");
    zenPath.setAttribute("d", `${current} L ${point.x} ${point.y}`);
  }

  // --- Reaction Tap Game ---
  function initReactionTap() {
    const area = document.getElementById("reaction-area");
    const prompt = document.getElementById("reaction-prompt");
    const scoreEl = document.getElementById("reaction-score");
    if (!area || !prompt) return;

    clearTimeout(reactionTimer);
    area.className = "reaction-area waiting";
    prompt.textContent = "Wait for Green...";
    reactionScore = 0;
    scoreEl.textContent = "Score: 0";

    const startReaction = () => {
      const delay = 2000 + Math.random() * 3000;
      reactionTimer = setTimeout(() => {
        area.className = "reaction-area ready";
        prompt.textContent = "TAP NOW!";
        reactionStartTime = Date.now();
      }, delay);
    };

    area.onclick = () => {
      if (area.classList.contains("waiting")) {
        clearTimeout(reactionTimer);
        prompt.textContent = "Too early! Resetting...";
        setTimeout(startReaction, 1000);
      } else if (area.classList.contains("ready")) {
        const reactionTime = Date.now() - reactionStartTime;
        reactionScore++;
        scoreEl.textContent = `Score: ${reactionScore}`;
        if (reactionTime < reactionBest) {
          reactionBest = reactionTime;
          document.getElementById("reaction-best").textContent = `Best: ${reactionBest}ms`;
        }
        prompt.textContent = `${reactionTime}ms! Wait...`;
        area.className = "reaction-area waiting";
        startReaction();
      }
    };

    startReaction();
  }

  // --- Thought Reframing ---
  function initThoughtReframing() {
    const btn = document.getElementById("reframe-btn");
    const negInput = document.getElementById("negative-thought");
    const posInput = document.getElementById("positive-thought");
    const history = document.getElementById("reframe-history");
    if (!btn || !negInput || !posInput || !history) return;

    btn.onclick = () => {
      const neg = negInput.value.trim();
      const pos = posInput.value.trim();
      if (!neg || !pos) return;

      const item = document.createElement("div");
      item.className = "reframe-item animate-fade-in";
      item.innerHTML = `
        <small>${new Date().toLocaleDateString()}</small>
        <p><strong>Negative:</strong> ${escapeHtml(neg)}</p>
        <p><strong>Positive:</strong> ${escapeHtml(pos)}</p>
      `;
      history.prepend(item);
      negInput.value = "";
      posInput.value = "";
      incrementStat("games", 1, "Reframed a thought", "game");
    };
  }

  // --- Zen Canvas ---
  function initZenCanvas() {
    const canvas = document.getElementById("zen-drawing-canvas");
    const colorInput = document.getElementById("canvas-color");
    const clearBtn = document.getElementById("canvas-clear");
    if (!canvas) return;

    zenCanvasCtx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    zenCanvasCtx.strokeStyle = colorInput.value;
    zenCanvasCtx.lineWidth = 3;
    zenCanvasCtx.lineCap = "round";

    canvas.onmousedown = (e) => {
      zenCanvasDrawing = true;
      zenCanvasCtx.beginPath();
      zenCanvasCtx.moveTo(e.offsetX, e.offsetY);
    };

    canvas.onmousemove = (e) => {
      if (!zenCanvasDrawing) return;
      zenCanvasCtx.lineTo(e.offsetX, e.offsetY);
      zenCanvasCtx.stroke();
    };

    canvas.onmouseup = () => zenCanvasDrawing = false;
    clearBtn.onclick = () => zenCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    colorInput.onchange = (e) => zenCanvasCtx.strokeStyle = e.target.value;
  }

  // --- Rhythm Tap ---
  function initRhythmTap() {
    const target = document.getElementById("rhythm-target");
    const beat = document.getElementById("rhythm-beat");
    const scoreEl = document.getElementById("rhythm-score");
    if (!target || !beat) return;

    rhythmScore = 0;
    scoreEl.textContent = "Score: 0";
    clearInterval(rhythmInterval);

    const spawnBeat = () => {
      beat.style.transition = "none";
      beat.style.width = "200px";
      beat.style.height = "200px";
      beat.style.opacity = "0";
      
      setTimeout(() => {
        beat.style.transition = "all 1s linear";
        beat.style.width = "80px";
        beat.style.height = "80px";
        beat.style.opacity = "1";
      }, 50);
    };

    target.onclick = () => {
      const rect = beat.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const size = rect.width;
      
      if (size > 70 && size < 90) {
        rhythmScore += 10;
        target.style.background = "#4ade80";
      } else {
        rhythmScore = Math.max(0, rhythmScore - 5);
        target.style.background = "#fca5a5";
      }
      scoreEl.textContent = `Score: ${rhythmScore}`;
      setTimeout(() => target.style.background = "var(--accent)", 200);
    };

    spawnBeat();
    rhythmInterval = setInterval(spawnBeat, 1200);
  }

  // --- Balloon Breather ---
  function initBalloonBreather() {
    const balloon = document.getElementById("balloon");
    const instr = document.getElementById("balloon-instruction");
    if (!balloon) return;

    balloonSize = 50;
    balloon.style.width = "50px";
    balloon.style.height = "60px";

    const inflate = () => {
      balloonSize = Math.min(250, balloonSize + 2);
      balloon.style.width = `${balloonSize}px`;
      balloon.style.height = `${balloonSize * 1.2}px`;
      if (balloonSize >= 250) instr.textContent = "Full! Release to exhale...";
    };

    const deflate = () => {
      balloonSize = Math.max(50, balloonSize - 1.5);
      balloon.style.width = `${balloonSize}px`;
      balloon.style.height = `${balloonSize * 1.2}px`;
      if (balloonSize <= 50) instr.textContent = "Hold SPACE to inhale...";
    };

    window.onkeydown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        clearInterval(balloonInterval);
        balloonInterval = setInterval(inflate, 30);
      }
    };

    window.onkeyup = (e) => {
      if (e.code === "Space") {
        clearInterval(balloonInterval);
        balloonInterval = setInterval(deflate, 30);
      }
    };
  }

  // --- Box Breathing ---
  function initBoxBreathing() {
    const startBtn = document.getElementById("box-breathing-start");
    const circle = document.getElementById("box-breathing-circle");
    const phaseEl = document.getElementById("box-breathing-phase");
    const timerEl = document.getElementById("box-breathing-timer");
    const durationInput = document.getElementById("box-breathing-duration");
    if (!startBtn || !circle || !phaseEl || !timerEl) return;

    let boxInterval = null;
    let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    const phases = ["Inhale", "Hold", "Exhale", "Hold"];

    startBtn.onclick = () => {
      const userMinutes = parseInt(durationInput?.value || "1");
      let totalSeconds = userMinutes * 60;
      
      startBtn.disabled = true;
      durationInput.disabled = true;
      
      const update = () => {
        phaseEl.textContent = phases[phase];
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        
        if (phase === 0) circle.style.transform = "scale(1.5)";
        if (phase === 2) circle.style.transform = "scale(1)";

        if (totalSeconds % 4 === 0 && totalSeconds > 0) {
          phase = (phase + 1) % 4;
        }

        if (totalSeconds <= 0) {
          clearInterval(boxInterval);
          startBtn.disabled = false;
          durationInput.disabled = false;
          phaseEl.textContent = "Session Complete";
          trackActivity(`Completed ${userMinutes}m breathing session`, "game");
          return;
        }
        totalSeconds--;
      };

      phase = 0;
      update();
      boxInterval = setInterval(update, 1000);
    };
  }

  // --- Affirmation Swipe ---
  function initAffirmationSwipe() {
    const card = document.getElementById("affirmation-card");
    const text = document.getElementById("affirmation-text");
    const nextBtn = document.getElementById("swipe-left");
    const loveBtn = document.getElementById("swipe-right");
    if (!card || !text) return;

    const affirmations = [
      "I am worthy of love and respect.",
      "My mistakes help me grow.",
      "I believe in my ability to get through tough times.",
      "I am enough just as I am.",
      "Today is a fresh start.",
      "I choose to be kind to myself."
    ];

    const next = () => {
      card.style.transform = "translateX(-100px) rotate(-10deg)";
      card.style.opacity = "0";
      setTimeout(() => {
        text.textContent = affirmations[Math.floor(Math.random() * affirmations.length)];
        card.style.transform = "translateX(0) rotate(0)";
        card.style.opacity = "1";
      }, 300);
    };

    nextBtn.onclick = next;
    loveBtn.onclick = () => {
      card.style.transform = "scale(1.1)";
      setTimeout(() => card.style.transform = "scale(1)", 200);
      trackActivity("Saved an affirmation", "mood");
      next();
    };
  }

  // --- Gratitude Journal ---
  function initGratitudeJournal() {
    const saveBtn = document.getElementById("save-gratitude-btn");
    const inputs = document.querySelectorAll(".gratitude-input");
    const history = document.getElementById("gratitude-history");
    if (!saveBtn || !history) return;

    saveBtn.onclick = () => {
      const items = Array.from(inputs).map(i => i.value.trim()).filter(v => v);
      if (items.length < 3) {
        alert("Please fill all 3 things!");
        return;
      }

      const entry = document.createElement("div");
      entry.className = "reframe-item animate-fade-in";
      entry.innerHTML = `
        <small>${new Date().toLocaleDateString()}</small>
        <ul>${items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
      `;
      history.prepend(entry);
      inputs.forEach(i => i.value = "");
      trackActivity("Wrote in gratitude journal", "mood");
    };
  }

  // --- Water a Plant ---
  function initWaterPlant() {
    const plant = document.getElementById("plant");
    const btn = document.getElementById("water-plant-btn");
    const msg = document.getElementById("plant-message");
    if (!plant || !btn) return;

    let hydration = 0;
    btn.onclick = () => {
      hydration++;
      plant.style.transform = "scale(1.2)";
      setTimeout(() => plant.style.transform = "scale(1)", 200);
      
      if (hydration > 5) {
        plant.textContent = "🪴";
        msg.textContent = "Your plant is thriving!";
      } else {
        msg.textContent = "Keep watering!";
      }
    };
  }

  // --- Find the Odd ---
  function initFindOdd() {
    const grid = document.getElementById("find-odd-grid");
    const scoreEl = document.getElementById("find-odd-score");
    if (!grid) return;

    let score = 0;
    const icons = ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇"];
    
    const startRound = () => {
      grid.innerHTML = "";
      const normal = icons[Math.floor(Math.random() * icons.length)];
      let odd = icons[Math.floor(Math.random() * icons.length)];
      while (odd === normal) odd = icons[Math.floor(Math.random() * icons.length)];

      const oddIndex = Math.floor(Math.random() * 16);
      for (let i = 0; i < 16; i++) {
        const item = document.createElement("button");
        item.className = "odd-item";
        item.textContent = i === oddIndex ? odd : normal;
        item.onclick = () => {
          if (i === oddIndex) {
            score++;
            scoreEl.textContent = `Score: ${score}`;
            startRound();
          }
        };
        grid.appendChild(item);
      }
    };
    startRound();
  }

  // --- Mandala Coloring ---
  function initMandalaColoring() {
    const container = document.getElementById("mandala-svg-container");
    const colorInput = document.getElementById("mandala-color");
    if (!container) return;

    container.innerHTML = `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
        <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" fill="#f1f5f9" stroke="#cbd5e1"/>
        <circle cx="50" cy="50" r="10" fill="#f1f5f9" stroke="#cbd5e1"/>
      </svg>
    `;

    container.onclick = (e) => {
      if (e.target.tagName === "path" || e.target.tagName === "circle") {
        e.target.setAttribute("fill", colorInput.value);
      }
    };
  }

  // --- Shape Arrange ---
  function initShapeArrange() {
    const pieces = document.getElementById("shape-pieces");
    if (!pieces) return;
    pieces.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const p = document.createElement("div");
      p.className = "shape-piece";
      p.draggable = true;
      pieces.appendChild(p);
    }
  }

  // --- Positive Quiz ---
  function initPositiveQuiz() {
    const qEl = document.getElementById("quiz-question");
    const optEl = document.getElementById("quiz-options");
    const feedback = document.getElementById("quiz-feedback");
    if (!qEl) return;

    const questions = [
      { q: "When things go wrong, I usually think...", a: ["It's temporary", "I'm cursed", "Everything is ruined"], correct: 0 },
      { q: "A challenge is...", a: ["A threat", "An opportunity", "A waste of time"], correct: 1 }
    ];

    const showQ = (idx) => {
      const q = questions[idx];
      qEl.textContent = q.q;
      optEl.innerHTML = "";
      q.a.forEach((opt, i) => {
        const b = document.createElement("button");
        b.className = "quiz-option";
        b.textContent = opt;
        b.onclick = () => {
          feedback.textContent = i === q.correct ? "Great mindset! ✨" : "Try to see the silver lining. ☁️";
          setTimeout(() => idx + 1 < questions.length ? showQ(idx + 1) : feedback.textContent = "Quiz Complete!", 1500);
        };
        optEl.appendChild(b);
      });
    };
    showQ(0);
  }

  // --- Relaxing Beats ---
  function initRelaxingBeats() {
    const pads = document.querySelectorAll(".beat-pad");
    pads.forEach(pad => {
      pad.onclick = () => {
        const ctx = ensureAudioContext();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(ctx.destination);
        osc.frequency.value = 200 + Math.random() * 400;
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      };
    });
  }

  // --- Grow a Tree ---
  function initGrowTree() {
    const tree = document.getElementById("tree");
    const water = document.getElementById("tree-water-btn");
    const sun = document.getElementById("tree-sun-btn");
    if (!tree) return;

    let growth = 0;
    const update = () => {
      if (growth > 10) tree.textContent = "🌳";
      else if (growth > 5) tree.textContent = "🌿";
      else tree.textContent = "🌱";
    };

    water.onclick = () => { growth++; update(); };
    sun.onclick = () => { growth++; update(); };
  }

  // --- Compliment Gen ---
  function initComplimentGen() {
    const text = document.getElementById("compliment-text");
    const btn = document.getElementById("gen-compliment-btn");
    if (!text) return;

    const comps = ["You are resilient.", "Your presence matters.", "You're doing better than you think.", "You are enough."];
    btn.onclick = () => text.textContent = comps[Math.floor(Math.random() * comps.length)];
  }

  // --- Positivity Challenge ---
  function initPositivityChallenge() {
    const title = document.getElementById("challenge-title");
    const desc = document.getElementById("challenge-desc");
    const btn = document.getElementById("complete-challenge-btn");
    if (!title) return;

    const challenges = [
      { t: "Kindness", d: "Send a nice text to a friend." },
      { t: "Self-Care", d: "Drink a full glass of water now." },
      { t: "Mindfulness", d: "Notice 3 blue things around you." }
    ];

    const c = challenges[Math.floor(Math.random() * challenges.length)];
    title.textContent = c.t;
    desc.textContent = c.d;
    btn.onclick = () => {
      btn.textContent = "Completed! 🎉";
      btn.disabled = true;
      incrementStat("games", 1, "Completed daily challenge", "mood");
    };
  }

  function setupGames() {
    gameLaunchButtons.forEach((button) => {
      button.addEventListener("click", () => openGameWorkspace(button.dataset.game));
    });

    if (gameWorkspaceClose) {
      gameWorkspaceClose.addEventListener("click", () => gameWorkspace?.classList.add("hidden"));
    }

    if (mindPuzzleReset) {
      mindPuzzleReset.addEventListener("click", initMindPuzzle);
    }

    if (mindfulMatchReset) {
      mindfulMatchReset.addEventListener("click", initMindfulMatch);
    }

    zenToolButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.zenTool === "erase") {
          resetZenGarden();
          return;
        }
        setZenTool(button.dataset.zenTool);
      });
    });

    if (zenGardenBoard) {
      zenGardenBoard.addEventListener("mousedown", (event) => {
        const point = boardPoint(event);
        if (zenTool === "stone") {
          addZenStone(point.x, point.y);
          return;
        }
        zenDrawing = true;
        beginZenPath(point);
      });

      zenGardenBoard.addEventListener("mousemove", (event) => {
        if (!zenDrawing || zenTool !== "rake") return;
        appendZenPath(boardPoint(event));
      });

      const stopZenDraw = () => {
        zenDrawing = false;
        zenPath = null;
      };

      zenGardenBoard.addEventListener("mouseup", stopZenDraw);
      zenGardenBoard.addEventListener("mouseleave", stopZenDraw);
    }

    setZenTool("rake");
  }

  function formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function applyBreathingPhase(phase) {
    if (!breathingCircle || !breathingPhase) return;
    breathingCircle.classList.remove("inhale", "exhale");
    if (phase === "inhale") {
      breathingCircle.classList.add("inhale");
      breathingPhase.textContent = "Inhale";
      return;
    }
    breathingCircle.classList.add("exhale");
    breathingPhase.textContent = "Exhale";
  }

  function stopBreathingSession(finished) {
    clearInterval(breathingTickInterval);
    clearInterval(breathingPhaseInterval);
    clearTimeout(breathingTimeout);
    breathingTickInterval = null;
    breathingPhaseInterval = null;
    breathingTimeout = null;

    if (!breathingStartBtn || !breathingTimer || !breathingPhase || !breathingCircle) return;
    breathingStartBtn.disabled = false;
    breathingStartBtn.textContent = "Start 1-Minute Session";
    breathingTimer.textContent = "01:00";
    breathingCircle.classList.remove("inhale", "exhale");
    breathingCircle.style.transform = "";
    breathingPhase.textContent = finished ? "Session complete" : "Press start";
    if (finished) {
      trackActivity("Completed breathing session", "game");
    }
  }

  function startBreathingSession() {
    if (!breathingStartBtn || !breathingTimer || !breathingPhase || !breathingCircle) return;

    let remaining = 60;
    let currentPhase = "inhale";

    breathingStartBtn.disabled = true;
    breathingStartBtn.textContent = "Running...";
    breathingTimer.textContent = formatSeconds(remaining);
    applyBreathingPhase(currentPhase);

    breathingTickInterval = setInterval(() => {
      remaining -= 1;
      breathingTimer.textContent = formatSeconds(Math.max(remaining, 0));
    }, 1000);

    breathingPhaseInterval = setInterval(() => {
      currentPhase = currentPhase === "inhale" ? "exhale" : "inhale";
      applyBreathingPhase(currentPhase);
    }, 4000);

    breathingTimeout = setTimeout(() => {
      stopBreathingSession(true);
    }, 60000);
  }

  if (ttsToggle) {
    setTtsUi();
    ttsToggle.addEventListener("click", () => {
      ttsEnabled = !ttsEnabled;
      if (!ttsEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setTtsUi();
    });
  }

  setTheme(userTheme, false);
  updateChatMoodMonitor("--", "--");
  setChatSafeMode(false);
  renderReactiveStats();
  renderActivity();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      pickVoiceByHint(voiceProfile.voiceHint);
    };
  }
  setupSpeechToText();
  setupRelaxingPlayer();
  setupGames();
  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedTheme = button.dataset.themeChoice;
      setTheme(selectedTheme, true);
      trackActivity(`Changed theme to ${selectedTheme}`, "theme");
    });
  });
  if (breathingStartBtn) {
    breathingStartBtn.addEventListener("click", () => {
      stopBreathingSession(false);
      startBreathingSession();
    });
  }
  if (deleteDataBtn) {
    deleteDataBtn.addEventListener("click", deleteMyData);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
  setUserLabels(null);
  ensureAuthenticated().then((ok) => {
    if (ok) loadHistory();
  });
});
