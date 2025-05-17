# backend/utils/supabase_session_service.py
"""
Servicio de sesión persistente basado en Supabase/PostgreSQL.

Pre-requisitos
--------------
pip install supabase-py
Añade en tu .env (o config.py):

SUPABASE_URL         = "https://xxxx.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOi..."        # ⬅ clave de servicio, *no* anon key
SUPABASE_SCHEMA      = "public"               # opcional
"""

from google.adk.sessions import InMemorySessionService, Session
from typing import Optional, Dict, Any, List
from supabase import create_client
import time

from backend.config import SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_SCHEMA  # ajusta a tu módulo

# Nombre de la tabla (debe existir en la BD)
_DEFAULT_TABLE = "sessions"


class SupabaseSessionService(InMemorySessionService):
    """Servicio de sesión que persiste el estado en una tabla de Supabase."""

    def __init__(self, table: str = _DEFAULT_TABLE):
        super().__init__()
        self.table = table
        # Conexión “singleton” para todo el proceso
        self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY, schema=SUPABASE_SCHEMA)

    # ──────────────────────────── CRUD público ────────────────────────────

    def create_session(
        self,
        app_name: str,
        user_id: str,
        session_id: str,
        state: Optional[Dict[str, Any]] = None,
    ) -> Session:
        """Crea o recupera una sesión existente."""
        existing = self.get_session(app_name, user_id, session_id)
        if existing:
            return existing

        session = Session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
            state=state or {},
        )
        self._save_session(session)
        return session

    def get_session(self, app_name: str, user_id: str, session_id: str) -> Optional[Session]:
        """Obtiene una sesión, o None si no existe."""
        result = (
            self.supabase.table(self.table)
            .select("*")
            .eq("app_name", app_name)
            .eq("user_id", user_id)
            .eq("session_id", session_id)
            .limit(1)
            .execute()
        )
        if result.data:
            row = result.data[0]
            return Session(
                app_name=row["app_name"],
                user_id=row["user_id"],
                session_id=row["session_id"],
                state=row.get("state", {}),
                last_update_time=row.get("last_update_time", 0),
            )
        return None

    def update_session(self, session: Session) -> None:
        """Actualiza el estado de la sesión."""
        self._save_session(session)

    def delete_session(self, app_name: str, user_id: str, session_id: str) -> None:
        """Elimina una sesión."""
        (
            self.supabase.table(self.table)
            .delete()
            .eq("app_name", app_name)
            .eq("user_id", user_id)
            .eq("session_id", session_id)
            .execute()
        )

    # ────────────────────────── utilidades internas ─────────────────────────

    def _save_session(self, session: Session) -> None:
        """Hace UPSERT (insert/update) de la sesión."""
        payload = {
            "app_name": session.app_name,
            "user_id": session.user_id,
            "session_id": session.session_id,
            "state": session.state,
            "last_update_time": time.time(),
        }
        # on_conflict => columnas que definen unicidad
        (
            self.supabase.table(self.table)
            .upsert(payload, on_conflict="app_name,user_id,session_id")
            .execute()
        )

    # ───────────────────────────── listados ────────────────────────────────

    def list_sessions_for_user(self, app_name: str, user_id: str) -> List[Dict[str, Any]]:
        """Listado de todas las sesiones de un usuario."""
        result = (
            self.supabase.table(self.table).select("*").eq("app_name", app_name).eq("user_id", user_id).execute()
        )
        return result.data or []

    def list_all_sessions(self) -> List[Dict[str, Any]]:
        """Listado de todas las sesiones (uso interno/admin)."""
        result = self.supabase.table(self.table).select("*").execute()
        return result.data or []

    # ──────────────────────────── representación ───────────────────────────

    def __repr__(self) -> str:  # pragma: no cover
        return f"<SupabaseSessionService table={self.table!r}>"
