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
    default_port = int(os.getenv("PORT", "8000"))
    # Buscar un puerto libre si el por defecto está en uso
    try:
        from backend.main import find_available_port
        available_port = find_available_port(default_port)
        if available_port is None:
            print(f"Advertencia: no se pudo encontrar un puerto libre. Usando {default_port}.")
            port = default_port
        elif available_port != default_port:
            print(f"El puerto {default_port} está en uso. Usando el puerto {available_port}.")
            port = available_port
        else:
            port = default_port
    except ImportError:
        port = default_port

    # Mensaje de inicio
    print(f"Iniciando servidor en {host}:{port}")
    print(f"Directorio base: {BASE_DIR}")

    # Asegurarse de que los directorios necesarios existen
    os.makedirs(os.path.join(BASE_DIR, "tmp", "audit_events"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "tmp", "audit_findings"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "tmp", "reports"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "uploads"), exist_ok=True)

    # Preparar argumentos para iniciar en modo API y lanzar Uvicorn
    import sys
    sys.argv = [sys.argv[0], "--mode", "api", "--host", host, "--port", str(port)]
    from backend.main import main
    main()