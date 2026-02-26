# 🎌 Portal de Feriados | Latinoamérica

<div align="center">
  <img src="public/favicon.png" alt="Portal de Feriados Logo" width="120" />
</div>

<p align="center">
  <strong>Plataforma integral para la consulta y gestión de días festivos en América Latina.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS" />
</p>

## 🚀 Características Principales (Features)

- **🔐 Autenticación y Autorización (RBAC)**: Sistema de roles sólido con perfiles de **Administrador** (gestión completa) y **Guest** (solo lectura).
- **📅 Visualización de Feriados**: Vistas duales (lista detallada y calendario interactivo) para la exploración inmersiva de feriados.
- **☁️ Persistencia en la Nube con Supabase**: Toda la información de usuarios, preferencias y días festivos está respaldada en PostgreSQL de manera segura y confiable.
- **🛡️ Seguridad RLS (Row Level Security)**: Políticas estrictas aplicadas a nivel de base de datos para garantizar que solo usuarios administrativos realicen modificaciones críticas.
- **🎨 Modo Oscuro Inteligente**: Soporte nativo para *Dark Theme* persistido por usuario a través de la base de datos.
- **🌐 Cobertura Latinoamericana**: Soporte extenso para la visualización de festividades en toda la región latinoamericana usando `date-holidays`.

## 🏗️ Arquitectura y Tech Stack

El portal está construido bajo una arquitectura cliente-servidor robusta, delegando la infraestructura del backend a Supabase, lo que garantiza alta disponibilidad y despliegues rápidos.

**Frontend:**
- **Core:** React 19 (Hooks, Functional Components).
- **Lenguaje:** TypeScript estricto.
- **Estilos:** Vanilla CSS / CSS Modules (enfocado en diseños responsivos y UI modernos).
- **Estado Global:** Zustand y React Context API.
- **Bundler:** ViteJS (Fast Hot-Module Replacement).
- **Iconografía:** Lucide React.

**Backend (BaaS - Supabase):**
- **Base de Datos:** PostgreSQL (Relacional, UUIDs, Timestamps de auditoría).
- **Seguridad:** Row Level Security (RLS) habilitado.

## 📂 Estructura del Proyecto

```text
PortalFeriados/
├── public/                # Assets estáticos y favicon
├── src/
│   ├── assets/            # Imágenes y recursos multimedia
│   ├── components/        # Componentes UI reutilizables
│   ├── context/           # Providers de contexto (Themes, Context API)
│   ├── features/          # Módulos de la aplicación orientados a características (Holidays, Auth)
│   ├── services/          # Capa de abstracción para conexión con base de datos/BaaS
│   ├── store/             # Zustand stores para gestión de estado complejo global
│   ├── types/             # Tipado global estricto TypeScript
│   ├── App.tsx            # Componente raíz
│   └── main.tsx           # Punto de entrada de la aplicación
├── supabase/
│   └── migrations/        # 🔥 Scripts SQL y configuración de estado para la DB Supabase
├── .env.example           # Ejemplos de variables de entorno requeridas
├── package.json           # Dependencias y scripts del proyecto
├── tsconfig.json          # Configuración del compilador TypeScript
└── vite.config.ts         # Configuración del bundler
```

## ⚙️ Requisitos Previos (Prerequisites)

Antes de empezar, asegúrate de cumplir con los siguientes requisitos en tu entorno de desarrollo:

- **Node.js**: `v18.x` o superior (se recomienda `v20.x` LTS).
- **npm** o **yarn**: Gestor de paquetes.
- **Cuenta de Supabase**: Crear un proyecto en [Supabase](https://supabase.com).

## 🔑 Variables de Entorno

El proyecto requiere conexión con tu instancia de Supabase. Crea un archivo `.env` en la raíz del proyecto basándote en el archivo de ejemplo:

**`.env.example`**
```env
# Variables de configuración para Supabase
VITE_SUPABASE_URL=https://tu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh... (tu clave pública anónima)
```

## 🗄️ Configuración de Base de Datos (Supabase)

Toda la infraestructura de la base de datos está provisionada en scripts SQL automatizados. Sigue estos pasos para prepararla:

1. Ingresa a tu panel principal en [Supabase](https://app.supabase.com).
2. Dirígete a la sección de **"SQL Editor"**.
3. Ejecuta de forma secuencial los scripts ubicados en la carpeta `supabase/migrations/`:
   - `001_initial_schema.sql`: Despliega las tablas (`users`, `holiday_types`, `custom_holidays`) y triggers.
   - `002_rls_policies.sql`: Fija la seguridad de las tablas con Row Level Security para Guest y Admins.
   - `003_seed_data.sql`: Añade la data de pruebas inicial y los tipos predefinidos.

## 🚀 Instalación y Ejecución

1. Resuelve e instala todas las dependencias:
   ```bash
   npm install
   ```
2. Inicializa el servidor en modo desarrollo (Hot-Reload activo):
   ```bash
   npm run dev
   ```
   > La aplicación estará disponible por defecto en: [http://localhost:5173](http://localhost:5173)

3. Compilar para Producción / Staging:
   ```bash
   npm run build
   ```

## 🧪 Credenciales de Prueba

Gracias al script inteligente `003_seed_data.sql`, cuentas con dos usuarios listos para ser utilizados luego de desplegar la base de datos:

| Rol | Usuario | Contraseña | Capacidades |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Control total, crear, actualizar o eliminar feriados y tipos. |
| **Visitante** | `guest` | `guest123` | Solamente lectura autorizada a nivel DB y modo espectador. |

---

> ✨ *Desarrollado y diseñado pensando en la excelencia, escalabilidad y buenas prácticas de Ingeniería de Software.*
