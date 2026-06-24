const { getResponse, json, publicResponse } = require("./_shared");

exports.handler = async event => {
  if (event.httpMethod !== "GET") return json(405, { error: "Método no permitido." });
  const id = event.queryStringParameters?.id;
  if (!id) return json(400, { error: "Falta el identificador del resultado." });
  const item = await getResponse(id);
  return item
    ? json(200, publicResponse(item))
    : json(404, { error: "Resultado no encontrado." });
};
