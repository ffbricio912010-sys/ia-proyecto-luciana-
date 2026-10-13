# Luciana — asistente personal

Interfaz web publicada con GitHub Pages y un backend opcional para conversación con IA.

## Archivos

- `index.html`: interfaz.
- `styles.css`: diseño.
- `app.js`: chat, tareas, notas, preferencias y memoria local; conexión opcional con el backend.
- `backend/cloudflare-worker.js`: backend para Cloudflare Workers. No contiene claves secretas.

## Activar la conversación con IA

La web por sí sola no puede guardar de forma segura una clave de proveedor. El backend mantiene la clave fuera del navegador y del repositorio.

1. Crea una cuenta gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey) y genera una clave de Gemini API. Revisa las condiciones del nivel gratuito antes de enviar datos personales; los límites y modelos disponibles pueden cambiar.
2. Crea una cuenta en [Cloudflare](https://dash.cloudflare.com/) y abre **Workers & Pages → Create → Worker**.
3. Crea el Worker y pega el contenido de `backend/cloudflare-worker.js` en el editor de código. Guarda y despliega.
4. En la configuración del Worker, abre **Settings → Variables and Secrets** (el nombre exacto puede variar), añade un secreto llamado `GEMINI_API_KEY` y pega allí la clave. No la añadas al código ni a GitHub. Vuelve a desplegar si Cloudflare lo solicita.
5. Comprueba la URL del Worker abriendo su raíz; debe mostrar un JSON con `"ok":true`. La ruta de chat es la misma URL terminada en `/chat`.
6. Abre [tu web de Luciana](https://ffbricio912010-sys.github.io/ia-proyecto-luciana-/), recarga con `Ctrl + F5` y escribe en el chat:
   `configurar ia https://TU-WORKER.TU-SUBDOMINIO.workers.dev/chat`
   Sustituye la URL de ejemplo por la URL real de tu Worker y añade `/chat`.
7. Envía un mensaje normal, por ejemplo: `Explícame cómo empezar a aprender inglés en 15 minutos al día.`

Para comprobar la conexión escribe `estado ia`. Para desconectarla en este navegador escribe `desconectar ia`.

## Importante

- El endpoint configurado se guarda en el almacenamiento local de este navegador.
- La memoria y el historial de Luciana siguen guardándose localmente; todavía no se sincronizan entre dispositivos.
- No pongas claves API en `app.js`, `index.html`, capturas de pantalla ni commits.
- El nivel gratuito de un proveedor puede tener límites, cambiar o no estar disponible para todas las cuentas/regiones.
- La URL del Worker es pública. CORS limita los navegadores autorizados, pero no es autenticación ni evita todas las llamadas automatizadas. Antes de compartir ampliamente la web, configura límites de solicitudes en Cloudflare y vigila el uso de la API.
- El proveedor procesa los mensajes enviados a la IA. No envíes contraseñas ni información sensible.
- El backend usa el modelo `gemini-2.5-flash`; si el proveedor deja de ofrecerlo a tu cuenta, cambia el identificador del modelo en `backend/cloudflare-worker.js` por uno disponible en tu cuenta.
