type Obj = Record<string, unknown>;

function isPlainObject(v: unknown): v is Obj {
  if (typeof v !== "object" || v === null) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string" && v.length === 0) return true;
  if (isPlainObject(v) && Object.keys(v).length === 0) return true;
  return false;
}

export function clean<T>(obj: T): T {
  if (!isPlainObject(obj)) return obj;
  const result: Obj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isEmptyValue(value)) continue;
    if (isPlainObject(value)) {
      const cleaned = clean(value);
      if (Object.keys(cleaned as Obj).length > 0) {
        result[key] = cleaned;
      }
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
