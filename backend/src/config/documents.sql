-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL DEFAULT 'Sin título',
  content JSON DEFAULT ('{"type":"doc","content":[],"databases":[]}'),
  icon VARCHAR(10) DEFAULT NULL,
  parent_id VARCHAR(36) DEFAULT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES documents(id) ON DELETE CASCADE,
  INDEX idx_parent_id (parent_id),
  INDEX idx_is_archived (is_archived),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
