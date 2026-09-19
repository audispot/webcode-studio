/* =========================================================
   WEBCODE STUDIO V2
   app.js
   ========================================================= */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";


/* =========================================================
   CODEMIRROR
   ========================================================= */

import {
  EditorState
} from "https://esm.sh/@codemirror/state@6.5.2";

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


/* =========================================================
   FIREBASE
   ========================================================= */

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const elements = {
  app: $("app"),

  topProjectName: $("topProjectName"),
  sidebarProjectName: $("sidebarProjectName"),
  sidebarProjectStatus: $("sidebarProjectStatus"),

  mobileMenuBtn: $("mobileMenuBtn"),
  sidebar: $("sidebar"),
  sidebarOverlay: $("sidebarOverlay"),

  fileTree: $("fileTree"),
  tabsContainer: $("tabsContainer"),

  newFileBtn: $("newFileBtn"),
  newFolderBtn: $("newFolderBtn"),
  newProjectBtn: $("newProjectBtn"),

  codeEditor: $("codeEditor"),

  currentFileName: $("currentFileName"),
  currentFileIcon: $("currentFileIcon"),
  saveStatus: $("saveStatus"),

  previewFrame: $("previewFrame"),
  refreshPreviewBtn: $("refreshPreviewBtn"),

  workspace: $("workspace"),

  runBtn: $("runBtn"),
  saveBtn: $("saveBtn"),

  dashboardBtn: $("dashboardBtn"),
  dashboardModal: $("dashboardModal"),
  closeDashboardModal: $("closeDashboardModal"),
  projectList: $("projectList"),
  dashboardNewProjectBtn: $("dashboardNewProjectBtn"),

  projectModal: $("projectModal"),
  closeProjectModal: $("closeProjectModal"),
  cancelProjectBtn: $("cancelProjectBtn"),
  projectForm: $("projectForm"),
  projectNameInput: $("projectNameInput"),
  projectDescriptionInput: $("projectDescriptionInput"),

  fileModal: $("fileModal"),
  closeFileModal: $("closeFileModal"),
  cancelFileBtn: $("cancelFileBtn"),
  fileForm: $("fileForm"),
  fileNameInput: $("fileNameInput"),

  folderModal: $("folderModal"),
  closeFolderModal: $("closeFolderModal"),
  cancelFolderBtn: $("cancelFolderBtn"),
  folderForm: $("folderForm"),
  folderNameInput: $("folderNameInput"),

  accountBtn: $("accountBtn"),
  accountInitial: $("accountInitial"),
  accountMenu: $("accountMenu"),
  accountEmail: $("accountEmail"),
  accountStatus: $("accountStatus"),
  accountSignInBtn: $("accountSignInBtn"),
  accountSignOutBtn: $("accountSignOutBtn"),

  authModal: $("authModal"),
  closeAuthModal: $("closeAuthModal"),
  authTitle: $("authTitle"),
  authSubtitle: $("authSubtitle"),
  authForm: $("authForm"),
  authEmail: $("authEmail"),
  authPassword: $("authPassword"),
  authSubmitBtn: $("authSubmitBtn"),
  authSwitchBtn: $("authSwitchBtn"),
  authError: $("authError"),

  publishBtn: $("publishBtn"),

  desktopEditorTab: $("desktopEditorTab"),
  desktopPreviewTab: $("desktopPreviewTab"),

  mobileEditorBtn: $("mobileEditorBtn"),
  mobilePreviewBtn: $("mobilePreviewBtn"),
  mobileRunBtn: $("mobileRunBtn"),

  toastContainer: $("toastContainer")
};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const STORAGE_KEY = "webcode-studio-v2";

let currentUser = null;

let authMode = "signin";

let editorView = null;

let currentFileId = null;

let autosaveTimer = null;

let projectState = null;


/* =========================================================
   DEFAULT PROJECT
   ========================================================= */

const DEFAULT_PROJECT = {
  id: createId(),

  name: "My Website",

  description: "My first WebCode Studio website.",

  createdAt: new Date().toISOString(),

  updatedAt: new Date().toISOString(),

  files: [
    {
      id: createId(),

      name: "index.html",

      type: "file",

      language: "html",

      parent: null,

      content:
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>

<body>

  <main class="hero">
    <h1>Welcome to WebCode Studio</h1>

    <p>
      Start building your website.
    </p>

    <button id="helloButton">
      Click me
    </button>
  </main>

</body>
</html>`
    },

    {
      id: createId(),

      name: "style.css",

      type: "file",

      language: "css",

      parent: null,

      content:
`* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;

  display: grid;
  place-items: center;

  font-family:
    Arial,
    sans-serif;

  background:
    linear-gradient(
      135deg,
      #111827,
      #312e81
    );

  color: white;
}

.hero {
  width: min(90%, 700px);

  padding: 50px;

  text-align: center;

  border-radius: 24px;

  background:
    rgba(255, 255, 255, 0.08);

  border:
    1px solid
    rgba(255, 255, 255, 0.12);

  backdrop-filter: blur(20px);

  box-shadow:
    0 30px 80px
    rgba(0, 0, 0, 0.35);
}

h1 {
  margin-top: 0;

  font-size: clamp(
    2rem,
    6vw,
    4rem
  );
}

p {
  color: #cbd5e1;

  line-height: 1.7;
}

button {
  margin-top: 20px;

  padding:
    12px
    20px;

  border: 0;

  border-radius: 12px;

  background:
    #8b5cf6;

  color: white;

  font-size: 16px;

  cursor: pointer;
}

button:hover {
  background:
    #7c3aed;
}`
    },

    {
      id: createId(),

      name: "script.js",

      type: "file",

      language: "javascript",

      parent: null,

      content:
`const button =
  document.getElementById(
    "helloButton"
  );

if (button) {
  button.addEventListener(
    "click",
    () => {
      button.textContent =
        "It works!";
    }
  );
}`
    }
  ],

  folders: [],

  activeFileId: null
};


/* =========================================================
   ID GENERATOR
   ========================================================= */

function createId() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


function init() {

  loadProject();

  setupEvents();

  initializeEditor();

  renderEverything();

  setupFirebaseAuth();

  updatePreview();

}


/* =========================================================
   LOAD PROJECT
   ========================================================= */

function loadProject() {

  let stored = null;

  try {
    stored = localStorage.getItem(
      STORAGE_KEY
    );
  } catch (error) {
    console.warn(
      "Local storage unavailable.",
      error
    );
  }


  if (stored) {

    try {

      projectState =
        JSON.parse(stored);

    } catch (error) {

      console.warn(
        "Could not parse saved project.",
        error
      );

      projectState =
        createDefaultProject();

    }

  } else {

    projectState =
      createDefaultProject();

  }


  ensureProjectIntegrity();


  if (!projectState.activeFileId) {

    const indexFile =
      projectState.files.find(
        file =>
          file.name === "index.html"
      );

    if (indexFile) {
      projectState.activeFileId =
        indexFile.id;
    } else if (
      projectState.files.length
    ) {
      projectState.activeFileId =
        projectState.files[0].id;
    }

  }


  currentFileId =
    projectState.activeFileId;

}


function createDefaultProject() {

  const copy =
    JSON.parse(
      JSON.stringify(DEFAULT_PROJECT)
    );

  copy.id = createId();

  copy.files =
    copy.files.map(file => ({
      ...file,
      id: createId()
    }));

  copy.activeFileId =
    copy.files[0]?.id || null;

  return copy;
}


/* =========================================================
   PROJECT INTEGRITY
   ========================================================= */

function ensureProjectIntegrity() {

  if (!projectState) {
    projectState =
      createDefaultProject();

    return;
  }

  if (
    !projectState.files ||
    !Array.isArray(projectState.files)
  ) {
    projectState.files = [];
  }

  if (
    !projectState.folders ||
    !Array.isArray(projectState.folders)
  ) {
    projectState.folders = [];
  }

  if (!projectState.name) {
    projectState.name =
      "My Website";
  }

  if (!projectState.id) {
    projectState.id =
      createId();
  }

  if (!projectState.createdAt) {
    projectState.createdAt =
      new Date().toISOString();
  }

  if (!projectState.updatedAt) {
    projectState.updatedAt =
      new Date().toISOString();
  }

}


/* =========================================================
   SAVE LOCAL PROJECT
   ========================================================= */

function saveProjectLocal() {

  projectState.updatedAt =
    new Date().toISOString();

  projectState.activeFileId =
    currentFileId;

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        projectState
      )
    );

    setSaveStatus(
      "Saved locally"
    );

  } catch (error) {

    console.error(
      "Could not save project.",
      error
    );

    setSaveStatus(
      "Local save failed"
    );

    showToast(
      "Could not save locally.",
      "error"
    );

  }

}


/* =========================================================
   SETUP EVENTS
   ========================================================= */

function setupEvents() {

  /* Mobile sidebar */

  elements.mobileMenuBtn?.addEventListener(
    "click",
    toggleSidebar
  );

  elements.sidebarOverlay?.addEventListener(
    "click",
    closeSidebar
  );


  /* Files */

  elements.newFileBtn?.addEventListener(
    "click",
    openFileModal
  );

  elements.newFolderBtn?.addEventListener(
    "click",
    openFolderModal
  );


  /* Projects */

  elements.newProjectBtn?.addEventListener(
    "click",
    openProjectModal
  );

  elements.dashboardNewProjectBtn?.addEventListener(
    "click",
    () => {

      closeDashboardModal();

      openProjectModal();

    }
  );


  /* Dashboard */

  elements.dashboardBtn?.addEventListener(
    "click",
    openDashboardModal
  );

  elements.closeDashboardModal?.addEventListener(
    "click",
    closeDashboardModal
  );


  /* Project modal */

  elements.closeProjectModal?.addEventListener(
    "click",
    closeProjectModal
  );

  elements.cancelProjectBtn?.addEventListener(
    "click",
    closeProjectModal
  );

  elements.projectForm?.addEventListener(
    "submit",
    handleCreateProject
  );


  /* File modal */

  elements.closeFileModal?.addEventListener(
    "click",
    closeFileModal
  );

  elements.cancelFileBtn?.addEventListener(
    "click",
    closeFileModal
  );

  elements.fileForm?.addEventListener(
    "submit",
    handleCreateFile
  );


  /* Folder modal */

  elements.closeFolderModal?.addEventListener(
    "click",
    closeFolderModal
  );

  elements.cancelFolderBtn?.addEventListener(
    "click",
    closeFolderModal
  );

  elements.folderForm?.addEventListener(
    "submit",
    handleCreateFolder
  );


  /* Account */

  elements.accountBtn?.addEventListener(
    "click",
    toggleAccountMenu
  );

  elements.accountSignInBtn?.addEventListener(
    "click",
    () => {

      closeAccountMenu();

      openAuthModal("signin");

    }
  );

  elements.accountSignOutBtn?.addEventListener(
    "click",
    handleSignOut
  );


  /* Auth */

  elements.closeAuthModal?.addEventListener(
    "click",
    closeAuthModal
  );

  elements.authForm?.addEventListener(
    "submit",
    handleAuthSubmit
  );

  elements.authSwitchBtn?.addEventListener(
    "click",
    toggleAuthMode
  );


  /* Save / run */

  elements.saveBtn?.addEventListener(
    "click",
    () => {

      saveCurrentEditor();

      saveProjectLocal();

      showToast(
        "Project saved.",
        "success"
      );

    }
  );


  elements.runBtn?.addEventListener(
    "click",
    () => {

      saveCurrentEditor();

      updatePreview();

      showPreview();

    }
  );


  elements.refreshPreviewBtn?.addEventListener(
    "click",
    () => {

      saveCurrentEditor();

      updatePreview();

    }
  );


  /* Desktop views */

  elements.desktopEditorTab?.addEventListener(
    "click",
    showEditor
  );

  elements.desktopPreviewTab?.addEventListener(
    "click",
    showPreview
  );


  /* Mobile views */

  elements.mobileEditorBtn?.addEventListener(
    "click",
    showEditor
  );

  elements.mobilePreviewBtn?.addEventListener(
    "click",
    showPreview
  );

  elements.mobileRunBtn?.addEventListener(
    "click",
    () => {

      saveCurrentEditor();

      updatePreview();

      showPreview();

    }
  );


  /* Publish */

  elements.publishBtn?.addEventListener(
    "click",
    handlePublish
  );


  /* Close menus/modals with Escape */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") {
        return;
      }

      closeSidebar();
      closeAccountMenu();

      closeFileModal();
      closeFolderModal();
      closeProjectModal();
      closeDashboardModal();
      closeAuthModal();

    }
  );


  /* Close account menu if clicking outside */

  document.addEventListener(
    "click",
    event => {

      if (
        elements.accountMenu?.classList.contains(
          "hidden"
        )
      ) {
        return;
      }

      const clickedAccount =
        elements.accountBtn?.contains(
          event.target
        );

      const clickedMenu =
        elements.accountMenu?.contains(
          event.target
        );

      if (
        !clickedAccount &&
        !clickedMenu
      ) {
        closeAccountMenu();
      }

    }
  );

}


/* =========================================================
   CODEMIRROR INITIALIZATION
   ========================================================= */

function initializeEditor() {

  if (!elements.codeEditor) {
    return;
  }


  const activeFile =
    getCurrentFile();


  const startContent =
    activeFile?.content || "";


  const state =
    EditorState.create({

      doc: startContent,

      extensions: [

        basicSetup,

        history(),

        keymap.of([
          ...defaultKeymap,
          ...historyKeymap
        ]),

        oneDark,

        EditorView.lineWrapping,

        EditorView.updateListener.of(
          update => {

            if (
              !update.docChanged
            ) {
              return;
            }

            handleEditorChanged();

          }
        ),

        EditorView.theme({

          "&": {
            height: "100%"
          },

          ".cm-content": {
            caretColor:
              "#c4b5fd"
          },

          ".cm-cursor": {
            borderLeftColor:
              "#c4b5fd"
          }

        })

      ]

    });


  editorView =
    new EditorView({

      state,

      parent:
        elements.codeEditor

    });

}


/* =========================================================
   CHANGE CODEMIRROR LANGUAGE
   ========================================================= */

function getLanguageExtension(
  file
) {

  if (!file) {
    return [];
  }

  const language =
    file.language ||
    detectLanguage(
      file.name
    );


  if (language === "html") {
    return [html()];
  }

  if (language === "css") {
    return [css()];
  }

  if (
    language === "javascript"
  ) {
    return [
      javascript({
        jsx: true
      })
    ];
  }

  return [];

}


/* =========================================================
   DETECT LANGUAGE
   ========================================================= */

function detectLanguage(
  filename
) {

  const extension =
    filename
      .split(".")
      .pop()
      .toLowerCase();


  if (
    extension === "html" ||
    extension === "htm"
  ) {
    return "html";
  }


  if (
    extension === "css"
  ) {
    return "css";
  }


  if (
    extension === "js" ||
    extension === "mjs" ||
    extension === "jsx"
  ) {
    return "javascript";
  }


  if (
    extension === "json"
  ) {
    return "javascript";
  }


  return "text";

}


/* =========================================================
   OPEN FILE
   ========================================================= */

function openFile(
  fileId
) {

  saveCurrentEditor();


  const file =
    projectState.files.find(
      item =>
        item.id === fileId
    );


  if (!file) {
    return;
  }


  currentFileId =
    file.id;

  projectState.activeFileId =
    file.id;


  if (!editorView) {
    return;
  }


  const languageExtensions =
    getLanguageExtension(
      file
    );


  const currentState =
    editorView.state;


  const newState =
    EditorState.create({

      doc:
        file.content || "",

      selection: {
        anchor: 0
      },

      extensions: [

        basicSetup,

        history(),

        keymap.of([
          ...defaultKeymap,
          ...historyKeymap
        ]),

        oneDark,

        EditorView.lineWrapping,

        ...languageExtensions,

        EditorView.updateListener.of(
          update => {

            if (
              update.docChanged
            ) {
              handleEditorChanged();
            }

          }
        ),

        EditorView.theme({

          "&": {
            height: "100%"
          },

          ".cm-content": {
            caretColor:
              "#c4b5fd"
          },

          ".cm-cursor": {
            borderLeftColor:
              "#c4b5fd"
          }

        })

      ]

    });


  editorView.setState(
    newState
  );


  renderEverything();

  updatePreview();

  closeSidebar();

}


/* =========================================================
   CURRENT FILE
   ========================================================= */

function getCurrentFile() {

  return projectState.files.find(
    file =>
      file.id === currentFileId
  ) || null;

}


/* =========================================================
   SAVE CURRENT EDITOR CONTENT
   ========================================================= */

function saveCurrentEditor() {

  if (
    !editorView ||
    !currentFileId
  ) {
    return;
  }


  const file =
    projectState.files.find(
      item =>
        item.id === currentFileId
    );


  if (!file) {
    return;
  }


  file.content =
    editorView.state.doc.toString();

  file.updatedAt =
    new Date().toISOString();


  projectState.updatedAt =
    new Date().toISOString();


  setSaveStatus(
    "Unsaved changes"
  );

}


/* =========================================================
   EDITOR CHANGED
   ========================================================= */

function handleEditorChanged() {

  saveCurrentEditor();


  setSaveStatus(
    "Saving..."
  );


  clearTimeout(
    autosaveTimer
  );


  autosaveTimer =
    setTimeout(
      () => {

        saveProjectLocal();

        /*
          Cloud autosave will be connected
          to the Cloudflare Worker later.
        */

      },
      700
    );

}


/* =========================================================
   SAVE STATUS
   ========================================================= */

function setSaveStatus(
  status
) {

  if (
    elements.saveStatus
  ) {
    elements.saveStatus.textContent =
      status;
  }

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderEverything() {

  renderProjectNames();

  renderFileTree();

  renderTabs();

  renderCurrentFileLabel();

}


/* =========================================================
   PROJECT NAME
   ========================================================= */

function renderProjectNames() {

  const name =
    projectState.name ||
    "My Website";


  if (
    elements.topProjectName
  ) {
    elements.topProjectName.textContent =
      name;
  }


  if (
    elements.sidebarProjectName
  ) {
    elements.sidebarProjectName.textContent =
      name;
  }


  if (
    elements.sidebarProjectStatus
  ) {

    elements.sidebarProjectStatus.textContent =
      currentUser
        ? "Cloud account connected"
        : "Local project";

  }

}


/* =========================================================
   FILE TREE
   ========================================================= */

function renderFileTree() {

  if (!elements.fileTree) {
    return;
  }


  elements.fileTree.innerHTML = "";


  const rootFiles =
    projectState.files.filter(
      file =>
        !file.parent
    );


  const rootFolders =
    projectState.folders.filter(
      folder =>
        !folder.parent
    );


  /*
    Folders first.
  */

  rootFolders.forEach(
    folder => {

      elements.fileTree.appendChild(
        createFolderElement(
          folder,
          0
        )
      );

    }
  );


  /*
    Files.
  */

  rootFiles.forEach(
    file => {

      elements.fileTree.appendChild(
        createFileElement(
          file,
          0
        )
      );

    }
  );


  if (
    !rootFiles.length &&
    !rootFolders.length
  ) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "px-3 py-8 text-center text-xs text-gray-600";

    empty.textContent =
      "No files yet.";

    elements.fileTree.appendChild(
      empty
    );

  }

}


/* =========================================================
   FILE ELEMENT
   ========================================================= */

function createFileElement(
  file,
  depth
) {

  const wrapper =
    document.createElement(
      "div"
    );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "file-tree-item";


  if (
    file.id === currentFileId
  ) {
    row.classList.add(
      "active"
    );
  }


  row.style.paddingLeft =
    `${8 + depth * 16}px`;


  const icon =
    document.createElement(
      "span"
    );


  icon.className =
    getFileIconClass(
      file
    );


  icon.innerHTML =
    getFileIcon(
      file
    );


  const name =
    document.createElement(
      "span"
    );


  name.className =
    "truncate flex-1";


  name.textContent =
    file.name;


  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "file-actions flex items-center";


  const deleteButton =
    document.createElement(
      "button"
    );


  deleteButton.type =
    "button";


  deleteButton.className =
    "w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 text-gray-600";


  deleteButton.title =
    "Delete file";


  deleteButton.innerHTML =
    `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-3.5 h-3.5"
      >
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v5M14 11v5"/>
      </svg>
    `;


  deleteButton.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      deleteFile(
        file.id
      );

    }
  );


  actions.appendChild(
    deleteButton
  );


  row.appendChild(icon);
  row.appendChild(name);
  row.appendChild(actions);


  row.addEventListener(
    "click",
    () => {

      openFile(
        file.id
      );

    }
  );


  wrapper.appendChild(row);


  return wrapper;

}


/* =========================================================
   FOLDER ELEMENT
   ========================================================= */

function createFolderElement(
  folder,
  depth
) {

  const wrapper =
    document.createElement(
      "div"
    );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "file-tree-item file-tree-folder";


  row.style.paddingLeft =
    `${8 + depth * 16}px`;


  const arrow =
    document.createElement(
      "span"
    );


  arrow.className =
    "folder-arrow";


  arrow.innerHTML =
    `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-3.5 h-3.5"
      >
        <path d="m9 18 6-6-6-6"/>
      </svg>
    `;


  const icon =
    document.createElement(
      "span"
    );


  icon.innerHTML =
    `
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


  const name =
    document.createElement(
      "span"
    );


  name.className =
    "truncate flex-1";


  name.textContent =
    folder.name;


  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "file-actions flex items-center";


  const deleteButton =
    document.createElement(
      "button"
    );


  deleteButton.type =
    "button";


  deleteButton.className =
    "w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 text-gray-600";


  deleteButton.title =
    "Delete folder";


  deleteButton.innerHTML =
    `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-3.5 h-3.5"
      >
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
      </svg>
    `;


  deleteButton.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      deleteFolder(
        folder.id
      );

    }
  );


  actions.appendChild(
    deleteButton
  );


  row.appendChild(
    arrow
  );

  row.appendChild(
    icon
  );

  row.appendChild(
    name
  );

  row.appendChild(
    actions
  );


  const children =
    document.createElement(
      "div"
    );


  children.className =
    "file-tree-children hidden";


  const childFiles =
    projectState.files.filter(
      file =>
        file.parent === folder.id
    );


  const childFolders =
    projectState.folders.filter(
      item =>
        item.parent === folder.id
    );


  childFolders.forEach(
    childFolder => {

      children.appendChild(
        createFolderElement(
          childFolder,
          depth + 1
        )
      );

    }
  );


  childFiles.forEach(
    file => {

      children.appendChild(
        createFileElement(
          file,
          depth + 1
        )
      );

    }
  );


  row.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      const isClosed =
        children.classList.contains(
          "hidden"
        );


      children.classList.toggle(
        "hidden"
      );


      row.classList.toggle(
        "open",
        isClosed
      );

    }
  );


  wrapper.appendChild(
    row
  );

  wrapper.appendChild(
    children
  );


  return wrapper;

}


/* =========================================================
   FILE ICON
   ========================================================= */

function getFileIcon(
  file
) {

  const language =
    file.language ||
    detectLanguage(
      file.name
    );


  if (
    language === "html"
  ) {

    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-4 h-4"
      >
        <path d="m8 9-4 3 4 3"/>
        <path d="m16 9 4 3-4 3"/>
        <path d="m14 5-4 14"/>
      </svg>
    `;

  }


  if (
    language === "css"
  ) {

    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-4 h-4"
      >
        <path d="m8 9-4 3 4 3"/>
        <path d="m16 9 4 3-4 3"/>
        <path d="m14 5-4 14"/>
      </svg>
    `;

  }


  if (
    language === "javascript"
  ) {

    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-4 h-4"
      >
        <path d="M4 4h16v16H4z"/>
        <path d="M9 17c1.5 1 3 .4 3-1V9"/>
        <path d="M15 13v4"/>
      </svg>
    `;

  }


  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      class="w-4 h-4"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
    </svg>
  `;

}


function getFileIconClass(
  file
) {

  const language =
    file.language ||
    detectLanguage(
      file.name
    );


  if (
    language === "html"
  ) {
    return "text-orange-400";
  }

  if (
    language === "css"
  ) {
    return "text-blue-400";
  }

  if (
    language === "javascript"
  ) {
    return "text-yellow-400";
  }

  return "text-gray-500";

}


/* =========================================================
   TABS
   ========================================================= */

function renderTabs() {

  if (!elements.tabsContainer) {
    return;
  }


  elements.tabsContainer.innerHTML =
    "";


  const openFiles =
    getOpenFiles();


  openFiles.forEach(
    file => {

      const tab =
        document.createElement(
          "button"
        );


      tab.type =
        "button";


      tab.className =
        "editor-tab";


      if (
        file.id === currentFileId
      ) {
        tab.classList.add(
          "active"
        );
      }


      const icon =
        document.createElement(
          "span"
        );


      icon.className =
        getFileIconClass(
          file
        );


      icon.innerHTML =
        getFileIcon(
          file
        );


      const name =
        document.createElement(
          "span"
        );


      name.textContent =
        file.name;


      const close =
        document.createElement(
          "span"
        );


      close.className =
        "editor-tab-close";


      close.innerHTML =
        `
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="w-3.5 h-3.5"
          >
            <path d="m6 6 12 12M18 6 6 18"/>
          </svg>
        `;


      close.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          closeTab(
            file.id
          );

        }
      );


      tab.appendChild(
        icon
      );

      tab.appendChild(
        name
      );

      tab.appendChild(
        close
      );


      tab.addEventListener(
        "click",
        () => {

          openFile(
            file.id
          );

        }
      );


      elements.tabsContainer.appendChild(
        tab
      );

    });

}


/* =========================================================
   OPEN FILES
   ========================================================= */

function getOpenFiles() {

  /*
    V2 keeps the currently active file and
    recently used files available.

    Later this can be replaced by a dedicated
    open-tabs array.
  */

  const files =
    projectState.files;


  if (!files.length) {
    return [];
  }


  return files;

}


/* =========================================================
   CLOSE TAB
   ========================================================= */

function closeTab(
  fileId
) {

  const files =
    projectState.files;


  if (
    files.length <= 1
  ) {

    showToast(
      "Keep at least one file open.",
      "info"
    );

    return;

  }


  if (
    fileId === currentFileId
  ) {

    const index =
      files.findIndex(
        file =>
          file.id === fileId
      );


    const nextFile =
      files[index + 1] ||
      files[index - 1];


    if (nextFile) {
      openFile(
        nextFile.id
      );
    }

  }


  renderTabs();

}


/* =========================================================
   CURRENT FILE LABEL
   ========================================================= */

function renderCurrentFileLabel() {

  const file =
    getCurrentFile();


  if (!file) {

    if (
      elements.currentFileName
    ) {
      elements.currentFileName.textContent =
        "No file";
    }

    return;

  }


  elements.currentFileName.textContent =
    file.name;


  if (
    elements.currentFileIcon
  ) {

    elements.currentFileIcon.className =
      getFileIconClass(
        file
      );

    elements.currentFileIcon.innerHTML =
      getFileIcon(
        file
      );

  }

}


/* =========================================================
   CREATE FILE
   ========================================================= */

function handleCreateFile(
  event
) {

  event.preventDefault();


  const rawName =
    elements.fileNameInput
      .value
      .trim();


  if (!rawName) {
    return;
  }


  const name =
    sanitizePath(
      rawName
    );


  if (!name) {
    showToast(
      "Enter a valid file name.",
      "error"
    );

    return;
  }


  const existing =
    projectState.files.some(
      file =>
        file.name === name &&
        file.parent === null
    );


  if (existing) {

    showToast(
      "A file with that name already exists.",
      "error"
    );

    return;

  }


  const file = {

    id: createId(),

    name,

    type: "file",

    language:
      detectLanguage(
        name
      ),

    parent: null,

    content:
      getStarterContent(
        name
      ),

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()

  };


  projectState.files.push(
    file
  );


  saveProjectLocal();

  closeFileModal();

  openFile(
    file.id
  );


  showToast(
    `${name} created.`,
    "success"
  );

}


/* =========================================================
   STARTER CONTENT
   ========================================================= */

function getStarterContent(
  filename
) {

  const language =
    detectLanguage(
      filename
    );


  if (
    language === "html"
  ) {

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
</head>
<body>

</body>
</html>`;

  }


  if (
    language === "css"
  ) {

    return `/* ${filename} */

`;

  }


  if (
    language === "javascript"
  ) {

    return `// ${filename}

`;

  }


  return "";

}


/* =========================================================
   DELETE FILE
   ========================================================= */

function deleteFile(
  fileId
) {

  const file =
    projectState.files.find(
      item =>
        item.id === fileId
    );


  if (!file) {
    return;
  }


  /*
    Don't use browser confirm dialogs.
    Use our own confirmation flow.
  */

  const shouldDelete =
    window.confirm(
      `Delete ${file.name}?`
    );


  if (!shouldDelete) {
    return;
  }


  projectState.files =
    projectState.files.filter(
      item =>
        item.id !== fileId
    );


  if (
    currentFileId === fileId
  ) {

    const nextFile =
      projectState.files[0];


    currentFileId =
      nextFile?.id || null;


    projectState.activeFileId =
      currentFileId;


    if (nextFile) {
      openFile(
        nextFile.id
      );
    } else if (
      editorView
    ) {

      editorView.dispatch({
        changes: {
          from: 0,
          to:
            editorView.state.doc.length,
          insert: ""
        }
      });

    }

  }


  saveProjectLocal();

  renderEverything();

  updatePreview();


  showToast(
    `${file.name} deleted.`,
    "success"
  );

}


/* =========================================================
   CREATE FOLDER
   ========================================================= */

function handleCreateFolder(
  event
) {

  event.preventDefault();


  const name =
    elements.folderNameInput
      .value
      .trim();


  if (!name) {
    return;
  }


  const existing =
    projectState.folders.some(
      folder =>
        folder.name === name &&
        folder.parent === null
    );


  if (existing) {

    showToast(
      "A folder with that name already exists.",
      "error"
    );

    return;

  }


  const folder = {

    id: createId(),

    name,

    type: "folder",

    parent: null,

    createdAt:
      new Date().toISOString()

  };


  projectState.folders.push(
    folder
  );


  saveProjectLocal();

  closeFolderModal();

  renderFileTree();


  showToast(
    `${name} folder created.`,
    "success"
  );

}


/* =========================================================
   DELETE FOLDER
   ========================================================= */

function deleteFolder(
  folderId
) {

  const folder =
    projectState.folders.find(
      item =>
        item.id === folderId
    );


  if (!folder) {
    return;
  }


  const shouldDelete =
    window.confirm(
      `Delete folder "${folder.name}" and its contents?`
    );


  if (!shouldDelete) {
    return;
  }


  const descendantFolderIds =
    getDescendantFolderIds(
      folderId
    );


  const allFolderIds =
    [
      folderId,
      ...descendantFolderIds
    ];


  projectState.folders =
    projectState.folders.filter(
      item =>
        !allFolderIds.includes(
          item.id
        )
    );


  projectState.files =
    projectState.files.filter(
      file =>
        !allFolderIds.includes(
          file.parent
        )
    );


  if (
    currentFileId &&
    !projectState.files.some(
      file =>
        file.id === currentFileId
    )
  ) {

    const firstFile =
      projectState.files[0];


    currentFileId =
      firstFile?.id || null;


    if (firstFile) {
      openFile(
        firstFile.id
      );
    }

  }


  saveProjectLocal();

  renderEverything();

  updatePreview();


  showToast(
    "Folder deleted.",
    "success"
  );

}


/* =========================================================
   DESCENDANT FOLDERS
   ========================================================= */

function getDescendantFolderIds(
  parentId
) {

  const result = [];


  const children =
    projectState.folders.filter(
      folder =>
        folder.parent === parentId
    );


  children.forEach(
    child => {

      result.push(
        child.id
      );

      result.push(
        ...getDescendantFolderIds(
          child.id
        )
      );

    }
  );


  return result;

}


/* =========================================================
   PATH SANITIZER
   ========================================================= */

function sanitizePath(
  value
) {

  return value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\.\./g, "")
    .trim();

}


/* =========================================================
   PREVIEW
   ========================================================= */

function updatePreview() {

  saveCurrentEditor();


  const htmlFile =
    findFileByName(
      "index.html"
    );


  if (!htmlFile) {

    elements.previewFrame.srcdoc =
      `
      <!DOCTYPE html>
      <html>
      <body style="
        margin:0;
        min-height:100vh;
        display:grid;
        place-items:center;
        font-family:Arial,sans-serif;
        color:#555;
      ">
        <div>
          <h2>No index.html</h2>
          <p>Create an index.html file to preview your site.</p>
        </div>
      </body>
      </html>
      `;

    return;

  }


  let documentHtml =
    htmlFile.content || "";


  const cssFiles =
    projectState.files.filter(
      file =>
        detectLanguage(
          file.name
        ) === "css"
    );


  const jsFiles =
    projectState.files.filter(
      file =>
        detectLanguage(
          file.name
        ) === "javascript"
    );


  const css =
    cssFiles
      .map(
        file =>
          file.content || ""
      )
      .join("\n");


  const js =
    jsFiles
      .map(
        file =>
          file.content || ""
      )
      .join("\n");


  documentHtml =
    injectStyles(
      documentHtml,
      css
    );


  documentHtml =
    injectScript(
      documentHtml,
      js
    );


  /*
    A CSP prevents the preview from
    accidentally reaching the parent app.
  */

  const securityMeta =
    `
    <meta
      http-equiv="Content-Security-Policy"
      content="
        default-src 'none';
        style-src 'unsafe-inline';
        script-src 'unsafe-inline';
        img-src data: blob:;
        font-src data:;
      "
    >
    `;


  documentHtml =
    documentHtml.replace(
      /<head([^>]*)>/i,
      `<head$1>${securityMeta}`
    );


  elements.previewFrame.srcdoc =
    documentHtml;

}


/* =========================================================
   INJECT CSS
   ========================================================= */

function injectStyles(
  htmlContent,
  cssContent
) {

  if (!cssContent.trim()) {
    return htmlContent;
  }


  const styleTag =
    `
    <style>
      ${cssContent}
    </style>
    `;


  if (
    /<\/head>/i.test(
      htmlContent
    )
  ) {

    return htmlContent.replace(
      /<\/head>/i,
      `${styleTag}</head>`
    );

  }


  return `
    <style>
      ${cssContent}
    </style>
    ${htmlContent}
  `;

}


/* =========================================================
   INJECT JAVASCRIPT
   ========================================================= */

function injectScript(
  htmlContent,
  jsContent
) {

  if (!jsContent.trim()) {
    return htmlContent;
  }


  const scriptTag =
    `
    <script>
      ${jsContent}
    <\/script>
    `;


  if (
    /<\/body>/i.test(
      htmlContent
    )
  ) {

    return htmlContent.replace(
      /<\/body>/i,
      `${scriptTag}</body>`
    );

  }


  return `
    ${htmlContent}
    ${scriptTag}
  `;

}


/* =========================================================
   FIND FILE
   ========================================================= */

function findFileByName(
  name
) {

  return projectState.files.find(
    file =>
      file.name.toLowerCase() ===
      name.toLowerCase()
  );

}


/* =========================================================
   EDITOR / PREVIEW SWITCHING
   ========================================================= */

function showEditor() {

  elements.workspace.classList.remove(
    "preview-mode"
  );


  elements.desktopEditorTab?.classList.add(
    "active"
  );

  elements.desktopPreviewTab?.classList.remove(
    "active"
  );


  elements.mobileEditorBtn?.classList.add(
    "active"
  );

  elements.mobilePreviewBtn?.classList.remove(
    "active"
  );


  if (editorView) {

    setTimeout(
      () => {
        editorView.requestMeasure();
      },
      30
    );

  }

}


function showPreview() {

  saveCurrentEditor();

  updatePreview();


  elements.workspace.classList.add(
    "preview-mode"
  );


  elements.desktopEditorTab?.classList.remove(
    "active"
  );

  elements.desktopPreviewTab?.classList.add(
    "active"
  );


  elements.mobileEditorBtn?.classList.remove(
    "active"
  );

  elements.mobilePreviewBtn?.classList.add(
    "active"
  );

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

  elements.sidebar.classList.toggle(
    "mobile-open"
  );


  const isOpen =
    elements.sidebar.classList.contains(
      "mobile-open"
    );


  elements.sidebarOverlay.classList.toggle(
    "hidden",
    !isOpen
  );

}


function closeSidebar() {

  elements.sidebar?.classList.remove(
    "mobile-open"
  );

  elements.sidebarOverlay?.classList.add(
    "hidden"
  );

}


/* =========================================================
   FILE MODAL
   ========================================================= */

function openFileModal() {

  elements.fileModal.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {
      elements.fileNameInput?.focus();
    },
    50
  );

}


function closeFileModal() {

  elements.fileModal.classList.add(
    "hidden"
  );


  elements.fileForm?.reset();

}


/* =========================================================
   FOLDER MODAL
   ========================================================= */

function openFolderModal() {

  elements.folderModal.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {
      elements.folderNameInput?.focus();
    },
    50
  );

}


function closeFolderModal() {

  elements.folderModal.classList.add(
    "hidden"
  );


  elements.folderForm?.reset();

}


/* =========================================================
   PROJECT MODAL
   ========================================================= */

function openProjectModal() {

  elements.projectModal.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {
      elements.projectNameInput?.focus();
    },
    50
  );

}


function closeProjectModal() {

  elements.projectModal.classList.add(
    "hidden"
  );


  elements.projectForm?.reset();

}


/* =========================================================
   CREATE PROJECT
   ========================================================= */

function handleCreateProject(
  event
) {

  event.preventDefault();


  const name =
    elements.projectNameInput
      .value
      .trim();


  const description =
    elements.projectDescriptionInput
      .value
      .trim();


  if (!name) {
    return;
  }


  saveCurrentEditor();


  /*
    For now the dashboard supports
    multiple local projects.
  */

  const projects =
    loadProjects();


  const project =
    createDefaultProject();


  project.name =
    name;

  project.description =
    description;


  projects.push(
    project
  );


  saveProjects(
    projects
  );


  projectState =
    project;


  currentFileId =
    project.files[0]?.id ||
    null;


  closeProjectModal();

  closeDashboardModal();


  /*
    Reinitialize CodeMirror with
    the new project's first file.
  */

  openFile(
    currentFileId
  );


  renderEverything();

  updatePreview();


  showToast(
    `${name} created.`,
    "success"
  );

}


/* =========================================================
   PROJECT LIST
   ========================================================= */

function loadProjects() {

  try {

    const raw =
      localStorage.getItem(
        "webcode-studio-projects-v2"
      );


    if (!raw) {

      return [
        projectState
      ];

    }


    const projects =
      JSON.parse(raw);


    if (
      !Array.isArray(
        projects
      )
    ) {

      return [
        projectState
      ];

    }


    /*
      Make sure current project
      is included.
    */

    const exists =
      projects.some(
        project =>
          project.id ===
          projectState.id
      );


    if (!exists) {
      projects.push(
        projectState
      );
    }


    return projects;

  } catch (error) {

    console.warn(
      "Could not load projects.",
      error
    );


    return [
      projectState
    ];

  }

}


function saveProjects(
  projects
) {

  try {

    localStorage.setItem(
      "webcode-studio-projects-v2",
      JSON.stringify(
        projects
      )
    );

  } catch (error) {

    console.warn(
      "Could not save projects.",
      error
    );

  }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function openDashboardModal() {

  saveCurrentEditor();

  saveProjectLocal();


  elements.dashboardModal.classList.remove(
    "hidden"
  );


  renderProjectDashboard();

}


function closeDashboardModal() {

  elements.dashboardModal.classList.add(
    "hidden"
  );

}


/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function renderProjectDashboard() {

  const projects =
    loadProjects();


  elements.projectList.innerHTML =
    "";


  if (!projects.length) {

    elements.projectList.innerHTML =
      `
      <div class="
        py-12
        text-center
        text-gray-500
        text-sm
      ">
        No projects yet.
      </div>
      `;

    return;

  }


  projects.forEach(
    project => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "project-card mb-3";


      const top =
        document.createElement(
          "div"
        );


      top.className =
        "flex items-start justify-between gap-3";


      const information =
        document.createElement(
          "div"
        );


      information.className =
        "min-w-0 flex-1";


      const title =
        document.createElement(
          "div"
        );


      title.className =
        "font-medium text-sm truncate";


      title.textContent =
        project.name;


      const description =
        document.createElement(
          "div"
        );


      description.className =
        "text-xs text-gray-500 mt-1 line-clamp-2";


      description.textContent =
        project.description ||
        "No description";


      const stats =
        document.createElement(
          "div"
        );


      stats.className =
        "text-[10px] text-gray-600 mt-3";


      stats.textContent =
        `${project.files?.length || 0} files`;


      information.appendChild(
        title
      );

      information.appendChild(
        description
      );

      information.appendChild(
        stats
      );


      const open =
        document.createElement(
          "button"
        );


      open.type =
        "button";


      open.className =
        "px-3 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300";


      open.textContent =
        project.id ===
        projectState.id
          ? "Current"
          : "Open";


      open.disabled =
        project.id ===
        projectState.id;


      open.addEventListener(
        "click",
        () => {

          switchProject(
            project.id
          );

        }
      );


      top.appendChild(
        information
      );

      top.appendChild(
        open
      );


      card.appendChild(
        top
      );


      elements.projectList.appendChild(
        card
      );

    });

}


/* =========================================================
   SWITCH PROJECT
   ========================================================= */

function switchProject(
  projectId
) {

  saveCurrentEditor();

  saveProjectLocal();


  const projects =
    loadProjects();


  const project =
    projects.find(
      item =>
        item.id === projectId
    );


  if (!project) {
    return;
  }


  projectState =
    project;


  ensureProjectIntegrity();


  currentFileId =
    projectState.activeFileId ||
    projectState.files[0]?.id ||
    null;


  closeDashboardModal();


  if (currentFileId) {

    openFile(
      currentFileId
    );

  }


  renderEverything();

  updatePreview();


  showToast(
    `Opened ${project.name}.`,
    "success"
  );

}


/* =========================================================
   AUTH MODAL
   ========================================================= */

function openAuthModal(
  mode = "signin"
) {

  authMode =
    mode;


  updateAuthModal();


  elements.authModal.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {
      elements.authEmail?.focus();
    },
    50
  );

}


function closeAuthModal() {

  elements.authModal.classList.add(
    "hidden"
  );


  elements.authError.classList.add(
    "hidden"
  );


  elements.authError.textContent =
    "";


  elements.authForm?.reset();

}


/* =========================================================
   AUTH MODE
   ========================================================= */

function toggleAuthMode() {

  authMode =
    authMode ===
    "signin"
      ? "signup"
      : "signin";


  updateAuthModal();

}


function updateAuthModal() {

  const isSignIn =
    authMode === "signin";


  elements.authTitle.textContent =
    isSignIn
      ? "Sign in"
      : "Create your account";


  elements.authSubtitle.textContent =
    isSignIn
      ? "Sign in to sync your projects."
      : "Create an account to access your projects.";


  elements.authSubmitBtn.textContent =
    isSignIn
      ? "Sign in"
      : "Create account";


  elements.authSwitchBtn.textContent =
    isSignIn
      ? "Create an account"
      : "Already have an account? Sign in";


  elements.authPassword.autocomplete =
    isSignIn
      ? "current-password"
      : "new-password";

}


/* =========================================================
   AUTH SUBMIT
   ========================================================= */

async function handleAuthSubmit(
  event
) {

  event.preventDefault();


  const email =
    elements.authEmail.value.trim();


  const password =
    elements.authPassword.value;


  if (!email || !password) {
    return;
  }


  setAuthError("");


  elements.authSubmitBtn.disabled =
    true;


  elements.authSubmitBtn.textContent =
    authMode === "signin"
      ? "Signing in..."
      : "Creating account...";


  try {

    if (
      authMode === "signin"
    ) {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      showToast(
        "Welcome back.",
        "success"
      );

    } else {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      showToast(
        "Account created.",
        "success"
      );

    }


    closeAuthModal();

  } catch (error) {

    console.error(
      "Firebase authentication error:",
      error
    );


    setAuthError(
      getFirebaseErrorMessage(
        error
      )
    );

  } finally {

    elements.authSubmitBtn.disabled =
      false;


    elements.authSubmitBtn.textContent =
      authMode === "signin"
        ? "Sign in"
        : "Create account";

  }

}


/* =========================================================
   FIREBASE AUTH STATE
   ========================================================= */

function setupFirebaseAuth() {

  onAuthStateChanged(
    auth,
    user => {

      currentUser =
        user;


      updateAccountUI();

      renderProjectNames();

    }
  );

}


/* =========================================================
   ACCOUNT UI
   ========================================================= */

function updateAccountUI() {

  if (!currentUser) {

    elements.accountInitial.textContent =
      "G";


    elements.accountEmail.textContent =
      "Guest";


    elements.accountStatus.textContent =
      "Not signed in";


    elements.accountSignInBtn.classList.remove(
      "hidden"
    );


    elements.accountSignOutBtn.classList.add(
      "hidden"
    );


    return;

  }


  const email =
    currentUser.email ||
    "User";


  elements.accountInitial.textContent =
    email
      .charAt(0)
      .toUpperCase();


  elements.accountEmail.textContent =
    email;


  elements.accountStatus.textContent =
    "Firebase account connected";


  elements.accountSignInBtn.classList.add(
    "hidden"
  );


  elements.accountSignOutBtn.classList.remove(
    "hidden"
  );

}


/* =========================================================
   SIGN OUT
   ========================================================= */

async function handleSignOut() {

  try {

    await signOut(
      auth
    );


    closeAccountMenu();


    showToast(
      "Signed out.",
      "success"
    );

  } catch (error) {

    console.error(
      error
    );


    showToast(
      "Could not sign out.",
      "error"
    );

  }

}


/* =========================================================
   FIREBASE ERROR MESSAGE
   ========================================================= */

function getFirebaseErrorMessage(
  error
) {

  const code =
    error?.code || "";


  switch (code) {

    case "auth/invalid-email":
      return "Enter a valid email address.";

    case "auth/user-not-found":
      return "No account was found with that email.";

    case "auth/wrong-password":
      return "The password is incorrect.";

    case "auth/invalid-credential":
      return "The email or password is incorrect.";

    case "auth/email-already-in-use":
      return "An account already exists with this email.";

    case "auth/weak-password":
      return "Use a stronger password.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    default:
      return (
        error?.message ||
        "Authentication failed."
      );

  }

}


/* =========================================================
   AUTH ERROR
   ========================================================= */

function setAuthError(
  message
) {

  if (!message) {

    elements.authError.classList.add(
      "hidden"
    );

    elements.authError.textContent =
      "";

    return;

  }


  elements.authError.textContent =
    message;


  elements.authError.classList.remove(
    "hidden"
  );

}


/* =========================================================
   ACCOUNT MENU
   ========================================================= */

function toggleAccountMenu() {

  elements.accountMenu.classList.toggle(
    "hidden"
  );

}


function closeAccountMenu() {

  elements.accountMenu?.classList.add(
    "hidden"
  );

}


/* =========================================================
   PUBLISH PLACEHOLDER
   ========================================================= */

function handlePublish() {

  /*
    Publishing is deliberately not pretending
    to work yet.

    The next backend stage will connect this
    button to:

    Firebase Auth
          ↓
    Cloudflare Worker
          ↓
    D1
          ↓
    R2
          ↓
    Cloudflare publishing
  */

  if (!currentUser) {

    openAuthModal(
      "signin"
    );


    showToast(
      "Sign in before publishing your website.",
      "info"
    );


    return;

  }


  showToast(
    "Publishing will be connected to Cloudflare next.",
    "info"
  );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message,
  type = "info"
) {

  if (!elements.toastContainer) {
    return;
  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "toast";


  const icon =
    document.createElement(
      "span"
    );


  icon.innerHTML =
    getToastIcon(
      type
    );


  const text =
    document.createElement(
      "span"
    );


  text.className =
    "flex-1";


  text.textContent =
    message;


  toast.appendChild(
    icon
  );

  toast.appendChild(
    text
  );


  elements.toastContainer.appendChild(
    toast
  );


  setTimeout(
    () => {

      toast.classList.add(
        "removing"
      );


      setTimeout(
        () => {

          toast.remove();

        },
        180
      );

    },
    2600
  );

}


function getToastIcon(
  type
) {

  if (
    type === "success"
  ) {

    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-4 h-4 text-emerald-400"
      >
        <path d="m5 12 4 4L19 6"/>
      </svg>
    `;

  }


  if (
    type === "error"
  ) {

    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-4 h-4 text-red-400"
      >
        <circle cx="12" cy="12" r="9"/>
        <path d="m9 9 6 6M15 9l-6 6"/>
      </svg>
    `;

  }


  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      class="w-4 h-4 text-violet-400"
    >
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 10v6"/>
      <path d="M12 7h.01"/>
    </svg>
  `;

}


/* =========================================================
   MOBILE VIEWPORT RESIZE
   ========================================================= */

/*
  iOS Safari can change the visual viewport when
  the keyboard opens.

  We don't force a zoom or transform here.
*/

if (
  window.visualViewport
) {

  window.visualViewport.addEventListener(
    "resize",
    () => {

      if (editorView) {
        editorView.requestMeasure();
      }

    }
  );

}


/* =========================================================
   BEFORE PAGE CLOSE
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    saveCurrentEditor();

    saveProjectLocal();

  }
);


/* =========================================================
   INITIAL STATUS
   ========================================================= */

setTimeout(
  () => {

    if (
      elements.saveStatus
    ) {

      elements.saveStatus.textContent =
        "Saved locally";

    }

  },
  500
);
