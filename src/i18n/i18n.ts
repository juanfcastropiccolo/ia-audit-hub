
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translation resources
const resources = {
  es: {
    translation: {
      // Common
      welcome: 'Bienvenido a AUDIT-IA',
      welcome_back: '¡Bienvenido de nuevo!',
      login: 'Iniciar sesión',
      login_to_continue: 'Inicie sesión para continuar con su auditoría',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      search: 'Buscar',
      remember_me: 'Recordarme',
      forgot_password: '¿Olvidó su contraseña?',
      role_selection: 'Tipo de usuario',
      
      // Roles
      role_admin: 'Administrador',
      role_client: 'Cliente',
      
      // Status and messages
      logging_in: 'Iniciando sesión...',
      invalidCredentials: 'Credenciales inválidas',
      
      // Navigation and titles
      admin_dashboard: 'Panel de Administración',
      clients: 'Clientes',
      logs: 'Registros',
      
      // Chat related
      send: 'Enviar',
      typing_message: 'Escriba su mensaje...',
      upload_file: 'Subir archivo',
      
      // Platform info
      platform_slogan: 'Plataforma inteligente de auditoría',
      ai_audit_platform: 'AUDIT-IA: Auditoría Inteligente',
      ai_audit_description: 'Plataforma avanzada de auditoría potenciada por Agentes IA'
    }
  },
  en: {
    translation: {
      // Common
      welcome: 'Welcome to AUDIT-IA',
      welcome_back: 'Welcome back!',
      login: 'Login',
      login_to_continue: 'Login to continue with your audit',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      search: 'Search',
      remember_me: 'Remember me',
      forgot_password: 'Forgot password?',
      role_selection: 'User type',
      
      // Roles
      role_admin: 'Administrator',
      role_client: 'Client',
      
      // Status and messages
      logging_in: 'Logging in...',
      invalidCredentials: 'Invalid credentials',
      
      // Navigation and titles
      admin_dashboard: 'Admin Dashboard',
      clients: 'Clients',
      logs: 'Logs',
      
      // Chat related
      send: 'Send',
      typing_message: 'Type your message...',
      upload_file: 'Upload file',
      
      // Platform info
      platform_slogan: 'Intelligent audit platform',
      ai_audit_platform: 'AUDIT-IA: Intelligent Auditing',
      ai_audit_description: 'Advanced AI-powered auditing platform with AI Agents'
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
