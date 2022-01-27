import { read, write } from "fs-jetpack";

const CACHE_PATH = "./.md2carddav.cache.json";

type Cache = { [key: string]: any };

export const getCache = (): Cache => {
  const cache = read(CACHE_PATH, "json");
  if (typeof cache !== "object") {
    return {};
  }

  return cache;
};

const writeCacheToDisk = (cache: Cache) => {
  write(CACHE_PATH, cache);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setCache = (key: string, val: any): void => {
  const cache = getCache();

  const updatedCache = { ...cache, [key]: val };

  writeCacheToDisk(updatedCache);
};
