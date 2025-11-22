# 📂 Scripts de Base de Datos - NovaProject

Esta carpeta contiene scripts de mantenimiento, migración y utilidades para la base de datos.

## 🎯 ¿Qué son los Scripts?

Los scripts son programas Node.js que se ejecutan **manualmente** (no son parte del servidor web) para:
- Crear/modificar tablas
- Migrar datos entre versiones
- Poblar datos de prueba
- Reparar inconsistencias

## 📋 Scripts Disponibles

### 🔧 Mantenimiento

#### `create-weekly-reports.js`
Crea la tabla `weekly_reports` si no existe.
```bash
node src/scripts/create-weekly-reports.js
```

#### `recreate-weekly-reports.js`
**⚠️ DESTRUCTIVO:** Elimina y recrea la tabla `weekly_reports` (pierdes datos).
```bash
node src/scripts/recreate-weekly-reports.js
```

#### `debug-risks.js`
Muestra la estructura y datos de la tabla `risks` para debugging.
```bash
node src/scripts/debug-risks.js
```

---

### 🚀 Migración

#### `migrate-v1-to-v2.js` ⭐
**Script maestro** que actualiza tu base de datos de V1 a V2.

**Pasos para ejecutar:**

1. **Hacer backup OBLIGATORIO:**
   ```bash
   mysqldump -u root -p novaproject_db > backup_v1_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Ejecutar migración:**
   ```bash
   cd backend
   node src/scripts/migrate-v1-to-v2.js
   ```

3. **Verificar resultado:**
   - El script te dirá si la migración fue exitosa.
   - Reinicia el servidor: `npm run dev`
   - Prueba crear un reporte semanal en el Dashboard.

4. **Si algo falla, restaurar backup:**
   ```bash
   mysql -u root -p novaproject_db < backup_v1_YYYYMMDD_HHMMSS.sql
   ```

**¿Qué hace este script?**
- ✅ Verifica la versión actual de tu base de datos
- ✅ Crea tabla `weekly_reports` con todas las columnas necesarias
- ✅ Añade columnas faltantes a tablas existentes (ej: `evidence_link`)
- ✅ Registra la versión V2 en tabla `schema_version`
- ✅ Verifica integridad antes de confirmar cambios

---

## 🛠️ Crear un Script Nuevo

### Plantilla Básica

```javascript
import pool from '../config/database.js';

const myScript = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Iniciando script...');
    
    // Tu código SQL aquí
    await connection.query('SELECT * FROM boards');
    
    console.log('✅ Script completado.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

myScript();
```

### Ejecutar tu script

```bash
node src/scripts/mi-script.js
```

---

## 📊 Tabla de Versiones

El script de migración crea una tabla `schema_version` que registra todas las migraciones:

| version | description                    | applied_at          |
|---------|--------------------------------|---------------------|
| 1       | Base V1                        | 2025-01-15 10:00:00 |
| 2       | V2: Weekly Reports + Dashboard | 2025-01-20 14:30:00 |

**Consultar versión actual:**
```sql
SELECT * FROM schema_version ORDER BY applied_at DESC LIMIT 1;
```

---

## ⚠️ Mejores Prácticas

### ✅ SIEMPRE hacer backup antes de:
- Ejecutar scripts de migración
- Modificar estructura de tablas
- Eliminar datos

### ✅ Probar en entorno local primero:
```bash
# 1. Clonar base de datos de producción
mysqldump -u root -p novaproject_prod > prod_backup.sql
mysql -u root -p novaproject_dev < prod_backup.sql

# 2. Probar migración en dev
node src/scripts/migrate-v1-to-v2.js

# 3. Si funciona, ejecutar en producción
```

### ✅ Verificar después de migrar:
```bash
# Contar registros en tablas críticas
mysql -u root -p novaproject_db -e "
  SELECT 'boards' AS tabla, COUNT(*) AS registros FROM boards
  UNION ALL
  SELECT 'deliverables', COUNT(*) FROM deliverables
  UNION ALL
  SELECT 'risks', COUNT(*) FROM risks
  UNION ALL
  SELECT 'weekly_reports', COUNT(*) FROM weekly_reports;
"
```

---

## 🆘 Solución de Problemas

### Error: "Unknown column 'achievements'"
**Causa:** Tabla `weekly_reports` tiene estructura antigua.
**Solución:**
```bash
node src/scripts/recreate-weekly-reports.js
```

### Error: "Table 'weekly_reports' doesn't exist"
**Causa:** Tabla no se ha creado.
**Solución:**
```bash
node src/scripts/create-weekly-reports.js
```

### Error: "Cannot add foreign key constraint"
**Causa:** Proyecto referenciado no existe en tabla `boards`.
**Solución:** Verifica que el `project_id` exista:
```sql
SELECT id, title FROM boards WHERE id = <tu_project_id>;
```

---

## 📚 Recursos Adicionales

- [Documentación MySQL](https://dev.mysql.com/doc/)
- [Guía de Migraciones](../../../MIGRATION_V1_TO_V2.md)
- [Troubleshooting Backend](../../../backend-error.log)
