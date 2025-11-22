# 📡 API Endpoints - NovaProject v2.0.0

## ✅ Endpoints Implementados

### 🎯 Milestones

#### GET `/api/milestones/project/:projectId`
Obtener todos los milestones de un proyecto

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": 1,
      "title": "Fase 1: Análisis y Diseño",
      "description": "Completar análisis de requerimientos",
      "targetDate": "2024-12-05",
      "status": "in_progress",
      "progressPercentage": 60,
      "priority": "high",
      "createdAt": "2024-11-20T...",
      "updatedAt": "2024-11-20T..."
    }
  ],
  "error": null
}
```

#### GET `/api/milestones/metrics/:projectId`
Obtener métricas calculadas del proyecto

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": {
      "current": 45,
      "target": 100,
      "unit": "%",
      "trend": "up",
      "status": "warning"
    },
    "milestones": {
      "completed": 1,
      "total": 4,
      "percentage": 25
    }
  },
  "error": null
}
```

#### POST `/api/milestones`
Crear un nuevo milestone

**Body:**
```json
{
  "projectId": 1,
  "title": "Fase 5: Lanzamiento",
  "description": "Despliegue a producción",
  "targetDate": "2025-01-15",
  "priority": "critical"
}
```

#### PUT `/api/milestones/:id`
Actualizar un milestone

**Body:**
```json
{
  "status": "completed",
  "progressPercentage": 100
}
```

#### DELETE `/api/milestones/:id`
Eliminar un milestone

---

### 👥 Stakeholders

#### GET `/api/stakeholders/project/:projectId`
Obtener todos los stakeholders de un proyecto

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "projectId": 1,
      "name": "Juan Pérez",
      "role": "VP Tecnología",
      "priority": "high",
      "contactInfo": {"email": "juan@company.com"},
      "availability": {},
      "isActive": true,
      "createdAt": "2024-11-20T...",
      "updatedAt": "2024-11-20T..."
    }
  ],
  "error": null
}
```

#### GET `/api/stakeholders/:stakeholderId/availability`
Obtener disponibilidad de un stakeholder

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "stakeholderId": "uuid",
      "dayOfWeek": 1,
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isActive": true
    }
  ],
  "error": null
}
```

#### POST `/api/stakeholders/:stakeholderId/availability`
Añadir disponibilidad a un stakeholder

**Body:**
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "17:00:00"
}
```

---

### 📅 Meetings

#### GET `/api/stakeholders/meetings/:projectId`
Obtener reuniones de un proyecto

**Query Params:**
- `status` (opcional): `scheduled`, `completed`, `cancelled`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": 1,
      "title": "Reunión de Coordinación",
      "startTime": "2024-11-25T10:00:00",
      "endTime": "2024-11-25T11:00:00",
      "status": "scheduled",
      "createdAt": "2024-11-20T..."
    }
  ],
  "error": null
}
```

#### POST `/api/stakeholders/meetings`
Crear una nueva reunión

**Body:**
```json
{
  "projectId": 1,
  "title": "Reunión de Coordinación",
  "startTime": "2024-11-25T10:00:00",
  "endTime": "2024-11-25T11:00:00"
}
```

#### PUT `/api/stakeholders/meetings/:id/status`
Actualizar estado de una reunión

**Body:**
```json
{
  "status": "completed"
}
```

#### POST `/api/stakeholders/find-slots/:projectId`
Buscar slots óptimos para reunión

**Body:**
```json
{
  "stakeholderIds": ["uuid1", "uuid2", "uuid3"],
  "duration": 60,
  "daysAhead": 14
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "startTime": "2024-11-22T10:00:00",
      "endTime": "2024-11-22T11:00:00",
      "availableStakeholders": ["uuid1", "uuid2", "uuid3"],
      "score": 100,
      "reasons": [
        "Todos los stakeholders disponibles",
        "Horario laboral"
      ]
    }
  ],
  "error": null
}
```

---

## 🧪 Testing de Endpoints

### Usando cURL

#### Obtener milestones
```bash
curl http://localhost:3000/api/milestones/project/1
```

#### Crear milestone
```bash
curl -X POST http://localhost:3000/api/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "title": "Nueva Fase",
    "targetDate": "2025-01-15",
    "priority": "high"
  }'
```

#### Obtener métricas
```bash
curl http://localhost:3000/api/milestones/metrics/1
```

#### Obtener stakeholders
```bash
curl http://localhost:3000/api/stakeholders/project/1
```

#### Crear reunión
```bash
curl -X POST http://localhost:3000/api/stakeholders/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "title": "Reunión de Coordinación",
    "startTime": "2024-11-25T10:00:00",
    "endTime": "2024-11-25T11:00:00"
  }'
```

#### Buscar slots óptimos
```bash
curl -X POST http://localhost:3000/api/stakeholders/find-slots/1 \
  -H "Content-Type: application/json" \
  -d '{
    "stakeholderIds": ["uuid1", "uuid2"],
    "duration": 60,
    "daysAhead": 14
  }'
```

---

## 📊 Formato de Respuesta Estándar

Todas las respuestas siguen el formato:

```json
{
  "success": true|false,
  "data": {} | [] | null,
  "error": null | {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo"
  }
}
```

### Códigos de Error Comunes

- `VALIDATION_ERROR` - Datos de entrada inválidos
- `NOT_FOUND` - Recurso no encontrado
- `GET_*_ERROR` - Error al obtener datos
- `CREATE_*_ERROR` - Error al crear recurso
- `UPDATE_*_ERROR` - Error al actualizar recurso
- `DELETE_*_ERROR` - Error al eliminar recurso

---

## 🔐 Autenticación (Pendiente)

Actualmente los endpoints son públicos. Para añadir autenticación:

1. Importar middleware de autenticación
2. Añadir a las rutas:
```javascript
router.get('/project/:projectId', authMiddleware, getMilestonesByProject);
```

---

## 🚀 Estado de Implementación

| Módulo | Endpoints | Estado |
|--------|-----------|--------|
| **Milestones** | 5 endpoints | ✅ Completo |
| **Stakeholders** | 3 endpoints | ✅ Completo |
| **Meetings** | 4 endpoints | ✅ Completo |
| **Risks** | 0 endpoints | ⏳ Pendiente |
| **Deliverables** | 0 endpoints | ⏳ Pendiente |
| **Alerts** | 0 endpoints | ⏳ Pendiente |

**Total Implementado**: 12 endpoints funcionando

---

## 📝 Notas

- Todos los endpoints usan la base de datos `mi_nova_db`
- Los IDs de milestones, meetings y availability son UUIDs
- Los IDs de stakeholders y proyectos son integers (compatibilidad con tablas existentes)
- Las fechas se devuelven en formato ISO 8601
- Los horarios están en formato 24h (HH:mm:ss)

---

**Última actualización**: Noviembre 2024  
**Versión API**: 1.0.0  
**Base URL**: `http://localhost:3000`
