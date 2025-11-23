-- Actualización del esquema para soportar las nuevas funcionalidades del Frontend v2.1.0

-- --------------------------------------------------------
-- 1. Actualizar Tabla DELIVERABLES
-- --------------------------------------------------------

-- Cambiar status para soportar 'rejected' y otros estados del frontend
ALTER TABLE deliverables MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending';

-- Añadir columna 'type' (document, code, design, etc.)
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'document';

-- Añadir columna 'evidence_link'
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS evidence_link VARCHAR(500);

-- Asegurar columna 'due_date' (mapeada desde planned_end_date si existe)
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS due_date DATE;
-- Migrar datos existentes si planned_end_date existe
UPDATE deliverables SET due_date = planned_end_date WHERE due_date IS NULL AND planned_end_date IS NOT NULL;

-- --------------------------------------------------------
-- 2. Actualizar Tabla RISKS
-- --------------------------------------------------------

-- Cambiar probabilidad e impacto a INT (1-5) como espera el Frontend
ALTER TABLE risks MODIFY COLUMN probability INT DEFAULT 1;
ALTER TABLE risks MODIFY COLUMN impact INT DEFAULT 1;

-- --------------------------------------------------------
-- 3. Crear Tabla DOCUMENTS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_documents (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Asegurar Tabla ALERTS (si no existe)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  severity ENUM('info', 'warning', 'critical') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_alerts (project_id, is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
