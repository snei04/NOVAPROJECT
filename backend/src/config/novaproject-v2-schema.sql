-- ============================================
-- NOVAPROJECT V2.0.0 - SCHEMA COMPLETO
-- Soluciones para problemas identificados en IMEVI
-- ============================================

-- 1. DASHBOARD DE PROGRESO - Métricas y KPIs
-- ============================================

CREATE TABLE IF NOT EXISTS project_metrics (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(36) NOT NULL,
  metric_type ENUM('progress', 'deliverables', 'risks', 'quality', 'stakeholders') NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2),
  unit VARCHAR(20),
  trend ENUM('up', 'down', 'stable') DEFAULT 'stable',
  status ENUM('good', 'warning', 'critical') DEFAULT 'good',
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  
  INDEX idx_project_metrics (project_id, metric_type),
  INDEX idx_recorded_at (recorded_at),
  FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_milestones (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  actual_date DATE,
  status ENUM('pending', 'in_progress', 'completed', 'delayed', 'cancelled') DEFAULT 'pending',
  progress_percentage INT DEFAULT 0,
  priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
  dependencies JSON, -- Array de IDs de otros milestones
  responsible_user_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_milestones (project_id, status),
  INDEX idx_target_date (target_date),
  FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS weekly_reports (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(36) NOT NULL,
  week_number INT NOT NULL,
  year INT NOT NULL,
  report_date DATE NOT NULL,
  submitted_by VARCHAR(36) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contenido del reporte
  progress_summary TEXT NOT NULL,
  completed_tasks JSON, -- Array de task IDs
  blockers JSON, -- Array de {description, severity, owner}
  next_week_goals JSON, -- Array de objetivos
  risks_identified JSON, -- Array de risk IDs
  
  -- Métricas de la semana
  tasks_completed INT DEFAULT 0,
  tasks_planned INT DEFAULT 0,
  completion_rate DECIMAL(5,2),
  
  -- Estado
  status ENUM('draft', 'submitted', 'reviewed', 'approved') DEFAULT 'submitted',
  reviewed_by VARCHAR(36),
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_project_week (project_id, week_number, year),
  INDEX idx_project_reports (project_id, year, week_number),
  FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. GESTIÓN DE STAKEHOLDERS - Disponibilidad y Agendamiento
-- ============================================

CREATE TABLE IF NOT EXISTS stakeholders (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar VARCHAR(500),
  
  -- Prioridad y clasificación
  priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
  influence_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
  interest_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
  
  -- Información de contacto preferida
  preferred_contact_method ENUM('email', 'phone', 'teams', 'slack') DEFAULT 'email',
  timezone VARCHAR(50) DEFAULT 'America/Bogota',
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  last_interaction_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_stakeholders (project_id, is_active),
  INDEX idx_priority (priority),
  FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stakeholder_availability (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  stakeholder_id VARCHAR(36) NOT NULL,
  
  -- Disponibilidad recurrente
  day_of_week INT NOT NULL, -- 0=Domingo, 1=Lunes, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Excepciones (vacaciones, días festivos, etc.)
  exception_dates JSON, -- Array de fechas no disponibles
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_stakeholder_availability (stakeholder_id, is_active),
  FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meetings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_type ENUM('planning', 'review', 'interview', 'status', 'other') DEFAULT 'planning',
  
  -- Fecha y hora
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Bogota',
  
  -- Ubicación
  location VARCHAR(255),
  meeting_link VARCHAR(500),
  
  -- Prioridad y estado
  priority ENUM('urgent', 'high', 'normal', 'low') DEFAULT 'normal',
  status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  
  -- Organización
  organizer_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  
  -- Recordatorios
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_meetings (project_id, status),
  INDEX idx_start_time (start_time),
  FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meeting_attendees (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  meeting_id VARCHAR(36) NOT NULL,
  stakeholder_id VARCHAR(36) NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  attendance_status ENUM('pending', 'accepted', 'declined', 'tentative', 'attended', 'no_show') DEFAULT 'pending',
  response_date TIMESTAMP,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_meeting_attendee (meeting_id, stakeholder_id),
  INDEX idx_meeting_attendees (meeting_id),
  INDEX idx_stakeholder_meetings (stakeholder_id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. RISK MANAGEMENT INTELIGENTE
-- ============================================

CREATE TABLE IF NOT EXISTS risks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('technical', 'resource', 'schedule', 'budget', 'stakeholder', 'quality', 'external') NOT NULL,
  
  -- Scoring automático
  probability ENUM('very_low', 'low', 'medium', 'high', 'very_high') NOT NULL,
  impact ENUM('very_low', 'low', 'medium', 'high', 'very_high') NOT NULL,
  risk_score INT GENERATED ALWAYS AS (
    (CASE probability
      WHEN 'very_low' THEN 1
      WHEN 'low' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'high' THEN 4
      WHEN 'very_high' THEN 5
    END) *
    (CASE impact
      WHEN 'very_low' THEN 1
      WHEN 'low' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'high' THEN 4
      WHEN 'very_high' THEN 5
    END)
  ) STORED,
  
  -- Estado y seguimiento
  status ENUM('identified', 'analyzing', 'mitigating', 'monitoring', 'closed', 'occurred') DEFAULT 'identified',
  priority ENUM('critical', 'high', 'medium', 'low') GENERATED ALWAYS AS (
    CASE
      WHEN risk_score >= 15 THEN 'critical'
      WHEN risk_score >= 9 THEN 'high'
      WHEN risk_score >= 4 THEN 'medium'
      ELSE 'low'
    END
  ) STORED,
  
  -- Responsables
  identified_by VARCHAR(36) NOT NULL,
  owner_id VARCHAR(36),
  
  -- Fechas
  identified_date DATE NOT NULL,
  target_resolution_date DATE,
  actual_resolution_date DATE,
  last_review_date DATE,
  next_review_date DATE,
  
  -- Escalation
  escalated BOOLEAN DEFAULT FALSE,
  escalated_to VARCHAR(36),
  escalation_date TIMESTAMP,
  escalation_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_risks (project_id, status),
  INDEX idx_risk_score (risk_score DESC),
  INDEX idx_priority (priority),
  FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS risk_controls (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  risk_id VARCHAR(36) NOT NULL,
  control_type ENUM('preventive', 'detective', 'corrective', 'contingency') NOT NULL,
  description TEXT NOT NULL,
  
  -- Responsable y fechas
  responsible_id VARCHAR(36) NOT NULL,
  due_date DATE NOT NULL,
  completion_date DATE,
  
  -- Estado
  status ENUM('planned', 'in_progress', 'completed', 'cancelled', 'overdue') DEFAULT 'planned',
  effectiveness ENUM('not_assessed', 'ineffective', 'partially_effective', 'effective', 'highly_effective') DEFAULT 'not_assessed',
  
  -- Costos
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_risk_controls (risk_id, status),
  INDEX idx_due_date (due_date),
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. DELIVERABLE TRACKER AVANZADO
-- ============================================

CREATE TABLE IF NOT EXISTS deliverables (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deliverable_type ENUM('document', 'software', 'design', 'report', 'presentation', 'other') NOT NULL,
  
  -- Fechas
  planned_start_date DATE,
  planned_end_date DATE NOT NULL,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Estado y progreso
  status ENUM('not_started', 'in_progress', 'in_review', 'approved', 'rejected', 'delivered') DEFAULT 'not_started',
  progress_percentage INT DEFAULT 0,
  
  -- Responsables
  owner_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  
  -- Quality scoring
  quality_score DECIMAL(5,2), -- Calculado automáticamente
  quality_status ENUM('excellent', 'good', 'acceptable', 'poor', 'unacceptable'),
  
  -- Archivos y enlaces
  file_url VARCHAR(500),
  repository_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_deliverables (project_id, status),
  INDEX idx_planned_end_date (planned_end_date),
  FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS acceptance_criteria (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  deliverable_id VARCHAR(36) NOT NULL,
  criterion_text TEXT NOT NULL,
  priority ENUM('must_have', 'should_have', 'nice_to_have') DEFAULT 'must_have',
  
  -- Estado de cumplimiento
  is_met BOOLEAN DEFAULT FALSE,
  verification_method ENUM('inspection', 'testing', 'demonstration', 'analysis') NOT NULL,
  verified_by VARCHAR(36),
  verification_date TIMESTAMP,
  verification_notes TEXT,
  
  -- Peso para quality score
  weight INT DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_deliverable_criteria (deliverable_id),
  FOREIGN KEY (deliverable_id) REFERENCES deliverables(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deliverable_reviews (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  deliverable_id VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36) NOT NULL,
  review_round INT DEFAULT 1,
  
  -- Resultado de la revisión
  status ENUM('pending', 'in_progress', 'approved', 'rejected', 'needs_changes') DEFAULT 'pending',
  score DECIMAL(5,2), -- 0-100
  
  -- Comentarios y feedback
  comments TEXT,
  feedback JSON, -- Feedback estructurado por sección
  
  -- Fechas
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_date TIMESTAMP,
  due_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_deliverable_reviews (deliverable_id, status),
  INDEX idx_reviewer (reviewer_id),
  FOREIGN KEY (deliverable_id) REFERENCES deliverables(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ALERTAS Y NOTIFICACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(36) NOT NULL,
  alert_type ENUM('milestone_delay', 'risk_escalation', 'deliverable_overdue', 'stakeholder_unavailable', 'weekly_report_missing', 'quality_issue') NOT NULL,
  severity ENUM('info', 'warning', 'critical') NOT NULL,
  
  -- Contenido
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_required TEXT,
  
  -- Referencias
  reference_type ENUM('milestone', 'risk', 'deliverable', 'stakeholder', 'meeting', 'report') NOT NULL,
  reference_id VARCHAR(36) NOT NULL,
  
  -- Estado
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by VARCHAR(36),
  resolved_at TIMESTAMP,
  
  -- Destinatarios
  assigned_to JSON, -- Array de user IDs
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_alerts (project_id, is_resolved),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at DESC),
  FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TRIGGERS PARA AUTOMATIZACIÓN
-- ============================================

-- Trigger para calcular quality score de deliverables
DELIMITER //
CREATE TRIGGER calculate_deliverable_quality_score
AFTER UPDATE ON acceptance_criteria
FOR EACH ROW
BEGIN
  DECLARE total_weight INT;
  DECLARE met_weight INT;
  DECLARE quality_score DECIMAL(5,2);
  
  SELECT SUM(weight), SUM(CASE WHEN is_met THEN weight ELSE 0 END)
  INTO total_weight, met_weight
  FROM acceptance_criteria
  WHERE deliverable_id = NEW.deliverable_id;
  
  IF total_weight > 0 THEN
    SET quality_score = (met_weight / total_weight) * 100;
    
    UPDATE deliverables
    SET 
      quality_score = quality_score,
      quality_status = CASE
        WHEN quality_score >= 90 THEN 'excellent'
        WHEN quality_score >= 75 THEN 'good'
        WHEN quality_score >= 60 THEN 'acceptable'
        WHEN quality_score >= 40 THEN 'poor'
        ELSE 'unacceptable'
      END
    WHERE id = NEW.deliverable_id;
  END IF;
END//
DELIMITER ;

-- Trigger para alertas de riesgos críticos
DELIMITER //
CREATE TRIGGER alert_critical_risks
AFTER INSERT ON risks
FOR EACH ROW
BEGIN
  IF NEW.risk_score >= 15 THEN
    INSERT INTO alerts (
      project_id, alert_type, severity, title, message,
      reference_type, reference_id, assigned_to
    ) VALUES (
      NEW.project_id,
      'risk_escalation',
      'critical',
      CONCAT('Riesgo Crítico Identificado: ', NEW.title),
      CONCAT('Se ha identificado un riesgo crítico con score ', NEW.risk_score, '. Requiere atención inmediata.'),
      'risk',
      NEW.id,
      JSON_ARRAY(NEW.owner_id)
    );
  END IF;
END//
DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para queries frecuentes
CREATE INDEX idx_project_status_date ON deliverables(project_id, status, planned_end_date);
CREATE INDEX idx_project_priority_status ON risks(project_id, priority, status);
CREATE INDEX idx_meeting_project_time ON meetings(project_id, start_time, status);

-- ============================================
-- VISTAS PARA REPORTES
-- ============================================

CREATE OR REPLACE VIEW v_project_health AS
SELECT 
  b.id AS project_id,
  b.title AS project_name,
  COUNT(DISTINCT d.id) AS total_deliverables,
  SUM(CASE WHEN d.status = 'delivered' THEN 1 ELSE 0 END) AS completed_deliverables,
  COUNT(DISTINCT r.id) AS total_risks,
  SUM(CASE WHEN r.priority = 'critical' THEN 1 ELSE 0 END) AS critical_risks,
  AVG(d.quality_score) AS avg_quality_score,
  COUNT(DISTINCT wr.id) AS weekly_reports_count
FROM boards b
LEFT JOIN deliverables d ON b.id = d.project_id
LEFT JOIN risks r ON b.id = r.project_id
LEFT JOIN weekly_reports wr ON b.id = wr.project_id
GROUP BY b.id, b.title;
