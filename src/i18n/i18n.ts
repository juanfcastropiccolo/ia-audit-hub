
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Recursos de traducción
const resources = {
  es: {
    translation: {
      // Textos generales
      welcome: 'Bienvenido a Auditoría IA',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      
      // Mensajes de error
      required: 'Este campo es obligatorio',
      invalidEmail: 'Por favor, introduce un correo válido',
      invalidCredentials: 'Credenciales inválidas',
      
      // Roles
      client: 'Cliente',
      admin: 'Administrador',
      
      // Chat
      sendMessage: 'Enviar mensaje',
      uploadFile: 'Subir archivo',
      typing: 'Escribiendo...',
      
      // Admin dashboard
      clients: 'Clientes',
      logs: 'Registros',
      noClients: 'No hay clientes para mostrar',
      noLogs: 'No hay registros para mostrar',
      search: 'Buscar...'
    }
  },
  en: {
    translation: {
      // General texts
      welcome: 'Welcome to Audit IA',
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      
      // Error messages
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      invalidCredentials: 'Invalid credentials',
      
      // Roles
      client: 'Client',
      admin: 'Administrator',
      
      // Chat
      sendMessage: 'Send message',
      uploadFile: 'Upload file',
      typing: 'Typing...',
      
      // Admin dashboard
      clients: 'Clients',
      logs: 'Logs',
      noClients: 'No clients to display',
      noLogs: 'No logs to display',
      search: 'Search...'
    }
  }
};

// Configurar i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // idioma predeterminado
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // React ya escapa los valores
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
