const header = document.querySelector(".site-header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.14 });
document.querySelectorAll(".reveal").forEach((node) => {
  const rect = node.getBoundingClientRect();
  if (rect.top < window.innerHeight * 1.1) node.classList.add("visible");
  revealObserver.observe(node);
});

const typedStatus = document.querySelector("#typedStatus");
const typedCommand = document.querySelector("#typedCommand");
const statusPhrases = [
  "Automação, front-end e sistemas internos.",
  "Excel, ERP, dados e rotinas transformados em software.",
  "Projetos pequenos, úteis e fáceis de demonstrar.",
  "TCC em polimento de MVP: ERP para usinagem."
];
const commands = [
  "npm run portfolio -- --terminal-mode",
  "git log --oneline carreira/projetos",
  "python automacoes/rotina_real.py",
  "ssh empresas@contato --apresentar-tcc"
];

if (typedStatus) {
  let phraseIndex = 0;
  setInterval(() => {
    phraseIndex = (phraseIndex + 1) % statusPhrases.length;
    typedStatus.textContent = statusPhrases[phraseIndex];
  }, 2800);
}

if (typedCommand) {
  let commandIndex = 0;
  let charIndex = commands[0].length;
  let deleting = true;
  typedCommand.textContent = commands[0];

  function typeCommand() {
    const command = commands[commandIndex];
    typedCommand.textContent = command.slice(0, charIndex);
    if (!deleting && charIndex < command.length) {
      charIndex++;
      setTimeout(typeCommand, 54);
      return;
    }
    if (!deleting) {
      deleting = true;
      setTimeout(typeCommand, 1500);
      return;
    }
    if (charIndex > 0) {
      charIndex--;
      setTimeout(typeCommand, 24);
      return;
    }
    deleting = false;
    commandIndex = (commandIndex + 1) % commands.length;
    setTimeout(typeCommand, 360);
  }
  setTimeout(typeCommand, 1400);
}

function projectCard(project) {
  return `
    <article class="project-card reveal">
      <span class="project-theme">${project.theme} / ${project.status}</span>
      <h3>${project.name}</h3>
      <p>${project.description}</p>
      <p class="impact">${project.impact}</p>
      <div class="tags">${project.stack.map((tag) => `<span>${tag}</span>`).join("")}</div>
      <div class="project-actions">
        <a href="${project.href}" target="_blank" rel="noreferrer">Abrir demo</a>
        <a href="${project.repo}" target="_blank" rel="noreferrer">Ver repositório</a>
      </div>
    </article>
  `;
}

async function loadProjects() {
  const grid = document.querySelector("#projectGrid");
  const labGrid = document.querySelector("#labGrid");
  if (!grid && !labGrid) return;

  const response = await fetch("assets/data.json");
  const data = await response.json();
  if (grid) grid.innerHTML = data.projects.map(projectCard).join("");
  if (labGrid) labGrid.innerHTML = data.labs.map(projectCard).join("");
  document.querySelectorAll(".project-grid .reveal").forEach((node) => revealObserver.observe(node));
}
loadProjects();

const terminalTrigger = document.querySelector("#terminalTrigger");
const linuxTerminal = document.querySelector("#linuxTerminal");
const terminalClose = document.querySelector("#terminalClose");
const terminalOutput = document.querySelector("#terminalOutput");
const terminalForm = document.querySelector("#terminalForm");
const terminalInput = document.querySelector("#terminalInput");
const toast = document.querySelector("#toast");
const EMAIL = "quesede.filipe@gmail.com";
let terminalHistory = [];
let historyIndex = 0;

const pageRoutes = {
  historia: "historia.html",
  tcc: "tcc.html",
  projetos: "projetos.html",
  hobbies: "hobbies.html",
  labs: "hobbies.html",
  stack: "stack.html",
  contato: "contato.html"
};

function navigateToPage(route, message) {
  window.location.href = route;
  return `<p>${message}: <code>${route}</code></p>`;
}

const terminalCommands = {
  help: {
    description: "Lista comandos disponíveis",
    run: () => `
      <p>Comandos disponíveis:</p>
      <div class="terminal-table">
        <code>help</code><span>mostra esta lista</span>
        <code>ls</code><span>lista diretórios do portfólio</span>
        <code>go historia</code><span>abre a história profissional</span>
        <code>go tcc</code><span>abre a apresentação do TCC</span>
        <code>go projetos</code><span>abre projetos úteis</span>
        <code>go hobbies</code><span>abre os playgrounds</span>
        <code>go stack</code><span>abre habilidades e ferramentas</span>
        <code>go contato</code><span>abre contato</span>
        <code>open github</code><span>abre o GitHub</span>
        <code>open linkedin</code><span>abre o LinkedIn</span>
        <code>copy email</code><span>copia o email</span>
        <code>download cv</code><span>abre o currículo PDF</span>
        <code>clear</code><span>limpa o terminal</span>
      </div>
      <p class="terminal-muted">Dica: Ctrl/Cmd+K abre ou foca este terminal. Arraste pela barra superior.</p>
    `
  },
  ls: {
    description: "Lista páginas",
    run: () => `
      <p>drwxr-xr-x historia/</p>
      <p>drwxr-xr-x tcc/</p>
      <p>drwxr-xr-x projetos/</p>
      <p>drwxr-xr-x hobbies/</p>
      <p>drwxr-xr-x stack/</p>
      <p>drwxr-xr-x contato/</p>
      <p>-rw-r--r-- curriculo-quesede-filipe-constantino.pdf</p>
    `
  },
  whoami: {
    description: "Resumo profissional",
    run: () => `
      <p>Quésede Filipe Constantino</p>
      <p>Desenvolvedor em formação, com base em operação administrativa, automação, ERP, dados e front-end.</p>
    `
  },
  pwd: {
    description: "Mostra caminho atual",
    run: () => `<p>/home/qfc/portfolio/${currentPageName()}</p>`
  },
  clear: {
    description: "Limpa terminal",
    run: () => {
      terminalOutput.innerHTML = "";
      return "";
    }
  }
};

const terminalActions = [
  { match: ["go historia", "cd historia", "historia"], run: () => navigateToPage(pageRoutes.historia, "Abrindo ~/história") },
  { match: ["go tcc", "cd tcc", "tcc"], run: () => navigateToPage(pageRoutes.tcc, "Abrindo ~/tcc") },
  { match: ["go projetos", "cd projetos", "projetos"], run: () => navigateToPage(pageRoutes.projetos, "Abrindo ~/projetos") },
  { match: ["go hobbies", "cd hobbies", "hobbies", "go labs", "labs"], run: () => navigateToPage(pageRoutes.hobbies, "Abrindo ~/hobbies") },
  { match: ["go stack", "cd stack", "stack"], run: () => navigateToPage(pageRoutes.stack, "Abrindo ~/stack") },
  { match: ["go contato", "cd contato", "contato"], run: () => navigateToPage(pageRoutes.contato, "Abrindo ~/contato") },
  { match: ["open github", "github"], run: () => openExternal("https://github.com/ConsagradoBr", "Abrindo GitHub") },
  { match: ["open linkedin", "linkedin"], run: () => openExternal("https://www.linkedin.com/in/srconsagrado/", "Abrindo LinkedIn") },
  { match: ["open tcc", "repo tcc"], run: () => openExternal("https://github.com/ConsagradoBr/tcc-erp-usinagem", "Abrindo repositório do TCC") },
  { match: ["copy email", "email"], run: () => copyText(EMAIL, "Email copiado") },
  { match: ["copy link", "link"], run: () => copyText(window.location.href, "Link copiado") },
  { match: ["download cv", "cat curriculo", "curriculo", "cv"], run: () => {
    window.open("assets/docs/curriculo-quesede-filipe-constantino.pdf", "_blank");
    return "<p>abrindo assets/docs/curriculo-quesede-filipe-constantino.pdf</p>";
  } }
];

function currentPageName() {
  const file = window.location.pathname.split("/").pop() || "index.html";
  return file.replace(".html", "") || "home";
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
    return `<p>${message}: <code>${text}</code></p>`;
  } catch {
    return `<p class="terminal-error">Não consegui copiar automaticamente. Valor: <code>${text}</code></p>`;
  }
}

function openExternal(url, message) {
  window.open(url, "_blank", "noreferrer");
  return `<p>${message}: <code>${url}</code></p>`;
}

function appendTerminal(html) {
  if (!terminalOutput) return;
  terminalOutput.insertAdjacentHTML("beforeend", html);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function normalizeCommand(value) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function runTerminalCommand(rawCommand) {
  const command = normalizeCommand(rawCommand);
  if (!command) return;
  appendTerminal(`<p class="terminal-command">qfc@portfolio:~$ ${rawCommand}</p>`);
  terminalHistory.push(rawCommand);
  historyIndex = terminalHistory.length;

  if (terminalCommands[command]) {
    const output = terminalCommands[command].run();
    if (output) appendTerminal(output);
    return;
  }

  const action = terminalActions.find((item) => item.match.includes(command));
  if (action) {
    Promise.resolve(action.run()).then((output) => {
      if (output) appendTerminal(output);
    });
    return;
  }

  appendTerminal(`<p class="terminal-error">command not found: ${rawCommand}</p><p class="terminal-muted">Digite <code>help</code> para ver comandos.</p>`);
}

function openTerminal() {
  if (!linuxTerminal || !terminalTrigger || !terminalInput) return;
  linuxTerminal.hidden = false;
  terminalTrigger.setAttribute("aria-expanded", "true");
  if (!terminalOutput.dataset.booted) {
    terminalOutput.dataset.booted = "true";
    appendTerminal(`
      <p class="terminal-command">Linux qfc-os 6.5.0-portfolio #1 SMP PREEMPT_DYNAMIC</p>
      <p>Bem-vindo ao terminal do portfólio.</p>
      <p class="terminal-muted">Digite <code>help</code> para navegar por comandos.</p>
    `);
  }
  window.setTimeout(() => terminalInput.focus(), 30);
}

function closeTerminal() {
  if (!linuxTerminal || !terminalTrigger) return;
  linuxTerminal.hidden = true;
  terminalTrigger.setAttribute("aria-expanded", "false");
  terminalTrigger.focus();
}

function toggleTerminal() {
  if (!linuxTerminal) return;
  if (linuxTerminal.hidden) openTerminal();
  else closeTerminal();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setupTerminalDrag() {
  if (!linuxTerminal) return;
  const handle = linuxTerminal.querySelector(".window-bar");
  if (!handle) return;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function moveWindow(clientX, clientY) {
    const margin = 8;
    const rect = linuxTerminal.getBoundingClientRect();
    const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
    linuxTerminal.style.left = `${clamp(clientX - offsetX, margin, maxLeft)}px`;
    linuxTerminal.style.top = `${clamp(clientY - offsetY, margin, maxTop)}px`;
    linuxTerminal.style.right = "auto";
  }

  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    const rect = linuxTerminal.getBoundingClientRect();
    dragging = true;
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    linuxTerminal.classList.add("dragging");
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    moveWindow(event.clientX, event.clientY);
  });

  function stopDrag(event) {
    if (!dragging) return;
    dragging = false;
    linuxTerminal.classList.remove("dragging");
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  }

  handle.addEventListener("pointerup", stopDrag);
  handle.addEventListener("pointercancel", stopDrag);
  window.addEventListener("resize", () => {
    if (linuxTerminal.hidden || !linuxTerminal.style.left || !linuxTerminal.style.top) return;
    const rect = linuxTerminal.getBoundingClientRect();
    moveWindow(rect.left + offsetX, rect.top + offsetY);
  });
}

if (terminalTrigger && linuxTerminal && terminalClose && terminalForm && terminalInput) {
  terminalTrigger.addEventListener("click", toggleTerminal);
  terminalClose.addEventListener("click", closeTerminal);
  terminalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = terminalInput.value;
    terminalInput.value = "";
    runTerminalCommand(command);
  });
  terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = terminalHistory[historyIndex] || "";
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      historyIndex = Math.min(terminalHistory.length, historyIndex + 1);
      terminalInput.value = terminalHistory[historyIndex] || "";
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const value = normalizeCommand(terminalInput.value);
      const options = [
        ...Object.keys(terminalCommands),
        ...terminalActions.flatMap((item) => item.match)
      ];
      const suggestion = options.find((option) => option.startsWith(value));
      if (suggestion) terminalInput.value = suggestion;
    }
  });
  document.addEventListener("keydown", (event) => {
    const isCommandShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
    if (isCommandShortcut) {
      event.preventDefault();
      toggleTerminal();
    }
    if (event.key === "Escape" && !linuxTerminal.hidden) {
      closeTerminal();
    }
  });
  setupTerminalDrag();
  if (window.location.hash === "#terminal") {
    openTerminal();
  }
}

const canvas = document.querySelector("#signalCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.min(90, Math.floor(width / 14)) }, (_, index) => ({
      x: (index / 90) * width + Math.random() * 80,
      y: Math.random() * height,
      vx: .25 + Math.random() * .45,
      size: 1 + Math.random() * 2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(23, 136, 209, .13)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 72) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 72) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    particles.forEach((particle) => {
      particle.x += particle.vx;
      if (particle.x > width + 20) particle.x = -20;
      ctx.fillStyle = Math.random() > .96 ? "rgba(106, 51, 171, .88)" : "rgba(23, 136, 209, .72)";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resizeCanvas();
  draw();
  window.addEventListener("resize", resizeCanvas);
}
