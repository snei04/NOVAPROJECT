import StakeholderService from '../services/stakeholder.service.js';

export const getAllStakeholdersByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const stakeholders = await StakeholderService.getAllByBoard(boardId);
    res.status(200).json(stakeholders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los stakeholders.', error: error.message });
  }
};

export const createInterview = async (req, res) => {
  try {
    const interviewData = {
      ...req.body, // title, startTime, endTime, stakeholderIds
      boardId: req.params.boardId, // El ID del tablero viene de la URL
      createdByUserId: req.user.id // El ID del usuario viene del token
    };
    
    const newInterview = await StakeholderService.createInterview(interviewData);
    res.status(201).json(newInterview);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la entrevista.', error: error.message });
  }
};