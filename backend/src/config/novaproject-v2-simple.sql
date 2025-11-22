-- NovaProject v2.0.0 - Schema Simplificado (Sin FK a boards)

-- 1. DASHBOARD
CREATE TABLE IF NOT EXISTS project_metrics (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  metric_type ENUM('progress', 'deliverables', 'risks', 'quality') NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2),
  unit VARCHAR(20),
  trend ENUM('up', 'down', 'stable') DEFAULT 'stable',
  status ENUM('good', 'warning', 'critical') DEFAULT 'good',
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_metrics (project_id, metric_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS project_milestones (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'delayed') DEFAULT 'pending',
  progress_percentage INT DEFAULT 0,
  priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_milestones (project_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS weekly_reports (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  week_number INT NOT NULL,
  year INT NOT NULL,
  report_date DATE NOT NULL,
  progress_summary TEXT NOT NULL,
  tasks_completed INT DEFAULT 0,
  tasks_planned INT DEFAULT 0,
  completion_rate DECIMAL(5,2),
  status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_project_week (project_id, week_number, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. STAKEHOLDERS
CREATE TABLE IF NOT EXISTS stakeholders (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_stakeholders (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stakeholder_availability (
  id VARCHAR(36) PRIMARY KEY,
  stakeholder_id VARCHAR(36) NOT NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_stakeholder (stakeholder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS meetings (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_meetings (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. RISKS
CREATE TABLE IF NOT EXISTS risks (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('technical', 'resource', 'schedule', 'budget') NOT NULL,
  probability ENUM('very_low', 'low', 'medium', 'high', 'very_high') NOT NULL,
  impact ENUM('very_low', 'low', 'medium', 'high', 'very_high') NOT NULL,
  status ENUM('identified', 'mitigating', 'monitoring', 'closed') DEFAULT 'identified',
  identified_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_risks (project_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS risk_controls (
  id VARCHAR(36) PRIMARY KEY,
  risk_id VARCHAR(36) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('planned', 'in_progress', 'completed') DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_risk (risk_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. DELIVERABLES
CREATE TABLE IF NOT EXISTS deliverables (
  id VARCHAR(36) PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  planned_end_date DATE NOT NULL,
  status ENUM('not_started', 'in_progress', 'in_review', 'approved') DEFAULT 'not_started',
  progress_percentage INT DEFAULT 0,
  quality_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_deliverables (project_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS acceptance_criteria (
  id VARCHAR(36) PRIMARY KEY,
  deliverable_id VARCHAR(36) NOT NULL,
  criterion_text TEXT NOT NULL,
  is_met BOOLEAN DEFAULT FALSE,
  weight INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_deliverable (deliverable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
