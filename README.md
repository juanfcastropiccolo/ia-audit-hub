# AUDIT-IA - Plataforma de Simulación de Auditoría con IA

Esta plataforma proporciona una simulación de un sistema de auditoría que utiliza múltiples agentes de IA en una jerarquía. El sistema permite a los clientes interactuar con asistentes de IA y recibir respuestas que pasan por múltiples niveles de revisión simulados.

## Características Principales

- **Chat con Asistentes IA**: Interfaz intuitiva para comunicarse con agentes de IA simulando un entorno de auditoría.
- **Sistema de Multi-Agentes**: Implementación de cuatro niveles de agentes (Asistente, Senior, Supervisor y Manager) con flujo de trabajo secuencial.
- **Carga de Archivos**: Capacidad para subir archivos financieros (Excel, CSV, PDF) para su análisis.
- **Selección de Modelo**: Opciones para seleccionar entre diferentes proveedores de LLM (Google Gemini, OpenAI GPT-4, Anthropic Claude).
- **Panel de Administración**: Monitoreo de equipos de auditoría, eventos y configuración del sistema.

## Arquitectura

- **Frontend**: React con TypeScript, Tailwind CSS para UI
- **Backend**: Python con FastAPI y Google Agent Development Kit (ADK)
- **Modelos**: Integración con múltiples LLMs a través de LiteLLM

## Estructura del Proyecto

- `auditoria_ia/`: Código del backend con ADK y API REST
  - `agents/`: Implementación de los diferentes agentes y su jerarquía
  - `tools/`: Herramientas para análisis financiero y procesamiento de datos
  - `utils/`: Utilidades y servicios auxiliares
- `frontend/`: Aplicación web React con TypeScript
  - `src/components/`: Componentes de UI para el chat, dashboard, etc.
  - `src/api/`: Funciones para comunicación con el backend
- `uploads/`: Directorio para almacenar los archivos subidos por los clientes
- Scripts para iniciar los distintos componentes

## Cómo Iniciar la Aplicación

### Requisitos Previos

- Python 3.9+ 
- Node.js 18+ y npm
- Claves API para los LLMs (opcional, solo necesario para los modelos que desee usar)

### Configuración del Backend

1. Cree un archivo `.env` en el directorio raíz con sus claves API:

```
# Al menos una de estas claves es necesaria para usar modelos externos
GOOGLE_API_KEY=your_google_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# Opcional, para persistencia de datos
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
```

2. Instale las dependencias del backend:

```bash
pip install -r auditoria_ia/requirements.txt
```

### Instalación del Frontend

1. Instale las dependencias del frontend:

```bash
cd frontend
npm install
```

### Iniciar la Aplicación

Puede iniciar todos los componentes con el script de inicio:

```bash
./start_all.sh
```

O iniciar los componentes individualmente:

- Para iniciar solo el backend:
```bash
./start_backend.sh
```

- Para iniciar solo el frontend:
```bash
./start_frontend.sh
```

La aplicación estará disponible en:
- Frontend: http://localhost:5174
- API Backend: http://localhost:8000/api

## Flujo de Trabajo de Multi-Agentes

1. **Assistant Agent**: Primera línea de contacto con el cliente. Recibe consultas y archivos.
2. **Senior Agent**: Revisa las respuestas del Asistente y mejora la calidad.
3. **Supervisor Agent**: Supervisa el cumplimiento de políticas y agrega contexto empresarial.
4. **Manager Agent**: Realiza la revisión final y aprueba las respuestas al cliente.

Cada nivel de agente puede ejecutarse con diferentes modelos LLM configurables desde el panel de administración.

## Credenciales de Acceso

- **Admin**: admin@audit.com / password
- **Cliente**: cliente@empresa.com / password

## Estado Actual

- ✅ Interfaz de chat completa con carga de archivos
- ✅ Procesamiento de archivos (Excel, CSV, PDF)
- ✅ Implementación de jerarquía de agentes
- ✅ Panel de administración para cambio de modelo
- ✅ API backend funcionando con FastAPI
- ✅ Integración con múltiples proveedores de LLM 
