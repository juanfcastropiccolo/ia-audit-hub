# Plataforma de Auditoría con Agentes IA Jerárquicos

Esta plataforma implementa un sistema multi-agente jerárquico que emula la estructura de una firma de auditoría tradicional, utilizando el Agent Development Kit (ADK) de Google.

## Estructura jerárquica

La plataforma implementa cuatro niveles de agentes IA:

1. **Gerente IA**: Coordina todo el proceso, toma decisiones estratégicas y ofrece conclusiones de alto nivel.
2. **Supervisor IA**: Supervisa a los Senior IA, evalúa la calidad global y coordina entre diferentes áreas.
3. **Senior IA**: Revisa el trabajo de los Asistentes IA y añade análisis contable intermedio.
4. **Asistente IA**: Interactúa directamente con el cliente y realiza tareas operativas básicas.

## Características principales

- **Jerarquía de agentes**: Estructura en árbol multi-nivel donde los agentes superiores delegan tareas a agentes inferiores.
- **Trazabilidad total**: Registro detallado de todas las acciones, decisiones e interacciones de los agentes.
- **Persistencia**: Soporte para almacenamiento persistente en MongoDB.
- **Modelos flexibles**: Capacidad de utilizar modelos de Google (Gemini) o Anthropic (Claude).
- **Herramientas especializadas**: Herramientas para interactuar con Google Sheets, verificar cálculos, etc.
- **Modos de ejecución**: Interfaz por consola o API REST.

## Requisitos

- Python 3.9+
- Google API Key (para Gemini)
- Anthropic API Key (opcional, para Claude)
- MongoDB (opcional, para persistencia)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tuusuario/auditoria_ia.git
   cd auditoria_ia
   ```

2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

3. Crea un archivo `.env` basado en `.env-example`:
   ```bash
   cp .env-example .env
   # Edita el archivo .env con tus claves API
   ```

## Uso

### Modo interactivo

Para iniciar la aplicación en modo interactivo:

```bash
python main.py --mode interactive --agent assistant
```

Opciones adicionales:
- `--agent`: Tipo de agente a utilizar (assistant, senior, supervisor, manager, team, workflow)
- `--mongodb`: Usar MongoDB para persistencia
- `--anthropic`: Usar Claude de Anthropic en lugar de Gemini
- `--client`: ID de cliente personalizado

### Modo API con Frontend

Para iniciar el servidor API con acceso al frontend:

1. Primero, construye la interfaz de usuario:

```bash
./build_frontend.sh
```

2. Inicia el servidor API:

```bash
python main.py --mode api --host 0.0.0.0 --port 8000
```

3. Accede a la aplicación en tu navegador:
   - Interfaz de chat: http://localhost:8000/
   - Dashboard de equipos: http://localhost:8000/dashboard

Opciones adicionales:
- `--host`: Host para el servidor API
- `--port`: Puerto para el servidor API
- `--mongodb`: Usar MongoDB para persistencia
- `--anthropic`: Usar Claude de Anthropic en lugar de Gemini

### Ejemplos de uso

Para ejecutar los ejemplos de demostración:

```bash
python example.py
```

## Estructura del proyecto

- **agents/**: Implementación de los diferentes agentes jerárquicos
- **tools/**: Herramientas especializadas para los agentes
- **utils/**: Utilidades como servicio de sesión persistente
- **frontend/**: Frontend en React con Tailwind (pendiente)
- **config.py**: Configuración global de la aplicación
- **main.py**: Punto de entrada principal
- **example.py**: Ejemplos de demostración

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).

## Créditos

Desarrollado utilizando:
- [Google Agent Development Kit (ADK)](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/)

## Características del Frontend

La aplicación incluye dos interfaces principales:

1. **Interfaz de Chat**: Permite a los clientes interactuar directamente con un Asistente IA para realizar consultas y solicitar verificación de balances. 

2. **Dashboard**: Proporciona una vista en tiempo real de todos los equipos de auditoría activos, incluyendo:
   - Estado de cada equipo y sus agentes
   - Actividad reciente de cada equipo
   - Visualización de eventos por importancia
   - Seguimiento de tareas en curso

El frontend utiliza React con Tailwind CSS y se comunica con el backend usando:
- API REST para operaciones CRUD
- WebSockets para actualizaciones en tiempo real 