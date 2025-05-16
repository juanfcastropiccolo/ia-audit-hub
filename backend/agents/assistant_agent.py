from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
import os
from backend.config import (
    DEFAULT_ASSISTANT_MODEL, ASSISTANT_AGENT_NAME,
    GEMINI_FLASH_MODEL, CLAUDE_HAIKU_MODEL, GPT35_MODEL
)
from backend.tools.sheet_tools import get_sheet_data, verify_sheet_totals, verify_balance_equation
from backend.tools.tracing_tools import log_agent_action, get_action_history
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from google.adk.tools import FunctionTool

def create_assistant_agent(use_anthropic: bool = False, use_openai: bool = False) -> LlmAgent:
    """
    Crea un agente Asistente IA especializado en auditoría financiera y contable.
    
    Args:
        use_anthropic: Si se debe usar Claude de Anthropic.
        use_openai: Si se debe usar GPT de OpenAI.
        
    Returns:
        LlmAgent: El agente configurado.
    """
    # Definir el modelo a utilizar según la configuración
    model = "gemini-1.5-pro"
    if use_anthropic:
        model = "claude-3-opus-20240229"
    elif use_openai:
        model = "gpt-4"
    
    # Crear el agente Asistente
    agent = LlmAgent(
        name="assistant_agent",
        description="Asistente IA especializado en auditoría financiera y contable. Interactúa directamente con el cliente, recopila información necesaria y puede derivar casos complejos a agentes con mayor experiencia.",
        model=model,
        tools=[
            FunctionTool(
                name="escalate_to_senior",
                description="Escalar un caso complejo al agente Senior para análisis más detallado y revisión profunda. Usar cuando el caso requiera un análisis especializado o cuando el asistente haya identificado áreas que requieran experiencia adicional.",
                func=escalate_to_senior,
                parameters={
                    "type": "object",
                    "properties": {
                        "client_id": {
                            "type": "string",
                            "description": "ID del cliente cuyo caso está siendo escalado"
                        },
                        "session_id": {
                            "type": "string",
                            "description": "ID de la sesión actual"
                        },
                        "case_summary": {
                            "type": "string",
                            "description": "Resumen del caso que está siendo escalado, incluyendo puntos clave y razones del escalamiento"
                        },
                        "audit_documents": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Lista de documentos relevantes para la auditoría que han sido analizados"
                        }
                    },
                    "required": ["client_id", "session_id", "case_summary"]
                }
            ),
            FunctionTool(
                name="save_audit_event",
                description="Guardar un evento importante en el registro de auditoría para su seguimiento posterior",
                func=save_audit_event,
                parameters={
                    "type": "object",
                    "properties": {
                        "client_id": {
                            "type": "string",
                            "description": "ID del cliente relacionado con el evento"
                        },
                        "event_type": {
                            "type": "string",
                            "description": "Tipo de evento (document_review, client_query, correction_suggestion, etc.)"
                        },
                        "details": {
                            "type": "string",
                            "description": "Detalles específicos del evento para su registro"
                        },
                        "importance": {
                            "type": "string",
                            "enum": ["low", "medium", "high", "critical"],
                            "description": "Nivel de importancia del evento"
                        }
                    },
                    "required": ["client_id", "event_type", "details", "importance"]
                }
            )
        ],
        instructions="""
        Eres un Asistente de Auditoría IA de primera línea, especializado en atención a clientes que requieren auditoría financiera y contable.
        
        # Tus principales responsabilidades son:
        1. Atender a los clientes que se conectan al servicio de auditoría.
        2. Recopilar información y documentos necesarios para el proceso de auditoría.
        3. Realizar un análisis inicial básico de los documentos proporcionados por el cliente.
        4. Solicitar información adicional cuando sea necesario.
        5. Escalar casos complejos al agente Senior cuando sea apropiado.
        
        # Reglas importantes:
        1. SIEMPRE trata al cliente con amabilidad y profesionalismo.
        2. NUNCA inventes información financiera o contable que no esté respaldada por los documentos proporcionados.
        3. Si el cliente solicita servicios fuera del alcance de la auditoría financiera, explica amablemente las limitaciones.
        4. Cuando el cliente cargue documentos financieros o contables, DEBES analizarlos y ofrecer un resumen inicial.
        5. Si detectas anomalías importantes, inconsistencias en los datos, o casos que requieran un análisis más detallado, DEBES escalar el caso al agente Senior utilizando la herramienta "escalate_to_senior".
        6. SIEMPRE registra eventos importantes de la auditoría con la herramienta "save_audit_event".
        7. Después de revisar documentos complejos (como balances financieros, estados de resultados, etc.) ofrece escalar al agente Senior para una revisión más detallada.
        
        # Escenarios para escalar al Senior:
        1. Estados financieros con discrepancias significativas
        2. Casos de auditoría fiscal complejos
        3. Revisión detallada de cumplimiento normativo
        4. Análisis de riesgos de fraude
        5. Cualquier caso donde el cliente solicite una revisión especializada
        
        Al escalar un caso, proporciona un resumen claro y conciso de la situación y explica al cliente que un especialista Senior continuará con su caso para un análisis más profundo.
        """
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
        print(f"Error al guardar evento de escalamiento: {str(e)}")
    
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
        print(f"Error al guardar evento de auditoría: {str(e)}")
    
    return {
        "success": True,
        "message": f"Evento de auditoría registrado: {event_type} (Importancia: {importance})"
    } 