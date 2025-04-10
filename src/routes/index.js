import express from 'express';
import { handleFileController } from "../controllers/fileController.js";
import { handleProgressController } from "../controllers/progressController.js"

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor levantado' });
});

router.post('/process-file', handleFileController);
router.get('/progress-file', handleProgressController);

export default router;