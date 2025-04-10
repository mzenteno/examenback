import { getProgress } from '../services/progressService.js';


export const handleProgressController = (req, res) => {
  res.json(getProgress());
};