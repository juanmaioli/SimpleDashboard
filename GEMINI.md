# 🚀 SimpleDashboard

Documentación técnica y operativa para el asistente Gemini.

## 📝 Resumen del Proyecto
SimpleDashboard es una aplicación web ligera diseñada para actuar como un tablero de control (dashboard) para aplicaciones de servidor doméstico. Permite visualizar y gestionar accesos directos a diferentes servicios de forma centralizada y visualmente atractiva.

### 🛠️ Stack Tecnológico
- **Entorno de Ejecución:** Node.js
- **Framework Web:** Express.js (v5.2.1)
- **Motor de Plantillas:** EJS (v5.0.2)
- **Base de Datos:** SQLite (vía `better-sqlite3`)
- **Estilos:** Bootstrap 5.3 (Modo oscuro habilitado)
- **Gestión de Entorno:** `dotenv`

## ⚙️ Configuración y Ejecución

### Variables de Entorno (`.env`)
El proyecto requiere las siguientes variables configuradas:
- `PORT`: Puerto donde correrá la aplicación (ej. `8064`).
- `DB_PATH`: Ruta relativa al archivo SQLite (ej. `./public/db/app.sqlite`).
- `ICONS_PATH`: Ruta a la carpeta de iconos de aplicaciones.
- `BACKGROUNDS_PATH`: Ruta a la carpeta de fondos de pantalla.
- `BACKGROUND_URL`: URL de la imagen de fondo principal.

### 🚀 Comandos Clave
| Acción | Comando |
| :--- | :--- |
| Instalar dependencias | `pnpm install` |
| Iniciar aplicación | `node index.js` |
| Levantar con Docker | `docker compose up -d` |
| Construir imagen | `docker build -t simpledashboard .` |

> **Nota:** No se han detectado scripts de prueba en el `package.json` más allá del placeholder por defecto.

## 🏗️ Arquitectura y Estructura
- `index.js`: Punto de entrada único. Contiene la lógica de rutas, conexión a BD (con `override: true` en dotenv) y configuración de Express.
- `public/`: Directorio para activos estáticos.
    - `db/`: Contiene `app.sqlite`.
    - `icons/`: Almacena las imágenes de iconos de las aplicaciones.
    - `backgrounds/`: Imágenes de fondo locales.
- `views/`: Plantillas EJS.
    - `index.ejs`: Dashboard principal con efecto "glassmorphism". Personalizado por el usuario con mayor densidad de tarjetas (6 columnas en desktop) y estética específica.
    - `edit.ejs`: Interfaz simple para gestionar/editar las aplicaciones.

## 📜 Convenciones de Desarrollo
- **Estilo de Código:** CommonJS (`require`).
- **UI/UX:** Uso intensivo de clases de Bootstrap 5.3 y personalización CSS para efectos de transparencia (Glassmorphism). Se respeta la personalización de densidad de la cuadrícula realizada por el usuario.
- **Base de Datos:** Consultas mediante `better-sqlite3`. Las aplicaciones se muestran en orden alfabético (`ORDER BY title ASC`). Persistencia de configuración en la tabla `settings`.
- **Salud del Sistema:** Monitoreo mediante `axios` con soporte para HTTPS local.
- **Seguridad:** Soporte para HTTPS automático si se encuentran certificados en el directorio `./.dev` (`apache.crt` y `apache.key`).
- **Portabilidad:** Sistema de exportación/importación de configuración completa mediante archivos ZIP (`adm-zip`).
- **Idioma:** Todo el código fuente, comentarios y documentación interna deben mantenerse en español (es_AR) según las preferencias del usuario.

## 📌 TODO / Próximos Pasos
- [ ] Implementar sistema de categorías o grupos.
- [ ] Añadir una barra de búsqueda rápida.
- [ ] Implementar validación de formularios en el backend.
- [ ] Añadir una suite de pruebas básicas.
