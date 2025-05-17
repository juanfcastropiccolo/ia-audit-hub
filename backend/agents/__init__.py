"""
Módulos de agentes para la plataforma de Auditoría con Agentes IA Jerárquicos.

Este paquete contiene la implementación de los diferentes agentes IA que conforman
el equipo jerárquico de auditoría:

- Gerente IA (manager_agent.py)
- Supervisor IA (supervisor_agent.py)
- Senior IA (senior_agent.py)
- Asistente IA (assistant_agent.py)

También incluye funciones para crear equipos completos con diferentes configuraciones
de jerarquía (hierarchy.py).
"""

from backend.agents.assistant_agent import create_assistant_agent
from backend.agents.senior_agent import create_senior_agent
from backend.agents.supervisor_agent import create_supervisor_agent
from backend.agents.manager_agent import create_manager_agent
from backend.agents.hierarchy import (
    create_audit_team,
    create_workflow_audit_team,
    create_assistant_only
)

__all__ = [
    "create_assistant_agent",
    "create_senior_agent",
    "create_supervisor_agent",
    "create_manager_agent",
    "create_audit_team",
    "create_workflow_audit_team",
    "create_assistant_only"
] 