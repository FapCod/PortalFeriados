# Portal de Feriados

Una aplicación web moderna para visualizar y gestionar días festivos en Latinoamérica. Construida con React, TypeScript y Vite.

## Características

- **Visualización de Feriados:** Vista de calendario y lista para múltiples países.
- **Gestión de Feriados Personalizados:** Agregue sus propios feriados (guardados localmente).
- **Gestión de Tipos de Feriado:** Administre tipos de feriados con colores personalizados (Solo Admin).
- **Autenticación:** Sistema de login simulado (Admin/Invitado).
- **Temas:** Modo Claro y Oscuro con persistencia.
- **Diseño Responsivo:** Adaptado a dispositivos móviles y escritorio.

## Requisitos Previos

Asegúrese de tener instalado **Node.js** (versión 18 o superior) en su sistema.
Puede verificarlo ejecutando:
```bash
node -v
```

## Instalación

1.  Clone el repositorio o descargue el código fuente.
2.  Abra una terminal en la carpeta raíz del proyecto.
3.  Instale las dependencias ejecutando:

```bash
npm install
```

## Ejecutar el Proyecto (Desarrollo)

Para iniciar la aplicación en modo de desarrollo (con recarga automática):

```bash
npm run dev
```

Esto iniciará el servidor local, generalmente en `http://localhost:5173`. Abra esa URL en su navegador.

## Construir para Producción

Para generar los archivos optimizados para producción:

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist`.

Para previsualizar la versión de producción localmente:

```bash
npm run preview
```

## Estructura del Proyecto

- `src/components`: Componentes de React (Vistas, Controles, Layout, Admin).
- `src/context`: Contextos de React (Auth, Holiday, Theme).
- `src/services`: Lógica de negocio y manejo de datos.
- `src/styles`: Estilos globales y variables CSS.

## Credenciales de Prueba

- **Admin:**
    - Usuario: `admin`
    - Contraseña: `admin123`
- **Invitado:**
    - Usuario: `guest`
    - Contraseña: `guest123`
