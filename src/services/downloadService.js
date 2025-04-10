import axios from "axios";
import fs from "fs";
import path from 'path';


export class DownloadService {
  constructor() {
    this.downloadsDir = path.join(process.cwd(), 'downloads');
    this.ensureDownloadsDirExists();
  }

  ensureDownloadsDirExists() {
    if (!fs.existsSync(this.downloadsDir)) {
      fs.mkdirSync(this.downloadsDir, { recursive: true });
    }
  }

  async downloadFile(url, progressCallback = null) {
    const filePath = path.join(this.downloadsDir, `downloaded_${Date.now()}${path.extname(url) || '.zip'}`);
    const startTime = Date.now();

    try {
      const headResponse = await axios.head(url);
      const fileSize = parseInt(headResponse.headers['content-length'], 10) || 0;

      const writer = fs.createWriteStream(filePath);
      let receivedBytes = 0;

      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
        onDownloadProgress: progressEvent => {
          receivedBytes = progressEvent.loaded;
          if (progressCallback) {
            progressCallback({
              percent: fileSize > 0 ? Math.round((receivedBytes / fileSize) * 100) : 0,
              downloaded: receivedBytes,
              total: fileSize,
              speed: receivedBytes / ((Date.now() - startTime) / 1000)
            });
          }
        }
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve({
          filePath,
          size: receivedBytes,
          time: (Date.now() - startTime) / 1000
        }));
        writer.on('error', error => {
          this.cleanupFailedDownload(filePath);
          reject(new Error('Error al escribir archivo: ' + error.message));
        });
      });

    } catch (error) {
      this.cleanupFailedDownload(filePath);
      throw error;
    }
  }

  cleanupFailedDownload(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat(bytes / Math.pow(k, i)).toFixed(decimals) + ' ' + sizes[i];
  }
  
}