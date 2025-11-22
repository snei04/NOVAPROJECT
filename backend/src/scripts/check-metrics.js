import pool from '../config/database.js';

async function checkMetrics() {
  try {
    const projectId = 1; // Tu primer proyecto
    console.log(`📊 Calculando métricas para Proyecto ID: ${projectId}...\n`);

    // 1. Obtener milestones
    const [milestones] = await pool.query(
      'SELECT title, status, progress_percentage FROM project_milestones WHERE project_id = ?',
      [projectId]
    );

    console.log('📋 Milestones encontrados:');
    milestones.forEach(m => {
      console.log(`   - ${m.title}: ${m.progress_percentage}% (${m.status})`);
    });

    // 2. Calcular métricas (lógica del controller)
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const avgProgress = milestones.length > 0 
      ? milestones.reduce((sum, m) => sum + m.progress_percentage, 0) / milestones.length 
      : 0;

    const status = avgProgress >= 75 ? 'good' : avgProgress >= 50 ? 'warning' : 'critical';

    console.log('\n📈 Resultados Calculados:');
    console.log(`   - Progreso General: ${Math.round(avgProgress)}%`);
    console.log(`   - Estado: ${status.toUpperCase()}`);
    console.log(`   - Completados: ${completedMilestones}/${totalMilestones}`);

    console.log('\n💡 Cómo mejorar las métricas:');
    console.log('   Para ver cambios, actualiza el progreso de los milestones en la BD o vía API.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMetrics();
