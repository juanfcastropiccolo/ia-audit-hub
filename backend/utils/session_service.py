from google.adk.sessions import InMemorySessionService, Session
from typing import Optional, Dict, Any
import pymongo
import time
from backend.config import MONGODB_CONNECTION_STRING, MONGODB_DATABASE

class MongoDBSessionService(InMemorySessionService):
    """Servicio de sesión que utiliza MongoDB para almacenar estados de forma persistente."""
    
    def __init__(self, collection_name: str = "sessions"):
        """Inicializar con conexión a MongoDB."""
        super().__init__()
        self.client = pymongo.MongoClient(MONGODB_CONNECTION_STRING)
        self.db = self.client[MONGODB_DATABASE]
        self.collection = self.db[collection_name]
        
    def create_session(
        self, app_name: str, user_id: str, session_id: str, state: Optional[Dict[str, Any]] = None
    ) -> Session:
        """Crear una nueva sesión o recuperar una existente."""
        # Buscar sesión existente
        session_doc = self.collection.find_one({
            "app_name": app_name,
            "user_id": user_id,
            "session_id": session_id
        })
        
        if session_doc:
            # La sesión existe, recuperarla
            return Session(
                app_name=session_doc["app_name"],
                user_id=session_doc["user_id"],
                session_id=session_doc["session_id"],
                state=session_doc.get("state", {}),
                last_update_time=session_doc.get("last_update_time", 0)
            )
        
        # Crear nueva sesión
        session = Session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
            state=state or {}
        )
        self._save_session(session)
        return session
            
    def get_session(
        self, app_name: str, user_id: str, session_id: str
    ) -> Optional[Session]:
        """Obtener una sesión existente."""
        session_doc = self.collection.find_one({
            "app_name": app_name,
            "user_id": user_id,
            "session_id": session_id
        })
        
        if not session_doc:
            return None
            
        return Session(
            app_name=session_doc["app_name"],
            user_id=session_doc["user_id"],
            session_id=session_doc["session_id"],
            state=session_doc.get("state", {}),
            last_update_time=session_doc.get("last_update_time", 0)
        )
        
    def update_session(self, session: Session) -> None:
        """Actualizar una sesión en la base de datos."""
        self._save_session(session)
        
    def delete_session(self, app_name: str, user_id: str, session_id: str) -> None:
        """Eliminar una sesión."""
        self.collection.delete_one({
            "app_name": app_name,
            "user_id": user_id,
            "session_id": session_id
        })
        
    def _save_session(self, session: Session) -> None:
        """Guardar una sesión en MongoDB."""
        self.collection.update_one(
            {
                "app_name": session.app_name,
                "user_id": session.user_id,
                "session_id": session.session_id
            },
            {
                "$set": {
                    "state": session.state,
                    "last_update_time": time.time()
                }
            },
            upsert=True
        )
        
    def list_sessions_for_user(self, app_name: str, user_id: str) -> list:
        """Listar todas las sesiones de un usuario."""
        return list(self.collection.find({"app_name": app_name, "user_id": user_id}))
    
    def list_all_sessions(self) -> list:
        """Listar todas las sesiones."""
        return list(self.collection.find()) 