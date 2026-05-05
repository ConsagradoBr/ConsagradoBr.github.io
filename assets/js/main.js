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
