"""
Plataforma de Auditoría con Agentes IA Jerárquicos.

Este paquete implementa un sistema multi-agente jerárquico que emula la estructura
de una firma de auditoría tradicional con cuatro niveles de agentes:

1. Gerente IA: Nivel superior que coordina todo el proceso y toma decisiones estratégicas
2. Supervisor IA: Supervisa a los Senior IA y evalúa la calidad global
3. Senior IA: Revisa el trabajo de los Asistentes IA y añade análisis intermedio
4. Asistente IA: Interactúa con clientes y realiza tareas operativas básicas

El sistema permite verificar balances financieros mediante "footing" (comprobación de sumas)
con múltiples capas de revisión, emulando el proceso de una firma de auditoría real pero con IA.
"""

__version__ = "0.1.0"

# Funciones principales
from backend.main import main
from backend.agents.hierarchy import (
    create_audit_team, 
    create_workflow_audit_team,
    create_assistant_only
)
from backend.agents.assistant_agent import create_assistant_agent
from backend.agents.senior_agent import create_senior_agent
from backend.agents.supervisor_agent import create_supervisor_agent
from backend.agents.manager_agent import create_manager_agent

# Exportar funciones principales
__all__ = [
    "main",
    "create_audit_team",
    "create_workflow_audit_team",
    "create_assistant_only",
    "create_assistant_agent",
    "create_senior_agent",
    "create_supervisor_agent",
    "create_manager_agent"
] 