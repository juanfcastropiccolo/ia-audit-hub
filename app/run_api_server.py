#!/usr/bin/env python3
import os
import sys
import uvicorn
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configurar directorio raíz de la aplicación
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Añadir directorio raíz al path para poder importar los módulos
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

if __name__ == "__main__":
    # Configuración del servidor
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    # Mensaje de inicio
    print(f"Iniciando servidor en {host}:{port}")
    print(f"Directorio base: {BASE_DIR}")
    
    # Asegurarse de que los directorios necesarios existen
    os.makedirs(os.path.join(BASE_DIR, "tmp", "audit_events"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "tmp", "audit_findings"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "tmp", "reports"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "uploads"), exist_ok=True)
    
    # Configurar y iniciar el servidor FastAPI
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    ) 