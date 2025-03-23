import "dotenv/config";

function getENV<T>(key: string, fallback: T): T {
  return process.env[key] === undefined ? fallback : (process.env[key] as T);
}

export { getENV };
