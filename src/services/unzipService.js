import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import yauzl from 'yauzl-promise';
import { logger } from '../utils/logger.js';


export class UnzipService {
  constructor() {
    this.extractedDir = path.join(process.cwd(), 'downloads');
    this.ensureExtractedDirExists();
  }

  ensureExtractedDirExists() {
    if (!fs.existsSync(this.extractedDir)) {
      fs.mkdirSync(this.extractedDir, { recursive: true });
    }
  }

  async unzipService(filePath, progressCallback = null) {
    const outputDir = path.join(this.extractedDir, path.basename(filePath, '.zip'));
    let totalFiles = 0;
    let extractedCount = 0;

    try {
      const zip = await yauzl.open(filePath);

      // Contar el total de archivos (solo los archivos, no los directorios)
      for await (const entry of zip) {
        if (!entry.filename.endsWith('/')) {
          totalFiles++;
        }
      }

      zip.close();
      const zipReopened = await yauzl.open(filePath);
      
      for await (const entry of zipReopened) {
        if (entry.filename.endsWith('/')) continue;
        
        const fullPath = path.join(outputDir, entry.filename);
        
        await this.ensureDirectoryExists(path.dirname(fullPath));
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(fullPath);
        
        await pipeline(readStream, writeStream);

        extractedCount++;
        
        if (progressCallback) {
          const progress = (extractedCount / totalFiles) * 100;
          progressCallback({ percent: Math.round(progress) });
        }
      } 

      return { extractedDir: outputDir };
    } catch (error) {
      logger.error('Error al descomprimir:', error);
      throw new Error('Error en descompresión: ' + error.message);
    }
  }

  async ensureDirectoryExists(dirPath) {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }

}