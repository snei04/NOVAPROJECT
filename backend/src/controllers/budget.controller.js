import BudgetService from '../services/budget.service.js';

export const getBudgetItems = async (req, res) => {
  try {
    const { boardId } = req.params;
    const items = await BudgetService.getBudgetItems(boardId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBudgetItem = async (req, res) => {
  try {
    const { boardId } = req.params;
    const newItem = await BudgetService.createBudgetItem({ ...req.body, projectId: boardId });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await BudgetService.updateBudgetItem(id, req.body);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;
    await BudgetService.deleteBudgetItem(id);
    res.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBudgetSummary = async (req, res) => {
  try {
    const { boardId } = req.params;
    const summary = await BudgetService.getBudgetSummary(boardId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
