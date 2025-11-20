import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('✅ ¡Conexión a la base de datos MySQL establecida exitosamente!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar con la base de datos:', err.sqlMessage);
    });

export default pool;