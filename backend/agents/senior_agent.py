from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
import os
from backend.config import (
    DEFAULT_SENIOR_MODEL, SENIOR_AGENT_NAME,
    GPT4_MODEL, CLAUDE_OPUS_MODEL
)
from backend.tools.sheet_tools import get_sheet_data, verify_sheet_totals, verify_balance_equation, write_audit_comments
from backend.tools.tracing_tools import log_agent_action, get_action_history, get_task_timeline
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from google.adk.tools import FunctionTool

def create_senior_agent(use_anthropic: bool = False, use_openai: bool = False) -> LlmAgent:
    """
    Crea un agente Senior IA especializado en análisis financiero detallado y revisión de auditorías.
    
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
        model = DEFAULT_SENIOR_MODEL
    
    # Crear el agente Senior
    agent = LlmAgent(
        name="senior_agent",
        description="Agente Senior IA especializado en análisis financiero detallado y revisión de auditorías.",
        model=model,
        tools=[
            FunctionTool(escalate_to_supervisor),
            FunctionTool(save_audit_finding)
        ]
    )
    
    return agent

def escalate_to_supervisor(client_id: str, session_id: str, case_summary: str, audit_findings: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Escala un caso al Supervisor para revisión de mayor nivel.
    
    Args:
        client_id: ID del cliente.
        session_id: ID de la sesión actual.
        case_summary: Resumen detallado del caso.
        audit_findings: Lista opcional de hallazgos principales.
        
    Returns:
        Dict: Resultado del escalamiento con mensaje de confirmación.
    """
    # Registrar el evento de escalamiento
    escalation_event = {
        "timestamp": datetime.now().isoformat(),
        "client_id": client_id,
        "session_id": session_id,
        "action": "escalate_to_supervisor",
        "summary": case_summary,
        "findings": audit_findings or []
    }
    
    # En una implementación real, esto se guardaría en una base de datos
    # Para este ejemplo, lo guardamos en un archivo temporal
    try:
        escalation_file = os.path.join("tmp", f"supervisor_{client_id}_{session_id}.json")
        os.makedirs("tmp", exist_ok=True)
        
        with open(escalation_file, "w") as f:
            json.dump(escalation_event, f, indent=2)
    except Exception as e:
        print(f"Error al guardar evento de escalamiento a supervisor: {e}")
    # Emitir evento de auditoría por escalamiento
    try:
        from backend.main import emit_audit_event
        import asyncio
        evt = dict(escalation_event)
        evt.update({
            'agent_name': 'senior_agent',
            'event_type': 'escalation',
            'team_id': f"team_{client_id[:8]}",
            'importance': 'high'
        })
        asyncio.create_task(emit_audit_event(evt))
    except Exception:
        pass
    
    return {
        "success": True,
        "message": "El caso ha sido escalado al Supervisor para revisión y control de calidad.",
        "next_steps": "El Supervisor revisará el análisis detallado y proporcionará una evaluación adicional."
    }

def save_audit_finding(client_id: str, finding_type: str, description: str, severity: str, recommendation: Optional[str] = None) -> Dict[str, Any]:
    """
    Guarda un hallazgo importante de la auditoría.
    
    Args:
        client_id: ID del cliente.
        finding_type: Tipo de hallazgo.
        description: Descripción del hallazgo.
        severity: Nivel de severidad.
        recommendation: Recomendación opcional.
        
    Returns:
        Dict: Resultado del registro con confirmación.
    """
    # Crear el objeto de hallazgo
    audit_finding = {
        "timestamp": datetime.now().isoformat(),
        "client_id": client_id,
        "finding_type": finding_type,
        "description": description,
        "severity": severity,
        "recommendation": recommendation or "Pendiente de recomendación"
    }
    
    # En una implementación real, esto se guardaría en una base de datos
    # Para este ejemplo, lo guardamos en un archivo temporal
    try:
        findings_dir = os.path.join("tmp", "audit_findings")
        os.makedirs(findings_dir, exist_ok=True)
        
        finding_file = os.path.join(findings_dir, f"finding_{client_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
        with open(finding_file, "w") as f:
            json.dump(audit_finding, f, indent=2)
    except Exception as e:
        print(f"Error al guardar hallazgo de auditoría: {e}")
    # Emitir evento de hallazgo a través de WebSocket/API
    try:
        from backend.main import emit_audit_event
        import asyncio
        finding_evt = dict(audit_finding)
        finding_evt.update({
            'agent_name': 'senior_agent',
            'event_type': 'finding',
            'team_id': f"team_{client_id[:8]}",
            'importance': severity
        })
        asyncio.create_task(emit_audit_event(finding_evt))
    except Exception:
        pass
    
    return {
        "success": True,
        "message": f"Hallazgo de auditoría registrado: {finding_type} (Severidad: {severity})"
    } 