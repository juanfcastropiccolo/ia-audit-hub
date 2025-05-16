from google.adk.tools.tool_context import ToolContext
from typing import Dict, List, Any, Optional
import re

# En un entorno real, estas herramientas usarían la API de Google Sheets
# Para este ejemplo, simulamos el comportamiento con datos de muestra

def get_sheet_data(
    sheet_url: str,
    range: str = "",
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """Obtiene datos de una hoja de cálculo de Google Sheets.
    
    Args:
        sheet_url: URL de la hoja de Google Sheets.
        range: Rango de celdas a obtener (ejemplo: "A1:D10").
        tool_context: Contexto de la herramienta.
        
    Returns:
        dict: Status y datos de la hoja de cálculo.
    """
    # Validar URL de Google Sheets
    if not re.match(r'https://docs\.google\.com/spreadsheets/d/.*', sheet_url):
        return {
            "status": "error",
            "error_message": "URL de Google Sheets no válida."
        }
    
    # En un entorno real, usaríamos la API de Google Sheets para obtener datos
    # Simulación de datos para demostración:
    
    # Extraer ID del documento del URL
    try:
        sheet_id = re.search(r'/d/([a-zA-Z0-9-_]+)', sheet_url).group(1)
    except:
        return {
            "status": "error",
            "error_message": "No se pudo extraer el ID del documento del URL."
        }
    
    # Log de la operación para trazabilidad
    if tool_context:
        client_id = tool_context.state.get("client_id", "unknown")
        tool_context.state["sheet_access_log"] = tool_context.state.get("sheet_access_log", [])
        tool_context.state["sheet_access_log"].append({
            "timestamp": tool_context.state.get("current_timestamp", 0),
            "operation": "read",
            "sheet_id": sheet_id,
            "range": range,
            "client_id": client_id
        })
        
        # Guardar la URL para referencia futura
        tool_context.state["current_sheet_url"] = sheet_url
    
    # Datos de muestra para demostración (Balance General)
    mock_data = {
        "header": ["Cuenta", "Debe", "Haber", "Saldo"],
        "rows": [
            ["1000 - Caja", "10000.00", "2000.00", "8000.00"],
            ["1100 - Bancos", "15000.00", "5000.00", "10000.00"],
            ["1200 - Cuentas por Cobrar", "8000.00", "3000.00", "5000.00"],
            ["1300 - Inventario", "12000.00", "0.00", "12000.00"],
            ["2000 - Cuentas por Pagar", "0.00", "7000.00", "-7000.00"],
            ["2100 - Préstamos", "0.00", "20000.00", "-20000.00"],
            ["3000 - Capital", "0.00", "8000.00", "-8000.00"],
            ["Total", "45000.00", "45000.00", "0.00"]
        ]
    }
    
    return {
        "status": "success",
        "sheet_id": sheet_id,
        "data": mock_data
    }

def verify_sheet_totals(
    sheet_url: str,
    column_indices: List[int],
    expected_total_row_index: int = -1,
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """Verifica que los totales de las columnas coincidan con la fila de totales.
    
    Args:
        sheet_url: URL de la hoja de Google Sheets.
        column_indices: Índices de las columnas a verificar (0 para la primera columna).
        expected_total_row_index: Índice de la fila donde se esperan los totales (-1 para la última fila).
        tool_context: Contexto de la herramienta.
        
    Returns:
        dict: Status y resultados de la verificación.
    """
    # Primero obtenemos los datos
    sheet_result = get_sheet_data(sheet_url, "", tool_context)
    
    if sheet_result["status"] != "success":
        return sheet_result
        
    # Log de la operación para trazabilidad
    if tool_context:
        client_id = tool_context.state.get("client_id", "unknown")
        tool_context.state["verification_log"] = tool_context.state.get("verification_log", [])
        tool_context.state["verification_log"].append({
            "timestamp": tool_context.state.get("current_timestamp", 0),
            "operation": "verify_totals",
            "sheet_id": sheet_result["sheet_id"],
            "columns": column_indices,
            "client_id": client_id
        })
    
    data = sheet_result["data"]
    rows = data["rows"]
    
    # Ajustar el índice de la fila de totales si es -1 (última fila)
    if expected_total_row_index == -1:
        expected_total_row_index = len(rows) - 1
    
    results = {}
    
    for col_idx in column_indices:
        if col_idx >= len(rows[0]):
            results[col_idx] = {
                "status": "error",
                "error_message": f"El índice de columna {col_idx} está fuera de rango."
            }
            continue
            
        # Calcular el total sumando todas las filas excepto la de totales
        calculated_total = 0.0
        for i, row in enumerate(rows):
            if i != expected_total_row_index:
                try:
                    # Convertir a float para la suma
                    value = float(row[col_idx])
                    calculated_total += value
                except ValueError:
                    # Omitir celdas que no son numéricas
                    pass
                    
        # Obtener el total esperado de la fila de totales
        try:
            expected_total = float(rows[expected_total_row_index][col_idx])
        except ValueError:
            results[col_idx] = {
                "status": "error",
                "error_message": f"El valor total esperado no es numérico: {rows[expected_total_row_index][col_idx]}"
            }
            continue
            
        # Comparar con una pequeña tolerancia para errores de redondeo
        tolerance = 0.01
        if abs(calculated_total - expected_total) < tolerance:
            results[col_idx] = {
                "status": "success",
                "calculated_total": calculated_total,
                "expected_total": expected_total,
                "verified": True
            }
        else:
            results[col_idx] = {
                "status": "discrepancy",
                "calculated_total": calculated_total,
                "expected_total": expected_total,
                "difference": calculated_total - expected_total,
                "verified": False
            }
    
    # Determinar si todas las columnas verificaron correctamente
    all_verified = all(result.get("verified", False) for result in results.values())
    
    return {
        "status": "success",
        "column_results": results,
        "all_verified": all_verified
    }

def verify_balance_equation(
    sheet_url: str,
    assets_total_cell: str,
    liabilities_total_cell: str,
    equity_total_cell: str,
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """Verifica la ecuación contable: Activo = Pasivo + Patrimonio.
    
    Args:
        sheet_url: URL de la hoja de Google Sheets.
        assets_total_cell: Referencia de celda con el total de activos (ejemplo: "B10").
        liabilities_total_cell: Referencia de celda con el total de pasivos.
        equity_total_cell: Referencia de celda con el total de patrimonio.
        tool_context: Contexto de la herramienta.
        
    Returns:
        dict: Status y resultados de la verificación.
    """
    # En un entorno real, obtendríamos los valores directamente de las celdas
    # Para este ejemplo, usamos valores fijos para demostración
    
    # Log de la operación para trazabilidad
    if tool_context:
        client_id = tool_context.state.get("client_id", "unknown")
        tool_context.state["equation_check_log"] = tool_context.state.get("equation_check_log", [])
        tool_context.state["equation_check_log"].append({
            "timestamp": tool_context.state.get("current_timestamp", 0),
            "operation": "verify_balance_equation",
            "sheet_url": sheet_url,
            "client_id": client_id
        })
    
    # Valores de muestra para demostración
    assets_total = 35000.00
    liabilities_total = 27000.00
    equity_total = 8000.00
    
    # Verificar la ecuación contable
    right_side = liabilities_total + equity_total
    equation_balanced = abs(assets_total - right_side) < 0.01
    
    return {
        "status": "success",
        "assets_total": assets_total,
        "liabilities_total": liabilities_total,
        "equity_total": equity_total,
        "right_side_total": right_side,
        "difference": assets_total - right_side,
        "equation_balanced": equation_balanced
    }

def write_audit_comments(
    sheet_url: str,
    comments: Dict[str, str],
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """Escribe comentarios de auditoría en celdas específicas de la hoja de cálculo.
    
    Args:
        sheet_url: URL de la hoja de Google Sheets.
        comments: Diccionario con referencias de celdas como claves y comentarios como valores.
        tool_context: Contexto de la herramienta.
        
    Returns:
        dict: Status y resultados de la operación.
    """
    # Validar URL de Google Sheets
    if not re.match(r'https://docs\.google\.com/spreadsheets/d/.*', sheet_url):
        return {
            "status": "error",
            "error_message": "URL de Google Sheets no válida."
        }
    
    # Extraer ID del documento del URL
    try:
        sheet_id = re.search(r'/d/([a-zA-Z0-9-_]+)', sheet_url).group(1)
    except:
        return {
            "status": "error",
            "error_message": "No se pudo extraer el ID del documento del URL."
        }
    
    # Log de la operación para trazabilidad
    if tool_context:
        client_id = tool_context.state.get("client_id", "unknown")
        author = tool_context.agent_name
        tool_context.state["comment_log"] = tool_context.state.get("comment_log", [])
        
        for cell, comment in comments.items():
            tool_context.state["comment_log"].append({
                "timestamp": tool_context.state.get("current_timestamp", 0),
                "operation": "write_comment",
                "sheet_id": sheet_id,
                "cell": cell,
                "comment": comment,
                "author": author,
                "client_id": client_id
            })
    
    # En un entorno real, escribiríamos realmente los comentarios
    # Para la demostración, simplemente devolvemos éxito
    
    return {
        "status": "success",
        "sheet_id": sheet_id,
        "comments_written": len(comments),
        "cells_updated": list(comments.keys())
    } 