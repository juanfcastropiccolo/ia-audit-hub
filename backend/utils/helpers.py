"""
Funciones de utilidad para la plataforma de auditoría.
"""

import re
import uuid
from datetime import datetime
from typing import Union, Dict, Any

def format_timestamp(timestamp: Union[float, datetime, str], format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Formatea un timestamp en un formato legible.
    
    Args:
        timestamp: Timestamp en formato Unix, objeto datetime o string ISO.
        format_str: Formato de salida deseado.
        
    Returns:
        String con el timestamp formateado.
    """
    if isinstance(timestamp, float):
        dt = datetime.fromtimestamp(timestamp)
    elif isinstance(timestamp, str):
        try:
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except ValueError:
            # Si no es un formato ISO, intentar con timestamp Unix
            try:
                dt = datetime.fromtimestamp(float(timestamp))
            except (ValueError, TypeError):
                return "Formato de fecha inválido"
    elif isinstance(timestamp, datetime):
        dt = timestamp
    else:
        return "Formato de fecha inválido"
    
    return dt.strftime(format_str)

def validate_client_id(client_id: str) -> bool:
    """
    Valida que un ID de cliente tenga un formato válido.
    
    Args:
        client_id: ID del cliente a validar.
        
    Returns:
        True si el ID es válido, False en caso contrario.
    """
    # Validar que no esté vacío
    if not client_id:
        return False
    
    # Validar formato: letras, números, guiones y guiones bajos
    pattern = r'^[a-zA-Z0-9\-_]+$'
    if not re.match(pattern, client_id):
        return False
    
    # Validar longitud
    if len(client_id) < 4 or len(client_id) > 64:
        return False
    
    return True

def generate_client_id() -> str:
    """
    Genera un nuevo ID de cliente aleatorio.
    
    Returns:
        ID del cliente generado.
    """
    return f"client_{uuid.uuid4().hex[:8]}"

def sanitize_input(text: str) -> str:
    """
    Sanitiza la entrada del usuario eliminando caracteres potencialmente peligrosos.
    
    Args:
        text: Texto a sanitizar.
        
    Returns:
        Texto sanitizado.
    """
    # Eliminar caracteres de control excepto saltos de línea y tabuladores
    result = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Eliminar caracteres potencialmente peligrosos para inyección
    result = re.sub(r'[<>]', '', result)
    
    return result 