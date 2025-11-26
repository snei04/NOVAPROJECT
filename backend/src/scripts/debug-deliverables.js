import pool from '../config/database.js';

const checkDeliverables = async () => {
  try {
    // 1. Verificar si la tabla existe
    const [tables] = await pool.query("SHOW TABLES LIKE 'deliverables'");
    if (tables.length === 0) {
      console.error('❌ LA TABLA deliverables NO EXISTE.');
    } else {
      console.log('✅ Tabla deliverables existe.');
      
      // 2. Ver estructura
      const [columns] = await pool.query("DESCRIBE deliverables");
      console.log('Estructura:', columns.map(c => c.Field));
      
      // 3. Probar un SELECT simple
      try {
        const [rows] = await pool.query("SELECT * FROM deliverables LIMIT 1");
        console.log('✅ SELECT funciona. Filas:', rows.length);
      } catch (err) {
        console.error('❌ Error en SELECT:', err.message);
      }
    }

  } catch (error) {
    console.error('Error general:', error);
  } finally {
    process.exit();
  }
};

checkDeliverables();
