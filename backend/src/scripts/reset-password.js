import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

async function resetUserPassword() {
  try {
    const email = 'sneider.fuquen@imevi.co';
    const newPassword = '123456';
    
    console.log(`🔄 Reseteando contraseña para ${email}...`);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await pool.query('UPDATE usuarios SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    console.log('✅ Contraseña actualizada exitosamente a: 123456');
    console.log('👉 Intenta iniciar sesión ahora con este email y contraseña.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetUserPassword();
