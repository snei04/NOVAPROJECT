// src/app/core/models/stakeholder.model.ts

export interface Stakeholder {
  id: string;
  project_id: string;
  name: string;
  role: string;
  priority: 'high' | 'medium' | 'low';
  contact_info: any;  // Puedes definir una interfaz más estricta si quieres
  availability: any; // Puedes definir una interfaz más estricta si quieres
}