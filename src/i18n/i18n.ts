
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translation resources
const resources = {
  es: {
    translation: {
      // Common
      welcome: 'Bienvenido a AUDIT-IA',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      search: 'Buscar',
      
      // Roles
      role_admin: 'Administrador',
      role_client: 'Cliente',
      
      // Status and messages
      logging_in: 'Iniciando sesión...',
      invalidCredentials: 'Credenciales inválidas',
      demo_credentials: 'Credenciales de demostración:',
      
      // Navigation and titles
      admin_dashboard: 'Panel de Administración',
      clients: 'Clientes',
      logs: 'Registros',
      
      // Chat related
      send: 'Enviar',
      typing_message: 'Escriba su mensaje...',
      upload_file: 'Subir archivo',
      
      // Platform info
      platform_slogan: 'Plataforma inteligente de auditoría'
    }
  },
  en: {
    translation: {
      // Common
      welcome: 'Welcome to AUDIT-IA',
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      search: 'Search',
      
      // Roles
      role_admin: 'Administrator',
      role_client: 'Client',
      
      // Status and messages
      logging_in: 'Logging in...',
      invalidCredentials: 'Invalid credentials',
      demo_credentials: 'Demo credentials:',
      
      // Navigation and titles
      admin_dashboard: 'Admin Dashboard',
      clients: 'Clients',
      logs: 'Logs',
      
      // Chat related
      send: 'Send',
      typing_message: 'Type your message...',
      upload_file: 'Upload file',
      
      // Platform info
      platform_slogan: 'Intelligent audit platform'
    }
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
