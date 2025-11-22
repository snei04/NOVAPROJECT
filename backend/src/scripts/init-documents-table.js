import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDocumentsTable() {
  try {
    console.log('📄 Inicializando tabla de documentos...');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../config/documents.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el SQL
    await pool.query(sql);

    console.log('✅ Tabla de documentos creada exitosamente');

    // Crear un documento de ejemplo
    const defaultContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Bienvenido a Documentos' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Este es tu primer documento. Puedes editarlo, crear nuevos documentos y organizar tu información.'
            }
          ]
        }
      ],
      databases: []
    };

    await pool.query(
      `INSERT INTO documents (title, content, icon) VALUES (?, ?, ?)`,
      ['Mi Primer Documento', JSON.stringify(defaultContent), '📝']
    );

    console.log('✅ Documento de ejemplo creado');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando tabla de documentos:', error);
    process.exit(1);
  }
}

initDocumentsTable();
