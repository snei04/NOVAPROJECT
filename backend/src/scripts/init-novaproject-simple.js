import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generar UUID sin dependencias externas
function uuidv4() {
  return crypto.randomUUID();
}

async function initNovaProjectV2() {
  try {
    console.log('🚀 Inicializando NovaProject v2.0.0...');
    console.log('📦 Usando base de datos existente: mi_nova_db\n');

    // Leer el archivo SQL simplificado
    const sqlPath = path.join(__dirname, '../config/novaproject-v2-simple.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir en statements individuales
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Creando ${statements.length} tablas...\n`);

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await pool.query(statement);
          const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
          console.log(`✅ Tabla ${i + 1}/${statements.length}: ${tableName || 'creada'}`);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error(`⚠️  Error en statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('\n✅ Tablas creadas exitosamente\n');

    // Crear datos de ejemplo
    await createSampleData();

    console.log('\n🎉 NovaProject v2.0.0 inicializado exitosamente!\n');
    console.log('📊 Tablas creadas:');
    console.log('  ✅ project_metrics, project_milestones, weekly_reports');
    console.log('  ✅ stakeholders, stakeholder_availability, meetings');
    console.log('  ✅ risks, risk_controls');
    console.log('  ✅ deliverables, acceptance_criteria, alerts\n');
    console.log('💡 Accede a los módulos en:');
    console.log('  📊 /app/project-dashboard');
    console.log('  👥 /app/stakeholder-management');
    console.log('  ⚠️  /app/risk-management');
    console.log('  ✅ /app/deliverable-tracker\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando NovaProject v2.0.0:', error);
    process.exit(1);
  }
}

async function createSampleData() {
  console.log('📝 Creando datos de ejemplo...\n');

  try {
    // Obtener el primer board/proyecto
    const [boards] = await pool.query('SELECT id FROM boards LIMIT 1');
    
    if (boards.length === 0) {
      console.log('⚠️  No hay proyectos. Crea un board primero.');
      return;
    }

    const projectId = boards[0].id;
    console.log(`📋 Usando proyecto ID: ${projectId}\n`);

    // 1. Crear milestones
    const milestones = [
      { title: 'Fase 1: Análisis y Diseño', days: 14, progress: 60, priority: 'high' },
      { title: 'Fase 2: Desarrollo Core', days: 35, progress: 0, priority: 'high' },
      { title: 'Fase 3: Testing y QA', days: 56, progress: 0, priority: 'medium' },
      { title: 'Fase 4: Despliegue', days: 70, progress: 0, priority: 'critical' }
    ];

    for (const m of milestones) {
      await pool.query(`
        INSERT INTO project_milestones (id, project_id, title, target_date, status, priority, progress_percentage)
        VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?)
      `, [uuidv4(), projectId, m.title, m.days, m.progress > 0 ? 'in_progress' : 'pending', m.priority, m.progress]);
    }
    console.log('✅ 4 Milestones creados');

    // 2. Crear stakeholders
    const stakeholders = [
      { name: 'Juan Pérez', role: 'VP Tecnología', email: 'juan.perez@company.com', priority: 'critical' },
      { name: 'María García', role: 'Project Manager', email: 'maria.garcia@company.com', priority: 'high' },
      { name: 'Carlos López', role: 'Tech Lead', email: 'carlos.lopez@company.com', priority: 'high' },
      { name: 'Ana Martínez', role: 'QA Manager', email: 'ana.martinez@company.com', priority: 'medium' }
    ];

    const stakeholderIds = [];
    for (const sh of stakeholders) {
      const shId = uuidv4();
      stakeholderIds.push(shId);
      await pool.query(`
        INSERT INTO stakeholders (id, project_id, name, role, email, priority, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [shId, projectId, sh.name, sh.role, sh.email, sh.priority, `https://ui-avatars.com/api/?name=${encodeURIComponent(sh.name)}`]);
      
      // Añadir disponibilidad Lun-Vie 9-17
      for (let day = 1; day <= 5; day++) {
        await pool.query(`
          INSERT INTO stakeholder_availability (id, stakeholder_id, day_of_week, start_time, end_time)
          VALUES (?, ?, ?, '09:00:00', '17:00:00')
        `, [uuidv4(), shId, day]);
      }
    }
    console.log('✅ 4 Stakeholders creados con disponibilidad');

    // 3. Crear riesgos
    const risks = [
      { title: 'Retraso en entrega de diseños', desc: 'El equipo de diseño está sobrecargado', cat: 'schedule', prob: 'high', impact: 'high' },
      { title: 'Falta de disponibilidad de stakeholder clave', desc: 'VP en vacaciones durante fase crítica', cat: 'resource', prob: 'medium', impact: 'high' },
      { title: 'Dependencia de API externa', desc: 'API de terceros podría tener downtime', cat: 'technical', prob: 'low', impact: 'medium' }
    ];

    for (const r of risks) {
      const riskId = uuidv4();
      await pool.query(`
        INSERT INTO risks (id, project_id, title, description, category, probability, impact, identified_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
      `, [riskId, projectId, r.title, r.desc, r.cat, r.prob, r.impact]);
      
      // Añadir un control
      await pool.query(`
        INSERT INTO risk_controls (id, risk_id, description, due_date, status)
        VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'planned')
      `, [uuidv4(), riskId, `Control para: ${r.title}`]);
    }
    console.log('✅ 3 Riesgos creados con controles');

    // 4. Crear deliverables
    const deliverables = [
      { title: 'Documento de Arquitectura', desc: 'Diseño completo de la arquitectura', days: 7, progress: 75 },
      { title: 'Prototipo UI/UX', desc: 'Prototipo interactivo de pantallas', days: 14, progress: 50 },
      { title: 'API REST v1', desc: 'Implementación de endpoints principales', days: 21, progress: 0 }
    ];

    for (const d of deliverables) {
      const delivId = uuidv4();
      await pool.query(`
        INSERT INTO deliverables (id, project_id, title, description, planned_end_date, status, progress_percentage, quality_score)
        VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?)
      `, [delivId, projectId, d.title, d.desc, d.days, d.progress > 0 ? 'in_progress' : 'not_started', d.progress, d.progress * 0.9]);
      
      // Añadir criterios solo al primero
      if (d.progress > 0) {
        const criteria = [
          'Incluye diagrama de componentes completo',
          'Documenta patrones de diseño utilizados',
          'Especifica tecnologías y versiones'
        ];
        for (let i = 0; i < criteria.length; i++) {
          await pool.query(`
            INSERT INTO acceptance_criteria (id, deliverable_id, criterion_text, is_met, weight)
            VALUES (?, ?, ?, ?, ?)
          `, [uuidv4(), delivId, criteria[i], i < 2, 2]);
        }
      }
    }
    console.log('✅ 3 Deliverables creados con criterios');

    // 5. Crear métricas
    const metrics = [
      { type: 'progress', name: 'Progreso General', value: 45, target: 100, unit: '%' },
      { type: 'deliverables', name: 'Entregables Completados', value: 2, target: 8, unit: 'items' },
      { type: 'risks', name: 'Riesgos Activos', value: 3, target: 0, unit: 'items' },
      { type: 'quality', name: 'Quality Score Promedio', value: 75, target: 90, unit: '%' }
    ];

    for (const m of metrics) {
      await pool.query(`
        INSERT INTO project_metrics (id, project_id, metric_type, metric_name, current_value, target_value, unit, trend, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'up', 'good')
      `, [uuidv4(), projectId, m.type, m.name, m.value, m.target, m.unit]);
    }
    console.log('✅ 4 Métricas creadas');

    // 6. Crear reporte semanal
    const weekNumber = Math.ceil((new Date().getDate()) / 7);
    await pool.query(`
      INSERT INTO weekly_reports (id, project_id, week_number, year, report_date, progress_summary, tasks_completed, tasks_planned, completion_rate)
      VALUES (?, ?, ?, YEAR(CURDATE()), CURDATE(), ?, 8, 10, 80.00)
    `, [uuidv4(), projectId, weekNumber, 'Semana productiva con avances significativos en diseño de arquitectura']);
    console.log('✅ 1 Reporte semanal creado');

    console.log('\n✅ Datos de ejemplo creados exitosamente');
  } catch (error) {
    console.error('⚠️  Error creando datos de ejemplo:', error.message);
  }
}

initNovaProjectV2();
