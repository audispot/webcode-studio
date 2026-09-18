const DEFAULT_FILES={
  "index.html":`<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="hero">
    <h1>Hello, WebCode Studio 👋</h1>
    <p>Edit this file, then tap Run.</p>
    <button onclick="sayHello()">Click me</button>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
  "style.css":`*{box-sizing:border-box}body{margin:0;font-family:system-ui;background:linear-gradient(135deg,#111827,#312e81);color:white}.hero{min-height:100vh;display:grid;place-content:center;text-align:center;padding:24px}button{border:0;border-radius:10px;padding:12px 18px;cursor:pointer}`,
  "script.js":`function sayHello(){alert("JavaScript is running!");}`
};

let state={files:{...DEFAULT_FILES},current:"index.html",projects:JSON.parse(localStorage.getItem("wcs_projects")||"{}")};
const $=id=>document.getElementById(id);
const editor=$("editor"), preview=$("preview");

function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}
function persist(){localStorage.setItem("wcs_current",JSON.stringify({files:state.files,current:state.current}))}
function load(){try{const x=JSON.parse(localStorage.getItem("wcs_current"));if(x?.files)state.files=x.files;if(x?.current&&state.files[x.current])state.current=x.current}catch{}}
function render(){
  $("currentFile").textContent=state.current;
  $("saveState").textContent="Saved locally";
  editor.value=state.files[state.current]||"";
  $("fileList").innerHTML="";
  Object.keys(state.files).forEach(name=>{
    const row=document.createElement("div");row.className="file-item"+(name===state.current?" active":"");
    row.innerHTML=`<span>${icon(name)}</span><span>${escapeHtml(name)}</span><button class="delete icon-btn" title="Delete">×</button>`;
    row.onclick=e=>{if(e.target.closest(".delete"))return;state.current=name;render()};
    row.querySelector(".delete").onclick=e=>{e.stopPropagation();deleteFile(name)};
    $("fileList").appendChild(row);
  });
  $("tabs").innerHTML=Object.keys(state.files).map(n=>`<div class="tab ${n===state.current?"active":""}">${escapeHtml(n)}</div>`).join("");
}
function icon(n){return n.endsWith(".html")?"🌐":n.endsWith(".css")?"🎨":n.endsWith(".js")?"JS":"📄"}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function run(){
  const html=state.files["index.html"]||"";
  const css=state.files["style.css"]||"";
  const js=state.files["script.js"]||"";
  let out=html;
  out=out.replace(/<link[^>]+href=["']style\.css["'][^>]*>/i,`<style>${css}</style>`);
  out=out.replace(/<script[^>]+src=["']script\.js["'][^>]*><\/script>/i,`<script>${js.replace(/<\/script/gi,"<\\/script")}<\/script>`);
  preview.srcdoc=out;
  toast("Preview updated");
}
function save(){
  state.files[state.current]=editor.value;persist();
  state.projects["My First Project"]={files:state.files,updatedAt:new Date().toISOString()};
  localStorage.setItem("wcs_projects",JSON.stringify(state.projects));
  $("saveState").textContent="Saved";
  toast("Project saved on this device");
}
function deleteFile(name){
  if(Object.keys(state.files).length===1)return toast("Keep at least one file");
  if(!confirm(`Delete ${name}?`))return;
  delete state.files[name];state.current=Object.keys(state.files)[0];persist();render();run();
}
function newFile(){
  $("promptTitle").textContent="New file";$("promptInput").value="";$("promptInput").placeholder="example.js";$("promptDialog").showModal();
  $("promptForm").onsubmit=e=>{e.preventDefault();let n=$("promptInput").value.trim();if(!n)return;if(state.files[n])return toast("File already exists");state.files[n]="";state.current=n;persist();$("promptDialog").close();render()};
}
function newProject(){if(confirm("Start a new project? Unsaved current changes will be replaced.")){state.files={...DEFAULT_FILES};state.current="index.html";persist();render();run();toast("New project created")}}
function authUser(){return JSON.parse(localStorage.getItem("wcs_user")||"null")}
let signMode="signin";
function updateAuth(){const u=authUser();$("userBadge").textContent=u?.email||"Guest";$("authBtn").textContent=u?"Sign out":"Sign in"}
$("authBtn").onclick=()=>{if(authUser()){localStorage.removeItem("wcs_user");updateAuth();toast("Signed out");return}signMode="signin";$("authTitle").textContent="Sign in";$("authSubmit").textContent="Sign in";$("switchAuth").textContent="Create an account instead";$("authDialog").showModal()};
$("switchAuth").onclick=()=>{signMode=signMode==="signin"?"signup":"signin";$("authTitle").textContent=signMode==="signin"?"Sign in":"Create account";$("authSubmit").textContent=signMode==="signin"?"Sign in":"Create account";$("switchAuth").textContent=signMode==="signin"?"Create an account instead":"I already have an account"};
$("authForm").onsubmit=e=>{e.preventDefault();const email=$("email").value.trim().toLowerCase(),password=$("password").value;let users=JSON.parse(localStorage.getItem("wcs_users")||"{}");if(signMode==="signup"){if(users[email])return toast("Account already exists");users[email]={password};localStorage.setItem("wcs_users",JSON.stringify(users))}else if(!users[email]||users[email].password!==password)return toast("Invalid email or password");localStorage.setItem("wcs_user",JSON.stringify({email}));$("authDialog").close();updateAuth();toast(signMode==="signup"?"Account created":"Welcome back")};
editor.addEventListener("input",()=>{state.files[state.current]=editor.value;$("saveState").textContent="Unsaved changes";});
$("runBtn").onclick=()=>{state.files[state.current]=editor.value;run()};
$("refreshBtn").onclick=run;$("saveBtn").onclick=save;$("newFileBtn").onclick=newFile;$("newProjectBtn").onclick=newProject;
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
load();render();updateAuth();run();
