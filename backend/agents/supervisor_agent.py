from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
import os
from backend.config import (
    DEFAULT_SUPERVISOR_MODEL, SUPERVISOR_AGENT_NAME,
    GPT4_MODEL, CLAUDE_OPUS_MODEL
)
from backend.tools.sheet_tools import get_sheet_data, verify_balance_equation, write_audit_comments
from backend.tools.tracing_tools import log_agent_action, get_action_history, get_task_timeline, summarize_agent_activities

def create_supervisor_agent(model_name: str = None, use_anthropic: bool = False, use_openai: bool = False):
    """Crea un agente Supervisor IA que coordina y supervisa a los Senior IA.
    
    Args:
        model_name: Nombre específico del modelo a utilizar (opcional).
        use_anthropic: Si se debe usar Claude de Anthropic en lugar de Gemini.
        use_openai: Si se debe usar GPT de OpenAI en lugar de Gemini.
        
    Returns:
        LlmAgent: El agente Supervisor IA configurado.
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
        model = LiteLlm(model=GPT4_MODEL, stream=True)
    elif use_anthropic:
        model = LiteLlm(model=CLAUDE_OPUS_MODEL, stream=True)
    else:
        model = DEFAULT_SUPERVISOR_MODEL
    
    
    # Crear y devolver el agente
    supervisor_agent = LlmAgent(
        name=SUPERVISOR_AGENT_NAME,
        model=model,
        description="Supervisor IA que coordina a los Senior IA, evalúa la calidad global de las auditorías y asegura el cumplimiento metodológico.",
        tools=[
            get_sheet_data,
            verify_balance_equation,
            write_audit_comments,
            log_agent_action,
            get_action_history,
            get_task_timeline,
            summarize_agent_activities
        ]
    )
    
    return supervisor_agent 