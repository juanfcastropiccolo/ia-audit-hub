import os
import argparse
import uuid
import time
import json
import sys
import socket
import socketio
from fastapi.staticfiles import StaticFiles
from fastapi import File, UploadFile, Form, Query
from pydantic import BaseModel
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from fastapi.responses import HTMLResponse, JSONResponse
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
import google.generativeai as genai
# Note: genai.configure is deferred to runtime to avoid blocking at import
from collections import deque
import asyncio
from fastapi import FastAPI

# Add the parent directory to sys.path to ensure imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Cargar variables de entorno
load_dotenv()
_vite_anto = os.getenv("VITE_ANTHROPIC_API_KEY")
if _vite_anto and not os.getenv("ANTHROPIC_API_KEY"):
    os.environ["ANTHROPIC_API_KEY"] = _vite_anto
_vite_oa = os.getenv("VITE_OPENAI_API_KEY")
if _vite_oa and not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = _vite_oa
_vite_google = os.getenv("VITE_GEMINI_API_KEY")
if _vite_google and not os.getenv("GEMINI_API_KEY"):
    os.environ["GEMINI_API_KEY"] = _vite_google

# (Re)configure Google Gemini API key for ADK after loading environment variables
# deferring configure() call to application startup

# Importar FastAPI CORS
from fastapi.middleware.cors import CORSMiddleware

# Configurar origenes permitidos para CORS
origins = [
    "http://localhost:5173",  # Vite dev server default
    "http://localhost:4173",  # Vite preview
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
]

# Intentar importar los componentes directamente
from backend.config import APP_NAME, HOST, PORT
from backend.agents import (
    create_assistant_agent, 
    create_senior_agent, 
    create_supervisor_agent, 
    create_manager_agent, 
    create_audit_team, 
    create_workflow_audit_team, 
    create_assistant_only
)

from backend.utils import SupabaseSessionService, setup_logger
log = setup_logger(__name__)
# Subclase de InMemorySessionService que acepta llamadas posicionales a get_session
class PatchedInMemorySessionService(InMemorySessionService):
    def get_session(self, app_name, user_id=None, session_id=None, *args, **kwargs):
        return super().get_session(app_name=app_name, user_id=user_id, session_id=session_id)

app = FastAPI(title="API de Auditoría con Agentes IA", version="0.1.0")

# Agregar middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Serve uploads directory as static files
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Endpoint: upload file for initial Assistant peer-review and context building
from fastapi import UploadFile, File, Form
@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    client_id: str = Form(...),
    session_id: str = Form(...),
    model_type: str = Form(...),
):
    """
    Receive a file, perform a peer-review by two Assistant agents, and return summary.
    """
    # Save uploaded file
    upload_dir = os.path.join("uploads", client_id, session_id)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    # Extract text for analysis
    text_content = None
    try:
        import PyPDF2
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            pages = [p.extract_text() or "" for p in reader.pages]
            text_content = "\n".join(pages)
    except Exception:
        pass
    if text_content is None:
        # Try CSV/Excel
        try:
            import pandas as pd
            df = pd.read_excel(file_path) if file.filename.lower().endswith(('.xls', '.xlsx')) else pd.read_csv(file_path)
            text_content = df.to_csv(index=False)
        except Exception:
            pass
    if text_content is None:
        # Fallback for text files
        try:
            with open(file_path, encoding='utf-8', errors='ignore') as f:
                text_content = f.read()
        except Exception:
            text_content = f"[Could not extract text from {file.filename}]"
    # Determine model flags
    use_openai_flag = model_type.lower() in ("gpt4", "gpt-4", "gpt-3.5", "gpt35")
    use_anthropic_flag = model_type.lower().startswith("claude")
    # Build assistant reviews
    prompt = f"Revisa el siguiente documento:\n---\n{text_content}\n---\nProporciona un resumen crítico." 
    # Primary review
    review1 = run_assistant_agent(client_id, session_id, prompt,
                                  use_supabase=False,
                                  use_anthropic=use_anthropic_flag,
                                  use_openai=use_openai_flag)
    # Peer review by another Assistant
    review2 = run_assistant_agent(client_id, session_id,
                                  f"Por favor, revisa y comenta esta revisión anterior:\n{review1}",
                                  use_supabase=False,
                                  use_anthropic=use_anthropic_flag,
                                  use_openai=use_openai_flag)
    # Combine reviews
    summary = f"Revisión inicial:\n{review1}\n\nRevisión de pares:\n{review2}"
    return JSONResponse({
        "message": summary,
        "session_id": session_id,
        "model_used": model_type
    })

# Endpoint: start full audit pipeline and generate PDF report
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
except ImportError:
    canvas = None
    letter = None
import io

def generate_pdf(sections: list[str]) -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40
    c.setFont("Helvetica-Bold", 14)
    for idx, sec in enumerate(sections, start=1):
        c.drawString(40, y, f"Sección {idx}")
        y -= 24
        c.setFont("Helvetica", 12)
        for line in sec.split('\n'):
            if y < 40:
                c.showPage()
                y = height - 40
                c.setFont("Helvetica", 12)
            c.drawString(40, y, line[:90])
            y -= 18
        y -= 20
    c.save()
    data = buffer.getvalue()
    buffer.close()
    return data

@app.post("/api/start-audit")
def start_audit(
    client_id: str = Form(...),
    session_id: str = Form(...),
    model_type: str = Form(...)
):
    """
    Execute the full audit chain (Assistant→Senior→Supervisor→Manager) and return PDF report URL.
    """
    # Determine model flags
    use_openai_flag = model_type.lower() in ("gpt4", "gpt-4", "gpt-3.5", "gpt35")
    use_anthropic_flag = model_type.lower().startswith("claude")
    # Retrieve context from session (simple history)
    session_service = initialize_session_service(use_supabase=False)
    session = session_service.get_session(APP_NAME, client_id, session_id)
    history = session.state.get("history_messages", []) if session else []
    context = "\n".join(history)
    # Chain of reviews
    a1 = run_assistant_agent(client_id, session_id, context, False, use_anthropic_flag, use_openai_flag)
    a2 = run_assistant_agent(client_id, session_id, a1, False, use_anthropic_flag, use_openai_flag)
    s1 = run_senior_agent(client_id, session_id, a2, False, use_anthropic_flag, use_openai_flag)
    s2 = run_senior_agent(client_id, session_id, s1, False, use_anthropic_flag, use_openai_flag)
    sup = run_supervisor_agent(client_id, session_id, s2, False, use_anthropic_flag, use_openai_flag)
    man = run_manager_agent(client_id, session_id, sup, False, use_anthropic_flag, use_openai_flag)
    # Generate PDF
    report_bytes = generate_pdf([context, a1, a2, s1, s2, sup, man])
    # Save PDF
    out_dir = os.path.join("uploads", client_id, session_id)
    os.makedirs(out_dir, exist_ok=True)
    report_path = os.path.join(out_dir, "audit_report.pdf")
    with open(report_path, "wb") as f:
        f.write(report_bytes)
    # Return URL for download (static files served separately)
    report_url = f"/uploads/{client_id}/{session_id}/audit_report.pdf"
    return JSONResponse({"message": "Audit pipeline completed.", "report_url": report_url})

def initialize_session_service(*, use_supabase: bool = False):
    """
    Crea y devuelve el servicio de sesión.

    Params
    ------
    use_supabase : bool
        Si es True y hay credenciales válidas en el entorno, se usa Supabase;
        de lo contrario se cae al servicio en memoria.
    """

    supabase_url   = os.getenv("VITE_SUPABASE_URL")
    supabase_key   = os.getenv("VITE_SUPABASE_SERVICE_KEY")

    if use_supabase and supabase_url and supabase_key:
        log.info("Inicializando servicio de sesión con Supabase…")
        service = SupabaseSessionService()
    else:
        if use_supabase:
            log.warning(
                "Variables SUPABASE_URL / SUPABASE_SERVICE_KEY no definidas. Se usará InMemorySessionService."
            )
        else:
            log.info("Inicializando servicio de sesión en memoria…")
        service = PatchedInMemorySessionService()
    return service
    
# Application models and state for API endpoints
MAX_AUDIT_LOG_ENTRIES = 200

class ChatRequest(BaseModel):
    message: str
    client_id: str
    session_id: Optional[str] = None
    model_type: Optional[str] = None
    agent_type: Optional[str] = "assistant"

class AgentResponse(BaseModel):
    message: str
    client_id: str
    session_id: str
    model_used: Optional[str] = None

class ModelSettings(BaseModel):
    model_type: str

class ModelSettingsResponse(BaseModel):
    success: bool
    message: str
    model_type: str

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

# Initialize application state
app_state = {
    "session_service": initialize_session_service(use_supabase=False),
    "use_supabase": False,
    "use_anthropic": False,
    "use_openai": False,
    "active_teams": {},
    "connected_clients": set(),
    "uploaded_files": {},
    "default_model": "gemini",
    "audit_log": deque(maxlen=MAX_AUDIT_LOG_ENTRIES),
}

def validate_client_id(client_id: str) -> bool:
    if not client_id or len(client_id) < 4:
        return False
    return True

def run_assistant_agent(
    client_id: str,
    session_id: str,
    message: str,
    *,
    use_supabase: bool = False,
    use_anthropic: bool = False,
    use_openai: bool = False,
):
    """
    Ejecuta el agente Asistente IA para una interacción simple.

    Args
    ----
    client_id      : ID del cliente.
    session_id     : ID de la sesión.
    message        : Mensaje del usuario.
    use_supabase   : Si True y hay credenciales, persiste las sesiones en Supabase;
                     de lo contrario usa memoria.
    use_anthropic  : Si se debe usar Claude de Anthropic.
    use_openai     : Si se debe usar GPT de OpenAI.

    Returns
    -------
    str  – Respuesta del agente.
    """
    # Official Anthropic SDK call (preferred)
    if use_anthropic:
        try:
            import anthropic
            client = anthropic.Anthropic()
            resp = client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1024,
                messages=[{"role": "user", "content": message}],
            )
            # Try to extract content list
            if hasattr(resp, 'content'):
                parts = resp.content
                try:
                    # resp.content is list of parts with .text
                    return ''.join(getattr(p, 'text', str(p)) for p in parts)
                except Exception:
                    return str(parts)
            # Fallback to .completion attribute
            return getattr(resp, 'completion', str(resp))
        except ImportError:
            pass
        except Exception as e:
            return f"Error calling Anthropic SDK: {e}"
    # Direct API calls for OpenAI GPT and Anthropic Claude, bypassing ADK on demand
    if use_openai or use_anthropic:
        try:
            from openai import OpenAI
        except ImportError:
            return "Error: openai library not installed."
        # Determine API key and base
        if use_openai:
            api_key = os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY")
            api_base = None
            model_name = "gpt-4"
        else:
            api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("VITE_ANTHROPIC_API_KEY")
            api_base = "https://api.anthropic.com/v1"
            model_name = "claude-3-opus-20240229"
        if not api_key:
            return f"Error: {('OPENAI' if use_openai else 'ANTHROPIC')}_API_KEY not set."
        # Initialize client
        try:
            if api_base:
                client = OpenAI(api_key=api_key, api_base=api_base)
            else:
                client = OpenAI(api_key=api_key)
        except Exception:
            return "Error initializing OpenAI client."
        # Perform chat completion
        try:
            resp = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": message}],
                max_tokens=1024,
            )
            # Extract content
            choice = resp.choices[0]
            # Support both object and dict style
            if hasattr(choice, 'message') and hasattr(choice.message, 'content'):
                return choice.message.content
            elif isinstance(choice, dict) and 'message' in choice:
                return choice['message'].get('content', '')
            else:
                return str(choice)
        except Exception as e:
            return f"Error calling OpenAI API: {e}"
    # 1) Servicio de sesión
    session_service = initialize_session_service(use_supabase=use_supabase)

    # 2) Crear agente asistente
    print(f"Creando agente asistente (Anthropic={use_anthropic}, OpenAI={use_openai})")
    assistant_agent = create_assistant_only(
        client_id,
        use_anthropic=use_anthropic,
        use_openai=use_openai,
    )

    # 3) Loguear modelo
    model_name = getattr(assistant_agent.model, "model", str(assistant_agent.model))
    print(f"Modelo seleccionado para el asistente: {model_name}")

    # 4) Runner
    runner = Runner(
        agent=assistant_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    # 5) Asegurar sesión
    session = session_service.get_session(app_name=APP_NAME, user_id=client_id, session_id=session_id)
    if not session:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={"client_id": client_id},
        )

    # 6) Construir contenido y enviar
    content = types.Content(role="user", parts=[types.Part(text=message)])
    print(f"Enviando mensaje al agente: '{message[:50]}…'")

    response = None
    try:
        for event in runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content,
        ):
            if event.is_final_response():
                response = event.content

        # 7) Extraer texto
        response_text = ""
        if response and response.parts:
            for part in response.parts:
                if getattr(part, "text", None):
                    response_text += part.text

        print(f"Respuesta recibida - longitud: {len(response_text)}")
        return response_text
    except Exception as e:
        print(f"Error en run_assistant_agent: {e}")
        return f"Lo siento, hubo un error al comunicarse con el modelo. {e}"

def run_senior_agent(
    client_id: str,
    session_id: str,
    message: str,
    *,
    use_supabase: bool = False,
    use_anthropic: bool = False,
    use_openai: bool = False,
):
    """
    Ejecuta el agente Senior IA para análisis financiero.

    Args
    ----
    client_id      : ID del cliente.
    session_id     : ID de la sesión.
    message        : Mensaje del usuario.
    use_supabase   : Si True y hay credenciales, persiste las sesiones en Supabase;
                     de lo contrario usa memoria.
    use_anthropic  : Si se debe usar Claude de Anthropic.
    use_openai     : Si se debe usar GPT de OpenAI.

    Returns
    -------
    str – Respuesta del agente.
    """
    # Direct API calls for OpenAI GPT and Anthropic Claude, bypassing ADK on demand
    if use_openai:
        try:
            import openai
        except ImportError:
            return "Error: openai library not installed."
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return "Error: OPENAI_API_KEY not set."
        openai.api_key = key
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": message}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"Error calling OpenAI API: {e}"
    if use_anthropic:
        try:
            import openai
        except ImportError:
            return "Error: openai library not installed."
        key = os.getenv("ANTHROPIC_API_KEY")
        if not key:
            return "Error: ANTHROPIC_API_KEY not set."
        openai.api_key = key
        openai.api_base = "https://api.anthropic.com/v1"
        try:
            resp = openai.ChatCompletion.create(
                model="claude-3-opus-20240229",
                messages=[{"role": "user", "content": message}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"Error calling Anthropic API: {e}"
    # 1) Servicio de sesión
    session_service = initialize_session_service(use_supabase=use_supabase)

    # 2) Crear agente senior
    print(f"Creando agente senior (Anthropic={use_anthropic}, OpenAI={use_openai})")
    senior_agent = create_senior_agent(use_anthropic=use_anthropic, use_openai=use_openai)

    # 3) Loguear modelo
    model_name = getattr(senior_agent.model, "model", str(senior_agent.model))
    print(f"Modelo seleccionado para el senior: {model_name}")

    # 4) Runner
    runner = Runner(
        agent=senior_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    # 5) Asegurar sesión
    session = session_service.get_session(app_name=APP_NAME, user_id=client_id, session_id=session_id)
    if not session:
        session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={"client_id": client_id},
        )

    # 6) Construir contenido y enviar
    content = types.Content(role="user", parts=[types.Part(text=message)])
    print(f"Enviando mensaje al agente: '{message[:50]}…'")

    response = None
    try:
        for event in runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content,
        ):
            if event.is_final_response():
                response = event.content

        # 7) Extraer texto
        response_text = ""
        if response and response.parts:
            for part in response.parts:
                if getattr(part, "text", None):
                    response_text += part.text

        print(f"Respuesta recibida - longitud: {len(response_text)}")
        return response_text
    except Exception as e:
        print(f"Error en run_senior_agent: {e}")
        return f"Lo siento, hubo un error al comunicarse con el modelo. {e}"



def run_supervisor_agent(
    client_id: str,
    session_id: str,
    message: str,
    *,
    use_supabase: bool = False,
    use_anthropic: bool = False,
    use_openai: bool = False,
):
    """
    Ejecuta el agente Supervisor IA para supervisión del proceso.

    Args
    ----
    client_id      : ID del cliente.
    session_id     : ID de la sesión.
    message        : Mensaje del usuario.
    use_supabase   : Si True y existen credenciales, guarda sesiones en Supabase;
                     de lo contrario usa memoria.
    use_anthropic  : Si se debe usar Claude de Anthropic.
    use_openai     : Si se debe usar GPT de OpenAI.

    Returns
    -------
    str – Respuesta del agente.
    """
    # Direct LLM API integration: OpenAI GPT and Anthropic Claude
    if use_openai:
        try:
            import openai
        except ImportError:
            return "Error: openai library not installed."
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return "Error: OPENAI_API_KEY not set."
        openai.api_key = key
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": message}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"Error calling OpenAI API: {e}"
    if use_anthropic:
        # Anthropic (Claude) via OpenAI-compatible interface
        try:
            import openai
        except ImportError:
            return "Error: openai library not installed."
        key = os.getenv("ANTHROPIC_API_KEY")
        if not key:
            return "Error: ANTHROPIC_API_KEY not set."
        openai.api_key = key
        openai.api_base = "https://api.anthropic.com/v1"
        try:
            resp = openai.ChatCompletion.create(
                model="claude-3-opus-20240229",
                messages=[{"role": "user", "content": message}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"Error calling Anthropic API: {e}"
    # 1) Servicio de sesión
    session_service = initialize_session_service(use_supabase=use_supabase)

    # 2) Crear agente supervisor
    supervisor_agent = create_supervisor_agent(
        use_anthropic=use_anthropic,
        use_openai=use_openai,
    )

    # 3) Runner
    runner = Runner(
        agent=supervisor_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    # 4) Asegurar sesión
    session = session_service.get_session(app_name=APP_NAME, user_id=client_id, session_id=session_id)
    if not session:
        session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={"client_id": client_id},
        )

    # 5) Construir contenido y enviar
    content = types.Content(role="user", parts=[types.Part(text=message)])

    response = None
    for event in runner.run(
        user_id=client_id,
        session_id=session_id,
        new_message=content,
    ):
        if event.is_final_response():
            response = event.content

    # 6) Extraer texto de la respuesta
    response_text = ""
    if response and response.parts:
        for part in response.parts:
            if getattr(part, "text", None):
                response_text += part.text

    return response_text


def run_manager_agent(
    client_id: str,
    session_id: str,
    message: str,
    *,
    use_supabase: bool = False,
    use_anthropic: bool = False,
    use_openai: bool = False,
):
    """
    Ejecuta el agente Gerente IA responsable de la toma de decisiones.

    Args
    ----
    client_id      : ID del cliente.
    session_id     : ID de la sesión.
    message        : Mensaje del usuario.
    use_supabase   : Si True y existen credenciales, persiste sesiones en Supabase;
                     de lo contrario usa memoria.
    use_anthropic  : Si se debe usar Claude de Anthropic.
    use_openai     : Si se debe usar GPT de OpenAI.

    Returns
    -------
    str – Respuesta del agente.
    """
    # Direct LLM API integration: OpenAI GPT and Anthropic Claude
    if use_openai:
        try:
            import openai
        except ImportError:
            return "Error: openai library not installed."
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return "Error: OPENAI_API_KEY not set."
        openai.api_key = key
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": message}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"Error calling OpenAI API: {e}"
    if use_anthropic:
        # Anthropic (Claude) via OpenAI-compatible interface
        try:
            import openai
        except ImportError:
            return "Error: openai library not installed."
        key = os.getenv("ANTHROPIC_API_KEY")
        if not key:
            return "Error: ANTHROPIC_API_KEY not set."
        openai.api_key = key
        openai.api_base = "https://api.anthropic.com/v1"
        try:
            resp = openai.ChatCompletion.create(
                model="claude-3-opus-20240229",
                messages=[{"role": "user", "content": message}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"Error calling Anthropic API: {e}"
    # 1) Servicio de sesión
    session_service = initialize_session_service(use_supabase=use_supabase)

    # 2) Crear agente gerente
    manager_agent = create_manager_agent(
        use_anthropic=use_anthropic,
        use_openai=use_openai,
    )

    # 3) Runner
    runner = Runner(
        agent=manager_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    # 4) Asegurar sesión
    session = session_service.get_session(app_name=APP_NAME, user_id=client_id, session_id=session_id)
    if not session:
        session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={"client_id": client_id},
        )

    # 5) Construir contenido y enviar
    content = types.Content(role="user", parts=[types.Part(text=message)])

    response = None
    for event in runner.run(
        user_id=client_id,
        session_id=session_id,
        new_message=content,
    ):
        if event.is_final_response():
            response = event.content

    # 6) Extraer texto de la respuesta
    response_text = ""
    if response and response.parts:
        for part in response.parts:
            if getattr(part, "text", None):
                response_text += part.text

    return response_text


def run_team_agent(
    client_id: str,
    session_id: str,
    message: str,
    *,
    use_supabase: bool = False,
    use_anthropic: bool = False,
    use_openai: bool = False,
):
    """
    Ejecuta el equipo completo de agentes (assistant → senior → supervisor → manager) en secuencia.

    Args
    ----
    client_id      : ID del cliente.
    session_id     : ID de la sesión.
    message        : Mensaje del usuario.
    use_supabase   : Si True y existen credenciales, las sesiones se guardan en Supabase;
                     de lo contrario se usa memoria.
    use_anthropic  : Si se debe usar Claude.
    use_openai     : Si se debe usar GPT de OpenAI.

    Returns
    -------
    str – Respuesta final del equipo.
    """
    # 1) Servicio de sesión
    session_service = initialize_session_service(use_supabase=use_supabase)

    # 2) Crear equipo de trabajo (workflow)
    print(f"Creando equipo de auditoría (Anthropic={use_anthropic}, OpenAI={use_openai})")
    workflow_agent, team_agents = create_workflow_audit_team(
        client_id,
        use_anthropic=use_anthropic,
        use_openai=use_openai,
    )
    print("Equipo creado con agentes:", ", ".join(team_agents.keys()))

    # 3) Runner
    runner = Runner(
        agent=workflow_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    # 4) Asegurar sesión
    session = session_service.get_session(app_name=APP_NAME, user_id=client_id, session_id=session_id)
    if not session:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=client_id,
            session_id=session_id,
            state={
                "client_id": client_id,
                "audit_process": "starting",
                "agent_responses": {},
            },
        )

    # 5) Construir contenido y enviar
    content = types.Content(role="user", parts=[types.Part(text=message)])
    print(f"Enviando mensaje al equipo: '{message[:50]}…'")

    intermediate_responses = {}
    response = None
    current_agent = None

    try:
        for event in runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content,
        ):
            # — tool_call → identifica agente activo
            if event.is_tool_call():
                called_tool = event.tool_call.name
                current_agent = {
                    "assistant_agent": "assistant",
                    "senior_agent": "senior",
                    "supervisor_agent": "supervisor",
                    "manager_agent": "manager",
                }.get(called_tool)
                if current_agent:
                    print(f"Procesando con agente: {current_agent}")

            # — tool_response → guarda respuesta intermedia
            if event.is_tool_response() and current_agent:
                agent_response = event.tool_response.get("response", "")
                agent_text = ""
                if isinstance(agent_response, types.Content) and agent_response.parts:
                    for part in agent_response.parts:
                        if getattr(part, "text", None):
                            agent_text += part.text
                intermediate_responses[current_agent] = agent_text
                print(f"Respuesta de {current_agent} guardada ({len(agent_text)} chars)")

            # — final_response → termina workflow
            if event.is_final_response():
                response = event.content

        # 6) Extraer texto final
        response_text = ""
        if response and response.parts:
            for part in response.parts:
                if getattr(part, "text", None):
                    response_text += part.text

        # 7) Actualizar estado de sesión
        session = session_service.get_session(app_name=APP_NAME, user_id=client_id, session_id=session_id)
        if session:
            session.state = {
                **(session.state or {}),
                "audit_process": "completed",
                "agent_responses": intermediate_responses,
            }
            session_service.update_session(session)

        print(f"Respuesta final recibida - longitud: {len(response_text)}")
        return response_text

    except Exception as e:
        import traceback

        traceback.print_exc()
        return f"Lo siento, hubo un error al procesar con el equipo de auditoría. {e}"


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
    """Punto de entrada de la aplicación Audit-IA."""
    import argparse
    import os

    parser = argparse.ArgumentParser(
        description="Plataforma de Auditoría con Agentes IA Jerárquicos"
    )

    # ──────────── flags generales ────────────
    parser.add_argument(
        "--mode",
        choices=["interactive", "api"],
        default="interactive",
        help="Modo de ejecución: 'interactive' para consola, 'api' para servidor web",
    )
    parser.add_argument(
        "--supabase",
        action="store_true",
        help="Persistir sesiones en Supabase (en lugar de memoria)",
    )
    parser.add_argument(
        "--anthropic",
        action="store_true",
        help="Usar Claude de Anthropic en lugar de Gemini",
    )
    parser.add_argument(
        "--openai",
        action="store_true",
        help="Usar GPT de OpenAI en lugar de Gemini",
    )

    # ──────────── flags modo interactivo ────────────
    parser.add_argument("--client", help="ID del cliente (solo modo interactive)")
    parser.add_argument(
        "--agent",
        choices=["assistant", "senior", "supervisor", "manager", "team", "workflow"],
        default="assistant",
        help="Tipo de agente (modo interactive)",
    )

    # ──────────── flags modo API ────────────
    parser.add_argument("--host", default=HOST, help="Host del servidor API")
    parser.add_argument("--port", type=int, default=PORT, help="Puerto del servidor API")

    args = parser.parse_args()

    # ──────────── comprobación de credenciales ────────────
    if not os.getenv("GEMINI_API_KEY"):
        print("ADVERTENCIA: GEMINI_API_KEY no encontrada. Algunas funcionalidades IA pueden no funcionar.")

    if args.anthropic and not os.getenv("ANTHROPIC_API_KEY"):
        print("ADVERTENCIA: ANTHROPIC_API_KEY no encontrada. Claude no estará disponible.")

    if args.openai and not os.getenv("OPENAI_API_KEY"):
        print("ADVERTENCIA: OPENAI_API_KEY no encontrada. GPT-4 no estará disponible.")

    if args.supabase:
        if not (os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SERVICE_KEY")):
            print(
                "ADVERTENCIA: Se activó --supabase pero faltan SUPABASE_URL o SUPABASE_SERVICE_KEY."
            )

    # ──────────── despachar según modo ────────────
    if args.mode == "interactive":
        run_interactive_mode(args)
    else:
        # Ejecutar el servidor API con la app global (incluye endpoints /api/upload, /api/start-audit, /api/chat)
        try:
            import uvicorn
        except ImportError:
            print("Error: uvicorn no está instalado. Instálalo con: pip install uvicorn")
            exit(1)
        uvicorn.run("backend.main:app", host=args.host, port=args.port)


def run_interactive_mode(args):
    """Ejecuta la aplicación en modo interactivo por consola."""
    import uuid
    import time

    # ─────────── IDs básicos ───────────
    client_id  = args.client or f"client_{uuid.uuid4().hex[:8]}"
    session_id = f"session_{uuid.uuid4().hex[:8]}"

    print(f"Iniciando modo interactivo con cliente: {client_id}")
    print(f"Persistencia en Supabase: {args.supabase}")
    print(f"Usar Anthropic: {args.anthropic}")
    print(f"Usar OpenAI: {args.openai}")
    print("---------------------------------------")

    # ─────────── servicio de sesión ───────────
    session_service = initialize_session_service(use_supabase=args.supabase)

    # ─────────── selección de agente / equipo ───────────
    agent = None
    team  = None

    if args.agent == "assistant":
        agent = create_assistant_only(
            client_id,
            use_anthropic=args.anthropic,
            use_openai=args.openai,
        )
        print("Agente: Asistente IA")

    elif args.agent == "senior":
        agent = create_senior_agent(
            use_anthropic=args.anthropic,
            use_openai=args.openai,
        )
        print("Agente: Senior IA")

    elif args.agent == "supervisor":
        agent = create_supervisor_agent(
            use_anthropic=args.anthropic,
            use_openai=args.openai,
        )
        print("Agente: Supervisor IA")

    elif args.agent == "manager":
        agent = create_manager_agent(
            use_anthropic=args.anthropic,
            use_openai=args.openai,
        )
        print("Agente: Gerente IA")

    elif args.agent == "team":
        agent, team = create_audit_team(
            client_id,
            use_anthropic=args.anthropic,
            use_openai=args.openai,
        )
        print("Agente: Equipo Jerárquico (iniciando con Gerente IA)")

    else:  # workflow
        agent, team = create_workflow_audit_team(
            client_id,
            use_anthropic=args.anthropic,
            use_openai=args.openai,
        )
        print("Agente: Equipo de Flujo de Trabajo")

    # ─────────── runner ───────────
    runner = Runner(
        agent=agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    # ─────────── crear sesión ───────────
    session_service.create_session(
        app_name=APP_NAME,
        user_id=client_id,
        session_id=session_id,
        state={
            "client_id": client_id,
            "current_timestamp": time.time(),
            "current_task_id": f"task_{uuid.uuid4().hex[:8]}",
        },
    )

    # ─────────── loop de interacción ───────────
    print("\nEscribe 'salir' para terminar la sesión.")
    while True:
        user_input = input("\nTú: ")

        if user_input.lower() in {"salir", "exit", "quit"}:
            print("\n¡Hasta luego!")
            break

        content = types.Content(role="user", parts=[types.Part(text=user_input)])

        print("\nAgente: ", end="", flush=True)
        response = None

        for event in runner.run(
            user_id=client_id,
            session_id=session_id,
            new_message=content,
        ):
            # Streaming token‐by‐token
            if hasattr(event, "content_part_delta") and event.content_part_delta:
                delta = event.content_part_delta
                if delta.text:
                    print(delta.text, end="", flush=True)

            # Respuesta final (en caso de no streaming)
            if event.is_final_response():
                response = event.content
                if response and response.parts:
                    for part in response.parts:
                        if getattr(part, "text", None) and not hasattr(event, "content_part_delta"):
                            print(part.text, end="", flush=True)

        print()  # salto de línea al final de cada respuesta


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
    
    # NEW: Pydantic model for /api/chat request to match frontend
    class ChatRequest(BaseModel):
        message: str
        client_id: str
        session_id: Optional[str] = None
        model_type: Optional[str] = None
        agent_type: Optional[str] = "assistant"
    
    class AgentResponse(BaseModel):
        message: str
        client_id: str
        session_id: str
        model_used: Optional[str] = None # Added to match frontend expectation
    
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
    app = FastAPI(title="API de Auditoría con Agentes IA", version="0.1.0", lifespan=lifespan)

    from fastapi import FastAPI, Request
    from contextlib import asynccontextmanager
    
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
        if api_key:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            log.info("Google GenAI configurado correctamente")
        else:
            log.warning("GEMINI_API_KEY no definido → Gemini no podrá responder")
        yield  # Application lifespan continues here
    
    

    
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
        "session_service": initialize_session_service(use_supabase=False),
        "use_anthropic": False,
        "use_openai": False,
        "active_teams": {},  # Almacena los equipos activos
        "connected_clients": set(),  # Clientes conectados al WebSocket
        "uploaded_files": {},  # Almacena información sobre archivos cargados
        "default_model": "gpt4",  # Modelo por defecto (OpenAI GPT-4)
        "audit_log": deque(maxlen=MAX_AUDIT_LOG_ENTRIES) # UPDATED: Use deque for audit_log
    }
    
    # UPDATED: Endpoint para cambiar la configuración del modelo de IA
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
            
            # Emitir evento para registrar el cambio de modelo en background
            try:
                import asyncio
                asyncio.create_task(emit_audit_event({
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
                }))
            except Exception:
                pass
            
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
                "model_type": app_state.get("default_model", "gpt4")
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
    def validate_file(file: UploadFile) -> (bool, str): # type: ignore
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
            
            # Guardar el archivo localmente
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Almacenar en Supabase Storage
            # Intentar subir a Supabase Storage
            try:
                from supabase import create_client
                from backend.config import SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_SCHEMA
                supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY, schema=SUPABASE_SCHEMA)
                bucket = supabase.storage.from_('chat-files')
                storage_path = f"{client_id}/{safe_filename}"
                with file_path.open('rb') as fobj:
                    file_bytes = fobj.read()
                upload_resp = bucket.upload(storage_path, file_bytes, {'upsert': True})
                if upload_resp.error:
                    log.error(f"Error uploading file to Supabase: {upload_resp.error.message}")
                    file_url = None
                else:
                    public = bucket.get_public_url(storage_path)
                    file_url = public.get('publicUrl')
            except ImportError:
                # Supabase client no disponible, caer en fallback local
                file_url = None
            # Almacenar información sobre el archivo en memoria
            app_state.setdefault('uploaded_files', {})
            app_state['uploaded_files'].setdefault(client_id, {})
            app_state['uploaded_files'][client_id][file_id] = {
                'original_name': file.filename,
                'saved_name': safe_filename,
                'path': str(file_path),
                'type': file_ext,
                'size': os.path.getsize(file_path),
                'upload_time': datetime.now().isoformat(),
                'storage_path': storage_path,
                'file_url': file_url
            }
            
            print(f"Archivo cargado: {file.filename} -> {file_path}")
            
            # UPDATED: Use app_state default model if model_type is not provided
            if not model_type:
                model_type = app_state.get("default_model", "gpt4")
                
            use_anthropic = model_type == "claude" or app_state.get("use_anthropic", False)
            use_openai = model_type == "gpt4" or app_state.get("use_openai", False)
            
            # Emitir evento para registrar la carga de archivo
            # Emitir evento de auditoría por carga de archivo
            await emit_audit_event({
                'id': f"event_{uuid.uuid4().hex[:8]}",
                'team_id': f"team_{client_id[:8]}",
                'agent_name': f"{agent_type}_agent",
                'event_type': 'file_upload',
                'details': {
                    'client_id': client_id,
                    'session_id': session_id,
                    'file_name': file.filename,
                    'file_id': file_id,
                    'file_type': file_ext,
                    'file_size': os.path.getsize(file_path),
                    'file_url': file_url,
                    'model_used': model_type
                },
                'timestamp': datetime.now().isoformat(),
                'importance': 'high'
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
                args.supabase, 
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
    
    # NEW CHAT ENDPOINT TO MATCH FRONTEND
@app.post("/api/chat", response_model=AgentResponse)
async def handle_chat_request(request: ChatRequest):
    """Handles chat requests from the frontend."""
    start_time = time.time()
    client_id = request.client_id
    session_id = request.session_id or str(uuid.uuid4())
    message_text = request.message

    if not validate_client_id(client_id):
        return JSONResponse(
            status_code=400,
            content={"message": "ID de cliente inválido", "client_id": client_id, "session_id": session_id, "model_used": "error"}
        )

    # Determine model type and flags
    requested_model_type = request.model_type or app_state.get("default_model", "gemini")
    use_anthropic = requested_model_type.lower().startswith("claude")
    use_openai = requested_model_type.lower().startswith("gpt")
    # Map agent_type to runner function
    agent_runner = {
        "assistant": run_assistant_agent,
        "senior": run_senior_agent,
        "supervisor": run_supervisor_agent,
        "manager": run_manager_agent,
        "team": run_team_agent,
    }.get(request.agent_type, run_assistant_agent)
        # Invoke the runner in a thread
    try:
        response_text = await asyncio.to_thread(
            agent_runner,
            client_id,
            session_id,
            message_text,
            use_supabase=app_state.get("use_supabase", False),
            use_anthropic=use_anthropic,
            use_openai=use_openai,
        )
        return AgentResponse(
            message=response_text,
            client_id=client_id,
            session_id=session_id,
            model_used=requested_model_type,
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error interno: {e}", "client_id": client_id, "session_id": session_id, "model_used": "error"}
        )

        use_anthropic = requested_model_type.lower().startswith("claude")
        use_openai = requested_model_type.lower().startswith("gpt")
        # If 'gemini' or 'mock', both use_anthropic and use_openai will be False, leading to Gemini by default in ADK agent creation. 
        # 'mock' model type is handled by the ADK runner or agent itself if designed that way, or we might need explicit mock handling here too.
        # For now, assuming ADK create_assistant_only handles the Gemini default if no specific flags are true.

        # Agent selection based on agent_type from request
        agent_func_to_run = None
        # For now, we hardcode to assistant agent as per primary goal.
        # Later, this can be expanded based on request.agent_type.
        if request.agent_type == "assistant":
            agent_func_to_run = run_assistant_agent
        elif request.agent_type == "senior":
            agent_func_to_run = run_senior_agent
        elif request.agent_type == "supervisor":
            agent_func_to_run = run_supervisor_agent
        elif request.agent_type == "manager":
            agent_func_to_run = run_manager_agent
        elif request.agent_type == "team":
            agent_func_to_run = run_team_agent
        else:
            log.warning(f"Unknown agent_type: {request.agent_type}. Defaulting to assistant.")
            agent_func_to_run = run_assistant_agent # Default to assistant
            final_model_type_for_response = requested_model_type # Keep requested model type for response

        if not agent_func_to_run:
            log.error(f"Could not determine agent function for agent_type: {request.agent_type}")
            return JSONResponse(
                status_code=500,
                content={"message": "Error interno: Tipo de agente no configurado.", "client_id": client_id, "session_id": session_id, "model_used": "error"}
            )

        try:
            log.info(f"Processing /api/chat for client: {client_id}, session: {session_id}, model: {final_model_type_for_response}, agent: {request.agent_type}")
            # The ADK functions run_assistant_agent etc. expect use_supabase as a direct arg.
            # We need to get it from the global `args` or app_state if that's how it's managed in API mode.
            # Assuming `args.supabase` is available from the initial `main()` parse if API mode is run.
            # This might need adjustment if `args` isn't accessible here or if app_state should hold it.
            
            # Quick check for args.supabase (this is a simplification, might need robust config access)
            # It seems `args` from `main()` isn't directly available in request handlers.
            # Let's rely on `app_state` for `use_supabase` or assume a default if not set.
            # For now, let's assume `initialize_session_service` called by agent runners handles this.

            # Determinar uso de Supabase
            use_supabase_flag = app_state.get("use_supabase", False)
            # Intento primario con el modelo solicitado
            try:
                response_text = await asyncio.to_thread(
                    agent_func_to_run,
                    client_id, session_id, message_text,
                    use_supabase=use_supabase_flag,
                    use_anthropic=use_anthropic,
                    use_openai=use_openai
                )
            except Exception as primary_err:
                # Secuencia de fallback: gpt4 -> gemini -> claude
                fallback_sequence = ['gpt4', 'gemini', 'claude']
                response_text = None
                for fb in fallback_sequence:
                    if fb == requested_model_type:
                        continue
                    fb_anthropic = (fb == 'claude')
                    fb_openai = (fb == 'gpt4')
                    try:
                        response_text = await asyncio.to_thread(
                            agent_func_to_run,
                            client_id, session_id, message_text,
                            use_supabase=use_supabase_flag,
                            use_anthropic=fb_anthropic,
                            use_openai=fb_openai
                        )
                        final_model_type_for_response = fb
                        break
                    except Exception:
                        continue
                if response_text is None:
                    # Si todos fallan, propagar el error original
                    raise primary_err
            
            # Ensure use_supabase is passed to the agent function correctly
            # The run_..._agent functions take use_supabase as a direct argument.
            # It's initialized from `args.supabase` in `main()` which sets up `app_state["session_service"]`
            # The agent runners call `initialize_session_service(use_supabase=...)`
            # So, we need to make sure the agent functions get this flag.
            # The agent functions like `run_assistant_agent` already take `use_supabase` as a kwarg.
            # The `initialize_session_service` is called inside them.
            # This part needs careful checking of how `use_supabase` is propagated in API mode.
            # For now, let's assume the agent functions handle it internally or we need to pass `args.supabase` to them.
            # The current structure of `run_assistant_agent` calls `initialize_session_service(use_supabase=use_supabase)`
            # so the boolean `use_supabase` must be passed to it. This is missing from `asyncio.to_thread` call.
            
            # CORRECTED call to agent function, assuming `args` is accessible or default is fine
            # This part needs to be robust. For now, let's add a placeholder for use_supabase
            # Ideally, this should come from app_state if set during startup
            use_supabase_flag = app_state.get("use_supabase_from_config", False) # Placeholder

            # The functions like run_assistant_agent themselves handle initialize_session_service(use_supabase=...)
            # So, the boolean use_supabase needs to be passed to them.
            # The current asyncio.to_thread call only passes use_anthropic, use_openai.

            # Re-doing the call with placeholder for use_supabase
            response_text = await asyncio.to_thread(
                agent_func_to_run,
                client_id, session_id, message_text,
                use_supabase=use_supabase_flag, # THIS IS A KEY FIX - ensure it gets the right config
                use_anthropic=use_anthropic,
                use_openai=use_openai
            )

            elapsed_time = time.time() - start_time
            log.info(f"Response for /api/chat generated in {elapsed_time:.2f}s. Model: {final_model_type_for_response}")

            return AgentResponse(
                message=response_text,
                client_id=client_id,
                session_id=session_id,
                model_used=final_model_type_for_response 
            )

        except Exception as e:
            log.error(f"Error processing /api/chat request for client {client_id}: {e}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={"message": f"Error interno del servidor: {str(e)}", "client_id": client_id, "session_id": session_id, "model_used": "error"}
            )
# CHAT ENDPOINT: handle messages via assistant agent
@app.post("/api/chat", response_model=AgentResponse)
async def handle_chat_request(request: ChatRequest):
    """Handles chat requests from the frontend by delegating to the assistant agent."""
    client_id = request.client_id
    session_id = request.session_id or str(uuid.uuid4())
    if not validate_client_id(client_id):
        return JSONResponse(
            status_code=400,
            content={"message": "ID de cliente inválido", "client_id": client_id, "session_id": session_id, "model_used": "error"}
        )
    model_type = request.model_type or app_state.get("default_model", "gemini")
    use_anthropic = model_type.lower().startswith("claude")
    use_openai = model_type.lower().startswith("gpt")
    try:
        response_text = await asyncio.to_thread(
            run_assistant_agent,
            client_id,
            session_id,
            request.message,
            use_supabase=app_state.get("use_supabase", False),
            use_anthropic=use_anthropic,
            use_openai=use_openai,
        )
        return AgentResponse(
            message=response_text,
            client_id=client_id,
            session_id=session_id,
            model_used=model_type,
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error interno: {e}", "client_id": client_id, "session_id": session_id, "model_used": "error"}
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

 # Endpoint to list clients from Supabase
@app.get("/api/clients")
async def get_clients():
    try:
        from supabase import create_client
        from backend.config import SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_SCHEMA
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY, schema=SUPABASE_SCHEMA)
        result = supabase.table("users").select("*").eq("role", "client").execute()
        data = result.data or []
        return JSONResponse(status_code=200, content=data)
    except Exception as e:
        log.error(f"Error fetching clients: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "Error interno al obtener clientes"})

# Endpoint to list active audit teams
@app.get("/api/teams", response_model=List[AuditTeam])
async def list_teams():
    return list(app_state.get("active_teams", {}).values())

# Endpoint to list audit events, optional filtering by team_id
@app.get("/api/events", response_model=List[AuditEvent])
async def list_events(team_id: Optional[str] = None, limit: int = Query(50)):
    events = list(app_state.get("audit_log", []))
    if team_id:
        events = [e for e in events if e.get("team_id") == team_id]
    return events


if __name__ == "__main__":
    # Ejecutar la función principal
    main()