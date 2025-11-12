
# Proyecto TourlATabogo: Asistente de Turismo para Bogotá

## 1. Descripción General

TourlATabogo es un asistente de chat inteligente diseñado para ayudar a los usuarios y turistas a explorar la ciudad de Bogotá. El bot utiliza un modelo de lenguaje de Google (Gemini) para entender las peticiones del usuario en lenguaje natural y utiliza APIs de datos reales para proporcionar información precisa y útil.

## 2. Funcionalidades Principales

- **Comprensión de Lenguaje Natural:** Utiliza un modelo de IA para interpretar las intenciones del usuario, permitiendo conversaciones fluidas.
- **Búsqueda de Lugares:** Se conecta a la **API de Google Maps Places** para encontrar restaurantes, centros comerciales y otros puntos de interés.
- **Base de Conocimiento Curada:** Incluye una base de datos interna con lugares turísticos recomendados por localidad, asegurando respuestas de alta calidad.
- **Información del Clima:** Se conecta a la **API de OpenWeather** para dar el pronóstico del tiempo actual en Bogotá.
- **Interfaz de Chat Interactiva:** Presenta la información de manera clara, incluyendo mapas estáticos de las ubicaciones encontradas.

## 3. ¡IMPORTANTE! - Requisito de Activación de Google Cloud

La aplicación está completamente desarrollada y el código es funcional. Sin embargo, para que las funciones de IA y la búsqueda de lugares operen, **es indispensable activar la facturación en tu proyecto de Google Cloud.**

- **¿Por qué es necesario?** Google, como otros proveedores de nube, requiere una cuenta de facturación activa para habilitar el uso de sus APIs, incluso si el uso que se le dará está dentro de la "capa gratuita". Es una medida para prevenir el abuso de sus servicios.
- **¿Significa que tendré que pagar?** No necesariamente. Google ofrece un crédito gratuito muy generoso para nuevos usuarios y una capa gratuita para muchas de sus APIs. Solo se te cobrará si excedes significativamente estos límites gratuitos.

**Acción Requerida:**
1.  Ve a la **Consola de Google Cloud**.
2.  Asegúrate de tener seleccionado tu proyecto.
3.  Busca la sección **"Facturación"** ("Billing") y sigue los pasos para vincular una cuenta de facturación. Esto generalmente requiere añadir una tarjeta de crédito, pero no se te cobrará a menos que excedas el uso gratuito.

> **Hasta que la cuenta de facturación no esté activa, la API de Gemini y la API de Google Maps devolverán errores, y el bot no podrá dar respuestas inteligentes ni buscar lugares.**

## 4. Guía de Instalación y Ejecución

Sigue estos pasos para correr el proyecto en tu máquina local.

### Paso A: Instalar Dependencias

Ejecuta el siguiente comando en tu terminal para instalar todas las librerías necesarias:

```bash
npm install
```

### Paso B: Configurar las Claves de API (.env)

Este es el paso más crítico. Necesitas crear un archivo llamado `.env` en la raíz del proyecto y llenarlo con tus claves secretas.

1.  Busca el archivo `.env.example` y renómbralo a `.env`.
2.  Abre el archivo `.env` y llénalo con tus claves. Debe tener la siguiente estructura:

```env
# URL y Clave Anónima de tu proyecto de Supabase
# Las encuentras en tu Dashboard de Supabase > Settings > API
VITE_SUPABASE_URL=https://onfmsvvoprihtpsjjeyd.supabase.co
VITE_SUPABASE_ANON_KEY=TU_PROPIA_CLAVE_ANON_DE_SUPABASE

# Clave de API para la IA de Google Gemini
# Genérala desde aistudio.google.com
VITE_GEMINI_API_KEY=TU_CLAVE_DE_GEMINI

# Clave de API para Google Maps Platform
# Asegúrate de tener habilitadas las APIs: Places, Maps Static y Geocoding
VITE_GOOGLE_MAPS_API_KEY=TU_CLAVE_DE_GOOGLE_MAPS

# Clave de API para el clima
# Obtenla registrándote en openweathermap.org
VITE_OPENWEATHER_API_KEY=TU_CLAVE_DE_OPENWEATHER

# URL de redirección para el login (para desarrollo local)
VITE_AUTH_REDIRECT_URL=http://localhost:5173/
```

### Paso C: Ejecutar el Proyecto

Una vez configurado el archivo `.env`, inicia la aplicación con el siguiente comando:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## 5. Cómo Actualizar la Base de Conocimiento

El bot utiliza una base de datos interna para recomendaciones turísticas de alta calidad. Para añadir o modificar lugares:

1.  Abre el archivo `src/services/chatbot.ts`.
2.  Busca la constante `touristDB`.
3.  Puedes editar las entradas existentes o añadir nuevas siguiendo el formato JSON.

**Ejemplo de una entrada:**
```json
"20_Sumapaz": [ 
  { "nombre": "Páramo de Sumapaz", "direccion": "Vereda Nazareth", "horario": "6am-4pm", "que_es": "Páramo más grande del mundo" }
]
```
