# 🔄 Migración NovaProject V1 → V2

## 📊 Cambios en Base de Datos

### ✅ Tablas Nuevas (V2)
- `weekly_reports` - Reportes semanales obligatorios
- (Añade otras tablas nuevas aquí)

### 🔧 Tablas Modificadas
- `deliverables` - ¿Se añadió alguna columna nueva?
- `risks` - ¿Cambió la estructura?
- `boards` - ¿Nuevos campos?

### ❌ Tablas Eliminadas
- (Si eliminaste alguna tabla de V1, listala aquí)

---

## 🛠️ Scripts de Migración Necesarios

### 1. `migrate-v1-to-v2.js`
**Propósito:** Script maestro que ejecuta todas las migraciones en orden.

### 2. `add-weekly-reports-table.js`
**Propósito:** Crear tabla `weekly_reports` si no existe.

### 3. `migrate-existing-data.js`
**Propósito:** Transformar datos de V1 al formato de V2 (si hay cambios de estructura).

---

## 📝 Checklist de Migración

- [ ] Hacer backup completo de la base de datos V1
- [ ] Ejecutar script de migración en entorno de prueba
- [ ] Verificar integridad de datos migrados
- [ ] Probar funcionalidades críticas en V2
- [ ] Ejecutar migración en producción
- [ ] Monitorear errores post-migración

---

## 🔐 Backup de Seguridad

```bash
# Exportar base de datos V1
mysqldump -u root -p novaproject_db > backup_v1_$(date +%Y%m%d).sql

# Restaurar si algo falla
mysql -u root -p novaproject_db < backup_v1_YYYYMMDD.sql
```
