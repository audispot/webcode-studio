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
  basicSetup
} from "https://esm.sh/codemirror@6.0.1";

import {
  defaultKeymap,
  history,
  historyKeymap
} from "https://esm.sh/@codemirror/commands@6.8.1";

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

const firebaseApp =
  initializeApp(firebaseConfig);

const auth =
  getAuth(firebaseApp);


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) =>
  document.getElementById(id);


/* =========================================================
   DOM
   ========================================================= */

const el = {

  sidebar: $("sidebar"),
  sidebarOverlay: $("sidebarOverlay"),

  mobileMenuBtn: $("mobileMenuBtn"),

  fileTree: $("fileTree"),
  tabsContainer: $("tabsContainer"),

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

  dashboardModal:
    $("dashboardModal"),

  closeDashboardModal:
    $("closeDashboardModal"),

  projectList:
    $("projectList"),

  dashboardNewProjectBtn:
    $("dashboardNewProjectBtn"),

  newFileBtn:
    $("newFileBtn"),

  newFolderBtn:
    $("newFolderBtn"),

  newProjectBtn:
    $("newProjectBtn"),

  projectModal:
    $("projectModal"),

  closeProjectModal:
    $("closeProjectModal"),

  cancelProjectBtn:
    $("cancelProjectBtn"),

  projectForm:
    $("projectForm"),

  projectNameInput:
    $("projectNameInput"),

  projectDescriptionInput:
    $("projectDescriptionInput"),

  fileModal:
    $("fileModal"),

  closeFileModal:
    $("closeFileModal"),

  cancelFileBtn:
    $("cancelFileBtn"),

  fileForm:
    $("fileForm"),

  fileNameInput:
    $("fileNameInput"),

  folderModal:
    $("folderModal"),

  closeFolderModal:
    $("closeFolderModal"),

  cancelFolderBtn:
    $("cancelFolderBtn"),

  folderForm:
    $("folderForm"),

  folderNameInput:
    $("folderNameInput"),

  accountBtn:
    $("accountBtn"),

  accountMenu:
    $("accountMenu"),

  accountInitial:
    $("accountInitial"),

  accountEmail:
    $("accountEmail"),

  accountStatus:
    $("accountStatus"),

  accountSignInBtn:
    $("accountSignInBtn"),

  accountSignOutBtn:
    $("accountSignOutBtn"),

  authModal:
    $("authModal"),

  closeAuthModal:
    $("closeAuthModal"),

  authTitle:
    $("authTitle"),

  authSubtitle:
    $("authSubtitle"),

  authForm:
    $("authForm"),

  authEmail:
    $("authEmail"),

  authPassword:
    $("authPassword"),

  authSubmitBtn:
    $("authSubmitBtn"),

  authSwitchBtn:
    $("authSwitchBtn"),

  authError:
    $("authError"),

  publishBtn:
    $("publishBtn"),

  desktopEditorTab:
    $("desktopEditorTab"),

  desktopPreviewTab:
    $("desktopPreviewTab"),

  mobileEditorBtn:
    $("mobileEditorBtn"),

  mobilePreviewBtn:
    $("mobilePreviewBtn"),

  mobileRunBtn:
    $("mobileRunBtn"),

  topProjectName:
    $("topProjectName"),

  sidebarProjectName:
    $("sidebarProjectName"),

  sidebarProjectStatus:
    $("sidebarProjectStatus"),

  toastContainer:
    $("toastContainer")

};


/* =========================================================
   STATE
   ========================================================= */

let editorView = null;

let currentFileId = null;

let currentUser = null;

let authMode = "signin";

let saveTimer = null;

let deleteTarget = null;

let projectState = null;


/* =========================================================
   STORAGE
   ========================================================= */

const PROJECT_KEY =
  "webcode-studio-v2-project";

const PROJECTS_KEY =
  "webcode-studio-v2-projects";


/* =========================================================
   ID
   ========================================================= */

function createId() {

  if (
    crypto &&
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


/* =========================================================
   DEFAULT PROJECT
   ========================================================= */

function createDefaultProject() {

  const htmlId =
    createId();

  const cssId =
    createId();

  const jsId =
    createId();


  return {

    id: createId(),

    name:
      "My Website",

    description:
      "My first WebCode Studio website.",

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

    files: [

      {

        id: htmlId,

        name:
          "index.html",

        language:
          "html",

        parent:
          null,

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

    <h1>
      Welcome to WebCode Studio
    </h1>

    <p>
      Edit this code and press Run.
    </p>

    <button id="helloButton">
      Test JavaScript
    </button>

  </main>

</body>
</html>`

      },

      {

        id: cssId,

        name:
          "style.css",

        language:
          "css",

        parent:
          null,

        content:
`* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;

  display: grid;
  place-items: center;

  font-family: Arial, sans-serif;

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
    rgba(255,255,255,.08);

  border:
    1px solid
    rgba(255,255,255,.12);

  backdrop-filter:
    blur(20px);

  box-shadow:
    0 30px 80px
    rgba(0,0,0,.35);
}

h1 {
  font-size:
    clamp(2rem, 6vw, 4rem);
}

p {
  color:
    #cbd5e1;

  line-height:
    1.7;
}

button {
  padding:
    12px 20px;

  border: 0;

  border-radius:
    12px;

  background:
    #8b5cf6;

  color: white;

  font-size:
    16px;

  cursor:
    pointer;
}

button:hover {
  background:
    #7c3aed;
}`

      },

      {

        id: jsId,

        name:
          "script.js",

        language:
          "javascript",

        parent:
          null,

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
        "JavaScript works!";

    }
  );

}`

      }

    ],

    folders: [],

    activeFileId:
      htmlId

  };

}


/* =========================================================
   LOAD PROJECT
   ========================================================= */

function loadProject() {

  try {

    const saved =
      localStorage.getItem(
        PROJECT_KEY
      );


    if (saved) {

      projectState =
        JSON.parse(saved);

    }

  } catch (error) {

    console.error(
      "Could not load project:",
      error
    );

  }


  if (!projectState) {

    projectState =
      createDefaultProject();

  }


  if (
    !Array.isArray(
      projectState.files
    )
  ) {

    projectState.files = [];

  }


  if (
    !Array.isArray(
      projectState.folders
    )
  ) {

    projectState.folders = [];

  }


  currentFileId =
    projectState.activeFileId ||
    projectState.files[0]?.id ||
    null;


  saveProject();

}


/* =========================================================
   SAVE PROJECT
   ========================================================= */

function saveProject() {

  if (!projectState) {
    return;
  }


  projectState.activeFileId =
    currentFileId;


  projectState.updatedAt =
    new Date().toISOString();


  try {

    localStorage.setItem(
      PROJECT_KEY,
      JSON.stringify(
        projectState
      )
    );

    if (
      el.saveStatus
    ) {

      el.saveStatus.textContent =
        "Saved locally";

    }

  } catch (error) {

    console.error(
      "Save error:",
      error
    );

  }

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
   LANGUAGE
   ========================================================= */

function detectLanguage(
  filename
) {

  const ext =
    filename
      .split(".")
      .pop()
      .toLowerCase();


  if (
    ext === "html" ||
    ext === "htm"
  ) {
    return "html";
  }


  if (
    ext === "css"
  ) {
    return "css";
  }


  if (
    ext === "js" ||
    ext === "mjs" ||
    ext === "jsx"
  ) {
    return "javascript";
  }


  return "text";

}


/* =========================================================
   CODEMIRROR LANGUAGE
   ========================================================= */

function getLanguage(
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


  if (
    language === "html"
  ) {
    return [
      html()
    ];
  }


  if (
    language === "css"
  ) {
    return [
      css()
    ];
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
   CREATE EDITOR
   ========================================================= */

function createEditor() {

  if (
    !el.codeEditor
  ) {

    console.error(
      "codeEditor element was not found."
    );

    return;

  }


  const file =
    getCurrentFile();


  editorView =
    new EditorView({

      state:
        EditorState.create({

          doc:
            file?.content ||
            "",

          extensions: [

            basicSetup,

            history(),

            keymap.of([
              ...defaultKeymap,
              ...historyKeymap
            ]),

            oneDark,

            ...getLanguage(
              file
            ),

            EditorView.lineWrapping,

            EditorView.theme({

              "&": {
                height:
                  "100%"
              },

              ".cm-scroller": {
                overflow:
                  "auto"
              },

              ".cm-content": {
                fontSize:
                  "16px",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                padding:
                  "16px 0"
              },

              ".cm-gutters": {
                fontSize:
                  "14px"
              }

            }),

            EditorView.updateListener.of(
              update => {

                if (
                  update.docChanged
                ) {

                  saveEditorContent();

                }

              }
            )

          ]

        }),

      parent:
        el.codeEditor

    });

}


/* =========================================================
   OPEN FILE
   ========================================================= */

function openFile(
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


  saveEditorContent();


  currentFileId =
    file.id;


  projectState.activeFileId =
    file.id;


  if (!editorView) {

    createEditor();

  } else {

    editorView.setState(

      EditorState.create({

        doc:
          file.content ||
          "",

        extensions: [

          basicSetup,

          history(),

          keymap.of([
            ...defaultKeymap,
            ...historyKeymap
          ]),

          oneDark,

          ...getLanguage(
            file
          ),

          EditorView.lineWrapping,

          EditorView.theme({

            "&": {
              height:
                "100%"
            },

            ".cm-content": {
              fontSize:
                "16px",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              padding:
                "16px 0"
            },

            ".cm-gutters": {
              fontSize:
                "14px"
            }

          }),

          EditorView.updateListener.of(
            update => {

              if (
                update.docChanged
              ) {

                saveEditorContent();

              }

            }
          )

        ]

      })

    );

  }


  renderTabs();

  renderFileTree();

  renderCurrentFile();


  /*
    IMPORTANT:
    On mobile, selecting a file
    automatically switches back
    to the CODE view.
  */

  showEditor();


  setTimeout(
    () => {

      editorView?.requestMeasure();

    },
    50
  );

}


/* =========================================================
   SAVE EDITOR CONTENT
   ========================================================= */

function saveEditorContent() {

  if (
    !editorView ||
    !currentFileId
  ) {
    return;
  }


  const file =
    getCurrentFile();


  if (!file) {
    return;
  }


  file.content =
    editorView.state.doc.toString();


  projectState.updatedAt =
    new Date().toISOString();


  if (
    el.saveStatus
  ) {

    el.saveStatus.textContent =
      "Saving...";

  }


  clearTimeout(
    saveTimer
  );


  saveTimer =
    setTimeout(
      () => {

        saveProject();

      },
      500
    );

}


/* =========================================================
   RENDER CURRENT FILE
   ========================================================= */

function renderCurrentFile() {

  const file =
    getCurrentFile();


  if (
    el.currentFileName
  ) {

    el.currentFileName.textContent =
      file?.name ||
      "No file";

  }


  if (
    el.currentFileIcon &&
    file
  ) {

    el.currentFileIcon.innerHTML =
      fileIcon(
        file
      );

  }

}


/* =========================================================
   FILE ICON
   ========================================================= */

function fileIcon(
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
        width="18"
        height="18"
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
        width="18"
        height="18"
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
        width="18"
        height="18"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
        />
        <path d="M9 9v6"/>
        <path d="M9 15c2 1 3 .5 3-1"/>
        <path d="M15 9v6"/>
      </svg>
    `;

  }


  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      width="18"
      height="18"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
    </svg>
  `;

}


/* =========================================================
   FILE TREE
   ========================================================= */

function renderFileTree() {

  if (
    !el.fileTree
  ) {
    return;
  }


  el.fileTree.innerHTML =
    "";


  projectState.folders
    .filter(
      folder =>
        folder.parent === null
    )
    .forEach(
      folder => {

        el.fileTree.appendChild(
          createFolderNode(
            folder
          )
        );

      }
    );


  projectState.files
    .filter(
      file =>
        file.parent === null
    )
    .forEach(
      file => {

        el.fileTree.appendChild(
          createFileNode(
            file
          )
        );

      }
    );

}


/* =========================================================
   FILE NODE
   ========================================================= */

function createFileNode(
  file
) {

  const row =
    document.createElement(
      "button"
    );


  row.type =
    "button";


  row.className =
    "file-tree-item";


  if (
    file.id === currentFileId
  ) {

    row.classList.add(
      "active"
    );

  }


  row.innerHTML = `
    <span class="file-icon">
      ${fileIcon(file)}
    </span>

    <span class="file-name">
      ${escapeHtml(file.name)}
    </span>

    <span class="file-delete"
          title="Delete file">

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        width="15"
        height="15"
      >
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
      </svg>

    </span>
  `;


  row.addEventListener(
    "click",
    event => {

      if (
        event.target.closest(
          ".file-delete"
        )
      ) {

        event.stopPropagation();

        askDelete(
          "file",
          file.id,
          file.name
        );

        return;

      }


      openFile(
        file.id
      );

    }
  );


  return row;

}


/* =========================================================
   FOLDER NODE
   ========================================================= */

function createFolderNode(
  folder
) {

  const container =
    document.createElement(
      "div"
    );


  const row =
    document.createElement(
      "button"
    );


  row.type =
    "button";


  row.className =
    "file-tree-item";


  row.innerHTML = `
    <span class="folder-arrow">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        width="15"
        height="15"
      >
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </span>

    <span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        width="17"
        height="17"
      >
        <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    </span>

    <span class="file-name">
      ${escapeHtml(folder.name)}
    </span>

    <span class="file-delete"
          title="Delete folder">

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        width="15"
        height="15"
      >
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
      </svg>

    </span>
  `;


  const children =
    document.createElement(
      "div"
    );


  children.className =
    "hidden";


  projectState.files
    .filter(
      file =>
        file.parent === folder.id
    )
    .forEach(
      file => {

        children.appendChild(
          createFileNode(
            file
          )
        );

      }
    );


  row.addEventListener(
    "click",
    event => {

      if (
        event.target.closest(
          ".file-delete"
        )
      ) {

        event.stopPropagation();

        askDelete(
          "folder",
          folder.id,
          folder.name
        );

        return;

      }


      children.classList.toggle(
        "hidden"
      );


      row.classList.toggle(
        "folder-open"
      );

    }
  );


  container.appendChild(
    row
  );

  container.appendChild(
    children
  );


  return container;

}


/* =========================================================
   TABS
   ========================================================= */

function renderTabs() {

  if (
    !el.tabsContainer
  ) {
    return;
  }


  el.tabsContainer.innerHTML =
    "";


  projectState.files
    .forEach(
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


        tab.innerHTML = `

          <span>
            ${fileIcon(file)}
          </span>

          <span>
            ${escapeHtml(file.name)}
          </span>

        `;


        tab.addEventListener(
          "click",
          () => {

            openFile(
              file.id
            );

          }
        );


        el.tabsContainer.appendChild(
          tab
        );

      }
    );

}


/* =========================================================
   PREVIEW
   ========================================================= */

function updatePreview() {

  if (
    !el.previewFrame
  ) {
    return;
  }


  saveEditorContent();


  const htmlFile =
    projectState.files.find(
      file =>
        file.name
          .toLowerCase() ===
        "index.html"
    );


  if (!htmlFile) {

    el.previewFrame.srcdoc =
`
<!DOCTYPE html>
<html>
<body style="
  margin:0;
  min-height:100vh;
  display:grid;
  place-items:center;
  font-family:Arial,sans-serif;
  background:#fff;
  color:#444;
">

  <div style="text-align:center">

    <h2>
      No index.html
    </h2>

    <p>
      Create an index.html file.
    </p>

  </div>

</body>
</html>
`;

    return;

  }


  let source =
    htmlFile.content ||
    "";


  const css =
    projectState.files
      .filter(
        file =>
          detectLanguage(
            file.name
          ) === "css"
      )
      .map(
        file =>
          file.content
      )
      .join("\n");


  const js =
    projectState.files
      .filter(
        file =>
          detectLanguage(
            file.name
          ) === "javascript"
      )
      .map(
        file =>
          file.content
      )
      .join("\n");


  if (
    css.trim()
  ) {

    const style =
`
<style>
${css}
</style>
`;


    if (
      source.includes(
        "</head>"
      )
    ) {

      source =
        source.replace(
          "</head>",
          style +
          "</head>"
        );

    } else {

      source =
        style +
        source;

    }

  }


  if (
    js.trim()
  ) {

    const script =
`
<script>
${js}
<\/script>
`;


    if (
      source.includes(
        "</body>"
      )
    ) {

      source =
        source.replace(
          "</body>",
          script +
          "</body>"
        );

    } else {

      source +=
        script;

    }

  }


  el.previewFrame.srcdoc =
    source;

}


/* =========================================================
   SHOW EDITOR
   ========================================================= */

function showEditor() {

  /*
    Remove preview mode.
  */

  el.workspace?.classList.remove(
    "preview-mode"
  );


  document.body.classList.remove(
    "show-preview"
  );


  /*
    Make editor visible even if
    the old CSS didn't catch the
    mobile state.
  */

  const editorPanel =
    document.querySelector(
      "#editorPanel"
    );


  const previewPanel =
    document.querySelector(
      "#previewPanel"
    );


  if (editorPanel) {

    editorPanel.style.display =
      "";

  }


  if (previewPanel) {

    previewPanel.style.display =
      "";

  }


  el.mobileEditorBtn?.classList.add(
    "active"
  );

  el.mobilePreviewBtn?.classList.remove(
    "active"
  );


  el.desktopEditorTab?.classList.add(
    "active"
  );

  el.desktopPreviewTab?.classList.remove(
    "active"
  );


  setTimeout(
    () => {

      editorView?.requestMeasure();

    },
    50
  );

}


/* =========================================================
   SHOW PREVIEW
   ========================================================= */

function showPreview() {

  saveEditorContent();

  updatePreview();


  el.workspace?.classList.add(
    "preview-mode"
  );


  document.body.classList.add(
    "show-preview"
  );


  el.mobileEditorBtn?.classList.remove(
    "active"
  );

  el.mobilePreviewBtn?.classList.add(
    "active"
  );


  el.desktopEditorTab?.classList.remove(
    "active"
  );

  el.desktopPreviewTab?.classList.add(
    "active"
  );

}


/* =========================================================
   RUN
   ========================================================= */

function runProject() {

  saveEditorContent();

  updatePreview();

  showPreview();


  toast(
    "Preview updated.",
    "success"
  );

}


/* =========================================================
   CREATE FILE
   ========================================================= */

function createFile(
  name
) {

  name =
    name
      .trim();


  if (!name) {
    return;
  }


  if (
    projectState.files.some(
      file =>
        file.name
          .toLowerCase() ===
        name.toLowerCase()
    )
  ) {

    toast(
      "A file with that name already exists.",
      "error"
    );

    return;

  }


  const file = {

    id:
      createId(),

    name,

    language:
      detectLanguage(
        name
      ),

    parent:
      null,

    content:
      starterCode(
        name
      )

  };


  projectState.files.push(
    file
  );


  saveProject();


  closeModal(
    el.fileModal
  );


  if (
    el.fileForm
  ) {
    el.fileForm.reset();
  }


  openFile(
    file.id
  );


  toast(
    `${name} created.`,
    "success"
  );

}


/* =========================================================
   STARTER CODE
   ========================================================= */

function starterCode(
  name
) {

  const language =
    detectLanguage(
      name
    );


  if (
    language === "html"
  ) {

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>

</body>
</html>`;

  }


  if (
    language === "css"
  ) {

    return `/* ${name} */

`;

  }


  if (
    language === "javascript"
  ) {

    return `// ${name}

`;

  }


  return "";

}


/* =========================================================
   CREATE FOLDER
   ========================================================= */

function createFolder(
  name
) {

  name =
    name.trim();


  if (!name) {
    return;
  }


  if (
    projectState.folders.some(
      folder =>
        folder.name
          .toLowerCase() ===
        name.toLowerCase()
    )
  ) {

    toast(
      "That folder already exists.",
      "error"
    );

    return;

  }


  projectState.folders.push({

    id:
      createId(),

    name,

    parent:
      null

  });


  saveProject();

  renderFileTree();


  closeModal(
    el.folderModal
  );


  el.folderForm?.reset();


  toast(
    `${name} folder created.`,
    "success"
  );

}


/* =========================================================
   CUSTOM DELETE MODAL
   ========================================================= */

function askDelete(
  type,
  id,
  name
) {

  deleteTarget = {

    type,
    id,
    name

  };


  let modal =
    document.getElementById(
      "deleteModal"
    );


  if (!modal) {

    modal =
      document.createElement(
        "div"
      );


    modal.id =
      "deleteModal";


    modal.className =
`
fixed
inset-0
z-[9999]
hidden
items-center
justify-center
bg-black/70
backdrop-blur-sm
p-5
`;


    modal.innerHTML =
`
<div
  class="
    w-full
    max-w-sm
    rounded-2xl
    border
    border-white/10
    bg-[#11101d]
    p-5
    shadow-2xl
  "
>

  <div class="flex items-start gap-3">

    <div
      class="
        w-10
        h-10
        rounded-xl
        bg-red-500/10
        text-red-400
        flex
        items-center
        justify-center
        shrink-0
      "
    >

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        width="20"
        height="20"
      >
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
      </svg>

    </div>

    <div>

      <h3
        class="text-white font-semibold"
      >
        Delete item?
      </h3>

      <p
        id="deleteMessage"
        class="
          mt-1
          text-sm
          text-gray-400
        "
      ></p>

    </div>

  </div>

  <div
    class="
      mt-5
      flex
      gap-2
      justify-end
    "
  >

    <button
      id="deleteCancel"
      type="button"
      class="
        h-10
        px-4
        rounded-xl
        bg-white/5
        text-gray-300
        hover:bg-white/10
      "
    >
      Cancel
    </button>

    <button
      id="deleteConfirm"
      type="button"
      class="
        h-10
        px-4
        rounded-xl
        bg-red-500
        text-white
        hover:bg-red-600
      "
    >
      Delete
    </button>

  </div>

</div>
`;


    document.body.appendChild(
      modal
    );


    $("deleteCancel")
      .addEventListener(
        "click",
        closeDeleteModal
      );


    $("deleteConfirm")
      .addEventListener(
        "click",
        confirmDelete
      );

  }


  $("deleteMessage").textContent =
    `"${name}" will be permanently removed from this project.`;


  modal.classList.remove(
    "hidden"
  );

  modal.classList.add(
    "flex"
  );

}


function closeDeleteModal() {

  const modal =
    $("deleteModal");


  if (!modal) {
    return;
  }


  modal.classList.add(
    "hidden"
  );

  modal.classList.remove(
    "flex"
  );


  deleteTarget =
    null;

}


function confirmDelete() {

  if (!deleteTarget) {
    return;
  }


  const {
    type,
    id
  } =
    deleteTarget;


  if (
    type === "file"
  ) {

    const file =
      projectState.files.find(
        item =>
          item.id === id
      );


    projectState.files =
      projectState.files.filter(
        item =>
          item.id !== id
      );


    if (
      currentFileId === id
    ) {

      const next =
        projectState.files[0];


      currentFileId =
        next?.id ||
        null;


      if (next) {

        openFile(
          next.id
        );

      }

    }


    toast(
      `${file?.name || "File"} deleted.`,
      "success"
    );

  }


  if (
    type === "folder"
  ) {

    const childIds =
      getFolderTreeIds(
        id
      );


    const ids = [
      id,
      ...childIds
    ];


    projectState.folders =
      projectState.folders.filter(
        folder =>
          !ids.includes(
            folder.id
          )
      );


    projectState.files =
      projectState.files.filter(
        file =>
          !ids.includes(
            file.parent
          )
      );


    if (
      !projectState.files.some(
        file =>
          file.id ===
          currentFileId
      )
    ) {

      const next =
        projectState.files[0];


      currentFileId =
        next?.id ||
        null;


      if (next) {

        openFile(
          next.id
        );

      }

    }


    toast(
      "Folder deleted.",
      "success"
    );

  }


  saveProject();

  renderFileTree();

  renderTabs();

  closeDeleteModal();

}


/* =========================================================
   FOLDER TREE IDS
   ========================================================= */

function getFolderTreeIds(
  parentId
) {

  const result = [];


  projectState.folders
    .filter(
      folder =>
        folder.parent ===
        parentId
    )
    .forEach(
      folder => {

        result.push(
          folder.id
        );

        result.push(
          ...getFolderTreeIds(
            folder.id
          )
        );

      }
    );


  return result;

}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(
  modal
) {

  if (!modal) {
    return;
  }


  modal.classList.remove(
    "hidden"
  );

}


function closeModal(
  modal
) {

  if (!modal) {
    return;
  }


  modal.classList.add(
    "hidden"
  );

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function openDashboard() {

  renderDashboard();

  openModal(
    el.dashboardModal
  );

}


function renderDashboard() {

  if (
    !el.projectList
  ) {
    return;
  }


  let projects = [];


  try {

    const raw =
      localStorage.getItem(
        PROJECTS_KEY
      );


    if (raw) {
      projects =
        JSON.parse(raw);
    }

  } catch {

    projects = [];

  }


  const currentExists =
    projects.some(
      project =>
        project.id ===
        projectState.id
    );


  if (!currentExists) {

    projects.push(
      projectState
    );

  }


  el.projectList.innerHTML =
    "";


  projects.forEach(
    project => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
`
p-4
rounded-2xl
border
border-white/10
bg-white/[.03]
mb-3
`;


      card.innerHTML =
`
<div class="flex items-center justify-between gap-3">

  <div class="min-w-0">

    <div
      class="font-medium text-white truncate"
    >
      ${escapeHtml(project.name)}
    </div>

    <div
      class="text-xs text-gray-500 mt-1"
    >
      ${project.files?.length || 0}
      files
    </div>

  </div>

  <button
    type="button"
    class="
      project-open
      px-3
      h-9
      rounded-xl
      bg-white/5
      hover:bg-white/10
      text-xs
    "
  >
    ${
      project.id ===
      projectState.id
        ? "Current"
        : "Open"
    }
  </button>

</div>
`;


      const button =
        card.querySelector(
          ".project-open"
        );


      if (
        project.id ===
        projectState.id
      ) {

        button.disabled =
          true;

        button.style.opacity =
          ".5";

      } else {

        button.addEventListener(
          "click",
          () => {

            switchProject(
              project.id
            );

          }
        );

      }


      el.projectList.appendChild(
        card
      );

    });

}


/* =========================================================
   SWITCH PROJECT
   ========================================================= */

function switchProject(
  id
) {

  let projects = [];


  try {

    projects =
      JSON.parse(
        localStorage.getItem(
          PROJECTS_KEY
        ) || "[]"
      );

  } catch {

    projects = [];

  }


  const project =
    projects.find(
      item =>
        item.id === id
    );


  if (!project) {
    return;
  }


  saveProject();


  projectState =
    project;


  currentFileId =
    project.activeFileId ||
    project.files[0]?.id ||
    null;


  closeModal(
    el.dashboardModal
  );


  openFile(
    currentFileId
  );


  renderAll();

}


/* =========================================================
   CREATE PROJECT
   ========================================================= */

function createProject(
  name,
  description
) {

  const project =
    createDefaultProject();


  project.name =
    name;


  project.description =
    description;


  let projects = [];


  try {

    projects =
      JSON.parse(
        localStorage.getItem(
          PROJECTS_KEY
        ) || "[]"
      );

  } catch {

    projects = [];

  }


  projects.push(
    project
  );


  localStorage.setItem(
    PROJECTS_KEY,
    JSON.stringify(
      projects
    )
  );


  projectState =
    project;


  currentFileId =
    project.files[0].id;


  closeModal(
    el.projectModal
  );


  openFile(
    currentFileId
  );


  renderAll();


  toast(
    `${name} created.`,
    "success"
  );

}


/* =========================================================
   AUTH
   ========================================================= */

function openAuth(
  mode
) {

  authMode =
    mode;


  updateAuthUI();

  openModal(
    el.authModal
  );

}


function updateAuthUI() {

  const signIn =
    authMode ===
    "signin";


  if (
    el.authTitle
  ) {

    el.authTitle.textContent =
      signIn
        ? "Sign in"
        : "Create account";

  }


  if (
    el.authSubtitle
  ) {

    el.authSubtitle.textContent =
      signIn
        ? "Sign in to sync your projects."
        : "Create your WebCode Studio account.";

  }


  if (
    el.authSubmitBtn
  ) {

    el.authSubmitBtn.textContent =
      signIn
        ? "Sign in"
        : "Create account";

  }


  if (
    el.authSwitchBtn
  ) {

    el.authSwitchBtn.textContent =
      signIn
        ? "Create an account"
        : "Already have an account? Sign in";

  }

}


async function submitAuth(
  event
) {

  event.preventDefault();


  const email =
    el.authEmail
      ?.value
      .trim();


  const password =
    el.authPassword
      ?.value;


  if (
    !email ||
    !password
  ) {

    showAuthError(
      "Enter your email and password."
    );

    return;

  }


  el.authSubmitBtn.disabled =
    true;


  try {

    if (
      authMode ===
      "signin"
    ) {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      toast(
        "Signed in successfully.",
        "success"
      );

    } else {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      toast(
        "Account created successfully.",
        "success"
      );

    }


    closeModal(
      el.authModal
    );

  } catch (
    error
  ) {

    console.error(
      error
    );


    showAuthError(
      firebaseError(
        error
      )
    );

  } finally {

    el.authSubmitBtn.disabled =
      false;

    updateAuthUI();

  }

}


function showAuthError(
  message
) {

  if (
    !el.authError
  ) {
    return;
  }


  el.authError.textContent =
    message;


  el.authError.classList.remove(
    "hidden"
  );

}


function firebaseError(
  error
) {

  switch (
    error?.code
  ) {

    case "auth/invalid-email":
      return "Enter a valid email address.";

    case "auth/user-not-found":
      return "No account exists with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/email-already-in-use":
      return "An account already exists with this email.";

    case "auth/weak-password":
      return "Your password is too weak.";

    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";

    default:
      return (
        error?.message ||
        "Authentication failed."
      );

  }

}


/* =========================================================
   ACCOUNT
   ========================================================= */

function updateAccount() {

  if (!el.accountEmail) {
    return;
  }


  if (!currentUser) {

    el.accountEmail.textContent =
      "Guest";


    el.accountStatus.textContent =
      "Not signed in";


    el.accountInitial.textContent =
      "G";


    el.accountSignInBtn
      ?.classList
      .remove("hidden");


    el.accountSignOutBtn
      ?.classList
      .add("hidden");


    return;

  }


  const email =
    currentUser.email ||
    "User";


  el.accountEmail.textContent =
    email;


  el.accountStatus.textContent =
    "Account connected";


  el.accountInitial.textContent =
    email
      .charAt(0)
      .toUpperCase();


  el.accountSignInBtn
    ?.classList
    .add("hidden");


  el.accountSignOutBtn
    ?.classList
    .remove("hidden");

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

  renderFileTree();

  renderTabs();

  renderCurrentFile();

  updateProjectName();

  updateAccount();

}


/* =========================================================
   PROJECT NAME
   ========================================================= */

function updateProjectName() {

  const name =
    projectState.name;


  if (
    el.topProjectName
  ) {

    el.topProjectName.textContent =
      name;

  }


  if (
    el.sidebarProjectName
  ) {

    el.sidebarProjectName.textContent =
      name;

  }


  if (
    el.sidebarProjectStatus
  ) {

    el.sidebarProjectStatus.textContent =
      currentUser
        ? "Cloud account connected"
        : "Local project";

  }

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function openSidebar() {

  el.sidebar
    ?.classList
    .add(
      "mobile-open"
    );


  el.sidebarOverlay
    ?.classList
    .remove(
      "hidden"
    );

}


function closeSidebar() {

  el.sidebar
    ?.classList
    .remove(
      "mobile-open"
    );


  el.sidebarOverlay
    ?.classList
    .add(
      "hidden"
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(
  message,
  type = "info"
) {

  if (
    !el.toastContainer
  ) {

    console.log(
      message
    );

    return;

  }


  const item =
    document.createElement(
      "div"
    );


  item.className =
`
px-4
py-3
rounded-xl
border
border-white/10
bg-[#171525]
text-sm
text-white
shadow-2xl
mb-2
`;

  if (
    type === "success"
  ) {

    item.classList.add(
      "text-emerald-300"
    );

  }


  if (
    type === "error"
  ) {

    item.classList.add(
      "text-red-300"
    );

  }


  item.textContent =
    message;


  el.toastContainer.appendChild(
    item
  );


  setTimeout(
    () => {

      item.remove();

    },
    2500
  );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   EVENT SETUP
   ========================================================= */

function setupEvents() {

  /* Menu */

  el.mobileMenuBtn
    ?.addEventListener(
      "click",
      openSidebar
    );


  el.sidebarOverlay
    ?.addEventListener(
      "click",
      closeSidebar
    );


  /* File buttons */

  el.newFileBtn
    ?.addEventListener(
      "click",
      () => {

        openModal(
          el.fileModal
        );

        setTimeout(
          () => {
            el.fileNameInput?.focus();
          },
          50
        );

      }
    );


  el.newFolderBtn
    ?.addEventListener(
      "click",
      () => {

        openModal(
          el.folderModal
        );

        setTimeout(
          () => {
            el.folderNameInput?.focus();
          },
          50
        );

      }
    );


  /* Project */

  el.newProjectBtn
    ?.addEventListener(
      "click",
      () => {

        openModal(
          el.projectModal
        );

      }
    );


  el.dashboardNewProjectBtn
    ?.addEventListener(
      "click",
      () => {

        closeModal(
          el.dashboardModal
        );

        openModal(
          el.projectModal
        );

      }
    );


  /* Dashboard */

  el.dashboardBtn
    ?.addEventListener(
      "click",
      openDashboard
    );


  el.closeDashboardModal
    ?.addEventListener(
      "click",
      () => {

        closeModal(
          el.dashboardModal
        );

      }
    );


  /* Forms */

  el.fileForm
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        createFile(
          el.fileNameInput.value
        );

      }
    );


  el.folderForm
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        createFolder(
          el.folderNameInput.value
        );

      }
    );


  el.projectForm
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        createProject(
          el.projectNameInput.value,
          el.projectDescriptionInput.value
        );

      }
    );


  /* Close buttons */

  el.closeFileModal
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          el.fileModal
        )
    );


  el.cancelFileBtn
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          el.fileModal
        )
    );


  el.closeFolderModal
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          el.folderModal
        )
    );


  el.cancelFolderBtn
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          el.folderModal
        )
    );


  el.closeProjectModal
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          el.projectModal
        )
    );


  el.cancelProjectBtn
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          el.projectModal
        )
    );


  /* Run */

  el.runBtn
    ?.addEventListener(
      "click",
      runProject
    );


  el.mobileRunBtn
    ?.addEventListener(
      "click",
      runProject
    );


  /* Save */

  el.saveBtn
    ?.addEventListener(
      "click",
      () => {

        saveEditorContent();

        saveProject();

        toast(
          "Project saved.",
          "success"
        );

      }
    );


  /* Preview */

  el.refreshPreviewBtn
    ?.addEventListener(
      "click",
      () => {

        updatePreview();

        toast(
          "Preview refreshed.",
          "success"
        );

      }
    );


  /* Editor / Preview */

  el.mobileEditorBtn
    ?.addEventListener(
      "click",
      showEditor
    );


  el.mobilePreviewBtn
    ?.addEventListener(
      "click",
      showPreview
    );


  el.desktopEditorTab
    ?.addEventListener(
      "click",
      showEditor
    );


  el.desktopPreviewTab
    ?.addEventListener(
      "click",
      showPreview
    );


  /* Account */

  el.accountBtn
    ?.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        el.accountMenu
          ?.classList
          .toggle(
            "hidden"
          );

      }
    );


  el.accountSignInBtn
    ?.addEventListener(
      "click",
      () => {

        el.accountMenu
          ?.classList
          .add("hidden");

        openAuth(
          "signin"
        );

      }
    );


  el.accountSignOutBtn
    ?.addEventListener(
      "click",
      async () => {

        await signOut(
          auth
        );

        el.accountMenu
          ?.classList
          .add("hidden");

        toast(
          "Signed out.",
          "success"
        );

      }
    );


  /* Auth */

  el.authForm
    ?.addEventListener(
      "submit",
      submitAuth
    );


  el.authSwitchBtn
    ?.addEventListener(
      "click",
      () => {

        authMode =
          authMode ===
          "signin"
            ? "signup"
            : "signin";

        updateAuthUI();

      }
    );


  el.closeAuthModal
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          el.authModal
        )
    );


  /* Publish */

  el.publishBtn
    ?.addEventListener(
      "click",
      () => {

        if (!currentUser) {

          openAuth(
            "signin"
          );

          toast(
            "Sign in before publishing.",
            "info"
          );

          return;

        }


        toast(
          "Publishing will be connected to Cloudflare next.",
          "info"
        );

      }
    );


  /*
    Close account menu
    when clicking elsewhere.
  */

  document.addEventListener(
    "click",
    event => {

      if (
        !el.accountMenu
      ) {
        return;
      }


      if (
        !el.accountBtn?.contains(
          event.target
        ) &&
        !el.accountMenu.contains(
          event.target
        )
      ) {

        el.accountMenu
          .classList
          .add(
            "hidden"
          );

      }

    }
  );

}


/* =========================================================
   FIREBASE AUTH STATE
   ========================================================= */

function setupAuth() {

  onAuthStateChanged(
    auth,
    user => {

      currentUser =
        user;


      updateAccount();

      updateProjectName();

    }
  );

}


/* =========================================================
   START APPLICATION
   ========================================================= */

function start() {

  console.log(
    "WebCode Studio starting..."
  );


  loadProject();

  setupEvents();

  createEditor();

  renderAll();

  updatePreview();

  setupAuth();


  /*
    Start on the CODE view.
    This is important for mobile.
  */

  showEditor();


  console.log(
    "WebCode Studio ready."
  );

}


start();


/* =========================================================
   PAGE EXIT
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    saveEditorContent();

    saveProject();

  }
);
