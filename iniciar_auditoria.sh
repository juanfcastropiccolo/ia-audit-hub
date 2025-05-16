#!/bin/bash

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}     PLATAFORMA DE AUDITORÍA IA - INICIO RÁPIDO    ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar y solicitar API KEY si es necesario
if [ -z "$GOOGLE_API_KEY" ]; then
    echo -e "${YELLOW}No se encontró GOOGLE_API_KEY en las variables de entorno.${NC}"
    read -p "¿Quieres ingresar tu clave de API de Google ahora? (s/n): " confirm
    if [[ $confirm == [sS] ]]; then
        read -p "Ingresa tu GOOGLE_API_KEY: " api_key
        export GOOGLE_API_KEY=$api_key
        
        # Guardar en .env para futuras ejecuciones
        echo -e "\nGuardando API KEY en app/.env..."
        mkdir -p app
        echo "GOOGLE_API_KEY=$api_key" > app/.env
        echo "APP_NAME=\"Auditoría IA\"" >> app/.env
        echo "HOST=\"0.0.0.0\"" >> app/.env
        echo "PORT=8000" >> app/.env
        echo "DEBUG=true" >> app/.env
    else
        echo -e "${RED}No se puede continuar sin una API KEY de Google.${NC}"
        exit 1
    fi
fi

# Verificar si existe la carpeta app
if [ ! -d "app" ]; then
    echo -e "${YELLOW}No se encontró la carpeta 'app'. Ejecutando script de reorganización...${NC}"
    ./cleanup.sh
    if [ ! -d "app" ]; then
        echo -e "${RED}No se pudo crear la carpeta 'app'. Abortando.${NC}"
        exit 1
    fi
fi

# Asegurarse de que app/.env tiene GOOGLE_API_KEY
if [ ! -f "app/.env" ] || ! grep -q "GOOGLE_API_KEY" "app/.env"; then
    echo -e "${YELLOW}Creando/actualizando archivo app/.env...${NC}"
    echo "GOOGLE_API_KEY=$GOOGLE_API_KEY" > app/.env
    echo "APP_NAME=\"Auditoría IA\"" >> app/.env
    echo "HOST=\"0.0.0.0\"" >> app/.env
    echo "PORT=8000" >> app/.env
    echo "DEBUG=true" >> app/.env
fi

# Detener procesos anteriores
echo -e "${BLUE}Deteniendo procesos previos...${NC}"
pkill -f 'run_api_server.py|npm run dev' 2>/dev/null || true
sleep 2

# Ir a la carpeta app y ejecutar el script simple_run.py
echo -e "${BLUE}Iniciando la aplicación...${NC}"
cd app
python3 simple_run.py 