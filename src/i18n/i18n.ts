
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize the i18n instance
i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          // Auth
          login: {
            title: 'Iniciar Sesión',
            email: 'Correo electrónico',
            password: 'Contraseña',
            submit: 'Iniciar sesión',
            error: 'Credenciales inválidas',
            loading: 'Iniciando sesión...'
          },
          // Navigation
          nav: {
            clients: 'Clientes',
            logs: 'Registros',
            logout: 'Cerrar sesión',
            settings: 'Configuración'
          },
          // Client chat
          chat: {
            placeholder: 'Escriba un mensaje...',
            send: 'Enviar',
            upload: 'Subir documento',
            uploading: 'Subiendo...',
            empty: 'No hay mensajes todavía. Comience su auditoría ahora.'
          },
          // Admin dashboard
          admin: {
            clientsTitle: 'Clientes',
            searchClients: 'Buscar clientes...',
            noClients: 'No se encontraron clientes.',
            clientName: 'Nombre del cliente',
            company: 'Empresa',
            lastActive: 'Última actividad',
            status: 'Estado',
            active: 'Activo',
            inactive: 'Inactivo',
            view: 'Ver'
          },
          // General
          general: {
            loading: 'Cargando...',
            error: 'Se produjo un error. Inténtelo de nuevo.',
            offline: 'Sin conexión'
          }
        }
      },
      en: {
        translation: {
          // Auth
          login: {
            title: 'Login',
            email: 'Email',
            password: 'Password',
            submit: 'Sign in',
            error: 'Invalid credentials',
            loading: 'Signing in...'
          },
          // Navigation
          nav: {
            clients: 'Clients',
            logs: 'Logs',
            logout: 'Logout',
            settings: 'Settings'
          },
          // Client chat
          chat: {
            placeholder: 'Type a message...',
            send: 'Send',
            upload: 'Upload document',
            uploading: 'Uploading...',
            empty: 'No messages yet. Start your audit now.'
          },
          // Admin dashboard
          admin: {
            clientsTitle: 'Clients',
            searchClients: 'Search clients...',
            noClients: 'No clients found.',
            clientName: 'Client Name',
            company: 'Company',
            lastActive: 'Last Active',
            status: 'Status',
            active: 'Active',
            inactive: 'Inactive',
            view: 'View'
          },
          // General
          general: {
            loading: 'Loading...',
            error: 'An error occurred. Please try again.',
            offline: 'Offline'
          }
        }
      }
    },
    lng: 'es', // Default language
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // Not needed for React
    }
  });

export default i18n;
