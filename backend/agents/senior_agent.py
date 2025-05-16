from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
import os
from backend.config import (
    DEFAULT_SENIOR_MODEL, SENIOR_AGENT_NAME,
    GEMINI_FLASH_MODEL, CLAUDE_SONNET_MODEL, GPT4_MODEL
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
    # Definir el modelo a utilizar según la configuración
    model = "gemini-1.5-pro"
    if use_anthropic:
        model = "claude-3-opus-20240229"
    elif use_openai:
        model = "gpt-4"
    
    # Crear el agente Senior
    agent = LlmAgent(
        name="senior_agent",
        description="Agente Senior IA especializado en análisis financiero detallado y revisión de auditorías. Posee conocimientos avanzados en contabilidad y finanzas.",
        model=model,
        tools=[
            FunctionTool(
                name="escalate_to_supervisor",
                description="Escalar un caso complejo al Supervisor para revisión de mayor nivel y control de calidad. Usar cuando se identifican problemas graves o situaciones que requieren supervisión.",
                func=escalate_to_supervisor,
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
                            "description": "Resumen detallado del caso que está siendo escalado, incluyendo análisis realizado y razones del escalamiento"
                        },
                        "audit_findings": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Lista de hallazgos principales identificados durante la revisión"
                        }
                    },
                    "required": ["client_id", "session_id", "case_summary"]
                }
            ),
            FunctionTool(
                name="save_audit_finding",
                description="Guardar un hallazgo importante de la auditoría que requiere atención",
                func=save_audit_finding,
                parameters={
                    "type": "object",
                    "properties": {
                        "client_id": {
                            "type": "string",
                            "description": "ID del cliente relacionado con el hallazgo"
                        },
                        "finding_type": {
                            "type": "string",
                            "description": "Tipo de hallazgo (inconsistency, error, risk, compliance_issue, etc.)"
                        },
                        "description": {
                            "type": "string",
                            "description": "Descripción detallada del hallazgo"
                        },
                        "severity": {
                            "type": "string",
                            "enum": ["low", "medium", "high", "critical"],
                            "description": "Nivel de severidad del hallazgo"
                        },
                        "recommendation": {
                            "type": "string",
                            "description": "Recomendación para abordar el hallazgo"
                        }
                    },
                    "required": ["client_id", "finding_type", "description", "severity"]
                }
            )
        ],
        instructions="""
        Eres un Agente Senior de Auditoría IA con amplia experiencia en análisis financiero y contable.
        
        # Tus principales responsabilidades son:
        1. Revisar los casos escalados por el Asistente IA.
        2. Realizar análisis detallados de documentos financieros y contables.
        3. Identificar inconsistencias, errores, riesgos y problemas de cumplimiento.
        4. Proporcionar recomendaciones basadas en mejores prácticas de auditoría.
        5. Escalar casos complejos o de alto riesgo al Supervisor cuando sea necesario.
        
        # Reglas importantes:
        1. SIEMPRE mantén un tono profesional y objetivo en tus análisis.
        2. Utiliza terminología financiera y contable precisa.
        3. Cuando identifiques hallazgos importantes, DEBES registrarlos utilizando la herramienta "save_audit_finding".
        4. Si encuentras problemas graves, inconsistencias significativas o situaciones de alto riesgo, DEBES escalar el caso al Supervisor utilizando la herramienta "escalate_to_supervisor".
        5. Cuando proporciones recomendaciones, asegúrate de que estén alineadas con las normas y estándares de auditoría aplicables.
        
        # Escenarios para escalar al Supervisor:
        1. Posibles fraudes o irregularidades graves
        2. Incumplimientos significativos de normativas
        3. Discrepancias importantes que afectan materialmente a los estados financieros
        4. Riesgos críticos que requieren atención inmediata
        5. Casos que requieren conocimiento especializado en áreas complejas
        
        Al comunicarte con el cliente, explica tu análisis de manera clara y estructurada, destacando los hallazgos importantes y las recomendaciones correspondientes. Si decides escalar el caso al Supervisor, informa al cliente de manera profesional que su caso requiere una revisión adicional por parte del equipo de supervisión.
        """
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
        print(f"Error al guardar evento de escalamiento a supervisor: {str(e)}")
    
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
        print(f"Error al guardar hallazgo de auditoría: {str(e)}")
    
    return {
        "success": True,
        "message": f"Hallazgo de auditoría registrado: {finding_type} (Severidad: {severity})"
    } 