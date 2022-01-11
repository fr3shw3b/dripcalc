import localforage from "localforage";

interface Storage {
  writeData<T = string | Record<string, unknown>>(
    key: string,
    data: T
  ): Promise<T>;
  readData<T = string | Record<string, unknown>>(
    key: string
  ): Promise<T | null>;
  removeData(key: string): Promise<void>;
  clear(): Promise<void>;
}

function storage(): Storage {
  return {
    writeData: <T = string | Record<string, unknown>>(key: string, data: T) =>
      localforage.setItem(key, data),
    readData: (key: string) => localforage.getItem(key),
    removeData: (key: string) => localforage.removeItem(key),
    clear: () => localforage.clear(),
  } as const;
}

export default storage;
