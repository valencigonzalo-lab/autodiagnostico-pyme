const { clearResponses, json, validPin } = require("./_shared");

exports.handler = async event => {
  if (event.httpMethod !== "DELETE") return json(405, { error: "Método no permitido." });
  if (!validPin(event)) return json(401, { error: "PIN incorrecto." });
  await clearResponses();
  return json(200, { ok: true });
};
