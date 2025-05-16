import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Configuración de la base de datos
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "auditoria_ia")

# Configuración de la aplicación
APP_NAME = "auditoria_ia"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Configuración del servidor
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Nombres de los agentes
MANAGER_AGENT_NAME = "gerente_ia"
SUPERVISOR_AGENT_NAME = "supervisor_ia"
SENIOR_AGENT_NAME = "senior_ia"
ASSISTANT_AGENT_NAME = "asistente_ia"

# Configuración de modelos por defecto
DEFAULT_MANAGER_MODEL = "gemini-2.0-flash-exp"
DEFAULT_SUPERVISOR_MODEL = "gemini-2.0-flash-exp"
DEFAULT_SENIOR_MODEL = "gemini-2.0-flash-exp"
DEFAULT_ASSISTANT_MODEL = "gemini-2.0-flash-exp"

# Configuración de trazabilidad
ENABLE_TRACING = True
TRACE_LOG_FILE = "audit_trace.log" 