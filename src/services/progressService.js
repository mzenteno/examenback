let progress = {
  download: 0,
  unzip: 0,
  save: 0
};

export const setDownloadProgress = (percent) => {
  progress.download = percent;
};

export const setUnzipProgress = (percent) => {
  progress.unzip = percent;
};

export const setSaveProgress = (percent) => {
  progress.save = percent;
};

export const getProgress = () => {
  return {
    download: `${progress.download}% completado`,
    unzip: `${progress.unzip}% completado`,
    save: `${progress.save}% completado`
  };
};

export const resetProgress = () => {
  progress = { download: 0, unzip: 0, save: 0 };
};