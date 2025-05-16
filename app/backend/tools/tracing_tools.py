from google.adk.tools.tool_context import ToolContext
from typing import Dict, Any, Optional, List
import time
import json
import os
from auditoria_ia.config import TRACE_LOG_FILE, ENABLE_TRACING

def log_agent_action(
    action_type: str,
    details: Dict[str, Any],
    importance: str = "normal",
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """Registra una acción del agente en el sistema de trazabilidad.
    
    Args:
        action_type: Tipo de acción (por ejemplo: "decision", "calculation", "verification").
        details: Detalles específicos de la acción.
        importance: Nivel de importancia ("low", "normal", "high", "critical").
        tool_context: Contexto de la herramienta.
        
    Returns:
        dict: Status y detalles del registro creado.
    """
    if not tool_context:
        return {
            "status": "error",
            "error_message": "El contexto de la herramienta es obligatorio para el registro de trazabilidad."
        }
    
    timestamp = time.time()
    agent_name = tool_context.agent_name
    client_id = tool_context.state.get("client_id", "unknown")
    session_id = tool_context.state.get("session_id", "unknown")
    task_id = tool_context.state.get("current_task_id", "unknown")
    
    # Crear entrada de registro
    trace_entry = {
        "timestamp": timestamp,
        "agent": agent_name,
        "client_id": client_id,
        "session_id": session_id,
        "task_id": task_id,
        "action_type": action_type,
        "importance": importance,
        "details": details
    }
    
    # Almacenar en el estado para acceso en memoria
    trace_log = tool_context.state.get("trace_log", [])
    trace_log.append(trace_entry)
    tool_context.state["trace_log"] = trace_log
    
    # Si estamos registrando en archivo
    if ENABLE_TRACING:
        try:
            with open(TRACE_LOG_FILE, 'a') as log_file:
                log_file.write(json.dumps(trace_entry) + '\n')
        except Exception as e:
            return {
                "status": "warning",
                "message": "Registro en memoria completado, pero falló el registro en archivo",
                "error": str(e),
                "trace_entry_id": len(trace_log) - 1
            }
    
    return {
        "status": "success",
        "trace_entry_id": len(trace_log) - 1,
        "timestamp": timestamp
    }

def get_action_history(
    agent_filter: Optional[str] = None,
    action_type_filter: Optional[str] = None,
    importance_filter: Optional[str] = None,
    limit: int = 10,
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """Recupera el historial de acciones del sistema de trazabilidad.
    
    Args:
        agent_filter: Filtrar por nombre de agente.
        action_type_filter: Filtrar por tipo de acción.
        importance_filter: Filtrar por nivel de importancia.
        limit: Número máximo de entradas a devolver.
        tool_context: Contexto de la herramienta.
        
    Returns:
        dict: Status e historial de acciones.
    """
    if not tool_context:
        return {
            "status": "error",
            "error_message": "El contexto de la herramienta es obligatorio para consultar la trazabilidad."
        }
    
    # Obtener el registro de trazabilidad del estado
    trace_log = tool_context.state.get("trace_log", [])
    
    # Aplicar filtros
    filtered_log = trace_log.copy()
    
    if agent_filter:
        filtered_log = [entry for entry in filtered_log if entry["agent"] == agent_filter]
        
    if action_type_filter:
        filtered_log = [entry for entry in filtered_log if entry["action_type"] == action_type_filter]
        
    if importance_filter:
        filtered_log = [entry for entry in filtered_log if entry["importance"] == importance_filter]
    
    # Ordenar por timestamp (más reciente primero)
    filtered_log.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Limitar número de resultados
    limited_log = filtered_log[:limit]
    
    return {
        "status": "success",
        "total_entries": len(filtered_log),
        "returned_entries": len(limited_log),
        "history": limited_log
    }

def get_task_timeline(
    task_id: str,
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """Recupera la línea de tiempo completa de un task específico.
    
    Args:
        task_id: Identificador del task a consultar.
        tool_context: Contexto de la herramienta.
        
    Returns:
        dict: Status y línea de tiempo del task.
    """
    if not tool_context:
        return {
            "status": "error",
            "error_message": "El contexto de la herramienta es obligatorio para consultar la trazabilidad."
        }
    
    # Obtener el registro de trazabilidad del estado
    trace_log = tool_context.state.get("trace_log", [])
    
    # Filtrar para el task específico
    task_log = [entry for entry in trace_log if entry.get("task_id") == task_id]
    
    # Si no hay entradas para este task
    if not task_log:
        return {
            "status": "not_found",
            "message": f"No se encontraron registros para el task ID: {task_id}"
        }
    
    # Ordenar por timestamp (cronológicamente)
    task_log.sort(key=lambda x: x["timestamp"])
    
    # Organizar por agente para facilitar el seguimiento
    timeline_by_agent = {}
    for entry in task_log:
        agent = entry["agent"]
        if agent not in timeline_by_agent:
            timeline_by_agent[agent] = []
        timeline_by_agent[agent].append(entry)
    
    # Obtener metadatos del task
    task_start = task_log[0]["timestamp"] if task_log else None
    task_end = task_log[-1]["timestamp"] if task_log else None
    duration = task_end - task_start if (task_start and task_end) else None
    
    return {
        "status": "success",
        "task_id": task_id,
        "timeline": task_log,
        "timeline_by_agent": timeline_by_agent,
        "metadata": {
            "start_time": task_start,
            "end_time": task_end,
            "duration_seconds": duration,
            "total_actions": len(task_log),
            "agents_involved": list(timeline_by_agent.keys())
        }
    }

def summarize_agent_activities(
    time_period: str = "today",  # "today", "week", "month", "all"
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """Genera un resumen de las actividades de todos los agentes en un período.
    
    Args:
        time_period: Período de tiempo a resumir.
        tool_context: Contexto de la herramienta.
        
    Returns:
        dict: Status y resumen de actividades.
    """
    if not tool_context:
        return {
            "status": "error",
            "error_message": "El contexto de la herramienta es obligatorio para generar resúmenes."
        }
    
    # Obtener el registro de trazabilidad del estado
    trace_log = tool_context.state.get("trace_log", [])
    
    # Definir el punto de inicio según el período
    now = time.time()
    start_time = 0
    
    if time_period == "today":
        # Inicio del día actual (00:00:00)
        import datetime
        today = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        start_time = today.timestamp()
    elif time_period == "week":
        # Hace 7 días
        start_time = now - (7 * 24 * 60 * 60)
    elif time_period == "month":
        # Hace 30 días
        start_time = now - (30 * 24 * 60 * 60)
    # Para "all" dejamos start_time en 0
    
    # Filtrar por período de tiempo
    period_log = [entry for entry in trace_log if entry["timestamp"] >= start_time]
    
    # Recopilar estadísticas
    agent_stats = {}
    action_type_counts = {}
    importance_counts = {"low": 0, "normal": 0, "high": 0, "critical": 0}
    unique_clients = set()
    unique_tasks = set()
    
    for entry in period_log:
        # Estadísticas por agente
        agent = entry["agent"]
        if agent not in agent_stats:
            agent_stats[agent] = {
                "total_actions": 0,
                "action_types": {},
                "importance_counts": {"low": 0, "normal": 0, "high": 0, "critical": 0}
            }
        
        agent_stats[agent]["total_actions"] += 1
        
        # Conteo por tipo de acción
        action_type = entry["action_type"]
        if action_type not in agent_stats[agent]["action_types"]:
            agent_stats[agent]["action_types"][action_type] = 0
        agent_stats[agent]["action_types"][action_type] += 1
        
        if action_type not in action_type_counts:
            action_type_counts[action_type] = 0
        action_type_counts[action_type] += 1
        
        # Conteo por importancia
        importance = entry.get("importance", "normal")
        agent_stats[agent]["importance_counts"][importance] += 1
        importance_counts[importance] += 1
        
        # Clientes y tasks únicos
        unique_clients.add(entry.get("client_id", "unknown"))
        unique_tasks.add(entry.get("task_id", "unknown"))
    
    # Calcular el agente más activo
    most_active_agent = max(agent_stats.items(), key=lambda x: x[1]["total_actions"], default=(None, {"total_actions": 0}))
    
    return {
        "status": "success",
        "time_period": time_period,
        "total_actions": len(period_log),
        "unique_clients": len(unique_clients),
        "unique_tasks": len(unique_tasks),
        "action_type_distribution": action_type_counts,
        "importance_distribution": importance_counts,
        "agent_stats": agent_stats,
        "most_active_agent": most_active_agent[0] if most_active_agent[0] else None
    } 