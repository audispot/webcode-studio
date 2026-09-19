// ============================================================
// WEBCode Studio V2
// app.js
// Matched specifically to the supplied index.html
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

import { EditorState } from "https://esm.sh/@codemirror/state@6.5.2";

import {
  EditorView,
  keymap
} from "https://esm.sh/@codemirror/view@6.36.5";

import {
  defaultKeymap,
  history,
  historyKeymap
} from "https://esm.sh/@codemirror/commands@6.8.1";

import {
  basicSetup
} from "https://esm.sh/codemirror@6.0.1";

import {
  html
} from "https://esm.sh/@codemirror/lang-html@6.4.9";

import {
  css
} from "https://esm.sh/@codemirror/lang-css@6.3.1";

import {
  javascript
} from "https://esm.sh/@codemirror/lang-javascript@6.2.3";

import {
  oneDark
} from "https://esm.sh/@codemirror/theme-one-dark@6.1.2";


// ============================================================
// FIREBASE
// ============================================================

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);


// ============================================================
// DEFAULT PROJECT
// ============================================================

const DEFAULT_FILES = {
  "index.html": {
    type: "file",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>

  <main class="hero">
    <h1>Welcome to WebCode Studio</h1>
    <p>Edit the code and press Run.</p>
    <button id="helloButton">Test JavaScript</button>
  </main>

  <script src="script.js"></script>
</body>
</html>`
  },

  "style.css": {
    type: "file",
    language: "css",
    content: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #0f1020;
  color: white;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
}

h1 {
  font-size: 42px;
  margin-bottom: 12px;
}

p {
  color: #b8b8c8;
  margin-bottom: 24px;
}

button {
  border: 0;
  border-radius: 12px;
  padding: 13px 20px;
  background: #7c3aed;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #6d28d9;
}`
  },

  "script.js": {
    type: "file",
    language: "javascript",
    content: `const button = document.getElementById("helloButton");

if (button) {
  button.addEventListener("click", () => {
    button.textContent = "JavaScript works!";
  });
}`
  }
};


// ============================================================
// STATE
// ============================================================

let projects = [];

let currentProject = null;

let currentFilePath = "index.html";

let editorView = null;

let isCreatingAccount = false;

let saveTimer = null;

let isUpdatingEditor = false;

const STORAGE_KEY = "webcode-studio-projects-v2";


// ============================================================
// DOM HELPERS
// ============================================================

const $ = (id) => document.getElementById(id);


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});


function initializeApp() {

  loadProjects();

  setupEditor();

  setupButtons();

  setupAuth();

  setupModals();

  renderProjects();

  if (!currentProject) {
    createDefaultProject();
  }

  renderProject();

  openFile(currentFilePath);

  updatePreview();

  setupMobileSidebar();

  setupAccountMenu();

  updateAuthUI();

  console.log("WebCode Studio initialized");
}


// ============================================================
// PROJECT STORAGE
// ============================================================

function loadProjects() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      projects = [];
      return;
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      projects = parsed;
    }

  } catch (error) {

    console.error("Could not load projects:", error);

    projects = [];
  }
}


function saveProjects() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(projects)
    );

  } catch (error) {

    console.error("Could not save projects:", error);

    showToast(
      "Could not save locally",
      "error"
    );

  }
}


// ============================================================
// DEFAULT PROJECT
// ============================================================

function createDefaultProject() {

  const project = {
    id: createId(),

    name: "My Website",

    description: "My first WebCode Studio website",

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),

    files: cloneFiles(DEFAULT_FILES)
  };

  projects.push(project);

  currentProject = project;

  saveProjects();
}


function cloneFiles(files) {

  return JSON.parse(
    JSON.stringify(files)
  );
}


// ============================================================
// PROJECT RENDERING
// ============================================================

function renderProject() {

  if (!currentProject) {
    return;
  }

  const name = currentProject.name || "My Website";

  const topProjectName = $("topProjectName");

  const sidebarProjectName = $("sidebarProjectName");

  if (topProjectName) {
    topProjectName.textContent = name;
  }

  if (sidebarProjectName) {
    sidebarProjectName.textContent = name;
  }

  renderFileTree();

  renderTabs();

  renderProjects();
}


// ============================================================
// FILE TREE
// ============================================================

function renderFileTree() {

  const container = $("fileTree");

  if (!container || !currentProject) {
    return;
  }

  container.innerHTML = "";

  const paths = Object.keys(currentProject.files);

  if (!paths.length) {

    const empty = document.createElement("div");

    empty.className =
      "text-xs text-gray-500 text-center py-8";

    empty.textContent = "No files yet.";

    container.appendChild(empty);

    return;
  }

  const sorted = paths.sort((a, b) => {

    const aParts = a.split("/").length;

    const bParts = b.split("/").length;

    if (aParts !== bParts) {
      return aParts - bParts;
    }

    return a.localeCompare(b);
  });


  // ----------------------------------------------------------
  // Create folder + file tree
  // ----------------------------------------------------------

  const folders = new Set();

  sorted.forEach(path => {

    const parts = path.split("/");

    if (parts.length > 1) {

      let accumulated = "";

      for (let i = 0; i < parts.length - 1; i++) {

        accumulated +=
          (accumulated ? "/" : "") +
          parts[i];

        folders.add(accumulated);
      }
    }
  });


  const visibleItems = [];

  folders.forEach(folder => {

    visibleItems.push({
      path: folder,
      type: "folder"
    });
  });

  sorted.forEach(path => {

    visibleItems.push({
      path,
      type: "file"
    });
  });


  visibleItems.sort((a, b) => {

    const depthA = a.path.split("/").length;

    const depthB = b.path.split("/").length;

    if (depthA !== depthB) {
      return depthA - depthB;
    }

    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }

    return a.path.localeCompare(b.path);
  });


  visibleItems.forEach(item => {

    const row = document.createElement("button");

    row.type = "button";

    row.className =
      "file-tree-item w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-white/5";


    if (
      item.type === "file" &&
      item.path === currentFilePath
    ) {

      row.classList.add(
        "bg-violet-500/15",
        "text-violet-300"
      );

    } else {

      row.classList.add(
        "text-gray-400"
      );
    }


    const depth =
      Math.max(
        0,
        item.path.split("/").length - 1
      );

    row.style.paddingLeft =
      `${8 + depth * 14}px`;


    // Icon

    const icon = document.createElement("span");

    icon.className =
      "shrink-0 w-4 h-4 flex items-center justify-center";


    if (item.type === "folder") {

      icon.innerHTML = `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          class="w-4 h-4"
        >
          <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
      `;

    } else {

      icon.innerHTML =
        getFileIcon(item.path);
    }


    row.appendChild(icon);


    // Name

    const name = document.createElement("span");

    name.className =
      "truncate flex-1 min-w-0";

    name.textContent =
      item.path.split("/").pop();

    row.appendChild(name);


    // Delete file button

    if (item.type === "file") {

      const deleteButton =
        document.createElement("span");

      deleteButton.className =
        "delete-file-btn opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition shrink-0";

      deleteButton.innerHTML = `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          class="w-4 h-4"
        >
          <path d="M4 7h16"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M6 7l1 14h10l1-14"/>
          <path d="M9 7V4h6v3"/>
        </svg>
      `;

      deleteButton.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          event.stopPropagation();

          deleteFile(item.path);
        }
      );

      row.appendChild(deleteButton);
    }


    row.classList.add("group");


    row.addEventListener(
      "click",
      () => {

        if (item.type === "file") {

          openFile(item.path);

          closeMobileSidebar();

        }
      }
    );


    container.appendChild(row);
  });
}


// ============================================================
// FILE ICONS
// ============================================================

function getFileIcon(path) {

  const lower =
    path.toLowerCase();

  if (lower.endsWith(".html")) {

    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-4 h-4 text-orange-400"
      >
        <path d="m8 9-4 3 4 3"/>
        <path d="m16 9 4 3-4 3"/>
        <path d="m14 5-4 14"/>
      </svg>
    `;
  }


  if (lower.endsWith(".css")) {

    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-4 h-4 text-blue-400"
      >
        <path d="m8 9-4 3 4 3"/>
        <path d="m16 9 4 3-4 3"/>
        <path d="m14 5-4 14"/>
      </svg>
    `;
  }


  if (
    lower.endsWith(".js") ||
    lower.endsWith(".mjs")
  ) {

    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-4 h-4 text-yellow-400"
      >
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <path d="M8 15c.5 1 1.2 1.5 2 1.5 1 0 1.5-.6 1.5-1.3 0-1.9-3.5-1-3.5-3.2 0-1 .8-1.8 2-1.8.9 0 1.6.4 2 1.1"/>
        <path d="M15 11v5.5"/>
      </svg>
    `;
  }


  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      class="w-4 h-4 text-gray-400"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
    </svg>
  `;
}


// ============================================================
// CODEMIRROR
// ============================================================

function setupEditor() {

  const editorContainer =
    $("codeEditor");

  if (!editorContainer) {

    console.error(
      "ERROR: #codeEditor was not found."
    );

    return;
  }


  editorView = new EditorView({

    state: EditorState.create({

      doc: "",

      extensions: [

        basicSetup,

        history(),

        keymap.of([
          ...defaultKeymap,
          ...historyKeymap
        ]),

        oneDark,

        EditorView.theme({

          "&": {
            height: "100%",
            fontSize: "15px"
          },

          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          },

          ".cm-content": {
            minHeight: "100%",
            padding: "16px"
          },

          ".cm-gutters": {
            minHeight: "100%"
          },

          "@media (max-width: 767px)": {
            "&": {
              fontSize: "16px"
            },

            ".cm-content": {
              padding: "14px"
            }
          }
        }),

        EditorView.updateListener.of(
          (update) => {

            if (
              update.docChanged &&
              !isUpdatingEditor
            ) {

              handleEditorChange();
            }
          }
        )
      ]
    }),

    parent: editorContainer
  });


  console.log(
    "CodeMirror editor mounted successfully."
  );
}


// ============================================================
// LANGUAGE
// ============================================================

function getLanguageExtension(path) {

  const lower =
    path.toLowerCase();


  if (
    lower.endsWith(".html") ||
    lower.endsWith(".htm")
  ) {

    return html();
  }


  if (lower.endsWith(".css")) {

    return css();
  }


  if (
    lower.endsWith(".js") ||
    lower.endsWith(".mjs")
  ) {

    return javascript();
  }


  return javascript();
}


// ============================================================
// OPEN FILE
// ============================================================

function openFile(path) {

  if (!currentProject) {
    return;
  }

  const file =
    currentProject.files[path];

  if (!file) {
    return;
  }


  currentFilePath = path;


  if (editorView) {

    isUpdatingEditor = true;

    const language =
      getLanguageExtension(path);


    editorView.dispatch({

      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: file.content || ""
      },

      effects: []
    });


    // Reconfigure language

    editorView.dispatch({
      effects: EditorView.editorAttributes.of({})
    });


    isUpdatingEditor = false;
  }


  updateCurrentFileUI();

  renderFileTree();

  renderTabs();

  setSaveStatus("Saved locally");

  showEditorView();
}


// ============================================================
// CURRENT FILE UI
// ============================================================

function updateCurrentFileUI() {

  const fileName =
    $("currentFileName");

  const fileIcon =
    $("currentFileIcon");


  if (fileName) {

    fileName.textContent =
      currentFilePath;
  }


  if (fileIcon) {

    fileIcon.innerHTML =
      getFileIcon(currentFilePath);
  }
}


// ============================================================
// EDITOR CHANGE
// ============================================================

function handleEditorChange() {

  if (
    !currentProject ||
    !currentProject.files[currentFilePath]
  ) {

    return;
  }


  const content =
    editorView.state.doc.toString();


  currentProject.files[currentFilePath].content =
    content;


  currentProject.updatedAt =
    new Date().toISOString();


  setSaveStatus("Unsaved");


  clearTimeout(saveTimer);


  saveTimer = setTimeout(() => {

    saveProjects();

    setSaveStatus("Saved locally");

    updatePreview();

  }, 500);
}


// ============================================================
// SAVE
// ============================================================

function saveCurrentProject() {

  if (!currentProject) {
    return;
  }


  if (
    currentFilePath &&
    currentProject.files[currentFilePath] &&
    editorView
  ) {

    currentProject.files[currentFilePath].content =
      editorView.state.doc.toString();
  }


  currentProject.updatedAt =
    new Date().toISOString();


  saveProjects();

  setSaveStatus("Saved locally");

  updatePreview();

  showToast(
    "Project saved",
    "success"
  );
}


// ============================================================
// SAVE STATUS
// ============================================================

function setSaveStatus(text) {

  const element =
    $("saveStatus");

  if (!element) {
    return;
  }

  element.textContent = text;


  if (text === "Unsaved") {

    element.className =
      "text-[10px] text-yellow-400";

  } else {

    element.className =
      "text-[10px] text-emerald-400";
  }
}


// ============================================================
// TABS
// ============================================================

function renderTabs() {

  const container =
    $("tabsContainer");

  if (!container || !currentProject) {
    return;
  }


  container.innerHTML = "";


  Object.keys(currentProject.files).forEach(
    (path) => {

      const tab =
        document.createElement("button");

      tab.type = "button";

      tab.className =
        "h-full px-4 flex items-center gap-2 border-r border-white/10 text-xs transition";


      if (path === currentFilePath) {

        tab.classList.add(
          "bg-[#111122]",
          "text-white",
          "border-t-2",
          "border-violet-500"
        );

      } else {

        tab.classList.add(
          "text-gray-500",
          "hover:text-gray-300",
          "hover:bg-white/[0.03]"
        );
      }


      const icon =
        document.createElement("span");

      icon.innerHTML =
        getFileIcon(path);

      tab.appendChild(icon);


      const name =
        document.createElement("span");

      name.textContent =
        path.split("/").pop();

      tab.appendChild(name);


      tab.addEventListener(
        "click",
        () => openFile(path)
      );


      container.appendChild(tab);
    }
  );
}


// ============================================================
// DELETE FILE
// ============================================================

function deleteFile(path) {

  if (!currentProject) {
    return;
  }


  const paths =
    Object.keys(currentProject.files);


  // Don't allow deleting the final file.

  if (paths.length <= 1) {

    showToast(
      "A project needs at least one file.",
      "error"
    );

    return;
  }


  if (!currentProject.files[path]) {
    return;
  }


  delete currentProject.files[path];


  if (currentFilePath === path) {

    const remaining =
      Object.keys(currentProject.files);

    currentFilePath =
      remaining[0] || "index.html";
  }


  currentProject.updatedAt =
    new Date().toISOString();


  saveProjects();

  renderProject();

  openFile(currentFilePath);

  updatePreview();


  // NO browser confirm()
  showToast(
    `${path} deleted`,
    "success"
  );
}


// ============================================================
// NEW FILE
// ============================================================

function createNewFile(name) {

  if (!currentProject) {
    return;
  }


  name =
    name.trim();


  if (!name) {
    return;
  }


  if (
    currentProject.files[name]
  ) {

    showToast(
      "That file already exists.",
      "error"
    );

    return;
  }


  currentProject.files[name] = {
    type: "file",
    language: detectLanguage(name),
    content: getStarterContent(name)
  };


  currentProject.updatedAt =
    new Date().toISOString();


  saveProjects();

  renderProject();

  openFile(name);

  closeModal("fileModal");

  showToast(
    `${name} created`,
    "success"
  );
}


// ============================================================
// NEW FOLDER
// ============================================================

function createNewFolder(name) {

  if (!currentProject) {
    return;
  }


  name =
    name.trim();


  if (!name) {
    return;
  }


  // A folder is represented through paths.
  // Create a starter file inside it.

  const starterPath =
    `${name}/index.html`;


  if (
    currentProject.files[starterPath]
  ) {

    showToast(
      "That folder already exists.",
      "error"
    );

    return;
  }


  currentProject.files[starterPath] = {
    type: "file",
    language: "html",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
</head>
<body>

  <h1>${name}</h1>

</body>
</html>`
  };


  currentProject.updatedAt =
    new Date().toISOString();


  saveProjects();

  renderProject();

  openFile(starterPath);

  closeModal("folderModal");

  showToast(
    `${name} folder created`,
    "success"
  );
}


// ============================================================
// LANGUAGE DETECTION
// ============================================================

function detectLanguage(name) {

  const lower =
    name.toLowerCase();


  if (
    lower.endsWith(".html") ||
    lower.endsWith(".htm")
  ) {
    return "html";
  }


  if (lower.endsWith(".css")) {
    return "css";
  }


  if (
    lower.endsWith(".js") ||
    lower.endsWith(".mjs")
  ) {
    return "javascript";
  }


  return "text";
}


// ============================================================
// STARTER CONTENT
// ============================================================

function getStarterContent(name) {

  const language =
    detectLanguage(name);


  if (language === "html") {

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Page</title>
</head>
<body>

  <h1>Hello World</h1>

</body>
</html>`;
  }


  if (language === "css") {

    return `body {
  margin: 0;
  font-family: Arial, sans-serif;
}`;
  }


  if (language === "javascript") {

    return `console.log("JavaScript is working");`;
  }


  return "";
}


// ============================================================
// PREVIEW
// ============================================================

function updatePreview() {

  const frame =
    $("previewFrame");

  if (!frame || !currentProject) {
    return;
  }


  const htmlFile =
    currentProject.files["index.html"];


  if (!htmlFile) {

    frame.srcdoc = `
      <html>
        <body style="font-family:Arial;padding:40px">
          <h2>No index.html</h2>
          <p>Create an index.html file to preview your website.</p>
        </body>
      </html>
    `;

    return;
  }


  let html =
    htmlFile.content || "";


  const cssFile =
    currentProject.files["style.css"];


  const jsFile =
    currentProject.files["script.js"];


  // ----------------------------------------------------------
  // Inject CSS
  // ----------------------------------------------------------

  if (cssFile) {

    const css =
      cssFile.content || "";


    const styleTag =
      `<style>${css}</style>`;


    if (html.includes("</head>")) {

      html =
        html.replace(
          "</head>",
          `${styleTag}</head>`
        );

    } else {

      html =
        styleTag + html;
    }
  }


  // ----------------------------------------------------------
  // Inject JavaScript
  // ----------------------------------------------------------

  if (jsFile) {

    const js =
      jsFile.content || "";


    const scriptTag =
      `<script>${js}<\/script>`;


    if (html.includes("</body>")) {

      html =
        html.replace(
          "</body>",
          `${scriptTag}</body>`
        );

    } else {

      html += scriptTag;
    }
  }


  frame.srcdoc =
    html;
}


// ============================================================
// RUN
// ============================================================

function runPreview() {

  saveCurrentProject();

  updatePreview();

  showPreviewView();

  showToast(
    "Preview updated",
    "success"
  );
}


// ============================================================
// BUTTONS
// ============================================================

function setupButtons() {

  // Dashboard

  $("dashboardBtn")?.addEventListener(
    "click",
    () => {

      renderProjects();

      openModal("dashboardModal");
    }
  );


  // Run

  $("runBtn")?.addEventListener(
    "click",
    runPreview
  );


  $("mobileRunBtn")?.addEventListener(
    "click",
    runPreview
  );


  // Save

  $("saveBtn")?.addEventListener(
    "click",
    saveCurrentProject
  );


  // New file

  $("newFileBtn")?.addEventListener(
    "click",
    () => openModal("fileModal")
  );


  // New folder

  $("newFolderBtn")?.addEventListener(
    "click",
    () => openModal("folderModal")
  );


  // New project

  $("newProjectBtn")?.addEventListener(
    "click",
    () => openModal("projectModal")
  );


  $("dashboardNewProjectBtn")?.addEventListener(
    "click",
    () => {

      closeModal("dashboardModal");

      openModal("projectModal");
    }
  );


  // Publish

  $("publishBtn")?.addEventListener(
    "click",
    () => {

      showToast(
        "Publishing will be connected to Cloudflare in the next step.",
        "info"
      );
    }
  );


  // Desktop editor

  $("desktopEditorTab")?.addEventListener(
    "click",
    showEditorView
  );


  // Desktop preview

  $("desktopPreviewTab")?.addEventListener(
    "click",
    showPreviewView
  );


  // Mobile editor

  $("mobileEditorBtn")?.addEventListener(
    "click",
    showEditorView
  );


  // Mobile preview

  $("mobilePreviewBtn")?.addEventListener(
    "click",
    showPreviewView
  );


  // Refresh preview

  $("refreshPreviewBtn")?.addEventListener(
    "click",
    updatePreview
  );
}


// ============================================================
// EDITOR / PREVIEW VIEW
// ============================================================

function showEditorView() {

  const editor =
    $("editorPanel");

  const preview =
    $("previewPanel");


  if (!editor || !preview) {
    return;
  }


  // Desktop

  if (window.innerWidth >= 768) {

    editor.style.display = "flex";

    preview.style.display = "flex";

  } else {

    editor.style.display = "flex";

    preview.style.display = "none";
  }


  updateViewButtons("editor");
}


function showPreviewView() {

  const editor =
    $("editorPanel");

  const preview =
    $("previewPanel");


  if (!editor || !preview) {
    return;
  }


  // Desktop

  if (window.innerWidth >= 768) {

    editor.style.display = "flex";

    preview.style.display = "flex";

  } else {

    editor.style.display = "none";

    preview.style.display = "flex";
  }


  updateViewButtons("preview");
}


function updateViewButtons(view) {

  const editorButtons = [
    $("desktopEditorTab"),
    $("mobileEditorBtn")
  ];


  const previewButtons = [
    $("desktopPreviewTab"),
    $("mobilePreviewBtn")
  ];


  editorButtons.forEach(button => {

    if (!button) return;

    button.classList.toggle(
      "active",
      view === "editor"
    );
  });


  previewButtons.forEach(button => {

    if (!button) return;

    button.classList.toggle(
      "active",
      view === "preview"
    );
  });
}


// ============================================================
// MOBILE SIDEBAR
// ============================================================

function setupMobileSidebar() {

  $("mobileMenuBtn")?.addEventListener(
    "click",
    openMobileSidebar
  );


  $("sidebarOverlay")?.addEventListener(
    "click",
    closeMobileSidebar
  );
}


function openMobileSidebar() {

  const sidebar =
    $("sidebar");

  const overlay =
    $("sidebarOverlay");


  sidebar?.classList.add(
    "mobile-sidebar-open"
  );


  overlay?.classList.remove(
    "hidden"
  );
}


function closeMobileSidebar() {

  const sidebar =
    $("sidebar");

  const overlay =
    $("sidebarOverlay");


  sidebar?.classList.remove(
    "mobile-sidebar-open"
  );


  overlay?.classList.add(
    "hidden"
  );
}


// ============================================================
// ACCOUNT MENU
// ============================================================

function setupAccountMenu() {

  const accountButton =
    $("accountBtn");

  const accountMenu =
    $("accountMenu");


  accountButton?.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      accountMenu?.classList.toggle(
        "hidden"
      );
    }
  );


  document.addEventListener(
    "click",
    (event) => {

      if (
        accountMenu &&
        !accountMenu.contains(event.target) &&
        event.target !== accountButton
      ) {

        accountMenu.classList.add(
          "hidden"
        );
      }
    }
  );


  $("accountSignInBtn")?.addEventListener(
    "click",
    () => {

      accountMenu?.classList.add("hidden");

      openAuthModal(false);
    }
  );


  $("accountSignOutBtn")?.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        showToast(
          "Signed out",
          "success"
        );

      } catch (error) {

        console.error(error);

        showToast(
          "Could not sign out",
          "error"
        );
      }
    }
  );
}


// ============================================================
// AUTH
// ============================================================

function setupAuth() {

  onAuthStateChanged(
    auth,
    (user) => {

      updateAuthUI(user);
    }
  );


  $("authForm")?.addEventListener(
    "submit",
    handleAuthSubmit
  );


  $("authSwitchBtn")?.addEventListener(
    "click",
    () => {

      isCreatingAccount =
        !isCreatingAccount;

      updateAuthModalMode();
    }
  );


  $("accountSignInBtn")?.addEventListener(
    "click",
    () => openAuthModal(false)
  );
}


function updateAuthUI(user = auth.currentUser) {

  const email =
    $("accountEmail");

  const status =
    $("accountStatus");

  const initial =
    $("accountInitial");

  const signIn =
    $("accountSignInBtn");

  const signOutButton =
    $("accountSignOutBtn");


  if (user) {

    const userEmail =
      user.email || "User";


    if (email) {
      email.textContent =
        userEmail;
    }


    if (status) {
      status.textContent =
        "Signed in";
      status.className =
        "text-xs text-emerald-400 mt-1";
    }


    if (initial) {

      initial.textContent =
        userEmail
          .charAt(0)
          .toUpperCase();
    }


    signIn?.classList.add("hidden");

    signOutButton?.classList.remove("hidden");

  } else {

    if (email) {
      email.textContent =
        "Guest";
    }


    if (status) {

      status.textContent =
        "Not signed in";

      status.className =
        "text-xs text-gray-500 mt-1";
    }


    if (initial) {
      initial.textContent = "G";
    }


    signIn?.classList.remove("hidden");

    signOutButton?.classList.add("hidden");
  }
}


async function handleAuthSubmit(event) {

  event.preventDefault();


  const email =
    $("authEmail")?.value.trim();


  const password =
    $("authPassword")?.value;


  const errorBox =
    $("authError");


  const button =
    $("authSubmitBtn");


  if (!email || !password) {
    return;
  }


  errorBox?.classList.add("hidden");


  if (button) {

    button.disabled = true;

    button.textContent =
      isCreatingAccount
        ? "Creating account..."
        : "Signing in...";
  }


  try {

    if (isCreatingAccount) {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


      showToast(
        "Account created successfully",
        "success"
      );

    } else {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      showToast(
        "Signed in successfully",
        "success"
      );
    }


    closeModal("authModal");


    $("authForm")?.reset();

  } catch (error) {

    console.error(
      "Firebase auth error:",
      error
    );


    if (errorBox) {

      errorBox.textContent =
        getFriendlyAuthError(error);

      errorBox.classList.remove(
        "hidden"
      );
    }

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        isCreatingAccount
          ? "Create account"
          : "Sign in";
    }
  }
}


function getFriendlyAuthError(error) {

  const code =
    error?.code || "";


  if (
    code.includes(
      "auth/email-already-in-use"
    )
  ) {

    return "An account with this email already exists.";
  }


  if (
    code.includes(
      "auth/invalid-email"
    )
  ) {

    return "Please enter a valid email address.";
  }


  if (
    code.includes(
      "auth/weak-password"
    )
  ) {

    return "Password should be at least 6 characters.";
  }


  if (
    code.includes(
      "auth/invalid-credential"
    ) ||
    code.includes(
      "auth/wrong-password"
    ) ||
    code.includes(
      "auth/user-not-found"
    )
  ) {

    return "Incorrect email or password.";
  }


  if (
    code.includes(
      "auth/too-many-requests"
    )
  ) {

    return "Too many attempts. Please try again later.";
  }


  return (
    error?.message ||
    "Authentication failed."
  );
}


// ============================================================
// AUTH MODAL
// ============================================================

function openAuthModal(createAccount = false) {

  isCreatingAccount =
    createAccount;


  updateAuthModalMode();

  openModal("authModal");
}


function updateAuthModalMode() {

  const title =
    $("authTitle");

  const subtitle =
    $("authSubtitle");

  const submit =
    $("authSubmitBtn");

  const switchButton =
    $("authSwitchBtn");


  if (isCreatingAccount) {

    if (title) {
      title.textContent =
        "Create account";
    }


    if (subtitle) {
      subtitle.textContent =
        "Create your WebCode Studio account.";
    }


    if (submit) {
      submit.textContent =
        "Create account";
    }


    if (switchButton) {
      switchButton.textContent =
        "Already have an account? Sign in";
    }

  } else {

    if (title) {
      title.textContent =
        "Sign in";
    }


    if (subtitle) {
      subtitle.textContent =
        "Sign in to sync your projects.";
    }


    if (submit) {
      submit.textContent =
        "Sign in";
    }


    if (switchButton) {
      switchButton.textContent =
        "Create an account";
    }
  }
}


// ============================================================
// MODALS
// ============================================================

function setupModals() {

  // Auth

  $("closeAuthModal")?.addEventListener(
    "click",
    () => closeModal("authModal")
  );


  // File

  $("closeFileModal")?.addEventListener(
    "click",
    () => closeModal("fileModal")
  );


  $("cancelFileBtn")?.addEventListener(
    "click",
    () => closeModal("fileModal")
  );


  $("fileForm")?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      const input =
        $("fileNameInput");

      createNewFile(
        input?.value || ""
      );

      if (input) {
        input.value = "";
      }
    }
  );


  // Folder

  $("closeFolderModal")?.addEventListener(
    "click",
    () => closeModal("folderModal")
  );


  $("cancelFolderBtn")?.addEventListener(
    "click",
    () => closeModal("folderModal")
  );


  $("folderForm")?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      const input =
        $("folderNameInput");

      createNewFolder(
        input?.value || ""
      );

      if (input) {
        input.value = "";
      }
    }
  );


  // Dashboard

  $("closeDashboardModal")?.addEventListener(
    "click",
    () => closeModal("dashboardModal")
  );


  // Project

  $("closeProjectModal")?.addEventListener(
    "click",
    () => closeModal("projectModal")
  );


  $("cancelProjectBtn")?.addEventListener(
    "click",
    () => closeModal("projectModal")
  );


  $("projectForm")?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      const name =
        $("projectNameInput")?.value.trim();


      const description =
        $("projectDescriptionInput")?.value.trim();


      createProject(
        name,
        description
      );
    }
  );


  // Close modal by clicking backdrop

  document.querySelectorAll(
    ".modal-backdrop"
  ).forEach(modal => {

    modal.addEventListener(
      "click",
      (event) => {

        if (
          event.target === modal
        ) {

          modal.classList.add(
            "hidden"
          );
        }
      }
    );
  });


  // Escape key

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") {
        return;
      }


      document.querySelectorAll(
        ".modal-backdrop"
      ).forEach(modal => {

        modal.classList.add(
          "hidden"
        );
      });
    }
  );
}


function openModal(id) {

  const modal =
    $(id);

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "hidden"
  );


  const firstInput =
    modal.querySelector(
      "input, textarea"
    );


  setTimeout(
    () => firstInput?.focus(),
    100
  );
}


function closeModal(id) {

  const modal =
    $(id);

  modal?.classList.add(
    "hidden"
  );
}


// ============================================================
// CREATE PROJECT
// ============================================================

function createProject(
  name,
  description
) {

  if (!name) {

    showToast(
      "Enter a project name.",
      "error"
    );

    return;
  }


  const project = {

    id: createId(),

    name,

    description:
      description || "",

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

    files:
      cloneFiles(DEFAULT_FILES)
  };


  projects.push(project);

  currentProject =
    project;

  currentFilePath =
    "index.html";


  saveProjects();

  renderProject();

  openFile("index.html");

  closeModal("projectModal");

  showToast(
    `${name} created`,
    "success"
  );


  const nameInput =
    $("projectNameInput");

  const descriptionInput =
    $("projectDescriptionInput");


  if (nameInput) {
    nameInput.value = "";
  }


  if (descriptionInput) {
    descriptionInput.value = "";
  }
}


// ============================================================
// PROJECT DASHBOARD
// ============================================================

function renderProjects() {

  const container =
    $("projectList");

  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!projects.length) {

    container.innerHTML = `
      <div class="text-center py-10 text-gray-500">
        No projects yet.
      </div>
    `;

    return;
  }


  projects.forEach(project => {

    const card =
      document.createElement("div");

    card.className =
      "group rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition p-4 mb-3";


    const top =
      document.createElement("div");

    top.className =
      "flex items-start justify-between gap-3";


    const info =
      document.createElement("div");

    info.className =
      "min-w-0";


    const title =
      document.createElement("div");

    title.className =
      "font-medium truncate";

    title.textContent =
      project.name;


    const description =
      document.createElement("div");

    description.className =
      "text-xs text-gray-500 mt-1";

    description.textContent =
      project.description ||
      "Website project";


    info.appendChild(title);

    info.appendChild(description);


    const open =
      document.createElement("button");

    open.type = "button";

    open.className =
      "shrink-0 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition text-xs";

    open.textContent =
      "Open";


    open.addEventListener(
      "click",
      () => {

        currentProject =
          project;

        currentFilePath =
          "index.html";


        saveProjects();

        renderProject();

        openFile(
          project.files["index.html"]
            ? "index.html"
            : Object.keys(project.files)[0]
        );

        closeModal("dashboardModal");

        showToast(
          `${project.name} opened`,
          "success"
        );
      }
    );


    top.appendChild(info);

    top.appendChild(open);


    card.appendChild(top);


    container.appendChild(card);
  });
}


// ============================================================
// TOASTS
// ============================================================

function showToast(
  message,
  type = "info"
) {

  const container =
    $("toastContainer");

  if (!container) {
    return;
  }


  const toast =
    document.createElement("div");


  let icon = "";


  if (type === "success") {

    icon = `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="w-4 h-4"
      >
        <path d="m5 12 4 4L19 6"/>
      </svg>
    `;

  } else if (type === "error") {

    icon = `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="w-4 h-4"
      >
        <path d="M6 6l12 12M18 6 6 18"/>
      </svg>
    `;

  } else {

    icon = `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="w-4 h-4"
      >
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 11v5"/>
        <path d="M12 8h.01"/>
      </svg>
    `;
  }


  toast.className =
    "pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-[#151526]/95 backdrop-blur-xl shadow-xl px-4 py-3 text-sm text-white animate-pop";


  toast.innerHTML = `
    <span class="${
      type === "success"
        ? "text-emerald-400"
        : type === "error"
          ? "text-red-400"
          : "text-violet-400"
    }">
      ${icon}
    </span>

    <span>${escapeHtml(message)}</span>
  `;


  container.appendChild(toast);


  setTimeout(
    () => {

      toast.style.opacity = "0";

      toast.style.transform =
        "translateY(5px)";

      toast.style.transition =
        "opacity .2s ease, transform .2s ease";


      setTimeout(
        () => toast.remove(),
        220
      );

    },
    2600
  );
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ============================================================
// ID
// ============================================================

function createId() {

  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {

    return crypto.randomUUID();
  }


  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2)
  );
}


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
  "resize",
  () => {

    if (window.innerWidth >= 768) {

      closeMobileSidebar();
    }


    if (
      window.innerWidth < 768 &&
      $("previewPanel")?.style.display !== "none"
    ) {

      // Keep current mobile view.
      return;
    }


    if (window.innerWidth >= 768) {

      const editor =
        $("editorPanel");

      const preview =
        $("previewPanel");


      if (editor) {
        editor.style.display =
          "flex";
      }


      if (preview) {
        preview.style.display =
          "flex";
      }
    }
  }
);


// ============================================================
// PREVENT ACCIDENTAL PAGE ZOOM / GESTURE ISSUES
// ============================================================

document.addEventListener(
  "gesturestart",
  (event) => {
    event.preventDefault();
  },
  { passive: false }
);


document.addEventListener(
  "gesturechange",
  (event) => {
    event.preventDefault();
  },
  { passive: false }
);


// ============================================================
// INITIAL PREVIEW AFTER LOAD
// ============================================================

setTimeout(
  () => {

    if (currentProject) {

      updatePreview();
    }

  },
  500
);
