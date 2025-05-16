# Correcciones a la Integración LLM (Method Not Allowed 405)

## Resumen del Problema

El problema principal era un error HTTP 405 "Method Not Allowed" que ocurría al intentar usar los modelos Claude de Anthropic o los modelos GPT de OpenAI. Este error se producía porque la configuración de LiteLlm tenía problemas con:

1. La estructura de los prefijos de los modelos
2. La gestión de las API Keys
3. El formato de las solicitudes HTTP
4. La falta de soporte para streaming adecuado

## Correcciones Implementadas

### 1. Actualización de Modelos en config.py

- Corregido el formato de los nombres de modelos para usar correctamente los prefijos requeridos por LiteLlm:
  - Gemini: `gemini/gemini-1.5-pro`, `gemini/gemini-1.5-flash`
  - Claude: `anthropic/claude-3-opus`, `anthropic/claude-3-sonnet`, `anthropic/claude-3-haiku`
  - GPT: `openai/gpt-4`, `openai/gpt-3.5-turbo`

### 2. Corrección de Functions de Creación de Agentes

- Añadida verificación correcta de API Keys en cada función de creación de agentes:
  - `create_assistant_agent`
  - `create_senior_agent`
  - `create_supervisor_agent`
  - `create_manager_agent`
- Habilitado correctamente el streaming con `stream=True` en todos los modelos
- Mejorado el manejo de excepciones para proporcionar mensajes de error más útiles

### 3. Mejora del Endpoint de API

- Añadido logging detallado para mejor diagnóstico
- Corregido el manejo de errores en el endpoint `/api/chat`
- Implementado un manejo más robusto del streaming de respuestas
- Mejorada la detección y uso de diferentes proveedores de LLM

### 4. Configuración Avanzada con LiteLlm Proxy

- Creado un nuevo script `start_litellm_proxy.sh` que lanza un servidor proxy LiteLlm
- El proxy implementa una capa de abstracción que gestiona correctamente las solicitudes a diferentes proveedores
- Configurado para manejar todas las API keys y parámetros de forma centralizada
- Evita problemas de Method Not Allowed al usar el formato correcto para cada LLM

### 5. Scripts de Inicio Mejorados

- `start_all.sh`: Inicia todo el stack (LiteLlm Proxy + Backend + Frontend)
- Corrección automática de la configuración en el .env
- Verificación correcta de API Keys
- Gestión de procesos para iniciar y detener adecuadamente los servicios

### 6. Archivos de Configuración y Ejemplos

- Creado `config.yaml.example` con la configuración correcta para LiteLlm
- Creado `.env-example` con el formato correcto para las API Keys
- Documentación sobre cómo usar los nuevos scripts
- Mejoras en el registro (logging) para facilitar la solución de problemas

## Cómo Usar la Solución

### Opción 1: Ejecutar todo junto
```bash
./start_all.sh
```
Esto iniciará automáticamente:
1. El proxy LiteLlm en el puerto 8080
2. El backend en el puerto 8000
3. El frontend en el puerto 3000 (si está disponible)

### Opción 2: Ejecutar solo el proxy LiteLlm
```bash
./start_litellm_proxy.sh
```
Y luego ejecutar el backend con:
```bash
./start_backend.sh
```

### Opción 3: Modelos específicos
Usar los scripts específicos para cada tipo de modelo:
- `./start_backend_claude.sh` (para modelos Claude)
- `./start_backend_openai.sh` (para modelos OpenAI/GPT)
- `./start_backend.sh` (para modelos Gemini/Google)

## Notas Importantes

- El problema principal era que la biblioteca LiteLlm necesita un formato específico para llamar a los diferentes proveedores de LLM
- El error 405 "Method Not Allowed" se producía porque se estaba usando un método HTTP incorrecto para la API de Anthropic
- La solución preferida es usar el proxy LiteLlm para gestionar todas las solicitudes, ya que proporciona un nivel adicional de abstracción que evita estos problemas
- Se ha mejorado la gestión de errores para proporcionar mensajes más claros cuando algo va mal 