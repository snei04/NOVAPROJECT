# 🚀 NovaProject v2.2.1 - Release Notes
## Optimización de Colaboración y Gestión de Propiedad

**Fecha de Lanzamiento:** 27 de Noviembre, 2025
**Versión:** v2.2.1

---

### 📋 Resumen Ejecutivo
Esta actualización se centra en la **flexibilidad y continuidad operativa** de los proyectos y documentos. Se ha desacoplado la existencia de los recursos de las cuentas de sus creadores originales ("Independencia del Creador") y se ha implementado un sistema robusto de **colaboración multiusuario** con invitaciones inteligentes.

---

### ✨ Nuevas Funcionalidades

#### 1. Colaboración en Documentos (Multi-tenant)
Ahora es posible trabajar en equipo sobre documentos de texto enriquecido con niveles de permiso específicos.
*   **Roles Definidos:**
    *   👑 **Owner (Dueño):** Control total, puede eliminar y gestionar accesos.
    *   ✏️ **Editor:** Puede modificar el contenido.
    *   👀 **Viewer:** Solo lectura (preparado para futura implementación frontend).
*   **Acceso Seguro:** Los documentos ya no son públicos ni globales; solo los usuarios explícitamente invitados o el creador pueden acceder a ellos.

#### 2. Independencia del Creador (Continuidad de Negocio)
Se ha eliminado el riesgo de pérdida de información cuando un empleado o usuario deja la organización.
*   **Tableros Persistentes:** Si se elimina una cuenta de usuario, sus tableros **NO se eliminan**. El campo de "creador" se establece en NULL, pero el tablero permanece activo para el resto de los miembros del equipo.
*   **Gestión de Acceso:** El acceso se gestiona estrictamente a través de la lista de miembros (`board_members`), no por la propiedad de la cuenta creadora.

#### 3. Sistema de Invitaciones Inteligente
Facilitamos la incorporación de nuevos miembros y colaboradores externos.
*   **Búsqueda de Usuarios:** Nuevo buscador integrado para encontrar colegas rápidamente por nombre o correo electrónico.
*   **Invitación a Externos:** Si invitas a un correo electrónico que no está registrado en NovaProject (ya sea a un Tablero o a un Documento), el sistema:
    1.  Permite la operación sin errores.
    2.  Envía automáticamente un correo electrónico al invitado con un enlace para registrarse.
    3.  (Opcional/Futuro) Vincula el acceso una vez completado el registro.

### 🎨 Mejoras en Frontend (UI/UX)

#### Componente de Compartir Documentos
*   **Nuevo Modal Interactivo:** Interfaz moderna y limpia para gestionar invitaciones.
*   **Buscador Integrado:** Autocompletado en tiempo real que sugiere usuarios registrados por nombre o correo.
*   **Selección de Roles:** Control visual para asignar permisos de *Editor* o *Visualizador*.

#### Experiencia de Usuario en Tableros
*   **Feedback Inteligente:** El formulario de invitación ahora informa claramente si el usuario fue añadido directamente o si se envió una invitación por correo (para usuarios no registrados), mejorando la claridad del proceso.

#### Módulo de Gestión de Stakeholders (Mejora 3)
*   **Portal Colaborativo:** Nuevo panel de control para visualizar y gestionar interesados del proyecto.
*   **Acciones Rápidas:**
    *   **Agregar:** Formulario modal para registrar nuevos stakeholders con roles y prioridades.
    *   **Invitar:** Funcionalidad "One-click" para enviar invitaciones de acceso al portal.
    *   **Roles Granulares:** Al invitar, se puede definir si el stakeholder tendrá permisos de **Editor** (Modificar tareas) o **Visualizador** (Solo lectura).
    *   **Modo Solo Lectura:** Los usuarios con rol de visualizador tienen restringidas las acciones de creación y edición en:
        *   Tablero Kanban (Listas/Tarjetas)
        *   Gestión de Riesgos
        *   Seguimiento de Entregables
        *   Reportes Semanales (Solo ver historial)
        *   Configuración del Proyecto (Gobernanza y Presupuesto)
    *   **Indicadores:** Visualización clara de qué stakeholders ya tienen acceso al sistema (🔗).

#### Gestión de Proyecto y Finanzas (Mejoras 2 y 4)
*   **Asistente de Creación Renovado:**
    *   Ahora incluye pasos para definir **Gobernanza** (Objetivos, Alcance) y **Presupuesto Inicial**.
*   **Panel de Configuración del Tablero (⚙️):**
    *   Nueva interfaz centralizada para editar detalles del proyecto.
    *   **Pestaña Gobernanza:** Gestión dinámica de objetivos específicos y alcance.
    *   **Pestaña Finanzas:** Control de presupuesto, costos reales y beneficios, con cálculo automático de ROI y desviaciones.

---

### 🛠️ Detalles Técnicos (Backend)

#### Cambios en Base de Datos
*   **Nueva Tabla `document_members`:**
    *   `document_id` (FK -> documents)
    *   `user_id` (FK -> usuarios)
    *   `role` ENUM('owner', 'editor', 'viewer')
*   **Modificación en Tabla `boards`:**
    *   Constraint FK `user_id` modificada de `ON DELETE CASCADE` a `ON DELETE SET NULL`.
    *   Columna `user_id` ahora admite valores NULL.

#### Nuevos Endpoints API
| Método | Ruta | Descripción | Nivel de Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/documents/:id/invite` | Invitar colaborador a un documento | 🔒 Private (Member) |
| `GET` | `/api/users/search` | Buscar usuarios por nombre/email (`?query=...`) | 🔒 Private |

#### Seguridad
*   Se ha aplicado el middleware `protect` a todas las rutas críticas de documentos (`/api/documents/*`) para garantizar que `req.user` esté siempre disponible y validado.
*   Actualización de `createDocument` para insertar automáticamente al creador en `document_members` con rol `owner`.
*   Actualización de `getAllDocuments` para filtrar mediante `JOIN document_members`.

---

### 📝 Pasos de Actualización (Para Desarrolladores)
1.  Ejecutar script de migración para documentos: `node backend/src/scripts/add_document_collaboration.js`
2.  Ejecutar script de migración para tableros: `node backend/src/scripts/make_boards_independent.js`
3.  Verificar configuración de servicio de correo (`SMTP`) para las invitaciones.

---

---

# 🚀 NovaProject v2.2.2 - Release Notes
## Módulo de Gestión Financiera y Presupuesto

**Fecha de Lanzamiento:** 25 de Noviembre, 2025
**Versión:** v2.2.2

---

### 📋 Resumen Ejecutivo
Esta versión introduce el **Módulo de Gestión Financiera**, permitiendo a los gerentes de proyecto llevar un control detallado del presupuesto. Se pueden registrar rubros presupuestales (Budget Items), vincularlos a fases del proyecto (Milestones), categorizarlos y monitorear la ejecución en tiempo real (Aprobado vs. Ejecutado).

---

### ✨ Nuevas Funcionalidades

#### 1. Tablero de Presupuesto (Budget Dashboard)
Una nueva vista dedicada para la gestión económica del proyecto.
*   **Selector de Proyectos:** Navegación fluida entre los presupuestos de diferentes proyectos.
*   **Resumen Financiero:** Tarjetas de métricas clave:
    *   💰 Presupuesto Aprobado Total.
    *   💸 Presupuesto Ejecutado Total.
    *   📉 Disponible (Cálculo en tiempo real).
    *   📊 Porcentaje de Ejecución General.
*   **Gestión de Items:** Tabla detallada para crear, editar y eliminar rubros de presupuesto.

#### 2. Vinculación con Fases (Milestones)
Integración profunda con la gestión del proyecto.
*   Al crear un gasto, se puede asignar a un **Hito/Fase** específico del proyecto.
*   Permite analizar costos por fase de desarrollo.

#### 3. Integración en Dashboard Principal
El Dashboard general del proyecto ahora incluye un widget de **Resumen Presupuestal** que muestra el estado financiero de un vistazo, complementando las métricas de progreso y riesgos.

---

### 🎨 Mejoras en Frontend (UI/UX)

*   **Navegación:** Nuevo acceso directo "Presupuesto" en la barra de navegación principal (`/app/budget`).
*   **Feedback Visual:**
    *   Indicadores de color para el estado del presupuesto (Verde = Disponible, Rojo = Déficit).
    *   Barras de progreso para visualizar el porcentaje de ejecución.
*   **Formularios Dinámicos:** Modales de creación/edición con selectores inteligentes para Categorías y Milestones.

---

### 🛠️ Detalles Técnicos (Backend)

#### Nueva Estructura de Datos
*   **Tabla `budget_items`:**
    *   `id`: UUID
    *   `project_id`: FK -> boards
    *   `milestone_id`: FK -> project_milestones
    *   `category`: Consultoría, Licencias, Hardware, Personal, Cloud, Otros.
    *   `amount_approved`: Decimal(15,2)
    *   `amount_executed`: Decimal(15,2)
    *   `justification`: Texto para explicar variaciones.

#### Nuevos Endpoints API
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/budget/project/:boardId` | Obtener todos los items de un proyecto |
| `GET` | `/api/budget/project/:boardId/summary` | Obtener resumen (totales) |
| `POST` | `/api/budget/project/:boardId` | Crear nuevo item de presupuesto |
| `PUT` | `/api/budget/:id` | Actualizar item existente |
| `DELETE` | `/api/budget/:id` | Eliminar item |

#### Correcciones Importantes
*   **Base de Datos:** Corrección de `Collation Mismatch` (`utf8mb4_0900_ai_ci`) que causaba errores 500 en consultas con JOINs.
*   **Mapeo de Datos:** Solución al problema de guardado de valores decimales y IDs (camelCase vs snake_case) en el servicio de presupuesto.
*   **Persistencia de Configuración:** Se corrigió un error crítico donde los objetivos, alcance y presupuesto definidos en "Configuración del Proyecto" no se visualizaban al recargar, asegurando ahora la correcta carga y mapeo de estos datos.

#### Seguridad y Permisos (Modo Solo Lectura)
Se ha reforzado el rol de **Visualizador (Viewer)** en todos los módulos para garantizar la integridad de los datos:
*   **Reportes Semanales:** Botones de creación y envío deshabilitados.
*   **Presupuesto:** Acciones de crear, editar y eliminar items deshabilitadas (UI gris e inactiva).
*   **Entregables:** Creación de nuevos entregables restringida visual y funcionalmente.
*   **Backend:** Validaciones de seguridad adicionales en los endpoints para rechazar intentos de modificación por parte de usuarios sin permisos de edición.

---

### 📝 Pasos de Actualización
1.  **Backend:** Reiniciar el servidor para aplicar los cambios de esquema de base de datos (script automático de creación de tabla `budget_items`).
2.  **Frontend:** No requiere acciones adicionales, recargar la aplicación.

---
*NovaProject Team*

---

# 🚀 NovaProject v2.2.3 - Release Notes
## Sincronización de Flujos y Refinamiento de UI

**Fecha de Lanzamiento:** 25 de Noviembre, 2025
**Versión:** v2.2.3

---

### 📋 Resumen Ejecutivo
Esta actualización se centra en la **integración de flujos de trabajo** entre módulos (Entregables -> Kanban) y el **refinamiento de la interfaz de usuario**, abordando problemas de diseño y usabilidad reportados, así como la consolidación de las políticas de permisos.

---

### ✨ Nuevas Funcionalidades y Mejoras

#### 1. Sincronización Entregables - Kanban
Optimización del flujo de trabajo para gestores de proyecto.
*   **Creación de Tareas desde Entregables:** Nuevo botón en el "Deliverable Tracker" que permite generar una tarjeta en el Tablero Kanban con un solo clic.
*   **Mapeo Inteligente:** La tarea hereda el título, descripción y fecha límite del entregable. Si el estado del entregable coincide con una lista existente, se asigna automáticamente; de lo contrario, se crea en una lista por defecto ("Sin Lista").

#### 2. Refinamiento de Interfaz (UI/UX)
*   **Menú de Usuario (Navbar):** Se ha solucionado el problema de desbordamiento visual cuando el nombre o correo del usuario es demasiado largo. Ahora el texto se trunca elegantemente y muestra el contenido completo al pasar el cursor (tooltip).
*   **Limpieza Visual:** Estandarización de títulos en los módulos de Presupuesto y Entregables para una apariencia más profesional (eliminación de emojis redundantes en encabezados).

#### 3. Gobernanza y Permisos (Ajustes Finales)
*   **Persistencia de Datos:** Verificación y corrección definitiva del mapeo de datos en la "Configuración del Proyecto", asegurando que los Objetivos, Alcance y Presupuesto se guarden y carguen correctamente (CamelCase mapping fix).
*   **Roles Granulares:** Se han aplicado restricciones visuales y lógicas estrictas para el rol de **Visualizador** en el Dashboard de Stakeholders (invitación deshabilitada) y otros módulos críticos.

---

### 🛠️ Correcciones Técnicas
*   **Frontend:** Ajuste de clases CSS (`truncate`, `min-w-0`) en el componente `Navbar` para manejo de desbordamiento de texto.
*   **Backend:** Implementación del endpoint `createTaskFromDeliverable` para la lógica de sincronización automática.

---

# 🚀 NovaProject v2.2.4 - Release Notes
## Mejoras en Experiencia de Usuario y Correcciones Críticas

**Fecha de Lanzamiento:** 27 de Noviembre, 2025
**Versión:** v2.2.4

---

### 📋 Resumen Ejecutivo
Esta versión se enfoca en pulir la experiencia del usuario final (**UX/UI**) eliminando interrupciones nativas del navegador y mejorando el diseño de los diálogos de tareas. Además, se han resuelto problemas críticos en el flujo de **invitaciones por correo** y la **creación rápida de tableros**.

---

### ✨ Nuevas Funcionalidades y Mejoras

#### 1. Experiencia de Usuario (UX/UI) Refinada
*   **Diálogos Nativos Eliminados:** Se han reemplazado todas las alertas intrusivas del navegador (`alert`, `confirm`, `prompt`) por **Componentes Modales Integrados**.
    *   Ahora, al renombrar o eliminar tableros y listas, el usuario interactúa con diálogos modernos que mantienen la coherencia visual de la aplicación.
    *   Incluye validaciones y estados de carga visuales.
*   **Rediseño del Diálogo de Tareas:**
    *   **Layout Optimizado:** Se migró de un diseño flexible a un **Grid Layout** robusto. Esto asegura que la columna lateral (Miembros, Etiquetas, Acciones) mantenga su ancho fijo y no colapse ni desborde el contenido principal, independientemente del tamaño de la pantalla.
    *   **Botones Responsivos:** Los botones de acción ("Guardar", "Completar") ahora se adaptan automáticamente (`flex-wrap`), evitando cortes en pantallas pequeñas.
    *   **Legibilidad Mejorada:** Corrección de contraste en los menús desplegables de miembros, asegurando que los nombres sean legibles sobre el fondo blanco.

#### 2. Creación de Tableros Flexible
*   **Acceso Rápido Habilitado:** Se ha flexibilizado la validación en el backend para permitir la **Creación Rápida** de tableros desde la barra de navegación.
*   Los campos de Gobernanza (Objetivos, Alcance) ahora son opcionales en la creación inicial, permitiendo a los usuarios empezar a trabajar de inmediato y definir los detalles estratégicos más tarde desde la configuración.

#### 3. Correcciones en Invitaciones
*   **Identidad del Remitente:** Se corrigió un error en las plantillas de correo donde el nombre del usuario que invita no se mostraba correctamente (`undefined`). Ahora, las invitaciones muestran claramente quién te está invitando a colaborar.

#### 4. Correcciones en Fases (Milestones)
*   **Manejo de Fechas:** Se solucionó un problema donde la fecha límite no se visualizaba correctamente al editar una fase debido a incompatibilidad de formato. Ahora las fechas se cargan y guardan con precisión.
*   **Confirmación de Eliminación:** Se reemplazó la alerta nativa del navegador al eliminar una fase por el nuevo **ConfirmDialog**, mejorando la coherencia visual y evitando interrupciones bruscas.

---

### 🛠️ Detalles Técnicos
*   **Backend (`BoardController`):** Ajuste en la validación de `createBoard` para hacer opcionales los campos `generalObjective`, `scopeDefinition`, etc.
*   **Frontend Componentes:**
    *   Creación de `InputDialogComponent` y `ConfirmDialogComponent`.
    *   Refactorización CSS en `TodoDialogComponent` usando CSS Grid (`grid-cols-[1fr_200px]`).
    *   Mejora en `BoardSettingsDialogComponent` para formateo de fechas y uso de `ConfirmDialog`.

---

