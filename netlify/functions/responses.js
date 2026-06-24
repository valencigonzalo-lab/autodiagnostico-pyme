const { json, publicResponse, saveResponse, validatePayload } = require("./_shared");

exports.handler = async event => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método no permitido." });
  try {
    const body = JSON.parse(event.body || "{}");
    const validationError = validatePayload(body);
    if (validationError) return json(400, { error: validationError });
    const item = await saveResponse(body);
    return json(201, publicResponse(item));
  } catch (error) {
    return json(400, { error: error.message || "No pudimos guardar las respuestas." });
  }
};
