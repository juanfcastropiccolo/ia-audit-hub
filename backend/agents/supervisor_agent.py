from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
import os
from backend.config import (
    DEFAULT_SUPERVISOR_MODEL, SUPERVISOR_AGENT_NAME,
    GEMINI_PRO_MODEL, CLAUDE_OPUS_MODEL, GPT4_MODEL
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
    # Verificar que las llaves API necesarias están disponibles
    if use_anthropic and not os.getenv("ANTHROPIC_API_KEY"):
        print("ADVERTENCIA: ANTHROPIC_API_KEY no encontrada. Usando modelo Gemini por defecto.")
        use_anthropic = False
    
    if use_openai and not os.getenv("OPENAI_API_KEY"):
        print("ADVERTENCIA: OPENAI_API_KEY no encontrada. Usando modelo Gemini por defecto.")
        use_openai = False
    
    # Definir el modelo a utilizar según las preferencias
    if model_name:
        # Si se proporciona un nombre específico de modelo, usarlo directamente
        model = LiteLlm(model=model_name, stream=True)
    elif use_anthropic:
        # Usar Claude Opus (alta capacidad)
        model = LiteLlm(model=CLAUDE_OPUS_MODEL, stream=True)
    elif use_openai:
        # Usar GPT-4 para el supervisor (alta capacidad)
        model = LiteLlm(model=GPT4_MODEL, stream=True)
    else:
        # Usar modelo Gemini Pro por defecto
        model = LiteLlm(model=GEMINI_PRO_MODEL, stream=True)
    
    # Instrucciones para el agente Supervisor
    instruction = """
    Eres un Supervisor IA de una firma de auditoría. Tu trabajo es supervisar a los Senior IA,
    evaluar la calidad global de las auditorías y coordinar el trabajo entre diferentes áreas.
    
    DIRECTRICES PRINCIPALES:
    
    1. Supervisión de calidad:
       - Revisa el trabajo de los Senior IA para asegurar la calidad y consistencia.
       - Verifica que se han seguido las metodologías de auditoría estándar.
       - Evalúa si los análisis son suficientemente profundos y completos.
       - Identifica áreas donde se necesita trabajo adicional.
    
    2. Coordinación de equipos:
       - Coordina el trabajo entre diferentes áreas de la auditoría.
       - Asegura que todos los aspectos clave de la auditoría estén cubiertos.
       - Identifica posibles redundancias o lagunas en el proceso.
       - Facilita la comunicación entre diferentes niveles de análisis.
    
    3. Delegación a nivel superior:
       - Para asuntos críticos, hallazgos significativos o decisiones estratégicas,
         eleva el caso al Gerente IA, indicando "Este asunto requiere atención del Gerente IA 
         por [razón específica]".
       - Cuando identifiques problemas que puedan afectar materialmente a los estados financieros
         o requieran cambios en el enfoque de la auditoría, indica "Esto debe ser evaluado por
         el Gerente IA".
    
    Recuerda: tu función es supervisar la calidad general de la auditoría y coordinar el trabajo
    entre diferentes áreas. Debes determinar qué asuntos son suficientemente importantes para
    ser escalados al nivel de gerencia.
    """
    
    # Crear y devolver el agente
    supervisor_agent = LlmAgent(
        name=SUPERVISOR_AGENT_NAME,
        model=model,
        description="Supervisor IA que coordina a los Senior IA, evalúa la calidad global de las auditorías y asegura el cumplimiento metodológico.",
        instruction=instruction,
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