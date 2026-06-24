# Publicar el autodiagnóstico en Netlify

Esta versión está preparada para funcionar en Netlify durante la capacitación:

- La encuesta se publica desde la carpeta `public`.
- Las respuestas se guardan con Netlify Blobs.
- El panel admin usa el mismo PIN de siempre: `2026`, salvo que configures otro.

## Pasos rápidos

1. Entrar a https://app.netlify.com/ y crear cuenta.
2. Crear un sitio nuevo desde GitHub.
3. Seleccionar el repositorio de este proyecto.
4. Netlify debería detectar la configuración del archivo `netlify.toml`.
5. En variables de entorno, agregar:

   - `ADMIN_PIN` = `2026`

6. Publicar.

Netlify entregará un link similar a:

`https://nombre-del-sitio.netlify.app`

Links de uso:

- Participantes: `https://nombre-del-sitio.netlify.app`
- Panel admin: `https://nombre-del-sitio.netlify.app/admin.html`

## Después de la capacitación

Desde el panel admin podés descargar los datos como CSV.
Si ya no necesitás el sitio, podés pausarlo o eliminarlo desde Netlify.
