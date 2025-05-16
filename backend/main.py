import os
import argparse
import uuid
import time
import json
import sys
import socket
from datetime import datetime
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from collections import deque

# Add the parent directory to sys.path to ensure imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Cargar variables de entorno
load_dotenv()

# Intentar importar los componentes directamente
from auditoria_ia.config import APP_NAME, HOST, PORT
from auditoria_ia.agents import (
    create_assistant_agent, 
    create_senior_agent, 
    create_supervisor_agent, 
    create_manager_agent, 
    create_audit_team, 
    create_workflow_audit_team, 
    create_assistant_only
)
from auditoria_ia.utils.mongodb_service import MongoDBSessionService

def initialize_session_service(use_mongodb=False):
    """Inicializa el servicio de sesión según la configuración.
    
    Args:
        use_mongodb: Si se debe usar MongoDB en lugar de memoria.
        
    Returns:
        El servicio de sesión inicializado.
    """
    if use_mongodb and os.getenv("MONGODB_CONNECTION_STRING"):
        print("Inicializando servicio de sesión con MongoDB...")
        return MongoDBSessionService()
    else:
        print("Inicializando servicio de sesión en memoria...")
        return InMemorySessionService()

def run_assistant_agent(client_id, session_id, message, use_mongodb=False, use_anthropic=False, use_openai=False):
    """Ejecuta el agente Asistente IA para una interacción simple.
    
    Args:
        client_id: ID del cliente.
        session_id: ID de la sesión.
        message: Mensaje del usuario.
        use_mongodb: Si se debe usar MongoDB para persistencia.
        use_anthropic: Si se debe usar Claude de Anthropic.
        use_openai: Si se debe usar GPT de OpenAI.
        
    Returns:
        La respuesta del agente.
    """
    # Inicializar el servicio de sesión
    session_service = initialize_session_service(use_mongodb)
    
    # Crear el agente asistente
    print(f"Creando agente asistente con use_anthropic={use_anthropic}, use_openai={use_openai}")
    assistant_agent = create_assistant_only(client_id, use_anthropic=use_anthropic, use_openai=use_openai)
    
    # Loguear información del modelo
    if hasattr(assistant_agent.model, 'model'):
        print(f"Modelo seleccionado para el asistente: {assistant_agent.model.model}")
    else:
        print(f"Modelo seleccionado: {assistant_agent.model}")
    
    # Crear un runner para el agente
    runner = Runner(
        agent=assistant_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Asegurarse de que existe la sesión
    session = session_service.get_session(APP_NAME, client_id, session_id)
    if not session:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={
                "client_id": client_id
            }
        )
    
    # Crear contenido de mensaje
    content = types.Content(role='user', parts=[types.Part(text=message)])
    print(f"Enviando mensaje al agente: '{message[:50]}...'")
    
    # Ejecutar el agente y obtener respuesta
    response = None
    try:
        for event in runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content
        ):
            if event.is_final_response():
                response = event.content
        
        # Extraer texto de la respuesta
        response_text = ""
        if response and response.parts:
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    response_text += part.text
        
        print(f"Respuesta recibida - longitud: {len(response_text)}")
        return response_text
    except Exception as e:
        error_msg = f"Error en run_assistant_agent: {str(e)}"
        print(error_msg)
        return f"Lo siento, hubo un error al comunicarse con el modelo. {str(e)}"

def run_senior_agent(client_id, session_id, message, use_mongodb=False, use_anthropic=False, use_openai=False):
    """Ejecuta el agente Senior IA para análisis financiero.
    
    Args:
        client_id: ID del cliente.
        session_id: ID de la sesión.
        message: Mensaje del usuario.
        use_mongodb: Si se debe usar MongoDB para persistencia.
        use_anthropic: Si se debe usar Claude de Anthropic.
        use_openai: Si se debe usar GPT de OpenAI.
        
    Returns:
        La respuesta del agente.
    """
    # Inicializar el servicio de sesión
    session_service = initialize_session_service(use_mongodb)
    
    # Crear el agente senior
    print(f"Creando agente senior con use_anthropic={use_anthropic}, use_openai={use_openai}")
    senior_agent = create_senior_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    
    # Loguear información del modelo
    if hasattr(senior_agent.model, 'model'):
        print(f"Modelo seleccionado para el senior: {senior_agent.model.model}")
    else:
        print(f"Modelo seleccionado: {senior_agent.model}")
    
    # Crear un runner para el agente
    runner = Runner(
        agent=senior_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Asegurarse de que existe la sesión
    session = session_service.get_session(APP_NAME, client_id, session_id)
    if not session:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={
                "client_id": client_id
            }
        )
    
    # Crear contenido de mensaje
    content = types.Content(role='user', parts=[types.Part(text=message)])
    print(f"Enviando mensaje al agente: '{message[:50]}...'")
    
    # Ejecutar el agente y obtener respuesta
    response = None
    try:
        for event in runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content
        ):
            if event.is_final_response():
                response = event.content
        
        # Extraer texto de la respuesta
        response_text = ""
        if response and response.parts:
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    response_text += part.text
        
        print(f"Respuesta recibida - longitud: {len(response_text)}")
        return response_text
    except Exception as e:
        error_msg = f"Error en run_senior_agent: {str(e)}"
        print(error_msg)
        return f"Lo siento, hubo un error al comunicarse con el modelo. {str(e)}"

def run_supervisor_agent(client_id, session_id, message, use_mongodb=False, use_anthropic=False, use_openai=False):
    """Ejecuta el agente Supervisor IA para supervisión del proceso.
    
    Args:
        client_id: ID del cliente.
        session_id: ID de la sesión.
        message: Mensaje del usuario.
        use_mongodb: Si se debe usar MongoDB para persistencia.
        use_anthropic: Si se debe usar Claude de Anthropic.
        use_openai: Si se debe usar GPT de OpenAI.
        
    Returns:
        La respuesta del agente.
    """
    # Inicializar el servicio de sesión
    session_service = initialize_session_service(use_mongodb)
    
    # Crear el agente supervisor
    supervisor_agent = create_supervisor_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    
    # Crear un runner para el agente
    runner = Runner(
        agent=supervisor_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Asegurarse de que existe la sesión
    session = session_service.get_session(APP_NAME, client_id, session_id)
    if not session:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={
                "client_id": client_id
            }
        )
    
    # Crear contenido de mensaje
    content = types.Content(role='user', parts=[types.Part(text=message)])
    
    # Ejecutar el agente y obtener respuesta
    response = None
    for event in runner.run(
        user_id=client_id,
        session_id=session_id,
        new_message=content
    ):
        if event.is_final_response():
            response = event.content
    
    # Extraer texto de la respuesta
    response_text = ""
    if response and response.parts:
        for part in response.parts:
            if hasattr(part, 'text') and part.text:
                response_text += part.text
    
    return response_text

def run_manager_agent(client_id, session_id, message, use_mongodb=False, use_anthropic=False, use_openai=False):
    """Ejecuta el agente Gerente IA para toma de decisiones.
    
    Args:
        client_id: ID del cliente.
        session_id: ID de la sesión.
        message: Mensaje del usuario.
        use_mongodb: Si se debe usar MongoDB para persistencia.
        use_anthropic: Si se debe usar Claude de Anthropic.
        use_openai: Si se debe usar GPT de OpenAI.
        
    Returns:
        La respuesta del agente.
    """
    # Inicializar el servicio de sesión
    session_service = initialize_session_service(use_mongodb)
    
    # Crear el agente gerente
    manager_agent = create_manager_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    
    # Crear un runner para el agente
    runner = Runner(
        agent=manager_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Asegurarse de que existe la sesión
    session = session_service.get_session(APP_NAME, client_id, session_id)
    if not session:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={
                "client_id": client_id
            }
        )
    
    # Crear contenido de mensaje
    content = types.Content(role='user', parts=[types.Part(text=message)])
    
    # Ejecutar el agente y obtener respuesta
    response = None
    for event in runner.run(
        user_id=client_id,
        session_id=session_id,
        new_message=content
    ):
        if event.is_final_response():
            response = event.content
    
    # Extraer texto de la respuesta
    response_text = ""
    if response and response.parts:
        for part in response.parts:
            if hasattr(part, 'text') and part.text:
                response_text += part.text
    
    return response_text

def run_team_agent(client_id, session_id, message, use_mongodb=False, use_anthropic=False, use_openai=False):
    """Ejecuta el equipo completo de agentes (asistente, senior, supervisor, manager) en secuencia.
    
    Args:
        client_id: ID del cliente.
        session_id: ID de la sesión.
        message: Mensaje del usuario.
        use_mongodb: Si se debe usar MongoDB para persistencia.
        use_anthropic: Si se debe usar Claude de Anthropic.
        use_openai: Si se debe usar GPT de OpenAI.
        
    Returns:
        La respuesta final del equipo (después de pasar por todos los niveles).
    """
    # UPDATED: Enhanced implementation for multi-agent workflow
    # Initialize the session service
    session_service = initialize_session_service(use_mongodb)
    
    # Create the sequential workflow audit team
    print(f"Creando equipo de auditoría con use_anthropic={use_anthropic}, use_openai={use_openai}")
    workflow_agent, team_agents = create_workflow_audit_team(client_id, use_anthropic=use_anthropic, use_openai=use_openai)
    
    # Log the model information
    agent_names = list(team_agents.keys())
    print(f"Equipo creado con agentes: {', '.join(agent_names)}")
    
    # Create a runner for the workflow agent
    runner = Runner(
        agent=workflow_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Ensure the session exists
    session = session_service.get_session(APP_NAME, client_id, session_id)
    if not session:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={
                "client_id": client_id,
                "audit_process": "starting",  # Track the state of the audit process
                "agent_responses": {}  # Store responses from each agent
            }
        )
    
    # Create message content
    content = types.Content(role='user', parts=[types.Part(text=message)])
    print(f"Sending message to audit team: '{message[:50]}...'")
    
    # Store for tracking the intermediate responses
    intermediate_responses = {}
    
    # Execute the workflow and get the final response
    try:
        response = None
        current_agent = None
        
        # Process the message through the sequential agent workflow
        for event in runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content
        ):
            if event.is_tool_call():
                # Identify which agent is currently processing
                called_tool = event.tool_call.name
                print(f"Tool call to: {called_tool}")
                if called_tool == "assistant_agent":
                    current_agent = "assistant"
                elif called_tool == "senior_agent":
                    current_agent = "senior"
                elif called_tool == "supervisor_agent":
                    current_agent = "supervisor"
                elif called_tool == "manager_agent":
                    current_agent = "manager"
                
                print(f"Procesando con agente: {current_agent}")
            
            if event.is_tool_response() and current_agent:
                # Get the response from the current agent
                agent_response = event.tool_response.get('response', '')
                if isinstance(agent_response, types.Content) and agent_response.parts:
                    agent_response_text = ""
                    for part in agent_response.parts:
                        if hasattr(part, 'text') and part.text:
                            agent_response_text += part.text
                    
                    intermediate_responses[current_agent] = agent_response_text
                    print(f"Respuesta de {current_agent} guardada ({len(agent_response_text)} caracteres)")
            
            if event.is_final_response():
                response = event.content
        
        # Extract text from the final response
        response_text = ""
        if response and response.parts:
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    response_text += part.text
        
        # Update session state with all agent responses
        session = session_service.get_session(APP_NAME, client_id, session_id)
        if session:
            session_state = session.state or {}
            session_state["audit_process"] = "completed"
            session_state["agent_responses"] = intermediate_responses
            session_service.update_session(
                app_name=APP_NAME,
                user_id=client_id,
                session_id=session_id,
                state=session_state
            )
        
        print(f"Final response received - length: {len(response_text)}")
        return response_text
    except Exception as e:
        error_msg = f"Error in run_team_agent: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return f"Lo siento, hubo un error al procesar con el equipo de auditoría. {str(e)}"

def find_available_port(start_port, max_attempts=100):
    """Busca un puerto disponible, comenzando desde start_port.
    
    Args:
        start_port: Puerto inicial para la búsqueda.
        max_attempts: Número máximo de puertos a intentar.
        
    Returns:
        Un puerto disponible.
    """
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            result = sock.connect_ex(('localhost', port))
            if result != 0:  # Si no se puede conectar, el puerto está disponible
                return port
    
    # Si no se encuentra ningún puerto disponible, devolver None
    return None

def main():
    """Función principal para iniciar la aplicación."""
    parser = argparse.ArgumentParser(description="Plataforma de Auditoría con Agentes IA Jerárquicos")
    
    # Argumentos generales
    parser.add_argument("--mode", type=str, choices=["interactive", "api"], default="interactive",
                      help="Modo de ejecución: interactive para consola, api para servidor web")
    parser.add_argument("--mongodb", action="store_true", help="Usar MongoDB para persistencia")
    parser.add_argument("--anthropic", action="store_true", help="Usar Claude de Anthropic en lugar de Gemini")
    parser.add_argument("--openai", action="store_true", help="Usar GPT de OpenAI en lugar de Gemini")
    
    # Argumentos para modo interactivo
    parser.add_argument("--client", type=str, help="ID del cliente (para modo interactivo)")
    parser.add_argument("--agent", type=str, choices=["assistant", "senior", "supervisor", "manager", "team", "workflow"],
                      default="assistant", help="Tipo de agente a utilizar (para modo interactivo)")
    
    # Argumentos para modo API
    parser.add_argument("--host", type=str, default=HOST, help="Host para el servidor API (para modo api)")
    parser.add_argument("--port", type=int, default=PORT, help="Puerto para el servidor API (para modo api)")
    
    args = parser.parse_args()
    
    # Verificar que tenemos las API keys necesarias
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY no encontrada en variables de entorno o .env")
        exit(1)
    
    if args.anthropic and not os.getenv("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY no encontrada, pero se solicitó usar Anthropic")
        exit(1)
    
    if args.openai and not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY no encontrada, pero se solicitó usar OpenAI")
        exit(1)
    
    # Iniciar en modo interactivo o API según lo solicitado
    if args.mode == "interactive":
        run_interactive_mode(args)
    else:
        run_api_mode(args)

def run_interactive_mode(args):
    """Ejecuta la aplicación en modo interactivo por consola."""
    import uuid
    import time
    
    # Generar ID de cliente si no se proporciona
    client_id = args.client or f"client_{uuid.uuid4().hex[:8]}"
    session_id = f"session_{uuid.uuid4().hex[:8]}"
    
    print(f"Iniciando modo interactivo con cliente: {client_id}")
    print(f"Usando MongoDB: {args.mongodb}")
    print(f"Usando Anthropic: {args.anthropic}")
    print(f"Usando OpenAI: {args.openai}")
    print("---------------------------------------")
    
    # Inicializar el servicio de sesión
    session_service = initialize_session_service(args.mongodb)
    
    # Crear el agente o equipo según lo solicitado
    agent = None
    team = None
    
    if args.agent == "assistant":
        agent = create_assistant_only(client_id, use_anthropic=args.anthropic, use_openai=args.openai)
        print("Agente: Asistente IA")
    elif args.agent == "senior":
        agent = create_senior_agent(use_anthropic=args.anthropic, use_openai=args.openai)
        print("Agente: Senior IA")
    elif args.agent == "supervisor":
        agent = create_supervisor_agent(use_anthropic=args.anthropic, use_openai=args.openai)
        print("Agente: Supervisor IA")
    elif args.agent == "manager":
        agent = create_manager_agent(use_anthropic=args.anthropic, use_openai=args.openai)
        print("Agente: Gerente IA")
    elif args.agent == "team":
        agent, team = create_audit_team(client_id, use_anthropic=args.anthropic, use_openai=args.openai)
        print("Agente: Equipo Jerárquico (iniciando con Gerente IA)")
    else:  # workflow
        agent, team = create_workflow_audit_team(client_id, use_anthropic=args.anthropic, use_openai=args.openai)
        print("Agente: Equipo de Flujo de Trabajo")
    
    # Crear un runner para el agente
    runner = Runner(
        agent=agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Crear sesión con información del cliente
    session = session_service.create_session(
        app_name=APP_NAME,
        user_id=client_id,
        session_id=session_id,
        state={
            "client_id": client_id,
            "current_timestamp": time.time(),
            "current_task_id": f"task_{uuid.uuid4().hex[:8]}"
        }
    )
    
    # Bucle de interacción
    print("\nEscribe 'salir' para terminar la sesión.")
    while True:
        # Solicitar entrada al usuario
        user_input = input("\nTú: ")
        
        # Salir si se solicita
        if user_input.lower() in ["salir", "exit", "quit"]:
            print("\n¡Hasta luego!")
            break
        
        # Crear contenido de mensaje
        content = types.Content(role='user', parts=[types.Part(text=user_input)])
        
        # Ejecutar el agente y obtener respuesta
        print("\nAgente: ", end="", flush=True)
        
        for event in runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content
        ):
            # Para streaming de tokens
            if hasattr(event, 'content_part_delta') and event.content_part_delta:
                delta = event.content_part_delta
                if delta.text:
                    print(delta.text, end="", flush=True)
            
            # Para respuesta final (en caso de no tener streaming)
            if event.is_final_response():
                response = event.content
                if response and response.parts:
                    for part in response.parts:
                        if hasattr(part, 'text') and part.text and not hasattr(event, 'content_part_delta'):
                            print(part.text, end="", flush=True)
        
        print()  # Nueva línea después de la respuesta completa

def run_api_mode(args):
    """Ejecuta la aplicación en modo API con FastAPI."""
    try:
        import uvicorn
        from fastapi import FastAPI, HTTPException, Depends, Request, WebSocket, WebSocketDisconnect, Query
        from fastapi import File, UploadFile, Form
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.staticfiles import StaticFiles
        from fastapi.responses import StreamingResponse
        from pydantic import BaseModel
        import socketio
        import asyncio
        import logging
        import shutil
        from pathlib import Path
    except ImportError:
        print("Error: FastAPI, uvicorn, o socketio no están instalados.")
        print("Por favor, instala los paquetes requeridos con: pip install fastapi uvicorn python-socketio")
        exit(1)
    
    # UPDATED: Added import for parsing files like Excel, CSV, and PDFs
    try:
        import pandas as pd
        import PyPDF2
        import io
    except ImportError:
        print("ADVERTENCIA: Algunos paquetes para procesamiento de archivos no están instalados.")
        print("Para habilitar todas las funcionalidades, instale: pip install pandas pypdf2")

    # Buscar un puerto disponible
    original_port = args.port
    available_port = find_available_port(args.port)
    
    if available_port is None:
        print(f"Error: No se pudo encontrar un puerto disponible después de intentar {100} puertos.")
        exit(1)
    
    if available_port != original_port:
        print(f"El puerto {original_port} está en uso. Utilizando el puerto {available_port} en su lugar.")
        args.port = available_port
    
    # Modelos de datos
    class UserMessage(BaseModel):
        message: str
        client_id: str
        session_id: Optional[str] = None
    
    class AgentResponse(BaseModel):
        message: str
        client_id: str
        session_id: str
    
    class ClientSession(BaseModel):
        id: str
        client_id: str
        messages: List[Dict[str, Any]]
        created_at: datetime
        last_activity: datetime
    
    class AuditTeam(BaseModel):
        id: str
        client_id: str
        agents: List[Dict[str, Any]]
        current_task: Optional[str] = None
        status: str
    
    class AuditEvent(BaseModel):
        id: str
        team_id: str
        agent_name: str
        event_type: str
        details: Dict[str, Any]
        timestamp: datetime
        importance: str
    
    # UPDATED: Model para cambiar el modelo de IA
    class ModelSettings(BaseModel):
        model_type: str
        
    # UPDATED: Model para respuesta de cambio de modelo
    class ModelSettingsResponse(BaseModel):
        success: bool
        message: str
        model_type: str
    
    # Crear aplicación FastAPI
    app = FastAPI(title="API de Auditoría con Agentes IA", version="0.1.0")
    
    # Configurar CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # En producción, limitar a dominios específicos
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Configurar Socket.IO para comunicación en tiempo real
    sio = socketio.AsyncServer(
        async_mode='asgi',
        cors_allowed_origins='*'
    )
    socket_app = socketio.ASGIApp(sio)
    app.mount('/socket.io', socket_app)
    
    # Configurar carpeta estática para el frontend
    if os.path.exists("./frontend/build"):
        app.mount("/", StaticFiles(directory="./frontend/build", html=True), name="static")
    
    # Crear directorio para archivos cargados si no existe
    UPLOAD_DIR = Path("./uploads")
    UPLOAD_DIR.mkdir(exist_ok=True)
    
    MAX_AUDIT_LOG_ENTRIES = 200 # Define a cap for audit log entries

    # Estado de la aplicación
    app_state = {
        "session_service": initialize_session_service(args.mongodb),
        "use_anthropic": args.anthropic,
        "use_openai": args.openai,
        "active_teams": {},  # Almacena los equipos activos
        "connected_clients": set(),  # Clientes conectados al WebSocket
        "uploaded_files": {},  # Almacena información sobre archivos cargados
        "default_model": "gemini",  # Modelo por defecto
        "audit_log": deque(maxlen=MAX_AUDIT_LOG_ENTRIES) # UPDATED: Use deque for audit_log
    }
    
    # UPDATED: Endpoint para cambiar el modelo de IA
    @app.post("/api/settings/model", response_model=ModelSettingsResponse)
    async def change_model_settings(settings: ModelSettings):
        """Endpoint para cambiar la configuración del modelo de IA."""
        try:
            model_type = settings.model_type.lower()
            
            # Validar el tipo de modelo
            if model_type not in ["gemini", "claude", "gpt4"]:
                return {
                    "success": False,
                    "message": f"Modelo no soportado: {model_type}. Use gemini, claude o gpt4.",
                    "model_type": app_state["default_model"]
                }
            
            # Verificar que las llaves API necesarias están disponibles
            if model_type == "claude" and not os.getenv("ANTHROPIC_API_KEY"):
                return {
                    "success": False,
                    "message": "ANTHROPIC_API_KEY no está configurada. No se puede usar Claude.",
                    "model_type": app_state["default_model"]
                }
            
            if model_type == "gpt4" and not os.getenv("OPENAI_API_KEY"):
                return {
                    "success": False,
                    "message": "OPENAI_API_KEY no está configurada. No se puede usar GPT-4.",
                    "model_type": app_state["default_model"]
                }
            
            # Actualizar configuración de modelo
            app_state["default_model"] = model_type
            app_state["use_anthropic"] = (model_type == "claude")
            app_state["use_openai"] = (model_type == "gpt4")
            
            # Emitir evento para registrar el cambio de modelo
            await emit_audit_event({
                "id": f"event_{uuid.uuid4().hex[:8]}",
                "team_id": "system",
                "agent_name": "system",
                "event_type": "model_change",
                "details": {
                    "model_type": model_type,
                    "use_anthropic": app_state["use_anthropic"],
                    "use_openai": app_state["use_openai"]
                },
                "timestamp": datetime.now().isoformat(),
                "importance": "high"
            })
            
            print(f"Modelo cambiado a: {model_type}")
            
            # Actualizar args para consistencia en las funciones que lo usan
            args.anthropic = app_state["use_anthropic"]
            args.openai = app_state["use_openai"]
            
            return {
                "success": True,
                "message": f"Modelo cambiado exitosamente a {model_type}",
                "model_type": model_type
            }
            
        except Exception as e:
            error_msg = f"Error al cambiar el modelo: {str(e)}"
            print(error_msg)
            import traceback
            traceback.print_exc()
            
            return {
                "success": False,
                "message": error_msg,
                "model_type": app_state.get("default_model", "gemini")
            }
    
    # Eventos de Socket.IO
    @sio.event
    async def connect(sid, environ):
        client_id = environ.get('HTTP_CLIENT_ID', None) or environ.get('QUERY_STRING', '').split('=')[1] if '=' in environ.get('QUERY_STRING', '') else None
        if client_id:
            app_state["connected_clients"].add((sid, client_id))
            print(f"Cliente {client_id} conectado con SID {sid}")
        else:
            print(f"Cliente conectado sin ID: {sid}")
    
    @sio.event
    async def disconnect(sid):
        client_to_remove = None
        for client_sid, client_id in app_state["connected_clients"]:
            if client_sid == sid:
                client_to_remove = (client_sid, client_id)
                break
        
        if client_to_remove:
            app_state["connected_clients"].discard(client_to_remove)
            print(f"Cliente {client_to_remove[1]} desconectado")
        else:
            print(f"Cliente desconectado: {sid}")
    
    # Función para emitir eventos de auditoría
    async def emit_audit_event(event: Dict[str, Any]):
        team_id = event.get("team_id")
        # Emitir a todos los clientes conectados
        try:
            await sio.emit('audit_event', event)
            print(f"Evento emitido para equipo {team_id}")
        except Exception as e:
            print(f"Error al emitir evento: {str(e)}")
            # No propagar la excepción para evitar interrumpir el flujo principal
        
        # UPDATED: Store event in app_state["audit_log"]
        try:
            # Ensure event has a serializable timestamp (it should already from creation)
            if isinstance(event.get("timestamp"), datetime):
                event["timestamp"] = event["timestamp"].isoformat()
            
            app_state["audit_log"].append(dict(event)) # Store a copy
        except Exception as e:
            print(f"Error al guardar evento en audit_log: {str(e)}")
            
    # Función auxiliar para extraer texto de archivos
    def extract_file_content(file_path: Path, file_type: str) -> str:
        """Extrae el contenido textual de diferentes tipos de archivos."""
        try:
            if file_type in ['.xlsx', '.xls']:
                # Extraer datos de archivos Excel
                if 'pandas' in sys.modules:
                    df = pd.read_excel(file_path)
                    return df.to_string()
                else:
                    return "El sistema no puede procesar archivos Excel. Instale pandas para esta funcionalidad."
            
            elif file_type == '.csv':
                # Extraer datos de archivos CSV
                if 'pandas' in sys.modules:
                    df = pd.read_csv(file_path)
                    return df.to_string()
                else:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return f.read()
            
            elif file_type == '.pdf':
                # Extraer texto de archivos PDF
                if 'PyPDF2' in sys.modules:
                    text = ""
                    with open(file_path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        for page_num in range(len(reader.pages)):
                            text += reader.pages[page_num].extract_text() + "\n"
                    return text
                else:
                    return "El sistema no puede procesar archivos PDF. Instale PyPDF2 para esta funcionalidad."
            
            elif file_type in ['.txt', '.md', '.json']:
                # Extraer texto de archivos de texto plano
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            
            else:
                return f"Tipo de archivo {file_type} no soportado para análisis de contenido."
        
        except Exception as e:
            print(f"Error al extraer contenido del archivo: {str(e)}")
            return f"Error al procesar el archivo: {str(e)}"
            
    # Función para validar el ID del cliente
    def validate_client_id(client_id: str) -> bool:
        if not client_id or len(client_id) < 4:
            return False
        # Validación adicional si es necesario
        return True
    
    # Función para validar archivos antes de procesarlos
    def validate_file(file: UploadFile) -> (bool, str):
        # Comprobar el tamaño del archivo (máximo ~20MB)
        if file.size and file.size > 20 * 1024 * 1024:
            return False, "El archivo es demasiado grande. Límite: 20MB."
        
        # Comprobar la extensión del archivo
        allowed_extensions = ['.csv', '.xlsx', '.xls', '.pdf', '.txt', '.md', '.json', '.docx', '.doc']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            return False, f"Tipo de archivo no soportado. Extensiones permitidas: {', '.join(allowed_extensions)}"
        
        return True, ""

    # Endpoint para cargar archivos
    @app.post("/api/upload", response_model=AgentResponse)
    async def upload_file(
        file: UploadFile = File(...),
        client_id: str = Form(...),
        session_id: str = Form(...),
        model_type: Optional[str] = Query(None, description="Tipo de modelo a utilizar (gemini, claude, gpt4)"),
        agent_type: Optional[str] = Query("assistant", description="Tipo de agente (assistant, senior, supervisor, manager, team)")
    ):
        """Endpoint para cargar y procesar archivos."""
        try:
            # UPDATED: Validar ID de cliente
            if not validate_client_id(client_id):
                return {
                    "message": "ID de cliente inválido.",
                    "client_id": client_id,
                    "session_id": session_id
                }
                
            # UPDATED: Validar archivo
            is_valid, error_message = validate_file(file)
            if not is_valid:
                return {
                    "message": f"Error con el archivo: {error_message}",
                    "client_id": client_id,
                    "session_id": session_id
                }
            
            # Crear un directorio específico para este cliente si no existe
            client_dir = UPLOAD_DIR / client_id
            client_dir.mkdir(exist_ok=True)
            
            # Generar nombre de archivo único
            file_id = uuid.uuid4().hex[:8]
            file_ext = os.path.splitext(file.filename)[1].lower()
            safe_filename = f"{file_id}{file_ext}"
            file_path = client_dir / safe_filename
            
            # Guardar el archivo
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Almacenar información sobre el archivo cargado
            if client_id not in app_state["uploaded_files"]:
                app_state["uploaded_files"][client_id] = {}
            
            app_state["uploaded_files"][client_id][file_id] = {
                "original_name": file.filename,
                "saved_name": safe_filename,
                "path": str(file_path),
                "type": file_ext,
                "size": os.path.getsize(file_path),
                "upload_time": datetime.now().isoformat()
            }
            
            print(f"Archivo cargado: {file.filename} -> {file_path}")
            
            # UPDATED: Use app_state default model if model_type is not provided
            if not model_type:
                model_type = app_state.get("default_model", "gemini")
                
            use_anthropic = model_type == "claude" or app_state.get("use_anthropic", False)
            use_openai = model_type == "gpt4" or app_state.get("use_openai", False)
            
            # Emitir evento para registrar la carga de archivo
            await emit_audit_event({
                "id": f"event_{uuid.uuid4().hex[:8]}",
                "team_id": f"team_{client_id[:8]}",
                "agent_name": f"{agent_type}_agent",
                "event_type": "file_upload",
                "details": {
                    "client_id": client_id,
                    "session_id": session_id,
                    "file_name": file.filename,
                    "file_id": file_id,
                    "file_type": file_ext,
                    "file_size": os.path.getsize(file_path),
                    "model_used": model_type
                },
                "timestamp": datetime.now().isoformat(),
                "importance": "high"
            })
            
            # Extraer contenido para análisis
            file_content = extract_file_content(file_path, file_ext)
            
            # Preparar mensaje para el agente explicando el archivo
            file_info = f"El cliente ha cargado un archivo: {file.filename} (tipo: {file_ext}, tamaño: {os.path.getsize(file_path) / 1024:.1f} KB)"
            analysis_request = f"Por favor, analiza este archivo y proporciona información relevante. Contenido del archivo:\n{file_content[:5000]}..."
            full_message = f"{file_info}\n\n{analysis_request}"
            
            # Seleccionar la función de agente apropiada
            agent_func = None
            if agent_type == "assistant":
                agent_func = run_assistant_agent
            elif agent_type == "senior":
                agent_func = run_senior_agent
            elif agent_type == "supervisor":
                agent_func = run_supervisor_agent
            elif agent_type == "manager":
                agent_func = run_manager_agent
            elif agent_type == "team":
                agent_func = run_team_agent
            else:
                agent_func = run_assistant_agent
            
            # Procesar el archivo y generar respuesta
            response_message = await asyncio.to_thread(
                agent_func, 
                client_id, 
                session_id, 
                full_message, 
                args.mongodb, 
                use_anthropic,
                use_openai
            )
            
            return {
                "message": response_message,
                "client_id": client_id,
                "session_id": session_id
            }
            
        except Exception as e:
            error_msg = f"Error al procesar el archivo: {str(e)}"
            print(error_msg)
            # Log the full exception
            import traceback
            traceback.print_exc()
            
            # Emitir evento de error
            await emit_audit_event({
                "id": f"event_{uuid.uuid4().hex[:8]}",
                "team_id": f"team_{client_id[:8]}",
                "agent_name": f"{agent_type}_agent",
                "event_type": "file_error",
                "details": {
                    "client_id": client_id,
                    "error": str(e)
                },
                "timestamp": datetime.now().isoformat(),
                "importance": "high"
            })
            
            return {
                "message": f"Lo siento, hubo un error al procesar tu archivo. {str(e)}",
                "client_id": client_id,
                "session_id": session_id
            }
    
    # Endpoints
    @app.post("/api/assistant", response_model=AgentResponse)
    async def chat_with_assistant(
        message: UserMessage,
        model_type: Optional[str] = Query(None, description="Tipo de modelo a utilizar (gemini, claude, gpt4)")
    ):
        """Endpoint para chatear con el asistente IA y procesar solicitudes del cliente.
        
        Parámetros:
        - message: Objeto con el mensaje del usuario, client_id y session_id opcional
        - model_type: Tipo de modelo a utilizar (opcional, si no se especifica se usa la configuración por defecto)
        
        Retorna:
        - AgentResponse: Respuesta del asistente con mensaje y session_id
        """
        start_time = time.time()
        client_id = message.client_id
        session_id = message.session_id or str(uuid.uuid4())
        
        # Validar client_id
        if not validate_client_id(client_id):
            return JSONResponse(
                status_code=400,
                content={"message": "ID de cliente inválido", "client_id": client_id, "session_id": session_id}
            )
        
        # Determinar qué modelo usar basado en la configuración
        use_anthropic = (model_type == "claude") or (app_state.get("use_anthropic", False) and not model_type)
        use_openai = (model_type == "gpt4") or (app_state.get("use_openai", False) and not model_type)
        
        # Comprobar si hay un escalamiento pendiente para este cliente/sesión
        escalation_file = os.path.join("tmp", f"escalation_{client_id}_{session_id}.json")
        if os.path.exists(escalation_file):
            try:
                with open(escalation_file, "r") as f:
                    escalation_data = json.load(f)
                    
                # Si hay escalamiento pendiente, procesarlo con el agente senior
                print(f"Detectado escalamiento pendiente para cliente {client_id}, sesión {session_id}")
                
                # Preparar mensaje para el senior con contexto del escalamiento
                senior_context = f"""CASO ESCALADO DEL ASISTENTE:
Resumen: {escalation_data.get('summary', 'No hay resumen disponible')}
Documentos analizados: {', '.join(escalation_data.get('documents', ['Ninguno']))}
Mensaje actual del cliente: {message.message}
"""
                
                # Ejecutar el agente senior con el contexto
                response_text = run_senior_agent(
                    client_id=client_id,
                    session_id=session_id,
                    message=senior_context + "\n\n" + message.message,
                    use_anthropic=use_anthropic,
                    use_openai=use_openai
                )
                
                # Registrar evento de procesamiento por senior
                new_event = AuditEvent(
                    id=str(uuid.uuid4()),
                    team_id=f"team_{client_id}",
                    agent_name="senior_agent",
                    event_type="case_review",
                    details={
                        "client_message": message.message,
                        "escalation_summary": escalation_data.get('summary', 'No hay resumen disponible'),
                        "session_id": session_id
                    },
                    timestamp=datetime.now(),
                    importance="high"
                )
                await emit_audit_event(new_event.dict())
                
                # Verificar si el senior escaló al supervisor
                if "escalar al supervisor" in response_text.lower() or "necesita revisión del supervisor" in response_text.lower():
                    # Crear archivo de escalamiento a supervisor
                    supervisor_escalation = {
                        "timestamp": datetime.now().isoformat(),
                        "client_id": client_id,
                        "session_id": session_id,
                        "action": "escalate_to_supervisor",
                        "summary": f"Caso escalado por Senior: {escalation_data.get('summary', 'No hay resumen disponible')}",
                        "senior_analysis": response_text,
                        "documents": escalation_data.get('documents', [])
                    }
                    
                    supervisor_file = os.path.join("tmp", f"supervisor_{client_id}_{session_id}.json")
                    with open(supervisor_file, "w") as f:
                        json.dump(supervisor_escalation, f, indent=2)
                    
                    # Añadir nota al final de la respuesta sobre escalamiento a supervisor
                    response_text += "\n\n[Este caso ha sido escalado al Supervisor para una revisión adicional]"
                
                # Eliminar el archivo de escalamiento al senior si ya no es necesario
                if not "escalar al supervisor" in response_text.lower():
                    try:
                        os.remove(escalation_file)
                        print(f"Archivo de escalamiento {escalation_file} eliminado tras procesamiento por Senior")
                    except Exception as e:
                        print(f"Error al eliminar archivo de escalamiento: {str(e)}")
                
                elapsed_time = time.time() - start_time
                print(f"Tiempo de respuesta del Senior: {elapsed_time:.2f} segundos")
                
                return {"message": response_text, "client_id": client_id, "session_id": session_id}
            except Exception as e:
                print(f"Error al procesar escalamiento: {str(e)}")
                # Continuar con el flujo normal si hay error en el procesamiento de escalamiento
        
        # Comprobar si hay un escalamiento al supervisor pendiente
        supervisor_file = os.path.join("tmp", f"supervisor_{client_id}_{session_id}.json")
        if os.path.exists(supervisor_file):
            try:
                with open(supervisor_file, "r") as f:
                    supervisor_data = json.load(f)
                    
                # Preparar mensaje para el supervisor con contexto del escalamiento
                supervisor_context = f"""CASO ESCALADO DEL SENIOR:
Resumen original: {supervisor_data.get('summary', 'No hay resumen disponible')}
Análisis del Senior: {supervisor_data.get('senior_analysis', 'No hay análisis disponible')}
Documentos analizados: {', '.join(supervisor_data.get('documents', ['Ninguno']))}
Mensaje actual del cliente: {message.message}
"""
                
                # Ejecutar el agente supervisor con el contexto
                response_text = run_supervisor_agent(
                    client_id=client_id,
                    session_id=session_id,
                    message=supervisor_context + "\n\n" + message.message,
                    use_anthropic=use_anthropic,
                    use_openai=use_openai
                )
                
                # Registrar evento de procesamiento por supervisor
                new_event = AuditEvent(
                    id=str(uuid.uuid4()),
                    team_id=f"team_{client_id}",
                    agent_name="supervisor_agent",
                    event_type="advanced_review",
                    details={
                        "client_message": message.message,
                        "senior_analysis": supervisor_data.get('senior_analysis', 'No hay análisis disponible'),
                        "session_id": session_id
                    },
                    timestamp=datetime.now(),
                    importance="high"
                )
                await emit_audit_event(new_event.dict())
                
                # Verificar si el supervisor escaló al manager
                if "escalar al manager" in response_text.lower() or "necesita revisión del manager" in response_text.lower():
                    # Crear archivo de escalamiento a manager
                    manager_escalation = {
                        "timestamp": datetime.now().isoformat(),
                        "client_id": client_id,
                        "session_id": session_id,
                        "action": "escalate_to_manager",
                        "summary": supervisor_data.get('summary', 'No hay resumen disponible'),
                        "senior_analysis": supervisor_data.get('senior_analysis', 'No hay análisis disponible'),
                        "supervisor_analysis": response_text,
                        "documents": supervisor_data.get('documents', [])
                    }
                    
                    manager_file = os.path.join("tmp", f"manager_{client_id}_{session_id}.json")
                    with open(manager_file, "w") as f:
                        json.dump(manager_escalation, f, indent=2)
                    
                    # Añadir nota al final de la respuesta sobre escalamiento a manager
                    response_text += "\n\n[Este caso ha sido escalado al Manager para la revisión final]"
                
                # Eliminar el archivo de escalamiento al supervisor si ya no es necesario
                if not "escalar al manager" in response_text.lower():
                    try:
                        os.remove(supervisor_file)
                        print(f"Archivo de escalamiento {supervisor_file} eliminado tras procesamiento por Supervisor")
                    except Exception as e:
                        print(f"Error al eliminar archivo de escalamiento: {str(e)}")
                
                elapsed_time = time.time() - start_time
                print(f"Tiempo de respuesta del Supervisor: {elapsed_time:.2f} segundos")
                
                return {"message": response_text, "client_id": client_id, "session_id": session_id}
            except Exception as e:
                print(f"Error al procesar escalamiento a supervisor: {str(e)}")
                # Continuar con el flujo normal si hay error
        
        # Comprobar si hay un escalamiento al manager pendiente
        manager_file = os.path.join("tmp", f"manager_{client_id}_{session_id}.json")
        if os.path.exists(manager_file):
            try:
                with open(manager_file, "r") as f:
                    manager_data = json.load(f)
                    
                # Preparar mensaje para el manager con contexto completo
                manager_context = f"""CASO ESCALADO PARA REVISIÓN FINAL:
Resumen original: {manager_data.get('summary', 'No hay resumen disponible')}
Análisis del Senior: {manager_data.get('senior_analysis', 'No hay análisis disponible')}
Análisis del Supervisor: {manager_data.get('supervisor_analysis', 'No hay análisis disponible')}
Documentos analizados: {', '.join(manager_data.get('documents', ['Ninguno']))}
Mensaje actual del cliente: {message.message}
"""
                
                # Ejecutar el agente manager con el contexto completo
                response_text = run_manager_agent(
                    client_id=client_id,
                    session_id=session_id,
                    message=manager_context + "\n\n" + message.message,
                    use_anthropic=use_anthropic,
                    use_openai=use_openai
                )
                
                # Registrar evento de procesamiento final por manager
                new_event = AuditEvent(
                    id=str(uuid.uuid4()),
                    team_id=f"team_{client_id}",
                    agent_name="manager_agent",
                    event_type="final_review",
                    details={
                        "client_message": message.message,
                        "senior_analysis": manager_data.get('senior_analysis', 'No hay análisis disponible'),
                        "supervisor_analysis": manager_data.get('supervisor_analysis', 'No hay análisis disponible'),
                        "session_id": session_id
                    },
                    timestamp=datetime.now(),
                    importance="critical"
                )
                await emit_audit_event(new_event.dict())
                
                # Si hay mensaje sobre informe final, generarlo
                if "informe final" in response_text.lower() or "reporte final" in response_text.lower():
                    # Generar informe final
                    try:
                        # Crear directorio para informes si no existe
                        reports_dir = os.path.join("tmp", "reports")
                        os.makedirs(reports_dir, exist_ok=True)
                        
                        # Crear informe con toda la información recopilada
                        report_data = {
                            "client_id": client_id,
                            "session_id": session_id,
                            "timestamp": datetime.now().isoformat(),
                            "summary": manager_data.get('summary', 'No hay resumen disponible'),
                            "senior_analysis": manager_data.get('senior_analysis', 'No hay análisis disponible'),
                            "supervisor_analysis": manager_data.get('supervisor_analysis', 'No hay análisis disponible'),
                            "manager_analysis": response_text,
                            "documents_analyzed": manager_data.get('documents', []),
                            "audit_result": "Completado"
                        }
                        
                        # Guardar informe en JSON
                        report_file = os.path.join(reports_dir, f"report_{client_id}_{session_id}.json")
                        with open(report_file, "w") as f:
                            json.dump(report_data, f, indent=2, ensure_ascii=False)
                        
                        # Añadir información sobre disponibilidad de informe
                        response_text += "\n\n[INFORME FINAL GENERADO: Puedes descargarlo desde la sección de informes]"
                    except Exception as e:
                        print(f"Error al generar informe final: {str(e)}")
                
                # Eliminar archivo de escalamiento al manager después de procesamiento
                try:
                    os.remove(manager_file)
                    print(f"Archivo de escalamiento {manager_file} eliminado tras procesamiento por Manager")
                except Exception as e:
                    print(f"Error al eliminar archivo de escalamiento: {str(e)}")
                
                elapsed_time = time.time() - start_time
                print(f"Tiempo de respuesta del Manager: {elapsed_time:.2f} segundos")
                
                return {"message": response_text, "client_id": client_id, "session_id": session_id}
            except Exception as e:
                print(f"Error al procesar escalamiento a manager: {str(e)}")
                # Continuar con el flujo normal si hay error
        
        # Si no hay escalamientos pendientes, procesar como asistente normal
        try:
            # Ejecutar agente asistente
            response_text = run_assistant_agent(
                client_id=client_id, 
                session_id=session_id, 
                message=message.message,
                use_mongodb=args.mongodb,
                use_anthropic=use_anthropic,
                use_openai=use_openai
            )
            
            # Registrar evento de interacción con cliente
            new_event = AuditEvent(
                id=str(uuid.uuid4()),
                team_id=f"team_{client_id}",
                agent_name="assistant_agent",
                event_type="client_interaction",
                details={
                    "client_message": message.message,
                    "session_id": session_id
                },
                timestamp=datetime.now(),
                importance="medium"
            )
            await emit_audit_event(new_event.dict())
            
            elapsed_time = time.time() - start_time
            print(f"Tiempo de respuesta del Asistente: {elapsed_time:.2f} segundos")
            
            return {"message": response_text, "client_id": client_id, "session_id": session_id}
        except Exception as e:
            error_message = f"Error al procesar mensaje: {str(e)}"
            print(error_message)
            return JSONResponse(
                status_code=500,
                content={"message": error_message, "client_id": client_id, "session_id": session_id}
            )

    # Endpoint para obtener el informe final de auditoría
    @app.get("/api/report/{session_id}")
    async def get_audit_report(session_id: str, client_id: str = Query(...)):
        """Endpoint para descargar el informe final de auditoría.
        
        Parámetros:
        - session_id: ID de la sesión de auditoría
        - client_id: ID del cliente (query parameter)
        
        Retorna:
        - Archivo JSON o HTML con el informe completo
        """
        # Validar client_id
        if not validate_client_id(client_id):
            return JSONResponse(
                status_code=400,
                content={"error": "ID de cliente inválido"}
            )
        
        # Buscar el informe en la carpeta de informes
        report_file = os.path.join("tmp", "reports", f"report_{client_id}_{session_id}.json")
        
        if not os.path.exists(report_file):
            return JSONResponse(
                status_code=404,
                content={"error": "Informe no encontrado"}
            )
        
        try:
            # Leer el informe JSON
            with open(report_file, "r") as f:
                report_data = json.load(f)
            
            # Generar informe en formato HTML más amigable
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Informe de Auditoría - Cliente: {client_id}</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                    h1 {{ color: #2c3e50; }}
                    h2 {{ color: #3498db; margin-top: 30px; }}
                    .section {{ margin: 20px 0; padding: 15px; border: 1px solid #eee; border-radius: 5px; }}
                    .meta {{ color: #7f8c8d; font-size: 0.9em; }}
                    pre {{ background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }}
                </style>
            </head>
            <body>
                <h1>Informe de Auditoría</h1>
                <div class="meta">
                    <p>Cliente ID: {client_id}</p>
                    <p>Sesión ID: {session_id}</p>
                    <p>Fecha: {datetime.fromisoformat(report_data['timestamp']).strftime('%d/%m/%Y %H:%M:%S')}</p>
                </div>
                
                <div class="section">
                    <h2>Resumen Ejecutivo</h2>
                    <p>{report_data['summary']}</p>
                </div>
                
                <div class="section">
                    <h2>Análisis del Senior</h2>
                    <pre>{report_data['senior_analysis']}</pre>
                </div>
                
                <div class="section">
                    <h2>Revisión del Supervisor</h2>
                    <pre>{report_data['supervisor_analysis']}</pre>
                </div>
                
                <div class="section">
                    <h2>Evaluación Final del Manager</h2>
                    <pre>{report_data['manager_analysis']}</pre>
                </div>
                
                <div class="section">
                    <h2>Documentos Analizados</h2>
                    <ul>
                        {"".join(f"<li>{doc}</li>" for doc in report_data['documents_analyzed'])}
                    </ul>
                </div>
                
                <div class="section">
                    <h2>Conclusión</h2>
                    <p>Estado de la Auditoría: <strong>{report_data['audit_result']}</strong></p>
                </div>
                
                <footer>
                    <p>Este informe fue generado automáticamente por el sistema de Auditoría IA.</p>
                </footer>
            </body>
            </html>
            """
            
            # Devolver el informe en formato HTML
            return HTMLResponse(content=html_content, status_code=200)
        except Exception as e:
            error_message = f"Error al procesar el informe: {str(e)}"
            print(error_message)
            return JSONResponse(
                status_code=500,
                content={"error": error_message}
            )

    # Iniciar servidor
    print(f"Iniciando servidor API en {args.host}:{args.port}")
    print(f"Usando MongoDB: {args.mongodb}")
    print(f"Usando Anthropic: {args.anthropic}")
    try:
        uvicorn.run(app, host=args.host, port=args.port)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"Error: El puerto {args.port} ya está en uso a pesar de la verificación previa.")
            print("Esto puede deberse a que otro proceso ocupó el puerto entre la verificación y el inicio del servidor.")
            exit(1)
        else:
            raise

if __name__ == "__main__":
    # Ejecutar la función principal
    main() 