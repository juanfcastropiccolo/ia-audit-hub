# Auditoría IA - Frontend

Este directorio contiene el frontend de la plataforma de Auditoría IA, un sistema que utiliza agentes de IA jerárquicos para realizar auditorías financieras.

## Tecnologías

- **React 18**: Framework principal de UI
- **TypeScript**: Tipado estático para mejor desarrollo
- **Tailwind CSS**: Framework de utilidades CSS para estilos
- **React Router**: Para el manejo de rutas
- **Vite**: Build tool y servidor de desarrollo

## Estructura de la aplicación

La aplicación tiene dos interfaces principales:

1. **Panel de Administración (Admin)**: Para que los administradores monitoreen y gestionen los equipos de agentes IA que realizan auditorías.
2. **Chat de Cliente**: Interfaz para que los clientes interactúen con su asistente IA de auditoría.

### Estructura de Carpetas

```
src/
  ├── api/           # Funciones para interactuar con el backend
  ├── components/    # Componentes React
  │   ├── admin/     # Componentes para el panel de administración
  │   ├── client/    # Componentes para la interfaz de chat
  ├── types/         # Definiciones de tipos TypeScript
  ├── App.tsx        # Componente principal y rutas
  ├── main.tsx       # Punto de entrada de la aplicación
```

## Inicio Rápido

1. **Instalación de dependencias**

```bash
npm install
```

2. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

3. **Construir para producción**

```bash
npm run build
```

## Autenticación

La aplicación cuenta con un sistema simple de autenticación con dos tipos de roles:

- **Admin**: Acceso al panel de administración con monitoreo de agentes
- **Cliente**: Acceso al chat para interactuar con el asistente IA

Para pruebas, puedes usar:
- Admin: admin@audit.com / password
- Cliente: cliente@empresa.com / password

## Características Principales

### Panel de Administración
- Visualización jerárquica de equipos de agentes IA (Manager → Supervisor → Senior → Assistant)
- Monitoreo en tiempo real de estado y actividades
- Registro de logs y eventos de auditoría
- Filtrado de registros por cliente, agente o tipo de evento

### Chat de Cliente
- Interfaz conversacional moderna
- Soporte para envío de archivos (documentos financieros)
- Recepción progresiva (streaming) de respuestas
- Indicación de estado de la auditoría

## Personalización de Tema

La aplicación utiliza una paleta de colores personalizada con soporte para modo oscuro:

- Soft Yellow (#FFF2AF)
- Lavender Mist (#DAD2FF)
- Purple Tint (#B2A5FF)
- Deep Indigo (#493D9E)

El modo oscuro se puede activar utilizando el toggle en la interfaz o añadiendo la clase `dark` al elemento HTML raíz.

## API Backend

Esta interfaz está diseñada para consumir APIs del backend de Auditoría IA implementado con Google ADK (Agent Development Kit). Las rutas principales incluyen:

- `/api/auth/login`: Autenticación
- `/api/clients`: Información de clientes
- `/api/agents`: Información sobre agentes
- `/api/tasks`: Tareas asignadas
- `/api/logs`: Eventos y logs
- `/api/chat/send`: Envío de mensajes
- `/api/chat/upload`: Subida de archivos
- `/api/chat/stream`: Recepción de respuestas en streaming 