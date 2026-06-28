// MentorAI - Application Engine (Backend Integrated)

// ==========================================
// 1. Initial State Definition
// ==========================================
const state = {
  authToken: localStorage.getItem('mentorai_token') || '',
  user: {
    username: "Scholar",
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    coins: 100,
    streak: 0,
    rank: "Beginner",
    weakTopics: [],
    achievements: [
      { id: "streak_5", title: "5-Day Streak", icon: "🔥", desc: "Maintained a learning habit for 5 days.", unlocked: false },
      { id: "boss_slayer", title: "Chapter Guard Defeated", icon: "👹", desc: "Won a Boss Battle in the Quiz Arena.", unlocked: false },
      { id: "sheets_sync", title: "Data Architect", icon: "📊", desc: "Synchronized learning records to Drive.", unlocked: false },
      { id: "perfect_quiz", title: "Absolute Perfection", icon: "🎯", desc: "Scored 100% on any adaptive quiz.", unlocked: false }
    ],
    dailyMissions: [
      { id: "mission_study", desc: "Initiate React or Binary Search lesson", reward: "+50 XP", done: false },
      { id: "mission_quiz", desc: "Defeat a Quiz Arena Boss", reward: "+100 XP / +10 Coins", done: false },
      { id: "mission_notes", desc: "Review 1 notes file in Vault", reward: "+20 Coins", done: false }
    ]
  },
  
  router: {
    metrics: {
      gemini: { latency: 1200, cost: 0.00015 },
      openai: { latency: 1800, cost: 0.0006 },
      claude: { latency: 2200, cost: 0.003 },
      deepseek: { latency: 900, cost: 0.00007 }
    },
    logs: [
      { time: "17:20:05", type: "info", text: "MentorAI Router online. Serving unified REST API." }
    ]
  },
  
  vault: [],
  
  currentLesson: {
    topic: "",
    mode: "professor",
    activeNodeId: null,
    roadmap: [],
    chatMessages: [],
    notesMarkdown: "",
    slides: [],
    quiz: [],
    quizActive: false,
    currentQuestionIndex: 0,
    bossHp: 100,
    playerHp: 3,
    activeFileId: null
  }
};

// ==========================================
// 2. UI Elements Mapping
// ==========================================
const UI = {
  navDashboard: document.getElementById('nav-dashboard'),
  navTutor: document.getElementById('nav-tutor'),
  navRoadmap: document.getElementById('nav-roadmap'),
  navQuiz: document.getElementById('nav-quiz'),
  navVault: document.getElementById('nav-vault'),
  navRouter: document.getElementById('nav-router'),
  
  views: {
    dashboard: document.getElementById('view-dashboard'),
    tutor: document.getElementById('view-tutor'),
    roadmap: document.getElementById('view-roadmap'),
    quiz: document.getElementById('view-quiz'),
    vault: document.getElementById('view-vault'),
    router: document.getElementById('view-router')
  },
  
  viewTitle: document.getElementById('current-view-title'),
  viewSubtitle: document.getElementById('current-view-subtitle'),
  
  topStreak: document.getElementById('top-streak-count'),
  topCoins: document.getElementById('top-coins-count'),
  topXp: document.getElementById('top-xp-count'),
  
  // Dashboard fields
  dashStreak: document.getElementById('dash-streak-days'),
  dashCoins: document.getElementById('dash-coins'),
  dashLevel: document.getElementById('dash-level'),
  dashNextXp: document.getElementById('dash-next-xp'),
  dashProgressPct: document.getElementById('dashboard-progress-pct'),
  dashProgressRing: document.getElementById('dashboard-progress-ring'),
  dashMissions: document.getElementById('dashboard-missions'),
  dashMissionsCompletedCount: document.getElementById('missions-completed-count'),
  dashWeakTopics: document.getElementById('dashboard-weak-topics'),
  dashLeaderboard: document.getElementById('leaderboard-items'),
  dashResumeBtn: document.getElementById('dashboard-resume-btn'),
  dashMissionText: document.getElementById('dashboard-learning-mission'),
  
  // Tutor fields
  tutorInput: document.getElementById('tutor-topic-input'),
  tutorMode: document.getElementById('select-learning-mode'),
  tutorStartBtn: document.getElementById('btn-start-teaching'),
  tutorChatViewport: document.getElementById('tutor-chat-viewport'),
  tutorChatControls: document.getElementById('tutor-chat-controls'),
  tutorUserReply: document.getElementById('tutor-user-reply'),
  tutorSendBtn: document.getElementById('btn-tutor-send'),
  
  // Visualizer fields
  tabButtons: document.querySelectorAll('.tabs-header .tab-btn'),
  tabPanels: document.querySelectorAll('.tab-viewport .tab-panel'),
  whiteboardCanvas: document.getElementById('whiteboard-canvas-container'),
  notesMarkdownView: document.getElementById('live-notes-markdown-view'),
  notesDownloadBtn: document.getElementById('btn-download-vault-notes'),
  notesDownloadMdBtn: document.getElementById('btn-download-vault-notes-md'),
  notesMakePptBtn: document.getElementById('btn-make-ppt'),
  completeNodeBtn: document.getElementById('btn-complete-node'),
  boardRenderingStatus: document.getElementById('board-rendering-status'),
  
  // Roadmap fields
  roadmapNodesDraw: document.getElementById('roadmap-nodes-draw'),
  roadmapTopicBadge: document.getElementById('roadmap-topic-badge'),
  roadmapCompletionPct: document.getElementById('roadmap-completion-pct'),
  
  // Quiz fields
  quizBossCard: document.getElementById('quiz-boss-card'),
  quizBossName: document.getElementById('quiz-boss-name'),
  quizBossHpBar: document.getElementById('quiz-boss-hp-bar'),
  quizBossHpText: document.getElementById('quiz-boss-hp-text'),
  quizPlayerName: document.getElementById('quiz-player-name'),
  quizPlayerHpBar: document.getElementById('quiz-player-hp-bar'),
  quizPlayerHpText: document.getElementById('quiz-player-hp-text'),
  quizProgressFill: document.getElementById('quiz-progress-fill'),
  quizQNum: document.getElementById('quiz-q-num'),
  quizQDiff: document.getElementById('quiz-q-diff'),
  quizQText: document.getElementById('quiz-q-text'),
  quizQCodeContainer: document.getElementById('quiz-q-code-container'),
  quizQCode: document.getElementById('quiz-q-code'),
  quizOptionsContainer: document.getElementById('quiz-options-container'),
  quizHintBtn: document.getElementById('btn-quiz-hint'),
  quizActionBtn: document.getElementById('btn-quiz-action'),
  quizOverlayScreen: document.getElementById('quiz-overlay-screen'),
  quizVictoryTitle: document.getElementById('quiz-victory-title'),
  quizVictorySubtitle: document.getElementById('quiz-victory-subtitle'),
  lootXp: document.getElementById('loot-xp'),
  lootCoins: document.getElementById('loot-coins'),
  quizCloseVictoryBtn: document.getElementById('btn-quiz-close-victory'),
  
  // Vault fields
  vaultFilesList: document.getElementById('vault-files-list'),
  inspectorFileTitle: document.getElementById('inspector-file-title'),
  inspectorFileType: document.getElementById('inspector-file-type'),
  inspectorFileContent: document.getElementById('inspector-file-content'),
  importCsvTrigger: document.getElementById('btn-import-csv-trigger'),
  
  // PPT Presenter
  slidePresenterViewport: document.getElementById('slide-presenter-viewport'),
  slideTextContent: document.getElementById('slide-text-content'),
  slideCounter: document.getElementById('slide-counter'),
  btnPrevSlide: document.getElementById('btn-prev-slide'),
  btnNextSlide: document.getElementById('btn-next-slide'),
  btnClosePresenter: document.getElementById('btn-close-presenter'),
  
  // Router fields
  routerStrategy: document.getElementById('select-routing-strategy'),
  checkAllowFailover: document.getElementById('check-allow-failover'),
  routerLogsConsole: document.getElementById('router-logs-console'),
  clearRouterLogsBtn: document.getElementById('btn-clear-router-logs'),
  chartLatency: document.getElementById('chart-latency'),
  chartCost: document.getElementById('chart-cost'),
  
  // Sync
  btnDriveSyncStatus: document.getElementById('btn-drive-sync-status'),
  
  // Settings Modal
  modalSettings: document.getElementById('modal-settings'),
  settingsTriggerBtn: document.getElementById('btn-settings-trigger'),
  settingsUsername: document.getElementById('settings-username'),
  settingsSpeed: document.getElementById('settings-speed'),
  settingsLanguage: document.getElementById('settings-language'),
  settingsGoal: document.getElementById('settings-goal'),
  settingsSaveBtn: document.getElementById('btn-settings-save'),
  settingsCancelBtn: document.getElementById('btn-settings-cancel'),
  closeSettingsBtn: document.getElementById('btn-close-settings'),
  avatarDisplay: document.getElementById('avatar-display'),
  userNameDisplay: document.getElementById('user-name-display'),
  userRankDisplay: document.getElementById('user-rank-display'),
  
  // CSV Import Modal
  modalImportCsv: document.getElementById('modal-import-csv'),
  csvDropZone: document.getElementById('csv-drop-zone'),
  csvFileInput: document.getElementById('csv-file-input'),
  csvFileName: document.getElementById('csv-file-name'),
  btnImportCsvExecute: document.getElementById('btn-import-csv-execute'),
  btnImportCsvCancel: document.getElementById('btn-import-csv-cancel'),
  btnCloseImportCsv: document.getElementById('btn-close-import-csv'),
  
  // Toast container
  toastContainer: document.getElementById('toast-container'),

  // Authentication views
  modalAuth: document.getElementById('modal-auth'),
  authLoginView: document.getElementById('auth-login-view'),
  authRegisterView: document.getElementById('auth-register-view'),
  btnExecuteLogin: document.getElementById('btn-login-execute'),
  btnExecuteRegister: document.getElementById('btn-register-execute'),
  linkToRegister: document.getElementById('link-to-register'),
  linkToLogin: document.getElementById('link-to-login'),
  loginUser: document.getElementById('login-username'),
  loginPass: document.getElementById('login-password'),
  registerUser: document.getElementById('register-username'),
  registerEmail: document.getElementById('register-email'),
  registerPass: document.getElementById('register-password'),
  btnLogout: document.getElementById('btn-logout')
};

// ==========================================
// 3. API Communication Client Modules
// ==========================================
async function apiFetch(endpoint, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  if (state.authToken) {
    headers["Authorization"] = `Bearer ${state.authToken}`;
  }
  
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(endpoint, options);
  if (response.status === 401) {
    // Session expired
    localStorage.removeItem('mentorai_token');
    state.authToken = "";
    UI.modalAuth.classList.add('active');
    throw new Error("Session expired. Please sign in again.");
  }
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Server responded with status ${response.status}`);
  }
  
  return response.json();
}

async function fetchUserProfile() {
  try {
    const data = await apiFetch("/api/user/profile");
    state.user.username = data.username;
    state.user.level = data.level;
    state.user.xp = data.xp;
    state.user.coins = data.coins;
    state.user.streak = data.streak;
    state.user.rank = data.rank;
    state.user.weakTopics = data.weakTopics || [];
    
    // Update local variables
    UI.userNameDisplay.textContent = state.user.username;
    UI.avatarDisplay.textContent = state.user.username.charAt(0).toUpperCase();
    UI.userRankDisplay.textContent = state.user.rank;
    
    updateTopBarStats();
    renderLeaderboard();
    renderWeakTopics();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function saveUserProfileToServer() {
  try {
    const payload = {
      xp: state.user.xp,
      coins: state.user.coins,
      streak: state.user.streak,
      level: state.user.level,
      rank: state.user.rank,
      weak_topics: state.user.weakTopics.map(t => ({
        name: t.name,
        retention: t.retention,
        level: t.level
      }))
    };
    await apiFetch("/api/user/profile", "PUT", payload);
  } catch (err) {
    console.error("Profile sync failed: ", err.message);
  }
}

async function fetchVaultFiles() {
  try {
    const files = await apiFetch("/api/vault");
    state.vault = files;
    renderVaultFilesList();
  } catch (err) {
    console.error("Vault fetch failed:", err.message);
  }
}

// ==========================================
// 4. View Control & Navigation
// ==========================================
function switchView(viewName) {
  Object.keys(UI.views).forEach(key => {
    if (key === viewName) {
      UI.views[key].classList.add('active');
    } else {
      UI.views[key].classList.remove('active');
    }
  });

  const navButtons = [UI.navDashboard, UI.navTutor, UI.navRoadmap, UI.navQuiz, UI.navVault, UI.navRouter];
  navButtons.forEach(btn => {
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const subtitles = {
    dashboard: "Track your streaks, daily goals, weak spots and global ranking.",
    tutor: "Input any topic to initiate adaptive interactive teaching with notes.",
    roadmap: "Visual curriculum steps mapped by AI. Unlock nodes by learning.",
    quiz: "Complete adaptive quizes to defeat chapter bosses and earn loot.",
    vault: "Review your study materials, flashcards, and compiled slide decks.",
    router: "Manage API limits, rotate API keys, and monitor routing logs."
  };
  
  UI.viewTitle.textContent = viewName === 'vault' ? 'Vault & Slides' : viewName.charAt(0).toUpperCase() + viewName.slice(1);
  if (viewName === 'tutor') UI.viewTitle.textContent = "AI Teacher";
  if (viewName === 'router') UI.viewTitle.textContent = "Multi-LLM Router Console";
  
  UI.viewSubtitle.textContent = subtitles[viewName] || "MentorAI Personal Teacher Dashboard";
}

function initNavigation() {
  const navButtons = [UI.navDashboard, UI.navTutor, UI.navRoadmap, UI.navQuiz, UI.navVault, UI.navRouter];
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  UI.dashResumeBtn.addEventListener('click', () => {
    if (state.currentLesson.topic) {
      switchView('tutor');
    } else {
      UI.tutorInput.focus();
      switchView('tutor');
      showToast('Select a topic to start learning!', 'info');
    }
  });
}

// ==========================================
// 5. Toast Notifications & Components Renders
// ==========================================
function showToast(message, type = "success") {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let symbol = "✅";
  if (type === "info") symbol = "ℹ️";
  if (type === "error") symbol = "⚠️";
  
  toast.innerHTML = `<span>${symbol}</span><span>${message}</span>`;
  UI.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function updateTopBarStats() {
  UI.topStreak.textContent = `${state.user.streak}d`;
  UI.topCoins.textContent = state.user.coins;
  UI.topXp.textContent = `${state.user.xp} XP`;
  
  UI.dashStreak.textContent = `${state.user.streak} Days`;
  UI.dashCoins.textContent = state.user.coins;
  UI.dashLevel.textContent = `Level ${state.user.level} (${state.user.rank})`;
  
  const xpNeeded = state.user.level * 1000;
  state.user.nextLevelXp = xpNeeded;
  const nextXpRequired = xpNeeded - state.user.xp;
  UI.dashNextXp.textContent = nextXpRequired > 0 ? nextXpRequired : 0;
  
  const dailyProgress = Math.min(Math.round((state.user.xp / xpNeeded) * 100), 100);
  UI.dashProgressPct.textContent = `${dailyProgress}%`;
  const circumference = 2 * Math.PI * 50; 
  const offset = circumference - (dailyProgress / 100) * circumference;
  UI.dashProgressRing.style.strokeDashoffset = offset;
}

function renderLeaderboard() {
  const users = [
    { name: "AlphaCoder", xp: 1950, streak: 12, rank: 1 },
    { name: "DevGamer", xp: 1680, streak: 8, rank: 2 },
    { name: state.user.username + " (You)", xp: state.user.xp, streak: state.user.streak, rank: 3, isUser: true },
    { name: "StudyQueen", xp: 1200, streak: 4, rank: 4 }
  ];

  users.sort((a,b) => b.xp - a.xp);
  users.forEach((u, index) => u.rank = index + 1);

  UI.dashLeaderboard.innerHTML = users.map(u => `
    <div class="leaderboard-row rank-${u.rank} ${u.isUser ? 'user-row' : ''}">
      <div class="row-left">
        <span class="rank-badge">${u.rank}</span>
        <span class="leaderboard-name">${u.name}</span>
      </div>
      <span class="leaderboard-score">${u.xp} XP (🔥 ${u.streak}d)</span>
    </div>
  `).join('');
}

function renderDailyMissions() {
  UI.dashMissions.innerHTML = state.user.dailyMissions.map(m => `
    <div class="mission-item ${m.done ? 'completed' : ''}">
      <div class="mission-details">
        <div class="checkbox-visual">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <span class="mission-title">${m.desc}</span>
      </div>
      <span class="mission-reward">${m.reward}</span>
    </div>
  `).join('');

  const completed = state.user.dailyMissions.filter(m => m.done).length;
  UI.dashMissionsCompletedCount.textContent = `${completed}/${state.user.dailyMissions.length} Done`;
}

function renderWeakTopics() {
  if (state.user.weakTopics.length === 0) {
    UI.dashWeakTopics.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted);">No weak topics marked. Defeat bosses to refine retention profiles!</span>`;
    return;
  }
  UI.dashWeakTopics.innerHTML = state.user.weakTopics.map(t => `
    <div class="topic-pill retention-${t.level}" title="Retention accuracy: ${t.retention}%">
      <span>${t.name}</span>
      <span class="badge">${t.retention}%</span>
    </div>
  `).join('');
}

function renderRouterCharts() {
  const metrics = state.router.metrics;
  const providers = ['gemini', 'openai', 'claude', 'deepseek'];
  
  UI.chartLatency.innerHTML = providers.map(p => {
    const lat = metrics[p].latency;
    const widthPct = Math.min((lat / 3000) * 100, 100);
    return `
      <div class="chart-bar-row">
        <span class="chart-bar-label">${p.toUpperCase()}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${p}" style="width: ${widthPct}%;"></div>
        </div>
        <span class="chart-bar-value">${lat}ms</span>
      </div>
    `;
  }).join('');

  UI.chartCost.innerHTML = providers.map(p => {
    const cost = metrics[p].cost;
    const widthPct = Math.min((cost / 0.004) * 100, 100);
    return `
      <div class="chart-bar-row">
        <span class="chart-bar-label">${p.toUpperCase()}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${p}" style="width: ${widthPct}%;"></div>
        </div>
        <span class="chart-bar-value">$${(cost * 1000).toFixed(4)}</span>
      </div>
    `;
  }).join('');
}

function appendRouterLog(text, type = "info") {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  state.router.logs.push({ time: timeStr, type, text });
  
  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.textContent = `[${timeStr}] ${text}`;
  UI.routerLogsConsole.appendChild(line);
  UI.routerLogsConsole.scrollTop = UI.routerLogsConsole.scrollHeight;
}

// Visual simulation of Google Drive sync animation
async function triggerDriveSyncAnimation(filename) {
  UI.btnDriveSyncStatus.classList.add('syncing');
  UI.btnDriveSyncStatus.querySelector('.btn-text').textContent = "Syncing...";
  
  try {
    await apiFetch("/api/vault/sync", "POST", { filename });
    setTimeout(() => {
      UI.btnDriveSyncStatus.classList.remove('syncing');
      UI.btnDriveSyncStatus.querySelector('.btn-text').textContent = "Drive Synced";
      showToast(`File "${filename}" autosynced to Google Drive`, "success");
      appendRouterLog(`File "${filename}" successfully written to Drive API.`, "success");
    }, 1200);
  } catch (e) {
    UI.btnDriveSyncStatus.classList.remove('syncing');
    UI.btnDriveSyncStatus.querySelector('.btn-text').textContent = "Sync Failed";
    showToast("Drive Sync API Failed", "error");
  }
}

// ==========================================
// 6. AI Teacher & Roadmap Engine
// ==========================================
async function initiateTopicTutor(topic, mode) {
  if (!topic) {
    showToast("Please enter a study topic", "error");
    return;
  }
  
  UI.tutorStartBtn.disabled = true;
  UI.tutorStartBtn.querySelector('span').textContent = "Analyzing...";
  UI.boardRenderingStatus.textContent = "Rendering...";
  
  UI.tutorChatViewport.innerHTML = `
    <div class="chat-msg system-msg">
      <div class="avatar">🤖</div>
      <div class="message-content">
        <p>Awaiting curriculum generation for <strong>${topic}</strong> in mode: <strong>${mode}</strong>...</p>
      </div>
    </div>
  `;

  try {
    appendRouterLog(`Forwarding curriculum generation call to REST api...`, "info");
    const response = await apiFetch("/api/tutor/generate", "POST", {
      topic,
      mode
    });
    
    // Save to current lesson state
    state.currentLesson.topic = topic;
    state.currentLesson.mode = mode;
    state.currentLesson.roadmap = response.roadmap;
    state.currentLesson.notesMarkdown = response.markdown;
    state.currentLesson.whiteboard = response.whiteboard;
    state.currentLesson.slides = response.slides;
    state.currentLesson.quiz = response.quiz;
    state.currentLesson.quizActive = false;
    state.currentLesson.currentQuestionIndex = 0;
    
    // Update daily mission
    state.user.dailyMissions[0].done = true;
    renderDailyMissions();
    
    UI.dashMissionText.textContent = `Finish the "${response.roadmap.find(n => n.status === 'active').title}" module and conquer the boss to keep your streak alive!`;

    // Render components
    renderRoadmap(response.roadmap, topic);
    renderTutorChatFirstResponse(topic, response.markdown);
    renderWhiteboard(response.whiteboard);
    renderNotesTab(response.markdown);
    
    UI.notesDownloadBtn.disabled = false;
    UI.notesDownloadMdBtn.disabled = false;
    UI.notesMakePptBtn.disabled = false;
    UI.completeNodeBtn.disabled = false;
    UI.boardRenderingStatus.textContent = "Complete";
    
    // Update vault
    await fetchVaultFiles();
    triggerDriveSyncAnimation(`${topic.charAt(0).toUpperCase() + topic.slice(1)} Notes`);
    
  } catch (error) {
    showToast("Error generating topic data: " + error.message, "error");
    UI.boardRenderingStatus.textContent = "Failed";
  } finally {
    UI.tutorStartBtn.disabled = false;
    UI.tutorStartBtn.querySelector('span').textContent = "Teach Me";
  }
}

function renderRoadmap(roadmap, topic) {
  UI.roadmapTopicBadge.textContent = topic.toUpperCase();
  
  if (!roadmap || roadmap.length === 0) {
    UI.roadmapNodesDraw.innerHTML = `<div class="empty-state"><p>No active roadmap. Start a topic in AI Teacher.</p></div>`;
    UI.roadmapCompletionPct.textContent = "0% Complete";
    return;
  }

  let html = `<div class="roadmap-tree">`;
  roadmap.forEach((node, idx) => {
    const isCompleted = node.status === 'completed';
    const isActive = node.status === 'active';
    let icon = "🔒";
    if (isCompleted) icon = "✅";
    if (isActive) icon = "⚡";
    if (node.type === 'boss') icon = "👹";
    
    html += `
      <div class="roadmap-node-box ${node.status}" data-node-id="${node.id}" data-node-index="${idx}">
        <span class="node-icon-indicator">${icon}</span>
        <span class="node-title-lbl">${node.title}</span>
        <span class="node-status-lbl">${node.status}</span>
      </div>
    `;
    
    if (idx < roadmap.length - 1) {
      html += `<div class="wb-arrow" style="transform: rotate(90deg); margin: 0 -20px; z-index: 0;"></div>`;
    }
  });
  html += `</div>`;
  UI.roadmapNodesDraw.innerHTML = html;
  
  document.querySelectorAll('.roadmap-node-box').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.nodeIndex);
      const node = state.currentLesson.roadmap[idx];
      if (node.status === 'locked') {
        showToast("Complete previous nodes to unlock this lesson module!", "error");
        return;
      }
      
      if (node.type === 'boss') {
        launchBossQuiz();
      } else {
        switchView('tutor');
        showToast(`Loading: ${node.title}`, 'info');
      }
    });
  });

  const completedCount = roadmap.filter(n => n.status === 'completed').length;
  const percentage = Math.round((completedCount / roadmap.length) * 100);
  UI.roadmapCompletionPct.textContent = `${percentage}% Complete`;
}

function renderTutorChatFirstResponse(topic, markdown) {
  UI.tutorChatViewport.innerHTML = `
    <div class="chat-msg system-msg">
      <div class="avatar">🤖</div>
      <div class="message-content">
        <p>I have designed a custom study road map and lesson notes for you regarding <strong>${topic}</strong>.</p>
        <p>You can check the step-by-step progress nodes in the <strong>Roadmaps</strong> tab or view the <strong>Live Notes & Outline</strong> on the right panel.</p>
        <blockquote>${markdown.split('\n').slice(0, 8).join('\n')}...</blockquote>
        <p>Are you ready to test your knowledge with a quiz now? Click below or navigate to the <strong>Quiz Arena</strong> node on the roadmap.</p>
        <button class="btn btn-primary btn-sm" onclick="launchBossQuiz()">Launch Lesson Assessment</button>
      </div>
    </div>
  `;
  UI.tutorChatControls.style.display = 'flex';
}

function renderWhiteboard(whiteboard) {
  if (!whiteboard || whiteboard.length === 0) {
    UI.whiteboardCanvas.innerHTML = `<div class="empty-state"><p>No active visualizations.</p></div>`;
    return;
  }

  let html = `<div class="wb-flow">`;
  whiteboard.forEach(item => {
    if (item.type === 'node') {
      html += `<div class="wb-node">${item.text}</div>`;
    } else if (item.type === 'arrow') {
      html += `<div class="wb-arrow"></div>`;
    }
  });
  html += `</div>`;
  UI.whiteboardCanvas.innerHTML = html;
}

function renderNotesTab(markdown) {
  UI.notesMarkdownView.innerHTML = `
    <div class="notes-content">
      ${simpleMarkdownParser(markdown)}
    </div>
  `;
}

function simpleMarkdownParser(text) {
  if (!text) return "";
  let html = text;
  html = html.replace(/# (.*)/g, '<h1>$1</h1>');
  html = html.replace(/## (.*)/g, '<h2>$1</h2>');
  html = html.replace(/### (.*)/g, '<h3>$1</h3>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\* ([^*]+)\n/g, '<li>$1</li>');
  html = html.replace(/> (.*)/g, '<blockquote>$1</blockquote>');
  return html;
}

// ==========================================
// 7. Adaptive Quiz & Boss Battle Engine
// ==========================================
function launchBossQuiz() {
  const current = state.currentLesson;
  if (!current.quiz || current.quiz.length === 0) {
    showToast("Please initiate a lesson topic first to build a quiz!", "error");
    return;
  }
  
  current.quizActive = true;
  current.currentQuestionIndex = 0;
  current.bossHp = 100;
  current.playerHp = 3;
  
  switchView('quiz');
  
  UI.quizBossCard.style.display = 'flex';
  UI.quizBossHpBar.style.width = '100%';
  UI.quizBossHpText.textContent = "100/100 HP";
  UI.quizPlayerHpBar.style.width = '100%';
  UI.quizPlayerHpText.textContent = "3/3 Hearts";
  
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const current = state.currentLesson;
  const question = current.quiz[current.currentQuestionIndex];
  
  UI.quizProgressFill.style.width = `${((current.currentQuestionIndex) / current.quiz.length) * 100}%`;
  UI.quizQNum.textContent = `Question ${current.currentQuestionIndex + 1} of ${current.quiz.length}`;
  UI.quizQText.textContent = question.text;
  
  if (question.code) {
    UI.quizQCodeContainer.style.display = 'block';
    UI.quizQCode.textContent = question.code;
  } else {
    UI.quizQCodeContainer.style.display = 'none';
  }

  UI.quizOptionsContainer.innerHTML = question.options.map((opt, idx) => `
    <button class="quiz-option-btn" data-index="${idx}">${opt}</button>
  `).join('');

  document.querySelectorAll('.quiz-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      UI.quizActionBtn.disabled = false;
    });
  });

  UI.quizActionBtn.disabled = true;
  UI.quizActionBtn.textContent = "Check Answer";
  UI.quizHintBtn.disabled = false;
}

function checkQuizAnswer() {
  const current = state.currentLesson;
  const question = current.quiz[current.currentQuestionIndex];
  const selectedBtn = document.querySelector('.quiz-option-btn.selected');
  
  if (!selectedBtn) return;
  
  const selectedIndex = parseInt(selectedBtn.dataset.index);
  const isCorrect = selectedIndex === question.answer;
  
  document.querySelectorAll('.quiz-option-btn').forEach(btn => {
    btn.disabled = true;
    const idx = parseInt(btn.dataset.index);
    if (idx === question.answer) {
      btn.classList.add('correct');
    } else if (idx === selectedIndex) {
      btn.classList.add('incorrect');
    }
  });

  if (isCorrect) {
    const damage = Math.round(100 / current.quiz.length);
    current.bossHp = Math.max(0, current.bossHp - damage);
    UI.quizBossHpBar.style.width = `${current.bossHp}%`;
    UI.quizBossHpText.textContent = `${current.bossHp}/100 HP`;
    showToast("Correct! Direct Hit on Boss! 💥", "success");
  } else {
    current.playerHp = Math.max(0, current.playerHp - 1);
    UI.quizPlayerHpBar.style.width = `${(current.playerHp / 3) * 100}%`;
    UI.quizPlayerHpText.textContent = `${current.playerHp}/3 Hearts`;
    
    // Add weak topic entry
    const topicExists = state.user.weakTopics.some(t => t.name === current.topic);
    if (!topicExists) {
      state.user.weakTopics.push({ name: current.topic, retention: 35, level: "low" });
      renderWeakTopics();
    }
    
    UI.quizBossCard.classList.add('animated-bounce');
    setTimeout(() => UI.quizBossCard.classList.remove('animated-bounce'), 800);
    showToast("Incorrect! Boss counter-attacks! 💔", "error");
  }

  UI.quizActionBtn.textContent = "Continue";
  UI.quizHintBtn.disabled = true;
  
  UI.quizActionBtn.removeEventListener('click', checkQuizAnswer);
  UI.quizActionBtn.addEventListener('click', advanceQuiz);
}

async function advanceQuiz() {
  const current = state.currentLesson;
  
  if (current.playerHp <= 0) {
    showQuizOverlay(false);
    return;
  }
  
  current.currentQuestionIndex++;
  
  if (current.currentQuestionIndex >= current.quiz.length) {
    showQuizOverlay(true);
  } else {
    UI.quizActionBtn.removeEventListener('click', advanceQuiz);
    UI.quizActionBtn.addEventListener('click', checkQuizAnswer);
    renderQuizQuestion();
  }
}

async function showQuizOverlay(isVictory) {
  UI.quizOverlayScreen.style.display = 'flex';
  
  if (isVictory) {
    UI.quizVictoryTitle.textContent = "🏆 Victory!";
    UI.quizVictorySubtitle.textContent = `You have successfully defeated the boss of the "${state.currentLesson.topic}" chapter!`;
    UI.lootXp.textContent = "+100 XP";
    UI.lootCoins.textContent = "+25 Coins";
    
    state.user.xp += 100;
    state.user.coins += 25;
    
    // Check level up
    const xpNeeded = state.user.level * 1000;
    if (state.user.xp >= xpNeeded) {
      state.user.level += 1;
      showToast(`🎉 Level Up! You are now Level ${state.user.level}!`, "success");
    }

    state.user.dailyMissions[1].done = true;
    renderDailyMissions();
    
    const bossNode = state.currentLesson.roadmap.find(n => n.type === 'boss');
    if (bossNode) bossNode.status = 'completed';
  } else {
    UI.quizVictoryTitle.textContent = "💀 Defeated";
    UI.quizVictorySubtitle.textContent = "Your shield broke. Try reviewing the notes or request another explanation mode!";
    UI.lootXp.textContent = "+10 XP";
    UI.lootCoins.textContent = "+0 Coins";
    state.user.xp += 10;
  }
  
  updateTopBarStats();
  await saveUserProfileToServer();
}

function closeQuizVictoryScreen() {
  UI.quizOverlayScreen.style.display = 'none';
  UI.quizBossCard.style.display = 'none';
  UI.quizActive = false;
  
  UI.quizActionBtn.removeEventListener('click', advanceQuiz);
  UI.quizActionBtn.addEventListener('click', checkQuizAnswer);
  
  renderRoadmap(state.currentLesson.roadmap, state.currentLesson.topic);
  switchView('dashboard');
}

// ==========================================
// 8. Vault & Slide deck presenter
// ==========================================
function renderVaultFilesList() {
  if (state.vault.length === 0) {
    UI.vaultFilesList.innerHTML = `<div class="empty-state"><p>Vault is empty. Study lessons to compile notes.</p></div>`;
    return;
  }

  UI.vaultFilesList.innerHTML = state.vault.map(f => `
    <div class="vault-item ${state.currentLesson.activeFileId == f.id ? 'active' : ''}" data-file-id="${f.id}">
      <span class="vault-item-icon">📄</span>
      <div class="vault-item-details">
        <span class="vault-item-name">${f.name}</span>
        <span class="vault-item-meta">${f.created} | ${f.size}</span>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.vault-item').forEach(el => {
    el.addEventListener('click', () => {
      const fileId = el.dataset.fileId;
      selectVaultFile(fileId);
    });
  });
}

async function selectVaultFile(fileId) {
  state.currentLesson.activeFileId = fileId;
  renderVaultFilesList();
  
  UI.inspectorFileTitle.textContent = "Loading file...";
  UI.inspectorFileType.textContent = "...";
  
  try {
    const file = await apiFetch(`/api/vault/${fileId}`);
    UI.inspectorFileTitle.textContent = file.name;
    UI.inspectorFileType.textContent = file.type.toUpperCase();
    
    // Store slide outlines
    state.currentLesson.slides = file.slides || [];
    state.currentLesson.quiz = file.quiz || [];
    
    UI.inspectorFileContent.innerHTML = `
      <div class="vault-notes-display">
        <div class="metadata" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 16px;">
          <span>Created: ${file.created}</span> | <span>File Size: ${file.size}</span>
        </div>
        <div class="file-body-md" style="line-height: 1.6;">
          ${simpleMarkdownParser(file.data)}
        </div>
        <div class="inspector-cta" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-glass); display: flex; gap: 10px;">
          <button class="btn btn-secondary btn-sm" id="btn-inspect-ppt">🖥️ Present Slides</button>
          <button class="btn btn-secondary btn-sm" id="btn-inspect-download-doc">📥 Download Word Doc</button>
          <button class="btn btn-secondary btn-sm" id="btn-inspect-download-md">📥 Download MD</button>
        </div>
      </div>
    `;

    document.getElementById('btn-inspect-ppt').addEventListener('click', () => {
      launchSlidesPresenter(file.slides);
    });

    document.getElementById('btn-inspect-download-doc').addEventListener('click', () => {
      downloadNotesDoc(file.name, file.data);
    });

    document.getElementById('btn-inspect-download-md').addEventListener('click', () => {
      downloadNotesMarkdown(file.name, file.data);
    });

    // Mark daily mission complete
    state.user.dailyMissions[2].done = true;
    renderDailyMissions();
    updateTopBarStats();
    await saveUserProfileToServer();

  } catch(e) {
    UI.inspectorFileContent.innerHTML = `<p style="color:var(--danger)">Error loading file: ${e.message}</p>`;
  }
}

function downloadNotesMarkdown(title, data) {
  try {
    const blob = new Blob([data], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Markdown file (.md) downloaded successfully!', 'success');
  } catch (error) {
    showToast('Download failed: ' + error.message, 'error');
  }
}

function downloadNotesDoc(title, data) {
  try {
    let parsedHtml = "";
    if (window.marked && typeof window.marked.parse === 'function') {
      parsedHtml = window.marked.parse(data);
    } else {
      parsedHtml = data.replace(/\n/g, '<br>');
    }
    
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
          h1 { color: #8b5cf6; border-bottom: 2px solid #a78bfa; padding-bottom: 8px; font-family: 'Outfit', sans-serif; }
          h2 { color: #3b82f6; margin-top: 24px; font-family: 'Outfit', sans-serif; }
          h3 { color: #1d4ed8; }
          code { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
          pre { background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; overflow-x: auto; border: 1px solid #e5e7eb; }
          blockquote { border-left: 4px solid #8b5cf6; padding-left: 16px; color: #4b5563; font-style: italic; margin: 16px 0; }
          table { border-collapse: collapse; width: 100%; margin: 16px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
          th { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        ${parsedHtml}
      </body>
      </html>
    `;
    
    const blob = new Blob([docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.doc`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Word Document (.doc) downloaded successfully!', 'success');
  } catch (error) {
    showToast('Download failed: ' + error.message, 'error');
  }
}

// Slides Presenter
let currentSlideIndex = 0;
let activeSlidesArray = [];

function launchSlidesPresenter(slides) {
  if (!slides || slides.length === 0) {
    showToast("No PPT slides outline found for this file", "error");
    return;
  }
  
  activeSlidesArray = slides;
  currentSlideIndex = 0;
  UI.slidePresenterViewport.style.display = 'flex';
  renderCurrentSlide();
}

function renderCurrentSlide() {
  const slide = activeSlidesArray[currentSlideIndex];
  UI.slideTextContent.innerHTML = `
    <h2>${slide.title}</h2>
    <ul>
      <li>${slide.bullet1}</li>
      <li>${slide.bullet2}</li>
      <li>${slide.bullet3}</li>
    </ul>
  `;
  UI.slideCounter.textContent = `Slide ${currentSlideIndex + 1} of ${activeSlidesArray.length}`;
}

// ==========================================
// 9. Auth Forms & settings
// ==========================================
function initAuthModal() {
  UI.linkToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    UI.authLoginView.style.display = 'none';
    UI.authRegisterView.style.display = 'block';
  });

  UI.linkToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    UI.authRegisterView.style.display = 'none';
    UI.authLoginView.style.display = 'block';
  });

  // Logout handler
  UI.btnLogout.addEventListener('click', () => {
    state.authToken = '';
    localStorage.removeItem('mentorai_token');
    showToast("Logged out successfully!", "success");
    switchView('dashboard');
    UI.modalAuth.classList.add('active');
  });

  // Login handler
  UI.btnExecuteLogin.addEventListener('click', async () => {
    const username = UI.loginUser.value.trim();
    const password = UI.loginPass.value.trim();
    
    if (!username || !password) {
      showToast("Please enter username and password", "error");
      return;
    }

    try {
      UI.btnExecuteLogin.disabled = true;
      UI.btnExecuteLogin.textContent = "Signing In...";
      
      const res = await apiFetch("/api/auth/login", "POST", { username, password });
      
      state.authToken = res.access_token;
      localStorage.setItem('mentorai_token', res.access_token);
      
      showToast("Signed In Successfully!", "success");
      UI.modalAuth.classList.remove('active');
      
      // Load user profile & vault items
      await fetchUserProfile();
      await fetchVaultFiles();
    } catch(e) {
      showToast(e.message, "error");
    } finally {
      UI.btnExecuteLogin.disabled = false;
      UI.btnExecuteLogin.textContent = "Sign In";
    }
  });

  // Register handler
  UI.btnExecuteRegister.addEventListener('click', async () => {
    const username = UI.registerUser.value.trim();
    const email = UI.registerEmail.value.trim();
    const password = UI.registerPass.value.trim();
    
    if (!username || !email || !password) {
      showToast("Please complete all registration fields", "error");
      return;
    }

    try {
      UI.btnExecuteRegister.disabled = true;
      UI.btnExecuteRegister.textContent = "Creating Account...";
      
      await apiFetch("/api/auth/register", "POST", { username, email, password });
      showToast("Account created successfully! Signing in...", "success");
      
      // Auto login
      const res = await apiFetch("/api/auth/login", "POST", { username, password });
      state.authToken = res.access_token;
      localStorage.setItem('mentorai_token', res.access_token);
      UI.modalAuth.classList.remove('active');
      
      await fetchUserProfile();
      await fetchVaultFiles();
    } catch(e) {
      showToast(e.message, "error");
    } finally {
      UI.btnExecuteRegister.disabled = false;
      UI.btnExecuteRegister.textContent = "Sign Up";
    }
  });
}

function initSettingsModal() {
  UI.settingsTriggerBtn.addEventListener('click', () => {
    UI.settingsUsername.value = state.user.username;
    UI.settingsGoal.value = 20; 
    UI.modalSettings.classList.add('active');
  });

  const closeSettings = () => {
    UI.modalSettings.classList.remove('active');
  };

  UI.closeSettingsBtn.addEventListener('click', closeSettings);
  UI.settingsCancelBtn.addEventListener('click', closeSettings);

  UI.settingsSaveBtn.addEventListener('click', async () => {
    const val = UI.settingsUsername.value.trim();
    if (val) {
      state.user.username = val;
      state.user.rank = UI.settingsSpeed.value === 'fast' ? 'Master' : 'Scholar';
      
      UI.userNameDisplay.textContent = state.user.username;
      UI.avatarDisplay.textContent = state.user.username.charAt(0).toUpperCase();
      UI.userRankDisplay.textContent = state.user.rank;
      
      await saveUserProfileToServer();
      updateTopBarStats();
      renderLeaderboard();
      showToast("Profile Settings Saved Successfully!", "success");
      closeSettings();
    }
  });
}

// CSV import logic (matches ZenTask format)
function parseTaskCSVText(text) {
  let lines = text.split('\n');
  if (lines.length <= 1) return [];
  
  const headers = lines[0].split(',');
  const titleIdx = headers.indexOf('Title');
  const catIdx = headers.indexOf('Category');
  const compIdx = headers.indexOf('Completed');
  
  const tasks = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cells = lines[i].split(',');
    if (cells.length > titleIdx) {
      tasks.push({
        title: cells[titleIdx],
        category: catIdx !== -1 ? cells[catIdx] : "personal",
        completed: compIdx !== -1 ? cells[compIdx] === 'true' : false
      });
    }
  }
  return tasks;
}

function initCsvImportModal() {
  UI.importCsvTrigger.addEventListener('click', () => {
    UI.csvFileName.style.display = 'none';
    UI.btnImportCsvExecute.disabled = true;
    UI.modalImportCsv.classList.add('active');
  });

  const closeModal = () => {
    UI.modalImportCsv.classList.remove('active');
  };

  UI.btnCloseImportCsv.addEventListener('click', closeModal);
  UI.btnImportCsvCancel.addEventListener('click', closeModal);

  UI.csvDropZone.addEventListener('click', () => UI.csvFileInput.click());
  UI.csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      UI.csvFileName.textContent = file.name;
      UI.csvFileName.style.display = 'inline-block';
      UI.btnImportCsvExecute.disabled = false;
    }
  });

  UI.btnImportCsvExecute.addEventListener('click', () => {
    const file = UI.csvFileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const text = e.target.result;
        const items = parseTaskCSVText(text);
        if (items.length === 0) {
          showToast("No valid data rows found in CSV", "error");
          return;
        }

        items.forEach(item => {
          if (!item.completed) {
            state.user.weakTopics.push({ name: item.title, retention: 20, level: "low" });
          }
        });
        
        renderWeakTopics();
        await saveUserProfileToServer();
        showToast(`Successfully imported ${items.length} records!`, "success");
        appendRouterLog(`Imported ZenTask task CSV containing ${items.length} entries.`, "success");
        closeModal();
      } catch (err) {
        showToast("Error parsing file: " + err.message, "error");
      }
    };
    reader.readAsText(file);
  });
}

function completeActiveRoadmapNode() {
  if (!state.currentLesson.roadmap || state.currentLesson.roadmap.length === 0) {
    showToast("No active roadmap loaded. Start a lesson topic first!", "warning");
    return;
  }
  
  const activeIdx = state.currentLesson.roadmap.findIndex(n => n.status === 'active');
  if (activeIdx !== -1) {
    const activeNode = state.currentLesson.roadmap[activeIdx];
    activeNode.status = 'completed';
    
    if (activeIdx + 1 < state.currentLesson.roadmap.length) {
      const nextNode = state.currentLesson.roadmap[activeIdx + 1];
      if (nextNode.status === 'locked') {
        nextNode.status = 'active';
        showToast(`Module "${activeNode.title}" completed! Next unlocked: "${nextNode.title}" ✅`, 'success');
      } else {
        showToast(`Module "${activeNode.title}" completed! ✅`, 'success');
      }
    } else {
      showToast("🎉 Congratulations! You have completed all modules in this roadmap!", "success");
    }
    
    state.user.xp += 30;
    state.user.coins += 10;
    updateTopBarStats();
    saveUserProfileToServer();
    
    renderRoadmap(state.currentLesson.roadmap, state.currentLesson.topic);
  } else {
    const allCompleted = state.currentLesson.roadmap.every(n => n.status === 'completed');
    if (allCompleted) {
      showToast("All modules in this roadmap are already completed! 🏆", "info");
    } else {
      showToast("No active roadmap module to complete.", "warning");
    }
  }
}

// ==========================================
// 10. Bootstrapping Events & Lifecycle
// ==========================================
async function bootstrap() {
  initNavigation();
  initAuthModal();
  initSettingsModal();
  initCsvImportModal();
  
  // Verify existing token
  if (state.authToken) {
    UI.modalAuth.classList.remove('active');
    await fetchUserProfile();
    await fetchVaultFiles();
  } else {
    UI.modalAuth.classList.add('active');
  }
  
  // Standard triggers
  UI.tutorStartBtn.addEventListener('click', () => {
    const topic = UI.tutorInput.value.trim();
    const mode = UI.tutorMode.value;
    initiateTopicTutor(topic, mode);
  });

  UI.tutorUserReply.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') UI.tutorSendBtn.click();
  });

  UI.tutorSendBtn.addEventListener('click', async () => {
    const reply = UI.tutorUserReply.value.trim();
    if (!reply) return;
    
    // Add student message
    const container = document.createElement('div');
    container.className = 'chat-msg student-msg';
    container.innerHTML = `
      <div class="avatar">${state.user.username.charAt(0).toUpperCase()}</div>
      <div class="message-content"><p>${reply}</p></div>
    `;
    UI.tutorChatViewport.appendChild(container);
    UI.tutorUserReply.value = "";
    UI.tutorChatViewport.scrollTop = UI.tutorChatViewport.scrollHeight;

    // Send to backend endpoint
    try {
      const data = await apiFetch("/api/tutor/chat", "POST", {
        topic: state.currentLesson.topic || "general",
        message: reply
      });

      // Add tutor message
      const resp = document.createElement('div');
      resp.className = 'chat-msg system-msg';
      resp.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="message-content"><p>${data.message}</p></div>
      `;
      UI.tutorChatViewport.appendChild(resp);
      UI.tutorChatViewport.scrollTop = UI.tutorChatViewport.scrollHeight;
    } catch(e) {
      showToast(e.message, "error");
    }
  });

  // Tabs selections
  UI.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      UI.tabButtons.forEach(b => b.classList.remove('active'));
      UI.tabPanels.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.getElementById(target).classList.add('active');
    });
  });

  UI.quizActionBtn.addEventListener('click', checkQuizAnswer);
  
  UI.quizHintBtn.addEventListener('click', async () => {
    const current = state.currentLesson;
    const question = current.quiz[current.currentQuestionIndex];
    if (state.user.coins < 10) {
      showToast("Insufficient Coins!", "error");
      return;
    }
    
    state.user.coins -= 10;
    updateTopBarStats();
    await saveUserProfileToServer();
    
    showToast(`Hint: ${question.hint}`, "info");
    appendRouterLog("Hint requested (-10 coins).", "warning");
  });
  
  UI.quizCloseVictoryBtn.addEventListener('click', closeQuizVictoryScreen);

  UI.notesDownloadBtn.addEventListener('click', () => {
    downloadNotesDoc(state.currentLesson.topic + " Notes", state.currentLesson.notesMarkdown);
  });

  UI.notesDownloadMdBtn.addEventListener('click', () => {
    downloadNotesMarkdown(state.currentLesson.topic + " Notes", state.currentLesson.notesMarkdown);
  });
  
  UI.notesMakePptBtn.addEventListener('click', () => {
    launchSlidesPresenter(state.currentLesson.slides);
  });

  UI.completeNodeBtn.addEventListener('click', () => {
    completeActiveRoadmapNode();
  });

  UI.btnPrevSlide.addEventListener('click', () => {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      renderCurrentSlide();
    }
  });
  
  UI.btnNextSlide.addEventListener('click', () => {
    if (currentSlideIndex < activeSlidesArray.length - 1) {
      currentSlideIndex++;
      renderCurrentSlide();
    }
  });
  
  UI.btnClosePresenter.addEventListener('click', () => {
    UI.slidePresenterViewport.style.display = 'none';
  });

  UI.clearRouterLogsBtn.addEventListener('click', () => {
    UI.routerLogsConsole.innerHTML = "";
    state.router.logs = [];
    appendRouterLog("Router console cleared.", "info");
  });

  UI.btnDriveSyncStatus.addEventListener('click', () => {
    triggerDriveSyncAnimation("Manual Backup Update");
  });
}

window.addEventListener('DOMContentLoaded', bootstrap);
