#!/usr/bin/env python3
"""
Script simplificado para iniciar la Plataforma de Auditoría IA usando solo el modelo Gemini.
No requiere configuración de LiteLLM ni otros componentes complejos.
"""
import os
import sys
import subprocess
import time
import signal
import atexit
from pathlib import Path

# Definir directorio base
BASE_DIR = Path(__file__).resolve().parent

# Crear directorios necesarios
os.makedirs(BASE_DIR / "tmp" / "audit_events", exist_ok=True)
os.makedirs(BASE_DIR / "tmp" / "audit_findings", exist_ok=True)
os.makedirs(BASE_DIR / "tmp" / "reports", exist_ok=True)
os.makedirs(BASE_DIR / "uploads", exist_ok=True)
os.makedirs(BASE_DIR / "logs", exist_ok=True)

# Limpiar procesos previos
print("Limpiando procesos previos...")
os.system("pkill -f 'run_api_server.py|npm run dev' 2>/dev/null || true")
time.sleep(2)

# Verificar API Key de Google
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    # Intentar cargar desde .env
    try:
        with open(BASE_DIR / ".env") as f:
            for line in f:
                if line.strip().startswith("GOOGLE_API_KEY="):
                    api_key = line.strip().split("=", 1)[1].strip('"\'')
                    os.environ["GOOGLE_API_KEY"] = api_key
                    break
    except FileNotFoundError:
        pass

if not api_key:
    print("\033[91mERROR: No se encontró GOOGLE_API_KEY\033[0m")
    print("Por favor, establece la variable de entorno GOOGLE_API_KEY o crea un archivo .env con esta variable.")
    sys.exit(1)

print(f"\033[92m✓ GOOGLE_API_KEY configurada correctamente\033[0m")

# Configurar variables de entorno para el backend
os.environ["APP_NAME"] = "Auditoría IA"
os.environ["HOST"] = "0.0.0.0"
os.environ["PORT"] = "8000"
os.environ["DEBUG"] = "true"

# Lista de procesos para limpieza al salir
processes = []

def cleanup():
    """Limpia los procesos al salir."""
    print("\nDeteniendo procesos...")
    for p in processes:
        try:
            p.terminate()
            p.wait(timeout=5)
            print(f"Proceso {p.pid} terminado.")
        except:
            print(f"No se pudo terminar proceso {p.pid}. Intentando matar...")
            try:
                p.kill()
            except:
                pass

# Registrar función de limpieza
atexit.register(cleanup)

# Iniciar el backend
print("\n\033[94mIniciando Backend...\033[0m")
backend_log = open(BASE_DIR / "logs" / "backend.log", "w")
backend_process = subprocess.Popen(
    [sys.executable, str(BASE_DIR / "run_api_server.py")],
    stdout=backend_log,
    stderr=backend_log
)
processes.append(backend_process)
print(f"Backend iniciado con PID: {backend_process.pid}")

# Esperar a que el backend esté listo
time.sleep(5)

# Iniciar el frontend
print("\n\033[94mIniciando Frontend...\033[0m")
frontend_log = open(BASE_DIR / "logs" / "frontend.log", "w")
os.chdir(BASE_DIR / "frontend")
frontend_process = subprocess.Popen(
    ["npm", "run", "dev"],
    stdout=frontend_log,
    stderr=frontend_log
)
processes.append(frontend_process)
print(f"Frontend iniciado con PID: {frontend_process.pid}")

# Volver al directorio original
os.chdir(BASE_DIR)

# Verificar si los procesos están ejecutándose
time.sleep(5)
backend_running = backend_process.poll() is None
frontend_running = frontend_process.poll() is None

if not backend_running:
    print("\033[91mERROR: El backend no se inició correctamente\033[0m")
    print("Revisa los logs en logs/backend.log")
    with open(BASE_DIR / "logs" / "backend.log") as f:
        print(f.read())
    sys.exit(1)

if not frontend_running:
    print("\033[91mERROR: El frontend no se inició correctamente\033[0m")
    print("Revisa los logs en logs/frontend.log")
    with open(BASE_DIR / "logs" / "frontend.log") as f:
        print(f.read())
    sys.exit(1)

# Mensaje de éxito
print("\n\033[92m==================================================\033[0m")
print("\033[92m       PLATAFORMA DE AUDITORÍA IA INICIADA        \033[0m")
print("\033[92m==================================================\033[0m")
print("")
print("La aplicación está disponible en:")
print(f"  - Frontend: \033[94mhttp://localhost:5173\033[0m")
print(f"  - API Backend: \033[94mhttp://localhost:8000\033[0m")
print("")

# Mantener el script ejecutándose
try:
    while True:
        # Verificar si los procesos siguen ejecutándose
        if backend_process.poll() is not None:
            print("\033[91mERROR: El proceso del backend ha terminado\033[0m")
            sys.exit(1)
        
        if frontend_process.poll() is not None:
            print("\033[91mERROR: El proceso del frontend ha terminado\033[0m")
            sys.exit(1)
            
        time.sleep(2)
except KeyboardInterrupt:
    print("\nCerrando aplicación...")
    # La limpieza se hará automáticamente con atexit 