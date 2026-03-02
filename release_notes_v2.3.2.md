# Release Notes - NovaProject v2.3.2

**Fecha de Lanzamiento:** 1 de Marzo de 2026

En esta versión nos hemos enfocado en simplificar y consolidar el núcleo operativo de la plataforma (El Kanban), garantizando un flujo de trabajo mucho más estricto, fluido y a prueba de desconexiones inoportunas.

---

## 🚀 Nuevas Funcionalidades y Mejoras Clave

### 1. Sincronización Magnética (Kanban ↔ Configuración)
- **Fases Sincronizadas Bidireccionalmente:** Las "Fases" creadas en los parámetros de la Configuración del Proyecto (Milestones) ahora fungen directamente como las columnas dinámicas de tu Tablero Kanban. 
- **Límites de tiempo Visibles:** Cada Columna/Fase en tu Kanban ahora muestra en su subtítulo la **Fecha Límite** estimada de terminación del hito.
- **Creación en Caliente:** Ahora puedes crear las Fases dictando su respectiva Fecha Límite directamente dentro de la interfaz del Kanban sin necesidad de navegar a los parámetros internos del proyecto.
- **Limpieza Estratégica:** Los nuevos proyectos ya no se autocompletarán obligatoriamente con las listas genéricas de *"Pendiente, En progreso, Completado"*. Los tableros iniciarán "en blanco" para forzar diseños de Flujos de Trabajo personalizados.

### 2. Consolidación de Experiencia "Kanban-First" 
- **Entregables Integrados:** El engorroso panel independiente de "Entregables" ha sido removido del sistema. Todas las gestiones de tareas recaen al 100% sobre el Kanban principal, sirviendo como la única fuente de la verdad para la operación del proyecto.
- **Terminología Intuitiva:** Se re-escribió todo el lenguaje front-end para adaptarse a entornos Enterprise (Se reemplazaron las palabras genéricas *"Lista"* y *"Tarjeta"* por **"Fase"** y **"Tarea"**).

### 3. Tareas Blindadas
- **Back-end Restrictivo:** Validaciones reescritas en el servidor y base de datos para proscribir la existencia de tareas "huérfanas". A nivel técnico y de UI es imposible crear u operar una Tarea si el proyecto carece previamente de Fases definidas.

### 4. Estabilidad y Gestión de Usuario
- **Sesiones Inteligentes:** Nuevo y potente detector de actividad en el Cliente: La aplicación detecta en tiempo real docenas de interacciones para refrescar de manera invisible el Token del servidor cada 10 minutos en uso constante.
- La sesión global ahora solo expirará de verdad tras 20 robustos minutos de verdadera y genuina inactividad total. ¡Adiós a los auto-logouts a plena mitad del trabajo!
- **Correcciones Visuales (Dashboard):** Limpieza de colores saturados en el Header del Tablero global cambiándolos por un azul sólido, y arreglado el *glitch* que ocasionaba que las métricas primarias (KPIs) se pintaran duplicadas.

---
*Gracias por utilizar NovaProject.*
*Para consultar dudas técnicas sobre el release o sugerir mejoras futuras, ponte en contacto con los repositorios core.*
