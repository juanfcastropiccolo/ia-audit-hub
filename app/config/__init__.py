"""
Configuraciones para la plataforma de auditoría.
"""

# Importar y exponer las configuraciones
try:
    # Importaciones absolutas
    from auditoria_ia.config.config import (
        APP_NAME,
        HOST,
        PORT,
        ENABLE_TRACING,
        TRACE_LOG_FILE,
        GOOGLE_API_KEY,
        ANTHROPIC_API_KEY,
        MONGODB_CONNECTION_STRING,
        MONGODB_DATABASE,
        DEBUG,
        MANAGER_AGENT_NAME,
        SUPERVISOR_AGENT_NAME,
        SENIOR_AGENT_NAME,
        ASSISTANT_AGENT_NAME,
        DEFAULT_MANAGER_MODEL,
        DEFAULT_SUPERVISOR_MODEL,
        DEFAULT_SENIOR_MODEL,
        DEFAULT_ASSISTANT_MODEL
    )
except ImportError:
    # Importaciones relativas
    from .config import (
        APP_NAME,
        HOST,
        PORT,
        ENABLE_TRACING,
        TRACE_LOG_FILE,
        GOOGLE_API_KEY,
        ANTHROPIC_API_KEY,
        MONGODB_CONNECTION_STRING,
        MONGODB_DATABASE,
        DEBUG,
        MANAGER_AGENT_NAME,
        SUPERVISOR_AGENT_NAME,
        SENIOR_AGENT_NAME,
        ASSISTANT_AGENT_NAME,
        DEFAULT_MANAGER_MODEL,
        DEFAULT_SUPERVISOR_MODEL,
        DEFAULT_SENIOR_MODEL,
        DEFAULT_ASSISTANT_MODEL
    )

__all__ = [
    'APP_NAME',
    'HOST',
    'PORT',
    'ENABLE_TRACING',
    'TRACE_LOG_FILE',
    'GOOGLE_API_KEY',
    'ANTHROPIC_API_KEY',
    'MONGODB_CONNECTION_STRING',
    'MONGODB_DATABASE',
    'DEBUG',
    'MANAGER_AGENT_NAME',
    'SUPERVISOR_AGENT_NAME',
    'SENIOR_AGENT_NAME',
    'ASSISTANT_AGENT_NAME',
    'DEFAULT_MANAGER_MODEL',
    'DEFAULT_SUPERVISOR_MODEL',
    'DEFAULT_SENIOR_MODEL',
    'DEFAULT_ASSISTANT_MODEL'
] 