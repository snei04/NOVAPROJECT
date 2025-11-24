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
  userRole?: 'owner' | 'member';

  // Governance
  generalObjective?: string;
  scopeDefinition?: string;
  specificObjectives?: { content: string }[];

  // Financials
  budgetEstimated?: number;
  budgetActual?: number;
  projectBenefit?: number;
}
