import os
from dotenv import load_dotenv
from google.adk.models.lite_llm import LiteLlm

# Cargar variables de entorno
load_dotenv()

# Configuración de API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ──────────────────────────── Supabase ─────────────────────────────
SUPABASE_URL = "https://wdhpfvgidwmporwuwtiy.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHBmdmdpZHdtcG9yd3V3dGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MDUxMDksImV4cCI6MjA2Mjk4MTEwOX0.aX4j-goFOo_9c9rQ8rd96Hdxv0AKo8RQPqYUDf01TEM"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHBmdmdpZHdtcG9yd3V3dGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQwNTEwOSwiZXhwIjoyMDYyOTgxMTA5fQ.XEFOF300eN56Cnxg-B3POlfRl3b3RmPwcM_D7S2htF8"
SUPABASE_JWT_SECRET = "cYi4DhEipCrU5q577MptOOe/RWZEOJpMQi7czbtH7+nfDX8DciM39tSvoNwGrNRMhvwJEVLvFA/qULINV3Yp7Q=="
SUPABASE_SCHEMA = "public"  # Schema expuesto

# Configuración de la aplicación
APP_NAME = "audit-ia"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Configuración del servidor
HOST = os.getenv("HOST", "0.0.0.0")
try:
    port_str = os.getenv("PORT", "8000")
    # Si el valor contiene espacios, podría haber un error en el archivo .env
    if " " in port_str:
        port_str = port_str.split(" ")[0]  # Tomar solo la primera parte
    PORT = int(port_str)
except ValueError:
    # Valor por defecto en caso de error
    PORT = 8000
    print(f"Error al leer PORT de las variables de entorno. Usando valor por defecto: {PORT}")

# Nombres de los agentes
MANAGER_AGENT_NAME = "gerente_ia"
SUPERVISOR_AGENT_NAME = "supervisor_ia"
SENIOR_AGENT_NAME = "senior_ia"
ASSISTANT_AGENT_NAME = "asistente_ia"

# Nombres de los modelos para instanciar
GEMINI_PRO_MODEL = "gemini/gemini-1.5-pro"
GEMINI_FLASH_MODEL = "gemini/gemini-1.5-flash"
CLAUDE_OPUS_MODEL = "anthropic/claude-3-opus"
CLAUDE_SONNET_MODEL = "anthropic/claude-3-sonnet"
CLAUDE_HAIKU_MODEL = "anthropic/claude-3-haiku"
GPT4_MODEL = "openai/gpt-4"
GPT35_MODEL = "openai/gpt-3.5-turbo"

# Configuración de modelos por defecto instanciados con LiteLlm
DEFAULT_MANAGER_MODEL = LiteLlm(model=GEMINI_PRO_MODEL)
DEFAULT_SUPERVISOR_MODEL = LiteLlm(model=GEMINI_PRO_MODEL)
DEFAULT_SENIOR_MODEL = LiteLlm(model=GEMINI_FLASH_MODEL)
DEFAULT_ASSISTANT_MODEL = LiteLlm(model=GEMINI_FLASH_MODEL)

# Configuración de trazabilidad
ENABLE_TRACING = True
TRACE_LOG_FILE = "audit_trace.log"