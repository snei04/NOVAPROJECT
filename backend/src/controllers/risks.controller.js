import pool from '../config/database.js';

export const getRisksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const [risks] = await pool.query(`
      SELECT r.*, u.nombre as ownerName, u.avatar as ownerAvatar
      FROM risks r
      LEFT JOIN usuarios u ON r.owner_id = u.id
      WHERE r.project_id = ?
      ORDER BY r.severity DESC
    `, [projectId]);
    res.json(risks);
  } catch (error) {
    console.error('Error obteniendo riesgos:', error);
    res.status(500).json({ message: 'Error al obtener riesgos' });
  }
};

export const createRisk = async (req, res) => {
  try {
    const { projectId, title, description, probability, impact, mitigationPlan, ownerId } = req.body;
    
    if (!projectId || !title || !probability || !impact) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const severity = probability * impact;

    const [result] = await pool.query(
      'INSERT INTO risks (project_id, title, description, probability, impact, severity, mitigation_plan, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, title, description, probability, impact, severity, mitigationPlan, ownerId]
    );
    
    // Devolver el objeto creado
    const [newRisk] = await pool.query('SELECT * FROM risks WHERE id = ?', [result.insertId]);
    res.status(201).json(newRisk[0]);
  } catch (error) {
    console.error('Error creando riesgo:', error);
    res.status(500).json({ message: 'Error al crear riesgo' });
  }
};

export const updateRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 1. Obtener riesgo actual
    const [rows] = await pool.query('SELECT * FROM risks WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Riesgo no encontrado' });
    const currentRisk = rows[0];

    // 2. Recalcular severity si es necesario
    let severity = currentRisk.severity;
    if (updates.probability !== undefined || updates.impact !== undefined) {
        const p = updates.probability !== undefined ? Number(updates.probability) : currentRisk.probability;
        const i = updates.impact !== undefined ? Number(updates.impact) : currentRisk.impact;
        severity = p * i;
    }
    
    // 3. Construir query dinámico
    const fields = [];
    const values = [];
    
    const allowedFields = ['title', 'description', 'probability', 'impact', 'status', 'mitigation_plan', 'owner_id'];
    
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
         let dbField = key;
         if (key === 'mitigationPlan') dbField = 'mitigation_plan';
         if (key === 'ownerId') dbField = 'owner_id';
         
         fields.push(`${dbField} = ?`);
         values.push(updates[key]);
      }
    }
    
    // Añadir severity si cambió
    if (severity !== currentRisk.severity) {
        fields.push('severity = ?');
        values.push(severity);
    }
    
    if (fields.length === 0) return res.json(currentRisk);
    
    values.push(id);
    
    await pool.query(`UPDATE risks SET ${fields.join(', ')} WHERE id = ?`, values);
    
    const [updatedRisk] = await pool.query('SELECT * FROM risks WHERE id = ?', [id]);
    res.json(updatedRisk[0]);
  } catch (error) {
    console.error('Error actualizando riesgo:', error);
    res.status(500).json({ message: 'Error al actualizar riesgo' });
  }
};

export const deleteRisk = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM risks WHERE id = ?', [id]);
    res.json({ message: 'Riesgo eliminado' });
  } catch (error) {
    console.error('Error eliminando riesgo:', error);
    res.status(500).json({ message: 'Error al eliminar riesgo' });
  }
};
