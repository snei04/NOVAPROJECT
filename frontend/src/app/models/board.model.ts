import { User } from "./user.model";
import { Colors } from '@models/colors.model';
import { List } from './list.model';
import { Card } from './card.model';

export interface Board {
  id: string;
  title: string;
  backgroundColor: Colors;
  members: User[];
  lists: List[];
  cards: Card[];
  userRole?: 'owner' | 'member' | 'viewer';

  // Governance
  generalObjective?: string;
  scopeDefinition?: string; // Mapped to scope_definition
  scope_definition?: string; // Actual DB column name
  general_objective?: string; // Actual DB column name
  specificObjectives?: { content: string }[];
  specific_objectives?: { content: string }[];

  // Financials
  budgetEstimated?: number;
  budgetActual?: number;
  projectBenefit?: number;
  
  fecha_creacion?: string; // Added for createdAt display
}
