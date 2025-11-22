import pool from '../config/database.js';

export const getProjectDashboard = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. Entregables (Progreso)
    const [deliverables] = await pool.query('SELECT status, progress FROM deliverables WHERE project_id = ?', [projectId]);
    const totalDeliv = deliverables.length;
    const completedDeliv = deliverables.filter(d => d.status === 'approved').length;
    const avgProgress = totalDeliv > 0 
        ? Math.round(deliverables.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0) / totalDeliv) 
        : 0;

    // 2. Riesgos (Alertas)
    const [risks] = await pool.query('SELECT severity, status FROM risks WHERE project_id = ?', [projectId]);
    const activeRisks = risks.filter(r => r.status !== 'closed');
    console.log(`Dashboard Proj ${projectId}: ${risks.length} riesgos encontrados, ${activeRisks.length} activos.`);
    
    const criticalRisks = activeRisks.filter(r => r.severity >= 15).length;

    // 3. Reportes Semanales
    const [reports] = await pool.query('SELECT * FROM weekly_reports WHERE project_id = ? ORDER BY year DESC, week_number DESC', [projectId]);
    
    // 4. Calcular Tendencia Real
    let trend = 'stable';
    if (reports.length > 0) {
        const lastProgress = Number(reports[0].progress_snapshot) || 0;
        if (avgProgress > lastProgress) trend = 'improving'; // Mejorando
        else if (avgProgress < lastProgress) trend = 'worsening'; // Empeorando
    } else if (avgProgress > 0) {
        trend = 'improving'; // Si hay progreso y no hay reportes, es mejora inicial
    }

    // 5. Timeline (Próximos entregables ordenados por fecha)
    const [timeline] = await pool.query(
        'SELECT id, title, due_date, status, progress FROM deliverables WHERE project_id = ? AND due_date IS NOT NULL ORDER BY due_date ASC LIMIT 6',
        [projectId]
    );

    res.json({
        progress: {
            percent: avgProgress,
            deliverables: { total: totalDeliv, completed: completedDeliv },
            trend: trend
        },
        timeline: timeline,
        alerts: {
            criticalRisks,
            totalRisks: activeRisks.length
        },
        weeklyReports: {
            total: reports.length,
            lastReport: reports[0] || null,
            history: reports
        }
    });

  } catch (error) {
    console.error('Error dashboard:', error);
    res.status(500).json({ message: 'Error obteniendo datos del dashboard' });
  }
};

export const createWeeklyReport = async (req, res) => {
  try {
    console.log('Recibiendo petición createWeeklyReport:', req.body);
    const { projectId, weekNumber, year, achievements, challenges, goals, progressSnapshot } = req.body;
    
    // Validar datos mínimos
    if (!projectId || !weekNumber || !year) {
        console.error('Faltan datos requeridos');
        return res.status(400).json({ message: 'Faltan datos requeridos (projectId, weekNumber, year)' });
    }

    const [result] = await pool.query(
      'INSERT INTO weekly_reports (project_id, week_number, year, achievements, challenges, goals_next_week, progress_snapshot, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, weekNumber, year, achievements || '', challenges || '', goals || '', progressSnapshot || 0, 'submitted']
    );
    
    console.log('Reporte creado con ID:', result.insertId);
    res.status(201).json({ message: 'Reporte creado', id: result.insertId });
  } catch (error) {
    console.error('Error creando reporte (SQL/Server):', error);
    res.status(500).json({ message: 'Error creando reporte: ' + error.message });
  }
};
