# 🚀 Quick Start - Clon de Notion

## Inicio Rápido en 3 Pasos

### 1️⃣ Inicializar Base de Datos (Solo la primera vez)

```bash
cd backend
node src/scripts/init-documents-table.js
```

**Resultado esperado:**
```
📄 Inicializando tabla de documentos...
✅ Tabla de documentos creada exitosamente
✅ Documento de ejemplo creado
```

### 2️⃣ Iniciar Backend

```bash
cd backend
npm run dev
```

**Resultado esperado:**
```
🚀 Servidor corriendo en el puerto 3000
```

### 3️⃣ Iniciar Frontend

```bash
cd frontend
npm start
```

**Resultado esperado:**
```
** Angular Live Development Server is listening on localhost:4200 **
```

## 🎯 Acceder a la Aplicación

Abre tu navegador en: **http://localhost:4200/documents**

## ✨ Primeros Pasos

1. **Ver el documento de ejemplo** - Haz clic en "Mi Primer Documento" en el sidebar
2. **Crear un nuevo documento** - Haz clic en el botón "+ Nueva Página"
3. **Editar el título** - Haz clic en el título y escribe
4. **Usar el editor** - Escribe contenido y usa la barra de herramientas para formato
5. **Insertar base de datos** - Haz clic en "🗄️ Base de Datos" en la barra de herramientas
6. **Exportar a Excel** - Haz clic en "📊 Exportar" en cualquier base de datos

## 🎨 Características Principales

### Editor de Texto
- **B** = Negrita
- **I** = Cursiva
- **S** = Tachado
- **H1, H2** = Encabezados
- **• Lista** = Lista con viñetas
- **☐ Tareas** = Lista de tareas
- **⊞ Tabla** = Insertar tabla

### Base de Datos
- Edita celdas haciendo clic
- Cambia tipo de columna con el dropdown
- Añade filas con "+ Añadir Fila"
- Añade columnas con el botón "+"
- Exporta con "📊 Exportar"

### Autoguardado
- ⏳ Guardando... = Guardando cambios
- ✓ Guardado = Todo guardado
- ⚠ Error = Problema al guardar

## 🔧 Comandos Útiles

### Backend
```bash
# Desarrollo
npm run dev

# Ver logs de MySQL
# (depende de tu configuración)
```

### Frontend
```bash
# Desarrollo
npm start

# Build de producción
npm run build

# Linting
npm run lint
```

## 📝 Estructura de URLs

- `/documents` - Lista de documentos
- `/documents/:id` - Editar documento específico

## 🐛 Problemas Comunes

### "Cannot connect to database"
- Verifica que MySQL está corriendo
- Revisa las credenciales en `.env`
- Asegúrate de que la base de datos existe

### "404 Not Found" en API
- Verifica que el backend está corriendo en puerto 3000
- Revisa `proxy.conf.json` en el frontend

### El editor no se muestra
- Limpia caché del navegador
- Verifica que TipTap se instaló: `npm list @tiptap/core`
- Revisa la consola del navegador

### Warnings de @apply en SCSS
- Son normales con TailwindCSS
- No afectan la funcionalidad
- Puedes ignorarlos

## 📚 Más Información

Ver `NOTION_CLONE_GUIDE.md` para documentación completa.

## 🎉 ¡Disfruta!

Ya tienes tu clon de Notion funcionando. Empieza a crear documentos y organizar tu información.
