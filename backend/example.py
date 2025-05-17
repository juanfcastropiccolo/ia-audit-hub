import os
import time
import uuid
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Importar componentes de nuestra aplicación
from config import APP_NAME
from agents import create_audit_team, create_workflow_audit_team, create_assistant_only
from utils import SupabaseSessionService

def demo_assistant_only():
    """Demostración simple con solo el agente Asistente IA."""
    print("Demostración con Asistente IA solamente")
    print("---------------------------------------")
    
    # Configurar servicio de sesión en memoria para simplicidad
    session_service = InMemorySessionService()
    
    # Crear un ID de cliente para este ejemplo
    client_id = f"client_{uuid.uuid4().hex[:8]}"
    session_id = f"session_{uuid.uuid4().hex[:8]}"
    
    # Crear el agente asistente
    assistant_agent = create_assistant_only(client_id)
    
    # Crear un runner para el agente
    runner = Runner(
        agent=assistant_agent,
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
            "current_task_id": f"footing_{uuid.uuid4().hex[:8]}"
        }
    )
    
    # Simular interacción con el cliente
    messages = [
        "Hola, necesito realizar una verificación de mi balance general",
        "Mi balance está en esta URL: https://docs.google.com/spreadsheets/d/1abcdefghijklmnopqrstuvwxyz123456789",
        "Por favor, revisa que las sumas de las columnas sean correctas",
        "¿Puedes verificar también que el activo coincida con pasivo más patrimonio?",
        "Gracias por tu ayuda"
    ]
    
    for message in messages:
        print(f"\nCliente: {message}")
        
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
        
        # Mostrar respuesta
        if response and response.parts:
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    print(f"Asistente IA: {part.text}")
        
        # Pequeña pausa para mejor legibilidad
        time.sleep(1)
    
    print("\nDemostración finalizada.")

def demo_hierarchy_team():
    """Demostración con el equipo jerárquico completo."""
    print("\nDemostración con Equipo Jerárquico Completo")
    print("------------------------------------------")
    
    # Configurar servicio de sesión en memoria para simplicidad
    session_service = InMemorySessionService()
    
    # Crear un ID de cliente para este ejemplo
    client_id = f"client_{uuid.uuid4().hex[:8]}"
    session_id = f"session_{uuid.uuid4().hex[:8]}"
    
    # Crear el equipo jerárquico completo
    manager_agent, team = create_audit_team(client_id)
    
    # Obtener el agente asistente que interactúa directamente con el cliente
    assistant_agent = team["assistant"]
    
    # Crear un runner para el agente asistente (entrada inicial)
    assistant_runner = Runner(
        agent=assistant_agent,
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
            "current_task_id": f"footing_{uuid.uuid4().hex[:8]}"
        }
    )
    
    # Simular interacción con el cliente
    messages = [
        "Hola, necesito realizar una verificación de mi balance general",
        "Mi balance está en esta URL: https://docs.google.com/spreadsheets/d/1abcdefghijklmnopqrstuvwxyz123456789",
        "Por favor, realiza un footing y verifica que los totales estén correctos"
    ]
    
    for message in messages:
        print(f"\nCliente: {message}")
        
        # Crear contenido de mensaje
        content = types.Content(role='user', parts=[types.Part(text=message)])
        
        # Ejecutar el agente asistente y obtener respuesta
        response = None
        for event in assistant_runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content
        ):
            if event.is_final_response():
                response = event.content
        
        # Mostrar respuesta
        if response and response.parts:
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    print(f"Asistente IA: {part.text}")
        
        # Pequeña pausa para mejor legibilidad
        time.sleep(1)
    
    # Simular que el asistente ha completado su trabajo y ahora debemos pasar al senior
    print("\n--- TRANSICIÓN: El trabajo del Asistente IA ha sido completado ---")
    print("--- Ahora el Senior IA revisará el trabajo ---\n")
    
    # Crear runner para el Senior IA
    senior_agent = team["senior"]
    senior_runner = Runner(
        agent=senior_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Mensaje para el Senior IA
    senior_message = "Revisa el trabajo de footing realizado por el Asistente IA para este balance general"
    print(f"Sistema: {senior_message}")
    
    # Crear contenido de mensaje
    senior_content = types.Content(role='user', parts=[types.Part(text=senior_message)])
    
    # Ejecutar el agente senior y obtener respuesta
    for event in senior_runner.run(
        user_id=client_id,
        session_id=session_id,
        new_message=senior_content
    ):
        if event.is_final_response():
            response = event.content
    
    # Mostrar respuesta
    if response and response.parts:
        for part in response.parts:
            if hasattr(part, 'text') and part.text:
                print(f"Senior IA: {part.text}")
    
    print("\nDemostración finalizada.")

def demo_workflow_team():
    """Demostración con el equipo en flujo de trabajo secuencial."""
    print("\nDemostración con Equipo de Flujo de Trabajo Secuencial")
    print("----------------------------------------------------")
    
    # Configurar servicio de sesión en memoria para simplicidad
    session_service = InMemorySessionService()
    
    # Crear un ID de cliente para este ejemplo
    client_id = f"client_{uuid.uuid4().hex[:8]}"
    session_id = f"session_{uuid.uuid4().hex[:8]}"
    
    # Crear el equipo de flujo de trabajo secuencial
    workflow_agent, team = create_workflow_audit_team(client_id)
    
    # Crear un runner para el agente de flujo de trabajo
    workflow_runner = Runner(
        agent=workflow_agent,
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
            "current_task_id": f"audit_{uuid.uuid4().hex[:8]}"
        }
    )
    
    # Mensaje inicial para iniciar el flujo de trabajo
    workflow_message = "Por favor, realiza una auditoría completa de mi balance general en https://docs.google.com/spreadsheets/d/1abcdefghijklmnopqrstuvwxyz123456789"
    print(f"\nCliente: {workflow_message}")
    
    # Crear contenido de mensaje
    workflow_content = types.Content(role='user', parts=[types.Part(text=workflow_message)])
    
    # Ejecutar el agente de flujo de trabajo y mostrar las respuestas de cada nivel
    current_agent = None
    
    for event in workflow_runner.run(
        user_id=client_id,
        session_id=session_id,
        new_message=workflow_content
    ):
        # Detectar cambios de agente
        if hasattr(event, 'author') and event.author:
            if current_agent != event.author:
                current_agent = event.author
                print(f"\n--- AGENTE: {current_agent} ---")
        
        # Mostrar respuesta final
        if event.is_final_response():
            response = event.content
            if response and response.parts:
                for part in response.parts:
                    if hasattr(part, 'text') and part.text:
                        print(f"{current_agent}: {part.text}")
    
    print("\nDemostración finalizada.")

if __name__ == "__main__":
    # Verificar que tenemos las API keys necesarias
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY no encontrada en variables de entorno o .env")
        exit(1)
    
    # Ejecutar las demostraciones
    demo_assistant_only()
    demo_hierarchy_team()
    demo_workflow_team() 