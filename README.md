# Mi IA Personal

Proyecto para construir una asistente de IA personal desde cero, empezando con una interfaz web sencilla y herramientas gratuitas.

## Estado actual

Primera versión de la interfaz: chat web, diseño adaptable y guardado local del historial en el navegador. Esta versión inicial usa respuestas de demostración; todavía no está conectada a un modelo de lenguaje real.

## Archivos

- `index.html`: estructura de la aplicación.
- `styles.css`: estilos y diseño adaptable.
- `app.js`: chat de demostración y persistencia local.

## Cómo probarla

Abre `index.html` en un navegador, o activa GitHub Pages desde **Settings → Pages** y selecciona la rama `main` y la carpeta `/ (root)`.

## Próximas etapas

1. Publicar la interfaz con GitHub Pages.
2. Elegir un proveedor de modelo con nivel gratuito disponible.
3. Crear un backend seguro para mantener la clave de API fuera del navegador y del repositorio.
4. Añadir memoria configurable y funciones personales.

## Seguridad

No pongas claves de API, contraseñas ni datos personales sensibles en este repositorio. GitHub Pages solo sirve archivos estáticos; para conectar una IA real con una clave privada se necesita un backend o una función serverless.
