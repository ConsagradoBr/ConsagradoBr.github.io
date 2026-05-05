const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.14 });
document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

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
let phraseIndex = 0;
setInterval(() => {
  phraseIndex = (phraseIndex + 1) % statusPhrases.length;
  typedStatus.textContent = statusPhrases[phraseIndex];
}, 2800);

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
  const response = await fetch("assets/data.json");
  const data = await response.json();
  const grid = document.querySelector("#projectGrid");
  const labGrid = document.querySelector("#labGrid");
  grid.innerHTML = data.projects.map(projectCard).join("");
  labGrid.innerHTML = data.labs.map(projectCard).join("");
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

const terminalCommands = {
  help: {
    description: "Lista comandos disponíveis",
    run: () => `
      <p>Comandos disponíveis:</p>
      <div class="terminal-table">
        <code>help</code><span>mostra esta lista</span>
        <code>ls</code><span>lista diretórios do portfólio</span>
        <code>go tcc</code><span>navega para a apresentação do TCC</span>
        <code>go projetos</code><span>navega para projetos úteis</span>
        <code>go hobbies</code><span>navega para os playgrounds</span>
        <code>go contato</code><span>navega para contato</span>
        <code>open github</code><span>abre o GitHub</span>
        <code>open linkedin</code><span>abre o LinkedIn</span>
        <code>copy email</code><span>copia o email</span>
        <code>download cv</code><span>abre o currículo PDF</span>
        <code>clear</code><span>limpa o terminal</span>
      </div>
      <p class="terminal-muted">Dica: Ctrl/Cmd+K abre ou foca este terminal. Esc fecha.</p>
    `
  },
  ls: {
    description: "Lista seções",
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
    run: () => "<p>/home/qfc/portfolio</p>"
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
  { match: ["go historia", "cd historia", "historia"], run: () => scrollToSection("historia", "Abrindo ~/história") },
  { match: ["go tcc", "cd tcc", "tcc"], run: () => scrollToSection("tcc", "Abrindo ~/tcc") },
  { match: ["go projetos", "cd projetos", "projetos"], run: () => scrollToSection("projetos", "Abrindo ~/projetos") },
  { match: ["go hobbies", "cd hobbies", "hobbies", "go labs"], run: () => scrollToSection("labs", "Abrindo ~/hobbies") },
  { match: ["go stack", "cd stack", "stack"], run: () => scrollToSection("stack", "Abrindo ~/stack") },
  { match: ["go contato", "cd contato", "contato"], run: () => scrollToSection("contato", "Abrindo ~/contato") },
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

function showToast(message) {
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

function scrollToSection(id, message) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return `<p>${message}</p>`;
}

function openExternal(url, message) {
  window.open(url, "_blank", "noreferrer");
  return `<p>${message}: <code>${url}</code></p>`;
}

function appendTerminal(html) {
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
  linuxTerminal.hidden = true;
  terminalTrigger.setAttribute("aria-expanded", "false");
  terminalTrigger.focus();
}

function toggleTerminal() {
  if (linuxTerminal.hidden) openTerminal();
  else closeTerminal();
}

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
if (window.location.hash === "#terminal") {
  openTerminal();
}

const canvas = document.querySelector("#signalCanvas");
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
  ctx.strokeStyle = "rgba(108,255,154,.12)";
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
    ctx.fillStyle = Math.random() > .96 ? "rgba(255,184,77,.88)" : "rgba(108,255,154,.72)";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(draw);
}

resizeCanvas();
draw();
window.addEventListener("resize", resizeCanvas);
