# 🚀 NovaProject v2.0.0 - Inicio Rápido

## ⚡ Instalación en 3 Pasos

### 1️⃣ Inicializar Base de Datos

```bash
cd backend
npm run init:novaproject
```

✅ **Esto creará**:
- 20 tablas nuevas para las 4 soluciones
- Datos de ejemplo (milestones, stakeholders, riesgos, deliverables)
- Triggers automáticos para alertas
- Vistas de reporte

### 2️⃣ Iniciar Servidores

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

### 3️⃣ Acceder a los Módulos

Abre tu navegador en:

- 📊 **Dashboard**: http://localhost:4200/app/project-dashboard
- 👥 **Stakeholders**: http://localhost:4200/app/stakeholder-management  
- ⚠️ **Riesgos**: http://localhost:4200/app/risk-management
- ✅ **Deliverables**: http://localhost:4200/app/deliverable-tracker

---

## 🎯 Qué Verás en Cada Módulo

### 📊 Dashboard de Progreso

**Funcionalidades inmediatas**:
- ✅ 4 métricas principales (Progreso, Entregables, Riesgos, Reportes)
- ✅ Timeline con 4 milestones de ejemplo
- ✅ Comparación vs proyecto IMEVI
- ✅ Alertas críticas (si hay riesgos altos)

**Acciones disponibles**:
- 📋 Generar Reporte Semanal
- 📊 Exportar Métricas
- ➕ Crear nuevo milestone
- 📝 Actualizar progreso

### 👥 Gestión de Stakeholders

**Funcionalidades inmediatas**:
- ✅ 4 stakeholders de ejemplo
- ✅ Calendario con disponibilidad (Lun-Vie 9-17h)
- ✅ Métricas de eficiencia
- ✅ Búsqueda de slots óptimos

**Acciones disponibles**:
- 📅 Agendar Reunión
- 🤖 Buscar Slots Óptimos (algoritmo inteligente)
- ➕ Añadir stakeholder
- 📧 Enviar invitaciones

### ⚠️ Risk Management

**Funcionalidades inmediatas**:
- ✅ 3 riesgos de ejemplo con scoring automático
- ✅ Matriz de riesgos visual
- ✅ Controles asignados
- ✅ Alertas automáticas para riesgos críticos

**Acciones disponibles**:
- ➕ Identificar nuevo riesgo
- 🛡️ Añadir control/mitigación
- 📊 Ver matriz de riesgos
- 🚨 Escalar riesgo crítico

### ✅ Deliverable Tracker

**Funcionalidades inmediatas**:
- ✅ 3 deliverables de ejemplo
- ✅ Criterios de aceptación trackables
- ✅ Quality score automático (75% en ejemplo)
- ✅ Workflow de revisión

**Acciones disponibles**:
- ➕ Crear deliverable
- ✓ Marcar criterio como cumplido
- 👁️ Solicitar revisión
- 📊 Ver quality score

---

## 💡 Casos de Uso Rápidos

### Caso 1: Crear un Nuevo Milestone

1. Ve al **Dashboard de Progreso**
2. Scroll hasta "Timeline Visual"
3. Clic en "➕ Añadir Milestone"
4. Completa:
   - Título: "Fase 5: Lanzamiento"
   - Fecha objetivo: +80 días
   - Prioridad: Critical
5. Guarda y verás el milestone en el timeline

### Caso 2: Agendar Reunión con Stakeholders

1. Ve a **Gestión de Stakeholders**
2. Selecciona stakeholders en los filtros
3. Clic en "🤖 Buscar Slots Óptimos"
4. El sistema mostrará los mejores horarios con score
5. Clic en "📅 Agendar Este Slot"
6. La reunión aparecerá en el calendario

### Caso 3: Identificar un Riesgo

1. Ve a **Risk Management**
2. Clic en "➕ Identificar Riesgo"
3. Completa:
   - Título: "Dependencia de servicio externo"
   - Categoría: Technical
   - Probabilidad: High
   - Impacto: Medium
4. El sistema calculará automáticamente:
   - Risk Score: 12 (High × Medium = 4 × 3)
   - Prioridad: High
5. Si score ≥ 15, se crea alerta automática

### Caso 4: Trackear Calidad de Deliverable

1. Ve a **Deliverable Tracker**
2. Selecciona un deliverable
3. Ve a "Criterios de Aceptación"
4. Marca criterios como cumplidos
5. El Quality Score se actualiza automáticamente:
   - Formula: (Criterios cumplidos × peso) / Total pesos × 100
6. El estado cambia según el score:
   - ≥90%: Excellent
   - 75-89%: Good
   - 60-74%: Acceptable
   - <60%: Needs improvement

---

## 📊 Datos de Ejemplo Incluidos

### Milestones (4)
- Fase 1: Análisis y Diseño (60% completado)
- Fase 2: Desarrollo Core (pendiente)
- Fase 3: Testing y QA (pendiente)
- Fase 4: Despliegue (pendiente)

### Stakeholders (4)
- Juan Pérez (VP Tecnología) - Prioridad: Critical
- María García (Project Manager) - Prioridad: High
- Carlos López (Tech Lead) - Prioridad: High
- Ana Martínez (QA Manager) - Prioridad: Medium

### Riesgos (3)
- Retraso en entrega de diseños (Score: 16 - Critical)
- Falta de disponibilidad de stakeholder (Score: 12 - High)
- Dependencia de API externa (Score: 4 - Medium)

### Deliverables (3)
- Documento de Arquitectura (75% progreso, 75% quality)
- Prototipo UI/UX (50% progreso)
- API REST v1 (0% progreso)

---

## 🎯 Métricas que Verás

### Dashboard Principal

```
📈 Progreso General: 45%
   vs IMEVI: +60% mejora en seguimiento

✅ Entregables: 2/8 completados
   vs IMEVI: +30% calidad

⚠️ Riesgos Activos: 3
   vs IMEVI: -40% retrasos esperados

📋 Reportes Semanales: 1
   vs IMEVI: +2100% (3 en 9 semanas → automático)
```

### Stakeholder Management

```
👥 Stakeholders Activos: 4
✅ Disponibles Ahora: 2
📅 Reuniones Próximas: 0
📊 Eficiencia Agendamiento: 85%
   vs IMEVI: +50% optimización
```

---

## 🔧 Comandos Útiles

### Backend
```bash
# Desarrollo
npm run dev

# Reinicializar BD
npm run init:novaproject

# Ver logs
tail -f debug.log
```

### Frontend
```bash
# Desarrollo
npm start

# Build producción
npm run build

# Linting
npm run lint
```

### Base de Datos
```bash
# Conectar a MySQL
mysql -u root -p

# Ver tablas creadas
USE your_database;
SHOW TABLES LIKE '%project%';
SHOW TABLES LIKE '%stakeholder%';
SHOW TABLES LIKE '%risk%';
SHOW TABLES LIKE '%deliverable%';

# Ver datos de ejemplo
SELECT * FROM project_milestones;
SELECT * FROM stakeholders;
SELECT * FROM risks;
SELECT * FROM deliverables;
```

---

## 🐛 Problemas Comunes

### "No se ven los datos"
```bash
# Verificar que se inicializó la BD
npm run init:novaproject

# Verificar que el backend está corriendo
curl http://localhost:3000/api/metrics/PROJECT_ID
```

### "Error al agendar reunión"
- Verifica que hay stakeholders con disponibilidad
- Verifica que seleccionaste al menos 1 stakeholder
- Verifica que el horario está dentro de disponibilidad

### "Quality score no se actualiza"
- El trigger se ejecuta automáticamente al marcar criterios
- Verifica que el deliverable tiene criterios definidos
- Refresca la página para ver cambios

---

## 📈 Próximos Pasos

1. **Personaliza los datos**: Reemplaza datos de ejemplo con tu proyecto real
2. **Configura alertas**: Ajusta umbrales de alertas según tu equipo
3. **Integra con calendario**: Conecta con Google Calendar o Outlook
4. **Exporta reportes**: Usa funciones de exportación para stakeholders
5. **Capacita al equipo**: Usa esta guía para onboarding

---

## 🎉 ¡Listo!

Ya tienes NovaProject v2.0.0 funcionando con:

- ✅ Dashboard de progreso en tiempo real
- ✅ Gestión inteligente de stakeholders
- ✅ Risk management proactivo
- ✅ Tracking de calidad automático

**Resultado**: Proyectos más rápidos, eficientes y de mayor calidad.

---

**¿Necesitas ayuda?** Ver `NOVAPROJECT_V2_README.md` para documentación completa.
