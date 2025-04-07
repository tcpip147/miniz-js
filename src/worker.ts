import Module, { MainModule } from '../public/miniz.js';
import { FileEntry } from '@/index';
let mod: MainModule | undefined;

onmessage = async function (e: MessageEvent<any>) {
  if (!mod) {
    mod = await Module();
  }
  if (e.data.func == 'zip') {
    postMessage({
      func: 'zip',
      result: new Blob([zip(mod!, e.data.files)], { type: 'application/octet-stream' }),
    });
  } else if (e.data.func == 'unzip') {
    const reader = new FileReader();
    reader.onload = function () {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      postMessage({
        func: 'unzip',
        result: unzip(mod!, bytes),
      });
    };
    reader.readAsArrayBuffer(e.data.data);
  }
};

function zip(mod: MainModule, files: FileEntry[]): Uint8Array {
  const sizeOfPointer = mod._size_of_pointer();
  const ptrEntries = mod._malloc(files.length * sizeOfPointer * 2);
  const memories = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const encoder = new TextEncoder();
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.data);
    const memory = {
      name: mod._malloc(nameBytes.length + 1),
      data: mod._malloc(dataBytes.length + 1),
    };
    memories.push(memory);
    mod.stringToUTF8(file.name, memory.name, nameBytes.length + 1);
    mod.stringToUTF8(file.data, memory.data, dataBytes.length + 1);
    mod.setValue(ptrEntries + i * sizeOfPointer * 2, memory.name, '*');
    mod.setValue(ptrEntries + i * sizeOfPointer * 2 + sizeOfPointer, memory.data, '*');
  }
  const sizeOfSizeT = mod._size_of_size_t();
  const ptrBufSize = mod._malloc(sizeOfSizeT);
  const ptrBytes = mod._c_zip(ptrEntries, files.length, ptrBufSize);
  const resultSize = mod.getValue(ptrBufSize, 'i32');
  const result = new Uint8Array(mod.HEAPU8.buffer, ptrBytes, resultSize);
  mod._free(ptrBytes);
  mod._free(ptrBufSize);
  for (const memory of memories) {
    mod._free(memory.name);
    mod._free(memory.data);
  }
  mod._free(ptrEntries);
  return resultSize == 0 ? new Uint8Array() : result;
}

function unzip(mod: MainModule, compressed: Uint8Array): FileEntry[] {
  const sizeOfPointer = mod._size_of_pointer();
  const ptrData = mod._malloc(compressed.length);
  const ptrNumFiles = mod._malloc(sizeOfPointer);
  mod.HEAP8.set(compressed, ptrData);
  const ptrFiles = mod._c_unzip(ptrData, compressed.length, ptrNumFiles);
  const numFiles = mod.getValue(ptrNumFiles, 'i32');
  const files: FileEntry[] = [];
  for (let i = 0; i < numFiles; i++) {
    const ptrName = mod.getValue(ptrFiles + i * sizeOfPointer * 2, '*');
    const ptrData = mod.getValue(ptrFiles + i * sizeOfPointer * 2 + sizeOfPointer, '*');
    files.push({
      name: mod.UTF8ToString(ptrName),
      data: mod.UTF8ToString(ptrData),
    });
    mod._free(ptrName);
    mod._free(ptrData);
  }
  mod._free(ptrFiles);
  mod._free(ptrNumFiles);
  mod._free(ptrData);
  return files;
}
