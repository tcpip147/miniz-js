export interface FileEntry {
  name: string;
  data: string;
}

class Miniz {
  worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('./worker.ts', import.meta.url));
  }

  zip(files: FileEntry[]): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.func == 'zip') {
          resolve(e.data.result);
        }
      };
      this.worker.postMessage({ func: 'zip', files });
    });
  }

  unzip(data: Uint8Array): Promise<FileEntry[]> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.func == 'unzip') {
          resolve(e.data.result);
        }
      };
      this.worker.postMessage({ func: 'unzip', data });
    });
  }
}

window.Miniz = Miniz;
