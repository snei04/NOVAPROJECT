# 🚀 NovaProject v2.2.1 - Release Notes
## Optimización de Colaboración y Gestión de Propiedad

**Fecha de Lanzamiento:** 24 de Noviembre, 2025
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
*NovaProject Team*
