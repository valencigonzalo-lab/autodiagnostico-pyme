const { aggregate, json, listResponses, validPin } = require("./_shared");

exports.handler = async event => {
  if (event.httpMethod !== "GET") return json(405, { error: "Método no permitido." });
  if (!validPin(event)) return json(401, { error: "PIN incorrecto." });
  const responses = await listResponses();
  return json(200, aggregate(responses));
};
