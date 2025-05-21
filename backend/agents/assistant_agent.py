from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
import os
import uuid
import google.generativeai as genai


from backend.config import (
    DEFAULT_ASSISTANT_MODEL, ASSISTANT_AGENT_NAME,
    GPT4_MODEL, CLAUDE_OPUS_MODEL
)
from backend.tools.sheet_tools import get_sheet_data, verify_sheet_totals, verify_balance_equation
from backend.tools.tracing_tools import log_agent_action, get_action_history
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from google.adk.tools import FunctionTool  # deprecated, only for fallback (tools now auto-wrapped)

def create_assistant_agent(use_anthropic: bool = False, use_openai: bool = False) -> LlmAgent:
    """
    Crea un agente Asistente IA especializado en auditoría financiera y contable.
    
    Args:
        use_anthropic: Si se debe usar Claude de Anthropic.
        use_openai: Si se debe usar GPT de OpenAI.
        
    Returns:
        LlmAgent: El agente configurado.
    """
    # Verificar credenciales de API y definir modelo LLM
    if use_anthropic and not os.getenv("ANTHROPIC_API_KEY"):
        print("ADVERTENCIA: ANTHROPIC_API_KEY no encontrada. Se usará modelo por defecto.")
        use_anthropic = False
    if use_openai and not os.getenv("OPENAI_API_KEY"):
        print("ADVERTENCIA: OPENAI_API_KEY no encontrada. Se usará modelo por defecto.")
        use_openai = False
    # Selección de modelo mediante constantes de configuración
    if use_openai:
        model = LiteLlm(model=GPT4_MODEL)
    elif use_anthropic:
        model = LiteLlm(model=CLAUDE_OPUS_MODEL)
    else:
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        model = DEFAULT_ASSISTANT_MODEL
    
    # Crear el agente Asistente
    agent = LlmAgent(
        name="assistant_agent",
        description="Asistente IA especializado en auditoría financiera y contable. Interactúa con el cliente y puede escalar casos complejos.",
        model=model,
        tools=[
            FunctionTool(escalate_to_senior),
            FunctionTool(save_audit_event)
        ]
    )
    
    return agent

def escalate_to_senior(client_id: str, session_id: str, case_summary: str, audit_documents: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Escala un caso al agente Senior para revisión y análisis detallado.
    
    Args:
        client_id: ID del cliente.
        session_id: ID de la sesión actual.
        case_summary: Resumen del caso.
        audit_documents: Lista opcional de documentos relevantes.
        
    Returns:
        Dict: Resultado del escalamiento con mensaje de confirmación.
    """
    # Esta función sería implementada en el backend para pasar el caso al Senior
    # Aquí solo registramos la intención y devolvemos una respuesta positiva
    
    # Registrar el evento de escalamiento
    escalation_event = {
        "timestamp": datetime.now().isoformat(),
        "client_id": client_id,
        "session_id": session_id,
        "action": "escalate_to_senior",
        "summary": case_summary,
        "documents": audit_documents or []
    }
    
    # En una implementación real, esto se guardaría en una base de datos
    # Para este ejemplo, lo guardamos en un archivo temporal
    try:
        escalation_file = os.path.join("tmp", f"escalation_{client_id}_{session_id}.json")
        os.makedirs("tmp", exist_ok=True)
        
        with open(escalation_file, "w") as f:
            json.dump(escalation_event, f, indent=2)
    except Exception as e:
        print(f"Error al guardar evento de escalamiento: {e}")
    # Emitir evento de escalamiento
    try:
        from backend.main import emit_audit_event
        import asyncio
        event = {
            'id': f"escalation_{uuid.uuid4().hex[:8]}",
            'team_id': f"team_{client_id[:8]}",
            'agent_name': 'assistant_agent',
            'event_type': 'escalation',
            'details': {'summary': case_summary, 'documents': audit_documents or []},
            'timestamp': datetime.now().isoformat(),
            'importance': 'high'
        }
        asyncio.create_task(emit_audit_event(event))
    except Exception:
        pass
    return {
        "success": True,
        "message": "El caso ha sido escalado al agente Senior para un análisis más detallado.",
        "next_steps": "El Senior revisará la información proporcionada y continuará con el proceso de auditoría."
    }

def save_audit_event(client_id: str, event_type: str, details: str, importance: str) -> Dict[str, Any]:
    """
    Guarda un evento importante en el registro de auditoría.
    
    Args:
        client_id: ID del cliente.
        event_type: Tipo de evento.
        details: Detalles del evento.
        importance: Importancia del evento.
        
    Returns:
        Dict: Resultado del registro con confirmación.
    """
    # Crear el objeto de evento
    audit_event = {
        "timestamp": datetime.now().isoformat(),
        "client_id": client_id,
        "event_type": event_type,
        "details": details,
        "importance": importance
    }
    
    # En una implementación real, esto se guardaría en una base de datos
    # Para este ejemplo, lo guardamos en un archivo temporal
    try:
        events_dir = os.path.join("tmp", "audit_events")
        os.makedirs(events_dir, exist_ok=True)
        
        event_file = os.path.join(events_dir, f"event_{client_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
        with open(event_file, "w") as f:
            json.dump(audit_event, f, indent=2)
    except Exception as e:
        print(f"Error al guardar evento de auditoría: {e}")
    # Emitir evento para WebSocket/API
    try:
        from backend.main import emit_audit_event
        import asyncio
        evt = dict(audit_event)
        evt['team_id'] = f"team_{client_id[:8]}"
        asyncio.create_task(emit_audit_event(evt))
    except Exception:
        pass
    return {
        "success": True,
        "message": f"Evento de auditoría registrado: {event_type} (Importancia: {importance})"
    }