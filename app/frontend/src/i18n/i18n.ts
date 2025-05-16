
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Recursos de traducción
const resources = {
  es: {
    translation: {
      // Traducciones generales
      "welcome": "Bienvenido a AUDIT-IA",
      "login": "Iniciar sesión",
      "logout": "Cerrar sesión",
      "dashboard": "Panel de control",
      "clients": "Clientes",
      "logs": "Registros",
      "settings": "Configuración",
      
      // Mensajes de error
      "error.general": "Ha ocurrido un error",
      "error.login": "Error al iniciar sesión. Compruebe sus credenciales.",
      "error.notFound": "Página no encontrada",
      
      // Botones y acciones
      "button.submit": "Enviar",
      "button.cancel": "Cancelar",
      "button.save": "Guardar",
      "button.delete": "Eliminar",
      
      // Mensajes de auditoría
      "audit.inProgress": "Auditoría en progreso",
      "audit.completed": "Auditoría completada",
      "audit.pending": "Auditoría pendiente",
      "audit.review": "En revisión"
    }
  }
};

// Inicializar i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Idioma predeterminado
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // No es necesario escapar valores en React
    },
  });

export default i18n;
