# TourlATabogo: Manual Completo del Proyecto

## 1. Visión General del Proyecto

TourlATabogo es un asistente de chat inteligente y conversacional diseñado para ser el guía turístico definitivo de Bogotá. Su principal fortaleza es su arquitectura **"Offline-First"**, que le permite ser funcional y útil desde el primer momento, utilizando una base de conocimiento curada, sin depender inicialmente de servicios externos que requieren configuración compleja.

El bot puede ampliarse fácilmente para utilizar APIs externas y ofrecer funcionalidades en tiempo real, como búsqueda de restaurantes o el pronóstico del clima, una vez que se proporcionan las claves de API correspondientes.

---

## 2. Arquitectura y Funcionamiento Interno

El "cerebro" del chatbot reside en el archivo `src/services/chatbot.ts`. Su lógica de funcionamiento es la siguiente:

1.  **Normalización:** El mensaje del usuario se convierte a minúsculas y se le quitan los acentos para facilitar su procesamiento.
2.  **Detección de Charla Casual:** El bot primero revisa si el mensaje es un saludo o una pregunta común (ej. "hola", "gracias", "¿cómo estás?") para dar una respuesta amigable e inmediata.
3.  **Identificación de Tópico y Ubicación:** El sistema analiza el mensaje en busca de dos cosas:
    *   Un **Tópico** (ej. "restaurantes", "turismo", "clima").
    *   Una **Ubicación** (ej. "chapinero", "usaquén", "la candelaria"), basándose en una extensa lista de localidades y barrios de Bogotá.
4.  **Análisis de Contexto (Memoria):** Si el usuario solo proporciona una ubicación (ej. "fontibón"), el bot revisa el mensaje anterior para recordar cuál era el tópico de la conversación (ej. si antes había preguntado por "restaurantes").
5.  **Toma de Decisiones (Offline-First):**
    *   Si el tópico es **"turismo"** y hay una ubicación, el bot consulta su **base de datos interna (`touristDB`)** y devuelve la lista de lugares curados que tú mismo proporcionaste. **Esta es la función principal y siempre operativa.**
    *   Si el tópico es **"restaurantes"**, **"centro comercial"** o **"clima"**, el bot no falla. En su lugar, devuelve un mensaje explicando que para activar esa función se necesita una clave de API específica, guiando al usuario sobre cómo mejorar el bot.
    *   Si no entiende la petición, devuelve un mensaje de ayuda estándar.

---

## 3. Guía de Instalación y Puesta en Marcha

Sigue estos pasos para instalar y ejecutar el proyecto en tu computadora.

### Prerrequisitos (Software Necesario)

- **Node.js:** Necesitas tener Node.js instalado. Puedes descargarlo desde [nodejs.org](https://nodejs.org/). `npm` (Node Package Manager) se instala automáticamente con Node.js.
- **Git (Opcional pero recomendado):** Para clonar y gestionar el código. Puedes descargarlo desde [git-scm.com](https://git-scm.com/).
- **Un editor de código:** Se recomienda [Visual Studio Code](https://code.visualstudio.com/).

### Pasos de Instalación

1.  **Clona o Descarga el Proyecto:**
    Si tienes Git, clona el repositorio. Si no, descarga y descomprime el archivo ZIP del proyecto.

2.  **Navega a la Carpeta del Proyecto:**
    Abre tu terminal (como PowerShell, CMD o la terminal de VS Code) y navega hasta la carpeta `project` que se encuentra dentro de la carpeta principal. **Este paso es muy importante.**

    ```bash
    cd ruta/a/tu/proyecto/TourIA (2)/project
    ```

3.  **Instala las Dependencias:**
    Una vez dentro de la carpeta `project`, ejecuta este comando. Descargará todas las librerías que la aplicación necesita para funcionar.

    ```bash
    npm install
    ```

4.  **Configura tus Claves de API:**
    Este es el paso más importante. En la carpeta `project`, busca un archivo llamado `.env.example`. Haz una copia de este archivo y renómbrala a `.env`.

    Abre el nuevo archivo `.env` y llénalo con tus claves. Más abajo se explica cómo obtener cada una.

5.  **Ejecuta la Aplicación:**
    ¡Listo! Ahora inicia la aplicación con el siguiente comando:

    ```bash
    npm run dev
    ```

    La terminal te mostrará una dirección local. Generalmente es `http://localhost:5173/`. Abre esa dirección en tu navegador para ver la aplicación funcionando.

---

## 4. Guía Detallada de APIs y Servicios Externos

Para desbloquear todo el potencial del chatbot, necesitas configurar los siguientes servicios.

### a) Supabase (Autenticación y Base de Datos)

- **Propósito:** Gestiona el login de usuarios y podría usarse en el futuro para guardar conversaciones.
- **Cómo configurarlo:**
  1.  Ve a [supabase.com](https://supabase.com) y entra a tu proyecto.
  2.  En el menú lateral, ve a **Settings (el engranaje) -> API**.
  3.  Copia la **URL** y la clave pública **`anon`**.
  4.  Pega estos valores en los campos `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` de tu archivo `.env`.
  5.  **¡MUY IMPORTANTE!** Ve a **Authentication -> URL Configuration** y en la sección **CORS Origins**, añade `http://localhost:5173/`. Sin esto, el login no funcionará en tu entorno local.

### b) Google Maps Platform (Búsqueda de Restaurantes y Mapas)

- **Propósito:** Activa la búsqueda en tiempo real de restaurantes y centros comerciales, y muestra los mapas.
- **¡Requisito Clave! -> Activar Facturación:**
  Google requiere que tu proyecto tenga una **cuenta de facturación activa** para usar sus APIs, incluso si tu uso se mantiene dentro de la capa gratuita. Esto es para prevenir abusos. Ve a la sección **"Facturación"** en tu Google Cloud Console para vincular una forma de pago.
- **Cómo configurarlo:**
  1.  Ve a la [Biblioteca de APIs de Google Cloud](https://console.cloud.google.com/apis/library).
  2.  Busca y **habilita** estas tres APIs: **`Places API`**, **`Maps Static API`** y **`Geocoding API`**.
  3.  Ve a **Credenciales**, crea una **"Clave de API"** y cópiala.
  4.  Pega esta clave en el campo `VITE_GOOGLE_MAPS_API_KEY` de tu archivo `.env`.

### c) OpenWeather (Clima en Tiempo Real)

- **Propósito:** Permite que el bot consulte y muestre el clima actual de Bogotá.
- **Cómo configurarlo:**
  1.  Regístrate para obtener una cuenta gratuita en [openweathermap.org](https://openweathermap.org/api).
  2.  Una vez dentro de tu panel de control, ve a la sección **"API keys"**.
  3.  Copia tu clave de API por defecto.
  4.  Pega esta clave en el campo `VITE_OPENWEATHER_API_KEY` de tu archivo `.env`.

---

## 5. Actualizar la Base de Conocimiento del Bot

La principal fortaleza del bot es su base de datos interna de lugares turísticos. Para añadir más lugares o modificar los existentes, sigue estos pasos:

1.  Abre el archivo `src/services/chatbot.ts`.
2.  Busca la constante llamada `touristDB`. Esta es la base de datos.
3.  Puedes añadir nuevas localidades o nuevos lugares dentro de las localidades existentes, siguiendo el formato JSON.

**Ejemplo de una entrada:**
```json
"13_Teusaquillo": [
  { "nombre": "Parque Metropolitano Simón Bolívar", "direccion": "Entre calles 53 y 64", "horario": "6am-6pm", "que_es": "Gran parque para recreación" }
]
```
