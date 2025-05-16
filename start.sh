#!/bin/bash
# Script principal para iniciar la aplicación completa

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}     INICIANDO PLATAFORMA DE AUDITORÍA IA          ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Establecer variables de entorno desde .env
if [ -f .env ]; then
    echo -e "${BLUE}1. Cargando variables de entorno...${NC}"
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}ERROR: No se encontró el archivo .env${NC}"
    echo -e "Por favor, crea el archivo .env con tus claves API"
    exit 1
fi

# Verificar API KEY de Google
if [ -z "$GOOGLE_API_KEY" ]; then
    echo -e "${RED}ERROR: GOOGLE_API_KEY no está configurada en el archivo .env${NC}"
    echo -e "Esta clave es obligatoria para el funcionamiento de la aplicación."
    exit 1
else
    echo -e "${GREEN}✓${NC} GOOGLE_API_KEY configurada correctamente"
fi

# Crear directorios necesarios si no existen
echo -e "${BLUE}2. Creando directorios necesarios...${NC}"
mkdir -p tmp/audit_events tmp/audit_findings tmp/reports uploads logs

# Detener procesos previos si existen
echo -e "${BLUE}3. Deteniendo procesos previos...${NC}"
pkill -f 'litellm|run_api_server.py|npm run dev' 2>/dev/null || true
sleep 2

# Verificar instalación de LiteLLM
if ! command -v litellm &> /dev/null; then
    echo -e "${YELLOW}Instalando LiteLLM...${NC}"
    pip install litellm
fi

# Configurar y iniciar proxy LiteLLM
echo -e "${BLUE}4. Iniciando LiteLLM Proxy...${NC}"
litellm --config config/litellm_config.yaml --port 8080 > logs/litellm.log 2>&1 &
LITELLM_PID=$!
echo -e "   LiteLLM iniciado con PID: $LITELLM_PID"
sleep 5

# Verificar que LiteLLM está funcionando
if ! ps -p $LITELLM_PID > /dev/null; then
    echo -e "${RED}ERROR: No se pudo iniciar LiteLLM Proxy.${NC}"
    echo -e "Revise los logs en logs/litellm.log"
    cat logs/litellm.log
    exit 1
fi
echo -e "${GREEN}✓${NC} LiteLLM iniciado correctamente"

# Iniciar backend
echo -e "${BLUE}5. Iniciando Backend...${NC}"
python run_api_server.py > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "   Backend iniciado con PID: $BACKEND_PID"
sleep 5

# Verificar que el backend está funcionando
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}ERROR: No se pudo iniciar el Backend.${NC}"
    echo -e "Revise los logs en logs/backend.log"
    cat logs/backend.log
    exit 1
fi
echo -e "${GREEN}✓${NC} Backend iniciado correctamente"

# Verificar que npm está instalado en el frontend
if [ ! -f frontend/package.json ]; then
    echo -e "${RED}ERROR: No se encontró package.json en el directorio frontend${NC}"
    exit 1
fi

# Iniciar frontend
echo -e "${BLUE}6. Iniciando Frontend...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "   Frontend iniciado con PID: $FRONTEND_PID"
cd ..
sleep 5

# Verificar que el frontend está funcionando
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${RED}ERROR: No se pudo iniciar el Frontend.${NC}"
    echo -e "Revise los logs en logs/frontend.log"
    cat logs/frontend.log
    exit 1
fi
echo -e "${GREEN}✓${NC} Frontend iniciado correctamente"

# Mensaje de éxito
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}       PLATAFORMA DE AUDITORÍA IA INICIADA        ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e ""
echo -e "La aplicación está disponible en:"
echo -e "  - Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "  - API Backend: ${BLUE}http://localhost:8000${NC}"
echo -e "  - LiteLLM Proxy: ${BLUE}http://localhost:8080${NC}"
echo -e ""
echo -e "Para ver los logs en tiempo real:"
echo -e "  - Frontend: ${YELLOW}tail -f logs/frontend.log${NC}"
echo -e "  - Backend: ${YELLOW}tail -f logs/backend.log${NC}"
echo -e "  - LiteLLM: ${YELLOW}tail -f logs/litellm.log${NC}"
echo -e ""
echo -e "Para detener todos los servicios: ${YELLOW}pkill -f 'litellm|run_api_server.py|npm run dev'${NC}"
