/* =========================================================
   WEBCODE STUDIO - APP.JS
   V2
   Firebase Auth + CodeMirror + Files + Tabs + Preview
   ========================================================= */

const state = {
  files: {},
  folders: [],
  activeFile: "index.html",
  openTabs: [],
  projectName: "My Website",
  projectDescription: "",
  editor: null,
  firebase: null,
  authUser: null,
  authMode: "signin",
  currentProjectId: "default",
  initialized: false
};


/* =========================================================
   DEFAULT PROJECT
   ========================================================= */

const DEFAULT_FILES = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>

<body>
  <main class="hero">
    <h1>Welcome to WebCode Studio</h1>
    <p>Edit this code and press Run.</p>
    <button id="helloButton">Test JavaScript</button>
  </main>

  <script src="script.js"></script>
</body>
</html>`,

  "style.css": `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #0f172a;
  color: white;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 30px;
  text-align: center;
}

h1 {
  font-size: 42px;
  margin: 0;
}

button {
  border: 0;
  border-radius: 10px;
  padding: 12px 20px;
  background: #7c3aed;
  color: white;
  cursor: pointer;
}`,

  "script.js": `document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("helloButton");

  if (button) {
    button.addEventListener("click", () => {
      button.textContent = "JavaScript works!";
    });
  }
});`
};


/* =========================================================
   DOM HELPER
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "info") {
  const container = $("toastContainer");

  if (!container) {
    console.log(message);
    return;
  }

  const toast = document.createElement("div");

  const icon =
    type === "success"
      ? "✓"
      : type === "error"
        ? "!"
        : "i";

  toast.className =
    "pointer-events-auto min-w-[220px] max-w-[320px] rounded-xl border border-white/10 bg-[#151526] px-4 py-3 text-sm text-white shadow-2xl flex items-center gap-3 animate-pop";

  toast.innerHTML = `
    <span class="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 font-semibold">
      ${icon}
    </span>
    <span class="flex-1">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function storageKey() {
  return `webcode-studio-project-${state.currentProjectId}`;
}


function saveLocalProject() {
  try {
    localStorage.setItem(
      storageKey(),
      JSON.stringify({
        files: state.files,
        folders: state.folders,
        projectName: state.projectName,
        projectDescription: state.projectDescription,
        updatedAt: new Date().toISOString()
      })
    );

    updateSaveStatus("Saved locally");

  } catch (error) {
    console.error(error);
    updateSaveStatus("Save failed");
  }
}


function loadLocalProject() {
  try {
    const saved = localStorage.getItem(storageKey());

    if (!saved) {
      state.files = { ...DEFAULT_FILES };
      state.folders = [];
      return;
    }

    const data = JSON.parse(saved);

    state.files =
      data.files && Object.keys(data.files).length
        ? data.files
        : { ...DEFAULT_FILES };

    state.folders = Array.isArray(data.folders)
      ? data.folders
      : [];

    state.projectName =
      data.projectName || "My Website";

    state.projectDescription =
      data.projectDescription || "";

  } catch (error) {
    console.error("Could not load local project:", error);

    state.files = { ...DEFAULT_FILES };
    state.folders = [];
  }
}


/* =========================================================
   SAVE STATUS
   ========================================================= */

function updateSaveStatus(text) {
  const element = $("saveStatus");

  if (element) {
    element.textContent = text;
  }
}


/* =========================================================
   FILE TYPE
   ========================================================= */

function getFileType(filename) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return "html";
  }

  if (lower.endsWith(".css")) {
    return "css";
  }

  if (lower.endsWith(".js")) {
    return "javascript";
  }

  if (lower.endsWith(".json")) {
    return "json";
  }

  return "text";
}


/* =========================================================
   FILE ICON
   ========================================================= */

function getFileIcon(filename) {
  const type = getFileType(filename);

  if (type === "html") {
    return `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        class="w-4 h-4 text-orange-400">
        <path d="m8 9-4 3 4 3"/>
        <path d="m16 9 4 3-4 3"/>
        <path d="m14 5-4 14"/>
      </svg>
    `;
  }

  if (type === "css") {
    return `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        class="w-4 h-4 text-blue-400">
        <path d="M5 4h14l-1.5 16L12 22 6.5 20 5 4Z"/>
        <path d="M8 8h8"/>
        <path d="M8.5 12h7"/>
        <path d="M9 16h6"/>
      </svg>
    `;
  }

  if (type === "javascript") {
    return `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        class="w-4 h-4 text-yellow-400">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M8 17v-5"/>
        <path d="M8 17c0 1.2.8 2 2 2s2-.8 2-2v-5"/>
        <path d="M16 12c-1.2 0-2 .8-2 1.8 0 2 4 1.2 4 3.2 0 1-.8 1.8-2 1.8"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8"
      class="w-4 h-4 text-gray-400">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
    </svg>
  `;
}


/* =========================================================
   RENDER FILE TREE
   ========================================================= */

function renderFileTree() {
  const tree = $("fileTree");

  if (!tree) return;

  tree.innerHTML = "";

  const files = Object.keys(state.files).sort();

  if (!files.length && !state.folders.length) {
    tree.innerHTML = `
      <div class="p-4 text-center text-xs text-gray-500">
        No files yet.
      </div>
    `;
    return;
  }

  const folderSet = new Set(state.folders);

  files.forEach((file) => {
    const parts = file.split("/");

    if (parts.length > 1) {
      folderSet.add(parts[0]);
    }
  });

  const folders = [...folderSet].sort();

  folders.forEach((folder) => {
    const folderEl = document.createElement("div");

    folderEl.className =
      "mb-1";

    folderEl.innerHTML = `
      <div class="flex items-center gap-2 px-2 py-2 text-xs text-gray-400">
        <svg viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8"
          class="w-4 h-4 text-violet-400">
          <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>

        <span>${escapeHtml(folder)}</span>
      </div>
    `;

    tree.appendChild(folderEl);

    files
      .filter(file => file.startsWith(folder + "/"))
      .forEach(file => {
        tree.appendChild(createFileElement(file, true));
      });
  });

  files
    .filter(file => !file.includes("/"))
    .forEach(file => {
      tree.appendChild(createFileElement(file, false));
    });
}


function createFileElement(file, nested = false) {
  const button = document.createElement("button");

  button.type = "button";

  button.className =
    `w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition
     hover:bg-white/5
     ${state.activeFile === file
       ? "bg-violet-500/15 text-white"
       : "text-gray-400"}`;

  if (nested) {
    button.classList.add("pl-7");
  }

  button.innerHTML = `
    ${getFileIcon(file)}

    <span class="truncate flex-1">
      ${escapeHtml(file.split("/").pop())}
    </span>
  `;

  button.addEventListener("click", () => {
    openFile(file);
  });

  return button;
}


/* =========================================================
   TABS
   ========================================================= */

function renderTabs() {
  const container = $("tabsContainer");

  if (!container) return;

  container.innerHTML = "";

  state.openTabs.forEach((file) => {
    const tab = document.createElement("button");

    tab.type = "button";

    tab.className =
      `h-full flex items-center gap-2 px-4 text-xs border-r border-white/10
       transition
       ${file === state.activeFile
         ? "bg-[#151525] text-white"
         : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"}`;

    tab.innerHTML = `
      ${getFileIcon(file)}

      <span class="max-w-[140px] truncate">
        ${escapeHtml(file.split("/").pop())}
      </span>

      <span
        class="tab-close text-gray-600 hover:text-white ml-1"
        data-close-tab="${escapeHtml(file)}"
      >
        ×
      </span>
    `;

    tab.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close-tab]");

      if (close) {
        event.stopPropagation();
        closeTab(file);
        return;
      }

      openFile(file);
    });

    container.appendChild(tab);
  });
}


function openFile(file) {
  if (!Object.prototype.hasOwnProperty.call(state.files, file)) {
    return;
  }

  state.activeFile = file;

  if (!state.openTabs.includes(file)) {
    state.openTabs.push(file);
  }

  updateCurrentFileLabel();
  renderTabs();
  renderFileTree();

  if (state.editor) {
    setEditorContent(state.files[file] || "");
  }

  setTimeout(() => {
    state.editor?.focus();
  }, 50);
}


function closeTab(file) {
  const index = state.openTabs.indexOf(file);

  if (index === -1) return;

  state.openTabs.splice(index, 1);

  if (state.activeFile === file) {
    const next =
      state.openTabs[index] ||
      state.openTabs[index - 1] ||
      Object.keys(state.files)[0];

    if (next) {
      state.activeFile = next;
    }
  }

  if (state.activeFile && state.editor) {
    setEditorContent(state.files[state.activeFile] || "");
  }

  updateCurrentFileLabel();
  renderTabs();
  renderFileTree();
}


function updateCurrentFileLabel() {
  const name = $("currentFileName");
  const icon = $("currentFileIcon");

  if (!state.activeFile) {
    if (name) name.textContent = "No file";
    return;
  }

  if (name) {
    name.textContent = state.activeFile;
  }

  if (icon) {
    icon.innerHTML = getFileIcon(state.activeFile);
  }
}


/* =========================================================
   CODEMIRROR
   ========================================================= */

async function initializeCodeMirror() {
  const editorElement = $("codeEditor");

  if (!editorElement) {
    console.error("codeEditor element not found.");
    return;
  }

  try {
    const [
      stateModule,
      viewModule,
      commandsModule,
      languageHtml,
      languageCss,
      languageJs,
      themeModule
    ] = await Promise.all([
      import("https://esm.sh/@codemirror/state@6.5.2"),
      import("https://esm.sh/@codemirror/view@6.36.5"),
      import("https://esm.sh/@codemirror/commands@6.8.1"),
      import("https://esm.sh/@codemirror/lang-html@6.4.9"),
      import("https://esm.sh/@codemirror/lang-css@6.3.1"),
      import("https://esm.sh/@codemirror/lang-javascript@6.2.3"),
      import("https://esm.sh/@codemirror/theme-one-dark@6.1.2")
    ]);

    const {
      EditorState
    } = stateModule;

    const {
      EditorView,
      keymap
    } = viewModule;

    const {
      defaultKeymap,
      history,
      historyKeymap
    } = commandsModule;

    const {
      html
    } = languageHtml;

    const {
      css
    } = languageCss;

    const {
      javascript
    } = languageJs;

    const {
      oneDark
    } = themeModule;

    const language = getLanguageExtension(
      state.activeFile,
      {
        html,
        css,
        javascript
      }
    );

    const startState = EditorState.create({
      doc: state.files[state.activeFile] || "",
      extensions: [
        history(),

        keymap.of([
          ...defaultKeymap,
          ...historyKeymap
        ]),

        language,

        oneDark,

        EditorView.lineWrapping,

        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;

          const value = update.state.doc.toString();

          state.files[state.activeFile] = value;

          updateSaveStatus("Unsaved changes");

          scheduleAutosave();

          updatePreview();
        }),

        EditorView.theme({
          "&": {
            height: "100%",
            backgroundColor: "#090912"
          },

          ".cm-scroller": {
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "15px",
            lineHeight: "1.6",
            overflow: "auto"
          },

          ".cm-content": {
            padding: "16px 0"
          },

          ".cm-line": {
            padding: "0 16px"
          },

          ".cm-gutters": {
            backgroundColor: "#090912",
            color: "#4b5563",
            border: "none"
          }
        })
      ]
    });

    state.editor = new EditorView({
      state: startState,
      parent: editorElement
    });

    console.log("CodeMirror initialized.");

  } catch (error) {
    console.error("CodeMirror failed:", error);

    editorElement.innerHTML = `
      <textarea
        id="fallbackEditor"
        spellcheck="false"
        style="
          width:100%;
          height:100%;
          resize:none;
          border:0;
          outline:0;
          background:#090912;
          color:#e5e7eb;
          padding:16px;
          font:15px/1.6 monospace;
        "
      ></textarea>
    `;

    const fallback = $("fallbackEditor");

    fallback.value =
      state.files[state.activeFile] || "";

    fallback.addEventListener("input", () => {
      state.files[state.activeFile] =
        fallback.value;

      updateSaveStatus("Unsaved changes");

      scheduleAutosave();

      updatePreview();
    });

    showToast(
      "CodeMirror could not load. Basic editor enabled.",
      "error"
    );
  }
}


function getLanguageExtension(file, modules) {
  const type = getFileType(file);

  if (type === "html") {
    return modules.html({
      matchClosingTags: true
    });
  }

  if (type === "css") {
    return modules.css();
  }

  if (type === "javascript") {
    return modules.javascript();
  }

  return [];
}


function setEditorContent(value) {
  if (state.editor) {
    state.editor.dispatch({
      changes: {
        from: 0,
        to: state.editor.state.doc.length,
        insert: value
      }
    });

    return;
  }

  const fallback = $("fallbackEditor");

  if (fallback) {
    fallback.value = value;
  }
}


/* =========================================================
   PREVIEW
   ========================================================= */

function updatePreview() {
  const frame = $("previewFrame");

  if (!frame) return;

  const html = state.files["index.html"] || "";

  const css = state.files["style.css"] || "";

  const js = state.files["script.js"] || "";

  let documentHtml = html;

  if (css) {
    const styleTag = `
      <style>
        ${css}
      </style>
    `;

    if (documentHtml.includes("</head>")) {
      documentHtml =
        documentHtml.replace(
          "</head>",
          `${styleTag}</head>`
        );
    } else {
      documentHtml =
        styleTag + documentHtml;
    }
  }

  if (js) {
    const scriptTag = `
      <script>
        ${js}
      <\/script>
    `;

    if (documentHtml.includes("</body>")) {
      documentHtml =
        documentHtml.replace(
          "</body>",
          `${scriptTag}</body>`
        );
    } else {
      documentHtml += scriptTag;
    }
  }

  frame.srcdoc = documentHtml;
}


function runPreview() {
  updatePreview();

  showToast(
    "Preview updated",
    "success"
  );
}


/* =========================================================
   AUTOSAVE
   ========================================================= */

let autosaveTimer = null;

function scheduleAutosave() {
  clearTimeout(autosaveTimer);

  autosaveTimer = setTimeout(() => {
    saveLocalProject();
  }, 800);
}


/* =========================================================
   MOBILE VIEW
   ========================================================= */

function setMobileView(view) {
  const editor = $("editorPanel");
  const preview = $("previewPanel");

  if (!editor || !preview) return;

  if (window.innerWidth >= 768) {
    editor.style.display = "";
    preview.style.display = "";
    return;
  }

  if (view === "preview") {
    editor.style.display = "none";
    preview.style.display = "flex";
  } else {
    editor.style.display = "flex";
    preview.style.display = "none";
  }

  document
    .querySelectorAll(".mobile-view-btn")
    .forEach(btn => {
      btn.classList.remove("active");
    });

  if (view === "preview") {
    $("mobilePreviewBtn")?.classList.add("active");
  } else {
    $("mobileEditorBtn")?.classList.add("active");
  }
}


/* =========================================================
   DESKTOP VIEW
   ========================================================= */

function setDesktopView(view) {
  const editor = $("editorPanel");
  const preview = $("previewPanel");

  if (!editor || !preview) return;

  if (window.innerWidth < 768) {
    setMobileView(
      view === "preview"
        ? "preview"
        : "editor"
    );

    return;
  }

  editor.style.display =
    view === "preview"
      ? "none"
      : "flex";

  preview.style.display =
    view === "preview"
      ? "flex"
      : "flex";

  if (view === "preview") {
    editor.style.flex = "0 0 0";
    preview.style.flex = "1";
  } else {
    editor.style.flex = "1";
    preview.style.flex = "1";
  }

  $("desktopEditorTab")
    ?.classList.toggle(
      "active",
      view === "editor"
    );

  $("desktopPreviewTab")
    ?.classList.toggle(
      "active",
      view === "preview"
    );
}


/* =========================================================
   SIDEBAR
   ========================================================= */

function openSidebar() {
  $("sidebar")?.classList.add("sidebar-open");
  $("sidebarOverlay")?.classList.remove("hidden");
}


function closeSidebar() {
  $("sidebar")?.classList.remove("sidebar-open");
  $("sidebarOverlay")?.classList.add("hidden");
}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(id) {
  const modal = $(id);

  if (!modal) return;

  modal.classList.remove("hidden");

  setTimeout(() => {
    modal.classList.add("modal-visible");
  }, 10);
}


function closeModal(id) {
  const modal = $(id);

  if (!modal) return;

  modal.classList.remove("modal-visible");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 150);
}


/* =========================================================
   ACCOUNT MENU
   ========================================================= */

function toggleAccountMenu() {
  const menu = $("accountMenu");

  if (!menu) return;

  menu.classList.toggle("hidden");
}


function closeAccountMenu() {
  $("accountMenu")?.classList.add("hidden");
}


/* =========================================================
   AUTH MODAL
   ========================================================= */

function openAuthModal(mode = "signin") {
  state.authMode = mode;

  const title = $("authTitle");
  const subtitle = $("authSubtitle");
  const submit = $("authSubmitBtn");
  const switchBtn = $("authSwitchBtn");
  const password = $("authPassword");

  if (mode === "signup") {
    if (title) title.textContent = "Create account";

    if (subtitle) {
      subtitle.textContent =
        "Create your WebCode Studio account.";
    }

    if (submit) {
      submit.textContent =
        "Create account";
    }

    if (switchBtn) {
      switchBtn.textContent =
        "Already have an account? Sign in";
    }

    if (password) {
      password.autocomplete = "new-password";
    }

  } else {
    if (title) title.textContent = "Sign in";

    if (subtitle) {
      subtitle.textContent =
        "Sign in to sync your projects.";
    }

    if (submit) {
      submit.textContent =
        "Sign in";
    }

    if (switchBtn) {
      switchBtn.textContent =
        "Create an account";
    }

    if (password) {
      password.autocomplete = "current-password";
    }
  }

  $("authError")?.classList.add("hidden");

  openModal("authModal");
}


function showAuthError(message) {
  const element = $("authError");

  if (!element) return;

  element.textContent = message;

  element.classList.remove("hidden");
}


/* =========================================================
   FIREBASE
   ========================================================= */

async function initializeFirebase() {
  try {
    const configModule =
      await import("./firebase-config.js");

    const firebaseAppModule =
      await import(
        "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"
      );

    const firebaseAuthModule =
      await import(
        "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
      );

    const firebaseApp =
      firebaseAppModule.initializeApp(
        configModule.firebaseConfig
      );

    const auth =
      firebaseAuthModule.getAuth(
        firebaseApp
      );

    state.firebase = {
      auth,
      createUserWithEmailAndPassword:
        firebaseAuthModule.createUserWithEmailAndPassword,
      signInWithEmailAndPassword:
        firebaseAuthModule.signInWithEmailAndPassword,
      signOut:
        firebaseAuthModule.signOut
    };

    firebaseAuthModule.onAuthStateChanged(
      auth,
      (user) => {
        state.authUser = user;

        updateAccountUI();

        if (user) {
          $("sidebarProjectStatus").textContent =
            "Signed in";

          $("sidebarProjectStatus").className =
            "text-[10px] text-emerald-400 mt-0.5";
        } else {
          $("sidebarProjectStatus").textContent =
            "Local project";

          $("sidebarProjectStatus").className =
            "text-[10px] text-gray-500 mt-0.5";
        }
      }
    );

    console.log("Firebase initialized.");

  } catch (error) {
    console.error(
      "Firebase initialization failed:",
      error
    );

    showToast(
      "Firebase could not load. Local mode is still available.",
      "error"
    );
  }
}


/* =========================================================
   ACCOUNT UI
   ========================================================= */

function updateAccountUI() {
  const email = $("accountEmail");
  const status = $("accountStatus");
  const signIn = $("accountSignInBtn");
  const signOut = $("accountSignOutBtn");
  const initial = $("accountInitial");

  if (state.authUser) {
    const userEmail =
      state.authUser.email || "User";

    if (email) {
      email.textContent = userEmail;
    }

    if (status) {
      status.textContent =
        "Signed in";
    }

    if (initial) {
      initial.textContent =
        userEmail
          .charAt(0)
          .toUpperCase();
    }

    signIn?.classList.add("hidden");
    signOut?.classList.remove("hidden");

  } else {
    if (email) {
      email.textContent = "Guest";
    }

    if (status) {
      status.textContent =
        "Not signed in";
    }

    if (initial) {
      initial.textContent = "G";
    }

    signIn?.classList.remove("hidden");
    signOut?.classList.add("hidden");
  }
}


/* =========================================================
   AUTH SUBMIT
   ========================================================= */

async function handleAuthSubmit(event) {
  event.preventDefault();

  if (!state.firebase) {
    showAuthError(
      "Firebase is not ready. Check firebase-config.js."
    );

    return;
  }

  const email =
    $("authEmail")?.value.trim();

  const password =
    $("authPassword")?.value;

  if (!email || !password) {
    showAuthError(
      "Enter your email and password."
    );

    return;
  }

  const button =
    $("authSubmitBtn");

  if (button) {
    button.disabled = true;
    button.textContent =
      state.authMode === "signup"
        ? "Creating..."
        : "Signing in...";
  }

  try {
    if (state.authMode === "signup") {
      await state.firebase
        .createUserWithEmailAndPassword(
          state.firebase.auth,
          email,
          password
        );

      showToast(
        "Account created successfully.",
        "success"
      );

    } else {
      await state.firebase
        .signInWithEmailAndPassword(
          state.firebase.auth,
          email,
          password
        );

      showToast(
        "Signed in successfully.",
        "success"
      );
    }

    closeModal("authModal");

    $("authForm")?.reset();

  } catch (error) {
    console.error(error);

    let message =
      "Authentication failed.";

    if (
      error.code ===
      "auth/email-already-in-use"
    ) {
      message =
        "That email is already registered.";
    }

    if (
      error.code ===
      "auth/invalid-credential"
    ) {
      message =
        "Email or password is incorrect.";
    }

    if (
      error.code ===
      "auth/weak-password"
    ) {
      message =
        "Password must be at least 6 characters.";
    }

    if (
      error.code ===
      "auth/invalid-email"
    ) {
      message =
        "Enter a valid email address.";
    }

    showAuthError(message);

  } finally {
    if (button) {
      button.disabled = false;

      button.textContent =
        state.authMode === "signup"
          ? "Create account"
          : "Sign in";
    }
  }
}


/* =========================================================
   CREATE FILE
   ========================================================= */

function createNewFile(filename) {
  filename = filename.trim();

  if (!filename) return;

  if (Object.prototype.hasOwnProperty.call(
    state.files,
    filename
  )) {
    showToast(
      "A file with that name already exists.",
      "error"
    );

    return;
  }

  state.files[filename] = "";

  closeModal("fileModal");

  $("fileNameInput").value = "";

  saveLocalProject();

  renderFileTree();

  openFile(filename);

  showToast(
    `${filename} created.`,
    "success"
  );
}


/* =========================================================
   CREATE FOLDER
   ========================================================= */

function createNewFolder(folderName) {
  folderName = folderName.trim();

  if (!folderName) return;

  if (state.folders.includes(folderName)) {
    showToast(
      "That folder already exists.",
      "error"
    );

    return;
  }

  state.folders.push(folderName);

  closeModal("folderModal");

  $("folderNameInput").value = "";

  saveLocalProject();

  renderFileTree();

  showToast(
    `${folderName} created.`,
    "success"
  );
}


/* =========================================================
   CREATE PROJECT
   ========================================================= */

function createProject(name, description) {
  name = name.trim();

  if (!name) return;

  const projectId =
    "project-" +
    Date.now();

  state.currentProjectId =
    projectId;

  state.projectName =
    name;

  state.projectDescription =
    description.trim();

  state.files = {
    ...DEFAULT_FILES
  };

  state.folders = [];

  state.activeFile =
    "index.html";

  state.openTabs = [
    "index.html"
  ];

  saveLocalProject();

  updateProjectNames();

  renderFileTree();

  renderTabs();

  setEditorContent(
    state.files["index.html"]
  );

  updatePreview();

  closeModal("projectModal");

  $("projectNameInput").value = "";
  $("projectDescriptionInput").value = "";

  showToast(
    "New project created.",
    "success"
  );
}


function updateProjectNames() {
  const top =
    $("topProjectName");

  const sidebar =
    $("sidebarProjectName");

  if (top) {
    top.textContent =
      state.projectName;
  }

  if (sidebar) {
    sidebar.textContent =
      state.projectName;
  }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {
  const list =
    $("projectList");

  if (!list) return;

  list.innerHTML = "";

  const projects = [
    {
      id: "default",
      name: "My Website",
      description:
        "Your first WebCode Studio project."
    }
  ];

  projects.forEach(project => {
    const card =
      document.createElement("button");

    card.type = "button";

    card.className =
      "w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition mb-3";

    card.innerHTML = `
      <div class="flex items-center gap-3">

        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">

          <svg viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="w-5 h-5">

            <path d="m8 9-4 3 4 3"/>
            <path d="m16 9 4 3-4 3"/>
            <path d="m14 5-4 14"/>

          </svg>

        </div>

        <div class="min-w-0">

          <div class="font-medium truncate">
            ${escapeHtml(project.name)}
          </div>

          <div class="text-xs text-gray-500 mt-1 truncate">
            ${escapeHtml(project.description)}
          </div>

        </div>

      </div>
    `;

    card.addEventListener("click", () => {
      closeModal("dashboardModal");

      showToast(
        "Project opened.",
        "success"
      );
    });

    list.appendChild(card);
  });
}


/* =========================================================
   PUBLISH
   ========================================================= */

function publishWebsite() {
  updatePreview();

  showToast(
    "Publishing will be connected to Cloudflare later.",
    "info"
  );
}


/* =========================================================
   SAVE BUTTON
   ========================================================= */

function saveProject() {
  saveLocalProject();

  updateSaveStatus(
    "Saved locally"
  );

  showToast(
    "Project saved.",
    "success"
  );
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

  /* Mobile menu */

  $("mobileMenuBtn")
    ?.addEventListener(
      "click",
      openSidebar
    );

  $("sidebarOverlay")
    ?.addEventListener(
      "click",
      closeSidebar
    );


  /* Dashboard */

  $("dashboardBtn")
    ?.addEventListener(
      "click",
      () => {
        closeAccountMenu();
        renderDashboard();
        openModal("dashboardModal");
      }
    );


  /* Run */

  $("runBtn")
    ?.addEventListener(
      "click",
      runPreview
    );


  $("mobileRunBtn")
    ?.addEventListener(
      "click",
      runPreview
    );


  /* Save */

  $("saveBtn")
    ?.addEventListener(
      "click",
      saveProject
    );


  /* Editor / Preview */

  $("desktopEditorTab")
    ?.addEventListener(
      "click",
      () => setDesktopView("editor")
    );


  $("desktopPreviewTab")
    ?.addEventListener(
      "click",
      () => setDesktopView("preview")
    );


  $("mobileEditorBtn")
    ?.addEventListener(
      "click",
      () => setMobileView("editor")
    );


  $("mobilePreviewBtn")
    ?.addEventListener(
      "click",
      () => setMobileView("preview")
    );


  $("refreshPreviewBtn")
    ?.addEventListener(
      "click",
      runPreview
    );


  /* Account */

  $("accountBtn")
    ?.addEventListener(
      "click",
      toggleAccountMenu
    );


  $("accountSignInBtn")
    ?.addEventListener(
      "click",
      () => {
        closeAccountMenu();
        openAuthModal("signin");
      }
    );


  $("accountSignOutBtn")
    ?.addEventListener(
      "click",
      async () => {

        if (!state.firebase) {
          showToast(
            "Firebase is not ready.",
            "error"
          );

          return;
        }

        try {
          await state.firebase.signOut(
            state.firebase.auth
          );

          closeAccountMenu();

          showToast(
            "Signed out.",
            "success"
          );

        } catch (error) {
          console.error(error);

          showToast(
            "Could not sign out.",
            "error"
          );
        }
      }
    );


  /* Auth */

  $("closeAuthModal")
    ?.addEventListener(
      "click",
      () => closeModal("authModal")
    );


  $("authForm")
    ?.addEventListener(
      "submit",
      handleAuthSubmit
    );


  $("authSwitchBtn")
    ?.addEventListener(
      "click",
      () => {
        openAuthModal(
          state.authMode === "signin"
            ? "signup"
            : "signin"
        );
      }
    );


  /* Files */

  $("newFileBtn")
    ?.addEventListener(
      "click",
      () => openModal("fileModal")
    );


  $("closeFileModal")
    ?.addEventListener(
      "click",
      () => closeModal("fileModal")
    );


  $("cancelFileBtn")
    ?.addEventListener(
      "click",
      () => closeModal("fileModal")
    );


  $("fileForm")
    ?.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        createNewFile(
          $("fileNameInput")
            ?.value || ""
        );
      }
    );


  /* Folders */

  $("newFolderBtn")
    ?.addEventListener(
      "click",
      () => openModal("folderModal")
    );


  $("closeFolderModal")
    ?.addEventListener(
      "click",
      () => closeModal("folderModal")
    );


  $("cancelFolderBtn")
    ?.addEventListener(
      "click",
      () => closeModal("folderModal")
    );


  $("folderForm")
    ?.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        createNewFolder(
          $("folderNameInput")
            ?.value || ""
        );
      }
    );


  /* Project */

  $("newProjectBtn")
    ?.addEventListener(
      "click",
      () => openModal("projectModal")
    );


  $("dashboardNewProjectBtn")
    ?.addEventListener(
      "click",
      () => {
        closeModal("dashboardModal");
        openModal("projectModal");
      }
    );


  $("closeProjectModal")
    ?.addEventListener(
      "click",
      () => closeModal("projectModal")
    );


  $("cancelProjectBtn")
    ?.addEventListener(
      "click",
      () => closeModal("projectModal")
    );


  $("projectForm")
    ?.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        createProject(
          $("projectNameInput")
            ?.value || "",
          $("projectDescriptionInput")
            ?.value || ""
        );
      }
    );


  /* Dashboard close */

  $("closeDashboardModal")
    ?.addEventListener(
      "click",
      () => closeModal("dashboardModal")
    );


  /* Publish */

  $("publishBtn")
    ?.addEventListener(
      "click",
      publishWebsite
    );


  /* Close menus when clicking outside */

  document.addEventListener(
    "click",
    (event) => {

      const accountButton =
        $("accountBtn");

      const accountMenu =
        $("accountMenu");

      if (
        accountMenu &&
        accountButton &&
        !accountMenu.contains(event.target) &&
        !accountButton.contains(event.target)
      ) {
        closeAccountMenu();
      }

    }
  );


  /* Escape key */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") {
        return;
      }

      closeAccountMenu();
      closeSidebar();

      [
        "authModal",
        "fileModal",
        "folderModal",
        "dashboardModal",
        "projectModal"
      ].forEach(closeModal);

    }
  );


  /* Resize */

  window.addEventListener(
    "resize",
    () => {

      if (window.innerWidth >= 768) {
        closeSidebar();

        $("editorPanel")?.style.removeProperty(
          "display"
        );

        $("previewPanel")?.style.removeProperty(
          "display"
        );
      } else {
        setMobileView(
          $("mobilePreviewBtn")?.classList.contains("active")
            ? "preview"
            : "editor"
        );
      }

    }
  );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializeApp() {

  if (state.initialized) {
    return;
  }

  state.initialized = true;

  console.log(
    "WebCode Studio starting..."
  );

  /* Load project */

  loadLocalProject();

  state.activeFile =
    Object.keys(state.files)[0] ||
    "index.html";

  state.openTabs = [
    state.activeFile
  ];

  updateProjectNames();

  renderFileTree();

  renderTabs();

  updateCurrentFileLabel();

  /* IMPORTANT:
     Attach buttons BEFORE external modules.
     This means buttons still work even if
     CodeMirror/Firebase has a loading problem.
  */

  setupEventListeners();

  /* Initialize editor */

  await initializeCodeMirror();

  /* Preview */

  updatePreview();

  /* Firebase */

  initializeFirebase();

  /* Mobile */

  if (window.innerWidth < 768) {
    setMobileView("editor");
  }

  console.log(
    "WebCode Studio ready."
  );
}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp,
    { once: true }
  );
} else {
  initializeApp();
}
