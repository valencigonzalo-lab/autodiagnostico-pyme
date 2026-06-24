const questions = [
  "En mi empresa existe apertura para probar nuevas ideas, aunque no siempre sepamos de antemano si van a funcionar.",
  "Cuando aparece un problema, solemos buscar nuevas formas de resolverlo en lugar de repetir siempre lo mismo.",
  "Las personas de la empresa se sienten habilitadas para proponer mejoras en procesos, productos, servicios o formas de trabajo.",
  "En mi empresa se aprende de los errores y se los usa como oportunidad de mejora.",
  "Tenemos una actitud positiva frente al cambio tecnológico, aunque implique modificar hábitos o formas de trabajo.",
  "Tenemos claridad sobre qué perfiles, capacidades o roles necesitamos fortalecer para que la empresa crezca.",
  "La empresa cuenta con prácticas para atraer, incorporar o desarrollar talento clave.",
  "Las personas reciben feedback, acompañamiento o instancias de conversación sobre su desempeño y desarrollo.",
  "Nos preocupa generar condiciones para retener a las personas valiosas de la empresa.",
  "La empresa promueve que las personas aprendan nuevas habilidades, especialmente vinculadas a tecnología, gestión o innovación.",
  "Los equipos trabajan de manera coordinada y con objetivos claros.",
  "Las personas de distintas áreas colaboran entre sí para resolver problemas o mejorar procesos.",
  "Tenemos reuniones, rutinas o espacios de seguimiento que ayudan a ordenar el trabajo y tomar decisiones.",
  "Cuando encaramos un proyecto o mejora, solemos dividirlo en pasos concretos, responsables y plazos.",
  "La empresa está abierta a incorporar metodologías ágiles o nuevas formas de organizar el trabajo.",
  "La empresa utiliza herramientas digitales para mejorar la gestión, la comunicación, la venta o la operación.",
  "Contamos con información o datos que nos ayudan a tomar mejores decisiones.",
  "Hay procesos de la empresa que podrían mejorar significativamente si incorporáramos tecnología o automatización.",
  "La empresa tiene interés en incorporar inteligencia artificial u otras herramientas digitales para mejorar su productividad.",
  "Sentimos que la transformación digital es una oportunidad concreta para mejorar la competitividad de la empresa."
];

const sections = [
  { title: "Cultura de innovación / cultura digital", copy: "Apertura para probar, aprender, proponer mejoras y cambiar hábitos.", ids: [1, 2, 3, 4, 5] },
  { title: "Talento y personas", copy: "Cómo la empresa atrae, desarrolla, acompaña y retiene capacidades clave.", ids: [6, 7, 8, 9, 10] },
  { title: "Metodologías ágiles y trabajo colaborativo", copy: "Coordinación, colaboración, rutinas y forma de organizar mejoras.", ids: [11, 12, 13, 14, 15] },
  { title: "Transformación digital", copy: "Uso de herramientas, datos, automatización, IA y visión de oportunidad.", ids: [16, 17, 18, 19, 20] }
];

const scale = [
  ["1", "Muy en desacuerdo"],
  ["2", "En desacuerdo"],
  ["3", "Ni de acuerdo ni en desacuerdo"],
  ["4", "De acuerdo"],
  ["5", "Muy de acuerdo"]
];

const closingQuestions = [
  {
    name: "advance",
    title: "21. ¿Qué tan avanzada considerás que está tu empresa en transformación digital?",
    options: ["Muy poco avanzada", "Poco avanzada", "Medianamente avanzada", "Avanzada", "Muy avanzada"]
  },
  {
    name: "predisposition",
    title: "22. ¿Qué predisposición tiene tu empresa para incorporar nuevas tecnologías, metodologías y prácticas de innovación?",
    options: ["Muy baja predisposición", "Baja predisposición", "Predisposición media", "Alta predisposición", "Muy alta predisposición"]
  }
];

const welcome = document.querySelector("#welcome");
const survey = document.querySelector("#survey");
const result = document.querySelector("#result");
const sectionsRoot = document.querySelector("#questionSections");
const finalRoot = document.querySelector("#finalQuestions");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const errorBox = document.querySelector("#formError");

function questionMarkup(id) {
  return `
    <div class="question">
      <div class="question-title"><span>${id}.</span><div>${questions[id - 1]}</div></div>
      <div class="scale" role="radiogroup" aria-label="Pregunta ${id}">
        ${scale.map(([value, label]) => `
          <div>
            <input type="radio" id="q${id}-${value}" name="q${id}" value="${value}" required>
            <label for="q${id}-${value}"><strong>${value}</strong><span>${label}</span></label>
          </div>`).join("")}
      </div>
    </div>`;
}

function sectionMarkup(section, index) {
  return `
    <section class="card section-card">
      <div class="section-heading">
        <span class="section-number">${index + 1}</span>
        <div><h2>${section.title}</h2><p>${section.copy}</p></div>
      </div>
      ${section.ids.map(questionMarkup).join("")}
    </section>`;
}

function closingMarkup(question) {
  return `
    <div class="question">
      <div class="question-title"><div>${question.title}</div></div>
      <div class="choice-list">
        ${question.options.map((option, index) => `
          <div>
            <input type="radio" id="${question.name}-${index + 1}" name="${question.name}" value="${index + 1}" required>
            <label for="${question.name}-${index + 1}">${option}</label>
          </div>`).join("")}
      </div>
    </div>`;
}

sectionsRoot.innerHTML = sections.map(sectionMarkup).join("");
finalRoot.innerHTML = closingQuestions.map(closingMarkup).join("");

function updateProgress() {
  const answeredScale = questions.filter((_, index) => survey.querySelector(`input[name="q${index + 1}"]:checked`)).length;
  const answeredFinal = closingQuestions.filter(question => survey.querySelector(`input[name="${question.name}"]:checked`)).length;
  const answered = answeredScale + answeredFinal;
  progressBar.style.width = `${(answered / 22) * 100}%`;
  progressText.textContent = `${answered} de 22 respondidas`;
  saveDraft();
}

function saveDraft() {
  if (survey.classList.contains("hidden")) return;
  const draft = {
    version: "cultura-talento-transformacion-1",
    participant: {
      name: document.querySelector("#name").value,
      company: document.querySelector("#company").value,
      role: document.querySelector("#role").value
    },
    values: {}
  };
  new FormData(survey).forEach((value, key) => { draft.values[key] = value; });
  localStorage.setItem("pyme-inteligente-draft", JSON.stringify(draft));
}

function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem("pyme-inteligente-draft"));
    if (!draft || draft.version !== "cultura-talento-transformacion-1") return;
    Object.entries(draft.participant || {}).forEach(([key, value]) => {
      const input = document.querySelector(`#${key}`);
      if (input) input.value = value || "";
    });
    Object.entries(draft.values || {}).forEach(([name, value]) => {
      const input = survey.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
      if (input) input.checked = true;
    });
  } catch {}
}

survey.addEventListener("change", updateProgress);

document.querySelector("#startButton").addEventListener("click", () => {
  welcome.classList.add("hidden");
  survey.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  updateProgress();
});

function resultMarkup(data) {
  const { score, scorePercent, level, quadrant, dimensions, strongest, opportunity } = data.result;
  return `
    <div class="hero" style="padding-bottom:24px">
      <span class="eyebrow">Tu resultado personal</span>
      <h1>Cultura, talento, colaboración y transformación digital.</h1>
      <p class="lead">No es una nota definitiva: es una fotografía de tu punto de partida y tu predisposición para cambiar.</p>
    </div>
    <section class="card result-hero">
      <div class="score-ring" style="--score:${scorePercent}"><div><strong>${score}</strong><span>promedio /5</span></div></div>
      <div class="result-copy">
        <p class="privacy-note">Resultado general</p>
        <h2 class="profile">${level.name}</h2>
        <p>${level.description}</p>
      </div>
    </section>
    <div class="result-grid">
      <section class="card">
        <h3>Tus cuatro dimensiones</h3>
        ${dimensions.map(dimension => `
          <div class="metric">
            <div class="metric-head"><span>${dimension.name}<small class="dimension-label">${dimension.interpretation}</small></span><strong>${dimension.score}/5</strong></div>
            <div class="metric-track"><span style="width:${dimension.percentage}%"></span></div>
          </div>`).join("")}
        <p class="privacy-note">Fortaleza relativa: <strong>${strongest.name.toLowerCase()}</strong>. Mayor oportunidad: <strong>${opportunity.name.toLowerCase()}</strong>.</p>
      </section>
      <section class="card">
        <p class="privacy-note">Tu cuadrante</p>
        <h3 class="quadrant-title">${quadrant.name}</h3>
        <p>${quadrant.summary}</p>
        <h3>Próximo paso sugerido</h3>
        <p class="recommendation">${quadrant.action}</p>
        <p class="privacy-note">El cuadrante combina tu avance percibido en transformación digital con tu predisposición al cambio.</p>
      </section>
    </div>
    <section class="card" style="padding:28px;margin-top:20px;box-shadow:none">
      <h3>Para conversar en tu empresa</h3>
      <ol class="reflection-list">
        <li>¿Cuál es la dimensión más fuerte de mi empresa?</li>
        <li>¿Cuál es la dimensión más débil?</li>
        <li>¿Qué práctica concreta podríamos mejorar en los próximos 30 días?</li>
        <li>¿Qué tecnología, metodología o hábito podríamos probar de manera simple?</li>
        <li>¿Qué persona o equipo debería liderar ese primer cambio?</li>
      </ol>
    </section>
    <div class="actions" style="justify-content:center;margin-top:24px">
      <button class="btn secondary" onclick="window.print()">Guardar o imprimir</button>
      <button class="btn ghost" id="copyResult">Copiar enlace personal</button>
    </div>`;
}

function attachCopyButton() {
  document.querySelector("#copyResult")?.addEventListener("click", async event => {
    await navigator.clipboard.writeText(location.href);
    event.currentTarget.textContent = "Enlace copiado";
  });
}

async function loadResult(id) {
  const response = await fetch(`/api/results/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("No encontramos este resultado.");
  const data = await response.json();
  welcome.classList.add("hidden");
  survey.classList.add("hidden");
  result.classList.remove("hidden");
  result.innerHTML = resultMarkup(data);
  attachCopyButton();
}

survey.addEventListener("submit", async event => {
  event.preventDefault();
  errorBox.classList.add("hidden");
  const firstMissing = Array.from(survey.querySelectorAll("[required]")).find(input =>
    input.type === "radio" && !survey.querySelector(`input[name="${input.name}"]:checked`)
  );
  if (firstMissing) {
    errorBox.textContent = "Faltan algunas respuestas. Revisá las preguntas que quedaron sin marcar.";
    errorBox.classList.remove("hidden");
    firstMissing.closest(".question")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const button = survey.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Calculando…";
  const answers = {};
  for (let id = 1; id <= 20; id++) answers[id] = Number(survey.querySelector(`input[name="q${id}"]:checked`).value);
  const payload = {
    participant: {
      name: document.querySelector("#name").value,
      company: document.querySelector("#company").value,
      role: document.querySelector("#role").value
    },
    answers,
    closing: {
      advance: Number(survey.querySelector('input[name="advance"]:checked').value),
      predisposition: Number(survey.querySelector('input[name="predisposition"]:checked').value)
    }
  };

  try {
    const response = await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No pudimos guardar las respuestas.");
    localStorage.removeItem("pyme-inteligente-draft");
    history.replaceState({}, "", `?resultado=${data.id}`);
    survey.classList.add("hidden");
    result.classList.remove("hidden");
    result.innerHTML = resultMarkup(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
    attachCopyButton();
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("hidden");
    button.disabled = false;
    button.innerHTML = "Ver mi resultado <span>→</span>";
  }
});

restoreDraft();
const resultId = new URLSearchParams(location.search).get("resultado");
if (resultId) loadResult(resultId).catch(error => {
  result.classList.remove("hidden");
  result.innerHTML = `<section class="card intro-card"><h2>${error.message}</h2><a class="btn" href="/">Hacer el diagnóstico</a></section>`;
});
