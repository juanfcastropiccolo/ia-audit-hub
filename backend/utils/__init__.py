"""
Utilidades y servicios para la plataforma de auditoría.
"""

# Importar y exponer las clases/funciones de utilidad
try:
    # Importaciones absolutas
    from backend.utils.mongodb import MongoDBSessionService
    from backend.utils.helpers import format_timestamp, validate_client_id
    from backend.utils.logger import setup_logger
except ImportError:
    # Importaciones relativas
    from .mongodb import MongoDBSessionService
    from .helpers import format_timestamp, validate_client_id
    from .logger import setup_logger

__all__ = [
    'MongoDBSessionService',
    'format_timestamp',
    'validate_client_id',
    'setup_logger'
] 