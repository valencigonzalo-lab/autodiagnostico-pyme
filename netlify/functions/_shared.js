const crypto = require("crypto");

const ADMIN_PIN = process.env.ADMIN_PIN || "2026";
const STORE_NAME = "autodiagnostico-responses";

async function getResponseStore() {
  const { getStore } = require("@netlify/blobs");
  return getStore(STORE_NAME);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

function validPin(event) {
  const headers = event.headers || {};
  const params = event.queryStringParameters || {};
  return (headers["x-admin-pin"] || headers["X-Admin-Pin"] || params.pin) === ADMIN_PIN;
}

function calculateResult(answers, closing) {
  const definitions = [
    { key: "culture", name: "Cultura de innovación / cultura digital", ids: [1, 2, 3, 4, 5] },
    { key: "talent", name: "Talento y personas", ids: [6, 7, 8, 9, 10] },
    { key: "agile", name: "Metodologías ágiles y trabajo colaborativo", ids: [11, 12, 13, 14, 15] },
    { key: "digital", name: "Transformación digital", ids: [16, 17, 18, 19, 20] }
  ];
  const sum = ids => ids.reduce((total, id) => total + Number(answers[id] || 0), 0);
  const interpret = average => {
    if (average < 2.5) return "Nivel inicial";
    if (average < 3.5) return "Nivel en desarrollo";
    if (average < 4.5) return "Nivel avanzado";
    return "Nivel consolidado";
  };
  const dimensions = definitions.map(definition => {
    const score = Number((sum(definition.ids) / definition.ids.length).toFixed(1));
    return {
      key: definition.key,
      name: definition.name,
      score,
      percentage: Math.round((score / 5) * 100),
      interpretation: interpret(score)
    };
  });
  const score = Number((Array.from({ length: 20 }, (_, index) => Number(answers[index + 1] || 0)).reduce((a, b) => a + b, 0) / 20).toFixed(1));
  const level = score < 2.5
    ? { key: "starting", name: "Empresa en punto de partida", description: "La empresa tiene baja madurez en prácticas de innovación, talento, colaboración y transformación digital. La prioridad debería ser identificar pocos cambios concretos y empezar por acciones simples." }
    : score < 3.5
      ? { key: "transition", name: "Empresa en transición", description: "La empresa reconoce la necesidad de cambiar, pero todavía necesita ordenar prioridades, definir responsables y pasar de la intención a la práctica." }
      : score < 4.5
        ? { key: "evolution", name: "Empresa en evolución", description: "La empresa ya tiene prácticas valiosas y cierta capacidad de transformación. El desafío es sistematizar, medir y escalar esas prácticas." }
        : { key: "transformer", name: "Empresa transformadora", description: "La empresa muestra una alta madurez cultural, organizacional y digital. El desafío es sostener la evolución, profundizar el uso de datos/IA y convertirse en referente para otras empresas." };

  const highAdvance = Number(closing.advance) >= 4;
  const highPredisposition = Number(closing.predisposition) >= 4;
  const quadrant = highAdvance && highPredisposition
    ? {
        key: "evolving",
        name: "Empresa en evolución",
        summary: "La empresa combina avance digital con apertura cultural. Tiene buenas condiciones para profundizar transformación, incorporar IA, mejorar procesos y fortalecer la colaboración.",
        action: "Tu empresa está bien posicionada para acelerar. El desafío es priorizar, medir impacto y sostener la mejora continua."
      }
    : !highAdvance && highPredisposition
      ? {
          key: "prepared",
          name: "Empresa preparada para empezar",
          summary: "La empresa todavía tiene bajo avance digital, pero muestra buena apertura para cambiar. Este es un punto de partida muy positivo.",
          action: "Tu empresa tiene una oportunidad clara: transformar predisposición en acción. El próximo paso es elegir un proceso concreto, una herramienta y un responsable."
        }
      : highAdvance && !highPredisposition
        ? {
            key: "tensioned",
            name: "Empresa tecnológica pero tensionada",
            summary: "La empresa incorporó tecnología o procesos digitales, pero puede tener dificultades culturales, resistencias internas o baja apropiación por parte de las personas.",
            action: "Tu empresa no necesita solo más tecnología. Necesita trabajar la adopción, la comunicación interna, el liderazgo y la gestión del cambio."
          }
        : {
            key: "resistant",
            name: "Empresa resistente",
            summary: "La empresa todavía no avanzó significativamente en transformación digital y además muestra baja predisposición a cambiar. El desafío principal es cultural: generar conciencia, mostrar oportunidades concretas y reducir temores.",
            action: "Tu empresa necesita empezar por conversaciones internas, casos simples y pequeñas mejoras que demuestren valor rápido."
          };

  return {
    score,
    scorePercent: Math.round((score / 5) * 100),
    level,
    quadrant,
    dimensions,
    strongest: [...dimensions].sort((a, b) => b.score - a.score)[0],
    opportunity: [...dimensions].sort((a, b) => a.score - b.score)[0],
    closing: {
      advance: Number(closing.advance),
      predisposition: Number(closing.predisposition)
    }
  };
}

function validatePayload(body) {
  const values = Object.values(body.answers || {}).map(Number);
  if (values.length !== 20 || values.some(value => !Number.isInteger(value) || value < 1 || value > 5)) {
    return "Completá las 20 afirmaciones.";
  }
  const closing = {
    advance: Number(body.closing?.advance),
    predisposition: Number(body.closing?.predisposition)
  };
  if (
    !Number.isInteger(closing.advance) || closing.advance < 1 || closing.advance > 5 ||
    !Number.isInteger(closing.predisposition) || closing.predisposition < 1 || closing.predisposition > 5
  ) {
    return "Completá las preguntas finales.";
  }
  return "";
}

function publicResponse(item) {
  return {
    id: item.id,
    createdAt: item.createdAt,
    participant: item.participant,
    answers: item.answers,
    closing: item.closing,
    result: item.result
  };
}

async function saveResponse(body) {
  const item = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    participant: {
      name: String(body.participant?.name || "").trim().slice(0, 100),
      company: String(body.participant?.company || "").trim().slice(0, 120),
      role: String(body.participant?.role || "").trim().slice(0, 100)
    },
    answers: body.answers,
    closing: {
      advance: Number(body.closing?.advance),
      predisposition: Number(body.closing?.predisposition)
    }
  };
  item.result = calculateResult(item.answers, item.closing);
  const store = await getResponseStore();
  await store.setJSON(`response:${item.id}`, item);
  return item;
}

async function getResponse(id) {
  const store = await getResponseStore();
  return store.get(`response:${id}`, { type: "json" });
}

async function listResponses() {
  const store = await getResponseStore();
  const listed = await store.list({ prefix: "response:" });
  const blobs = listed.blobs || [];
  const responses = await Promise.all(
    blobs.map(entry => store.get(entry.key, { type: "json" }).catch(() => null))
  );
  return responses
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

async function clearResponses() {
  const store = await getResponseStore();
  if (typeof store.deleteAll === "function") {
    await store.deleteAll({ prefix: "response:" });
    return;
  }
  const listed = await store.list({ prefix: "response:" });
  await Promise.all((listed.blobs || []).map(entry => store.delete(entry.key)));
}

function aggregate(responses) {
  const answered = responses.length;
  const average = (getter, decimals = 0) =>
    answered
      ? Number((responses.reduce((sum, item) => sum + getter(item), 0) / answered).toFixed(decimals))
      : 0;
  const percent = count => answered ? Math.round((count / answered) * 100) : 0;
  const levels = ["starting", "transition", "evolution", "transformer"].reduce((acc, key) => {
    acc[key] = responses.filter(item => item.result.level.key === key).length;
    return acc;
  }, {});
  const quadrants = ["resistant", "prepared", "tensioned", "evolving"].reduce((acc, key) => {
    acc[key] = responses.filter(item => item.result.quadrant.key === key).length;
    return acc;
  }, {});
  const dimensions = ["culture", "talent", "agile", "digital"].reduce((acc, key) => {
    acc[key] = answered
      ? Number((responses.reduce((sum, item) => {
          const dimension = item.result.dimensions.find(entry => entry.key === key);
          return sum + (dimension?.score || 0);
        }, 0) / answered).toFixed(1))
      : 0;
    return acc;
  }, {});
  const labels = {
    advance: ["", "Muy poco avanzada", "Poco avanzada", "Medianamente avanzada", "Avanzada", "Muy avanzada"],
    predisposition: ["", "Muy baja predisposición", "Baja predisposición", "Predisposición media", "Alta predisposición", "Muy alta predisposición"]
  };
  const countClosing = field => responses.reduce((acc, item) => {
    const label = labels[field][item.closing[field]];
    if (label) acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const questions = Array.from({ length: 20 }, (_, index) => {
    const id = index + 1;
    const total = responses.reduce((sum, item) => sum + Number(item.answers[id] || 0), 0);
    return { id, average: answered ? Number((total / answered).toFixed(1)) : 0 };
  });

  return {
    answered,
    averages: {
      score: average(item => item.result.score, 1),
      advance: average(item => item.closing.advance, 1),
      predisposition: average(item => item.closing.predisposition, 1)
    },
    dimensions,
    levels,
    quadrants,
    advance: countClosing("advance"),
    predisposition: countClosing("predisposition"),
    questions,
    insights: {
      strongestDimension: Object.entries(dimensions).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
      weakestDimension: Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0]?.[0] || "",
      highPredispositionPercent: percent(responses.filter(item => item.closing.predisposition >= 4).length),
      preparedOpportunityPercent: percent(responses.filter(item => item.closing.advance <= 3 && item.closing.predisposition >= 4).length)
    },
    latest: responses.slice(-8).reverse().map(item => ({
      createdAt: item.createdAt,
      company: item.participant.company || "Participante anónimo",
      score: item.result.score,
      level: item.result.level.name,
      quadrant: item.result.quadrant.name
    }))
  };
}

function csvResponse(rows) {
  const headers = [
    "fecha", "nombre", "empresa", "rol", "promedio_general", "nivel", "cuadrante",
    "cultura_innovacion_digital", "talento_personas", "metodologias_agiles_colaboracion", "transformacion_digital",
    "avance_transformacion_digital", "predisposicion_cambio",
    ...Array.from({ length: 20 }, (_, index) => `p${index + 1}`)
  ];
  const escape = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map(item => [
      item.createdAt, item.participant.name, item.participant.company, item.participant.role,
      item.result.score, item.result.level.name, item.result.quadrant.name,
      ...["culture", "talent", "agile", "digital"].map(key =>
        item.result.dimensions.find(dimension => dimension.key === key)?.score || 0
      ),
      item.closing.advance, item.closing.predisposition,
      ...Array.from({ length: 20 }, (_, index) => item.answers[index + 1])
    ].map(escape).join(","))
  ].join("\n");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="resultados-autodiagnostico.csv"',
      "Cache-Control": "no-store"
    },
    body: `\uFEFF${csv}`
  };
}

module.exports = {
  aggregate,
  clearResponses,
  csvResponse,
  getResponse,
  json,
  listResponses,
  publicResponse,
  saveResponse,
  validatePayload,
  validPin
};
