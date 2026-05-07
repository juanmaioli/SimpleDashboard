# ⚜️ SimpleDashboard

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

Un tablero de control minimalista, rápido y elegante para tus servicios locales. Diseñado con una estética **Glassmorphism** y optimizado para una visualización clara de tus aplicaciones.

## ✨ Características

- 🖼️ **Interfaz Elegante:** Fondo dinámico y tarjetas con desenfoque de fondo (backdrop-filter).
- 📱 **Diseño Responsivo:** Adaptado para múltiples dispositivos con una cuadrícula densa y limpia.
- 🗂️ **Orden Alfabético:** Tus aplicaciones se organizan automáticamente de la A a la Z.
- ⚙️ **Gestión Simple:** Edita nombres y URLs directamente desde el panel de ajustes.
- 🚀 **Ligero:** Basado en Node.js y SQLite para un consumo mínimo de recursos.

## 🛠️ Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd SimpleDashboard
    ```

2.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

3.  **Configurar entorno:**
    Crea un archivo `.env` basado en la siguiente estructura:
    ```env
    PORT=8064
    DB_PATH=public/db/app.sqlite
    ICONS_PATH=public/icons/
    BACKGROUNDS_PATH=public/backgrounds
    BACKGROUND_URL=https://tu-servidor.com/imagen.jpg
    ```

4.  **Iniciar:**
    ```bash
    node index.js
    ```

## 📂 Estructura del Proyecto

- `index.js`: Lógica del servidor y rutas.
- `views/`: Plantillas EJS para el dashboard y edición.
- `public/`: Activos estáticos (iconos, fondos y base de datos).

## 👤 Autor

Desarrollado por **Juan Gabriel Maioli**.

---
*Hecho con ❤️ para una gestión de servicios más simple.*
