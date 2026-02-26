# Nova Auth

Este proyecto consta de una arquitectura cliente-servidor con las siguientes tecnologías:
- **Backend**: Node.js
- **Frontend**: Angular

A continuación, se detallan las instrucciones necesarias para instalar y ejecutar el proyecto en tu entorno local después de clonarlo desde GitHub.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:
- [Node.js](https://nodejs.org/) (se recomienda la versión LTS)
- [npm](https://www.npmjs.com/) (se instala junto con Node.js)
- [Angular CLI](https://angular.io/cli) (opcional, instalar globalmente con `npm install -g @angular/cli`)

## Guía de Instalación

### 1. Clonar el repositorio

Abre tu terminal y ejecuta el siguiente comando para clonar el proyecto en tu máquina local:

```bash
git clone <URL_DEL_REPOSITORIO>
cd nova-auth
```
*(Nota: Reemplaza `<URL_DEL_REPOSITORIO>` por la ruta real de tu repositorio en GitHub).*

### 2. Configuración del Backend (Node.js)

1. Abre una terminal y navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. **Variables de entorno:** Verifica el archivo `.env` en la carpeta `backend` y ajústalo si es necesario (ej. conexión a base de datos, puertos, etc.).
4. Inicia el servidor:
   ```bash
   npm run dev
   # o si no tienes un script dev configurado:
   # npm start
   ```

### 3. Configuración del Frontend (Angular)

1. Abre una nueva pestaña o ventana en tu terminal y navega al directorio del frontend desde la raíz del proyecto:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Angular:
   ```bash
   npm start
   # o usando Angular CLI:
   # ng serve
   ```
4. Abre tu navegador y dirígete a `http://localhost:4200/` para ver la aplicación en funcionamiento.

## Comandos Útiles

- Para compilar el frontend para producción: `ng build` (dentro de la carpeta `frontend`).
- Para ejecutar las pruebas unitarias: `ng test`.
