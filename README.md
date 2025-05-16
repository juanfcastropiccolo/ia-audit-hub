
# AUDIT-IA: Plataforma de Auditoría Inteligente

![Tailwind Status](https://img.shields.io/badge/Tailwind-Ready-38B2AC)
![TypeScript Status](https://img.shields.io/badge/TypeScript-Ready-007ACC)
![React Status](https://img.shields.io/badge/React-18-61DAFB)

AUDIT-IA es una plataforma de auditoría que utiliza inteligencia artificial para optimizar y automatizar procesos de auditoría.

## Requisitos previos

- Node.js 18+ 
- npm 8+
- Python 3.9+
- pip

## Estructura del proyecto

```
/
├─ index.html
├─ src/               # Frontend (React + TypeScript + Tailwind)
│  ├─ components/     # Componentes reutilizables
│  ├─ layouts/        # Layouts de la aplicación
│  ├─ views/          # Vistas principales
│  └─ ...
└─ backend/           # Backend (FastAPI + Agentes IA)
```

## Getting Started

### Frontend

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

### Backend

```bash
# Instalar dependencias de Python
pip install -r backend/requirements.txt

# Iniciar servidor API
python backend/main.py --mode api
```

## Funcionalidades

- Sistema de autenticación con roles (admin/cliente)
- Panel de control para administradores
- Interfaz de chat con agentes IA para clientes
- Tema oscuro/claro

## Stack Tecnológico

- **Frontend**: React 18, TypeScript, TailwindCSS, Vite
- **Backend**: FastAPI, Python, Agentes IA
