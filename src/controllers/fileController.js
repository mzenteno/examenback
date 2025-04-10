import { DownloadService } from "../services/downloadService.js";
import { UnzipService } from "../services/unzipService.js";
import { DatabaseService } from "../services/databaseService.js";
import { logger } from "../utils/logger.js";
import { setUnzipProgress, setSaveProgress, setDownloadProgress, resetProgress } from '../services/progressService.js';


const downloadService = new DownloadService();
const unzipService = new UnzipService();
const databaseService = new DatabaseService();

export const handleFileController = async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL es requerida' 
    });
  }

  try {
    resetProgress();

    logger.info(`Iniciando descarga desde: ${url}`);
    const { filePath: filePath } = await downloadService.downloadFile(url, (progress) => {
      //logger.info(`Descarga: ${progress.percent}% completado`);
      setDownloadProgress(progress.percent);
    });
    
    //var filePath = '/mnt/DATOS/proyectos/examenapp/backend/downloads/download.zip';

    logger.info(`Iniciando descompresión de: ${filePath}`);
    const { extractedDir } = await unzipService.unzipService(filePath, (progress) => {
      //logger.info(`Descompresión: ${progress.percent}% completado`);
      setUnzipProgress(progress.percent);
    });

    await databaseService.saveFiles(extractedDir, (progress) => {
      //logger.info(`Descompresión: ${progress.percent}% completado`);
      setSaveProgress(progress.percent);
    });

    res.json({
      success: true,
      downloaded: filePath,
    });

  } catch (error) {
    logger.error('Error en el proceso:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      step: error.step || 'unknown'
    });
  }
  
}