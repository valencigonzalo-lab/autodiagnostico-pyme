const levelNames = {
  starting: "Empresa en punto de partida",
  transition: "Empresa en transición",
  evolution: "Empresa en evolución",
  transformer: "Empresa transformadora"
};
const quadrantNames = {
  resistant: "Empresa resistente",
  prepared: "Empresa preparada para empezar",
  tensioned: "Empresa tecnológica pero tensionada",
  evolving: "Empresa en evolución"
};
const dimensionNames = {
  culture: "Cultura de innovación / cultura digital",
  talent: "Talento y personas",
  agile: "Metodologías ágiles y colaboración",
  digital: "Transformación digital"
};

const login = document.querySelector("#login");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
let pin = sessionStorage.getItem("td-admin-pin") || "";
let refreshTimer;

function barsMarkup(values, maxValue, suffix = "") {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '<div class="empty">Los resultados aparecerán cuando lleguen respuestas.</div>';
  return entries.map(([label, value]) => `
    <div class="bar-row">
      <span>${label}</span>
      <div class="bar-track"><span style="width:${maxValue ? (value / maxValue) * 100 : 0}%"></span></div>
      <strong>${value}${suffix}</strong>
    </div>`).join("");
}

function render(data) {
  document.querySelector("#answered").textContent = data.answered;
  document.querySelector("#averageScore").textContent = data.averages.score;
  document.querySelector("#averageAdvance").textContent = data.averages.advance;
  document.querySelector("#averagePredisposition").textContent = data.averages.predisposition;
  document.querySelector("#quadrants").innerHTML = Object.entries(data.quadrants).map(([key, value]) => `
    <div class="profile-box"><strong>${value}</strong><span>${quadrantNames[key]}</span></div>
  `).join("");
  document.querySelector("#levels").innerHTML = barsMarkup(
    Object.fromEntries(Object.entries(data.levels).map(([key, value]) => [levelNames[key], value])),
    data.answered
  );
  document.querySelector("#dimensions").innerHTML = barsMarkup(
    Object.fromEntries(Object.entries(data.dimensions).map(([key, value]) => [dimensionNames[key], value])),
    5,
    "/5"
  );
  document.querySelector("#strongestDimension").textContent = dimensionNames[data.insights.strongestDimension] || "—";
  document.querySelector("#weakestDimension").textContent = dimensionNames[data.insights.weakestDimension] || "—";
  document.querySelector("#highPredisposition").textContent = `${data.insights.highPredispositionPercent}%`;
  document.querySelector("#preparedOpportunity").textContent = `${data.insights.preparedOpportunityPercent}%`;
  document.querySelector("#advance").innerHTML = barsMarkup(data.advance, data.answered);
  document.querySelector("#predisposition").innerHTML = barsMarkup(data.predisposition, data.answered);
  document.querySelector("#questions").innerHTML = data.answered
    ? data.questions.map(item => `
      <div class="bar-row">
        <span>Pregunta ${item.id}</span>
        <div class="bar-track"><span style="width:${(item.average / 5) * 100}%"></span></div>
        <strong>${item.average}</strong>
      </div>`).join("")
    : '<div class="empty">Todavía no hay respuestas.</div>';
  document.querySelector("#latest").innerHTML = data.latest.length
    ? data.latest.map(item => `<tr>
        <td>${new Date(item.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</td>
        <td>${item.company}</td><td>${item.score}/5</td><td>${item.level}</td><td>${item.quadrant}</td>
      </tr>`).join("")
    : '<tr><td colspan="5" class="empty">Esperando la primera participación…</td></tr>';
}

async function fetchSummary(showError = false) {
  try {
    const response = await fetch("/api/admin/summary", { headers: { "X-Admin-Pin": pin } });
    if (!response.ok) throw new Error("PIN incorrecto");
    const data = await response.json();
    login.classList.add("hidden");
    dashboard.classList.remove("hidden");
    render(data);
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(fetchSummary, 2000);
  } catch (error) {
    clearTimeout(refreshTimer);
    if (showError) {
      loginError.textContent = error.message;
      loginError.classList.remove("hidden");
      login.classList.remove("hidden");
      dashboard.classList.add("hidden");
    }
  }
}

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  pin = document.querySelector("#pin").value;
  sessionStorage.setItem("td-admin-pin", pin);
  fetchSummary(true);
});
document.querySelector("#export").addEventListener("click", () => {
  location.href = `/api/admin/export?pin=${encodeURIComponent(pin)}`;
});
document.querySelector("#fullscreen").addEventListener("click", async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
});
document.querySelector("#reset").addEventListener("click", async () => {
  if (!confirm("¿Querés borrar todas las respuestas? Esta acción no se puede deshacer.")) return;
  const response = await fetch("/api/admin/responses", {
    method: "DELETE",
    headers: { "X-Admin-Pin": pin }
  });
  if (response.ok) fetchSummary();
});
if (pin) fetchSummary(true);
