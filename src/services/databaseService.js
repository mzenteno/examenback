import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import path from 'path';
import fs from 'fs/promises';


export class DatabaseService {
  constructor() {
    this.client = new PrismaClient();
  }

  // Función recursiva para obtener todos los archivos
  async getAllFiles(dir) {
    let files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  async saveFiles(extractedDir, progressCallback = null) {
    let saved = 0;
    let failed = 0;

    const allFiles = await this.getAllFiles(extractedDir);
    const totalFiles = allFiles.length;

    for (const fullPath of allFiles) {
      const name = path.basename(fullPath);

      try {
        await this.client.file.create({
          data: {
            name,
            path: fullPath
          }
        });

        saved++;

        if (progressCallback) {
          const progress = (saved / totalFiles) * 100;
          progressCallback({ percent: Math.round(progress) });
        }
      } catch (error) {
        logger.error(`Error guardando ${name}:`, error);
        failed++;
      }
    }

    logger.info(`Guardados en BD: ${saved} archivos (${failed} fallidos)`);
    return { saved, failed };
  }

}