from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
import os
from backend.config import (
    DEFAULT_MANAGER_MODEL, MANAGER_AGENT_NAME,
    GEMINI_PRO_MODEL, CLAUDE_OPUS_MODEL, GPT4_MODEL
)
from backend.tools.sheet_tools import write_audit_comments
from backend.tools.tracing_tools import log_agent_action, get_action_history, get_task_timeline, summarize_agent_activities

def create_manager_agent(model_name: str = None, use_anthropic: bool = False, use_openai: bool = False):
    """Crea un agente Gerente IA que coordina todo el proceso de auditoría.
    
    Args:
        model_name: Nombre específico del modelo a utilizar (opcional).
        use_anthropic: Si se debe usar Claude de Anthropic en lugar de Gemini.
        use_openai: Si se debe usar GPT de OpenAI en lugar de Gemini.
        
    Returns:
        LlmAgent: El agente Gerente IA configurado.
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
        # Usar Claude Opus (máxima capacidad)
        model = LiteLlm(model=CLAUDE_OPUS_MODEL, stream=True)
    elif use_openai:
        # Usar GPT-4 para el manager (máxima capacidad)
        model = LiteLlm(model=GPT4_MODEL, stream=True)
    else:
        # Usar modelo Gemini Pro por defecto
        model = LiteLlm(model=GEMINI_PRO_MODEL, stream=True)
    
    # Instrucciones para el agente Gerente
    instruction = """
    Eres un Gerente IA de una firma de auditoría. Tu trabajo es supervisar todo el proceso de auditoría,
    tomar decisiones estratégicas y proporcionar conclusiones de alto nivel para la dirección.
    
    DIRECTRICES PRINCIPALES:
    
    1. Supervisión estratégica:
       - Supervisa el trabajo de todos los niveles (Asistente, Senior, Supervisor).
       - Evalúa la efectividad general del proceso de auditoría.
       - Toma decisiones finales sobre hallazgos significativos y áreas problemáticas.
       - Asegura que el plan de auditoría se haya ejecutado de manera efectiva.
    
    2. Comunicación con dirección:
       - Prepara informes ejecutivos con los hallazgos clave.
       - Formula conclusiones claras sobre la salud financiera de la entidad auditada.
       - Identifica riesgos estratégicos y recomendaciones de mejora.
       - Comunica de manera concisa y profesional, enfocándote en lo que es realmente importante.
    
    3. Toma de decisiones finales:
       - Evalúa los hallazgos de los niveles inferiores y determina su importancia relativa.
       - Decide qué asuntos requieren atención inmediata y cuáles pueden ser abordados a futuro.
       - Autoriza conclusiones y recomendaciones finales.
       - Determina si se necesitan acciones adicionales para completar la auditoría.
    
    Recuerda: eres el nivel más alto de decisión en la jerarquía de la auditoría. Tus conclusiones 
    representan la posición oficial de la firma ante el cliente. Tu enfoque debe ser estratégico y 
    centrado en los aspectos más críticos para la integridad de los estados financieros.
    """
    
    # Crear y devolver el agente
    manager_agent = LlmAgent(
        name=MANAGER_AGENT_NAME,
        model=model,
        description="Gerente IA que coordina todo el proceso de auditoría, toma decisiones estratégicas y ofrece conclusiones de alto nivel.",
        instruction=instruction,
        tools=[
            write_audit_comments,
            log_agent_action,
            get_action_history,
            get_task_timeline,
            summarize_agent_activities
        ]
    )
    
    return manager_agent 