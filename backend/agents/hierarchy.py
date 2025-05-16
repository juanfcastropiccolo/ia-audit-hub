from google.adk.agents import SequentialAgent
from google.adk.tools import FunctionTool  # Changed from AgentTool to FunctionTool
from .assistant_agent import create_assistant_agent
from .senior_agent import create_senior_agent
from .supervisor_agent import create_supervisor_agent
from .manager_agent import create_manager_agent

def create_audit_team(client_id: str, use_anthropic: bool = False, use_openai: bool = False):
    """Crea un equipo completo de auditoría IA con jerarquía para un cliente específico.
    
    Args:
        client_id: Identificador único del cliente.
        use_anthropic: Si se debe usar modelos de Anthropic en lugar de Gemini.
        use_openai: Si se debe usar modelos de OpenAI en lugar de Gemini.
        
    Returns:
        tuple: El agente gerente (raíz de la jerarquía) y un diccionario con todos los agentes.
    """
    assistant = create_assistant_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    senior = create_senior_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    supervisor = create_supervisor_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    manager = create_manager_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    
    # Establecer la jerarquía con el patrón de herramientas y sub_agents
    # A partir de ADK 0.2.0, es recomendable usar tanto sub_agents como FunctionTool
    
    # Configurar asistente con herramientas básicas (ya hecho en assistant_agent.py)
    
    # Configurar senior con el asistente como herramienta y sub_agente
    senior.sub_agents = [assistant]
    senior.tools.append(
        FunctionTool(
            func=assistant,
            name="assistant_agent",
            description="Asistente IA para tareas operativas básicas de auditoría"
        )
    )
    
    # Configurar supervisor con el senior como herramienta y sub_agente
    supervisor.sub_agents = [senior]
    supervisor.tools.append(
        FunctionTool(
            func=senior,
            name="senior_agent",
            description="Senior IA para análisis y revisión de tareas operativas"
        )
    )
    
    # Configurar manager con el supervisor como herramienta y sub_agente
    manager.sub_agents = [supervisor]
    manager.tools.append(
        FunctionTool(
            func=supervisor,
            name="supervisor_agent",
            description="Supervisor IA para coordinación y control de calidad"
        )
    )
    
    # Guardar todos los agentes en un diccionario para referencia fácil
    team = {
        "manager": manager,
        "supervisor": supervisor,
        "senior": senior,
        "assistant": assistant
    }
    
    return manager, team

def create_workflow_audit_team(client_id: str, use_anthropic: bool = False, use_openai: bool = False):
    """Crea un equipo de auditoría IA utilizando SequentialAgent para flujo de trabajo definido.
    
    Args:
        client_id: Identificador único del cliente.
        use_anthropic: Si se debe usar modelos de Anthropic en lugar de Gemini.
        use_openai: Si se debe usar modelos de OpenAI en lugar de Gemini.
        
    Returns:
        tuple: El agente secuencial (raíz del flujo de trabajo) y un diccionario con todos los agentes.
    """
    # Crear los agentes individuales
    assistant = create_assistant_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    senior = create_senior_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    supervisor = create_supervisor_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    manager = create_manager_agent(use_anthropic=use_anthropic, use_openai=use_openai)
    
    # Crear un flujo secuencial (primero asistente, luego senior, etc.)
    workflow = SequentialAgent(
        name=f"audit_workflow_{client_id}",
        sub_agents=[assistant, senior, supervisor, manager]
    )
    
    # Guardar todos los agentes en un diccionario para referencia fácil
    team = {
        "workflow": workflow,
        "manager": manager,
        "supervisor": supervisor,
        "senior": senior,
        "assistant": assistant
    }
    
    return workflow, team

def create_assistant_only(client_id: str, use_anthropic: bool = False, use_openai: bool = False):
    """Crea solo un agente Asistente IA para pruebas o interacciones simples.
    
    Args:
        client_id: Identificador único del cliente.
        use_anthropic: Si se debe usar modelos de Anthropic en lugar de Gemini.
        use_openai: Si se debe usar modelos de OpenAI en lugar de Gemini.
        
    Returns:
        LlmAgent: El agente Asistente IA.
    """
    return create_assistant_agent(use_anthropic=use_anthropic, use_openai=use_openai) 