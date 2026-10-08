import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const SCANNED_DIRS = ["data", "lib", "components", "app"] as const;
const SOURCE_EXTENSIONS = /\.(ts|tsx)$/;

/** Datos de prueba de las fases 1-6 que no deben volver a publicarse. */
const FORBIDDEN = [/999\s?000\s?000/, /640\s?0000/, /6400000/, /San Borja/i, /Aviaci[oó]n/i] as const;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return SOURCE_EXTENSIONS.test(entry) ? [path] : [];
  });
}

describe("datos de contacto de prueba", () => {
  it("no quedan en data/, lib/, components/ ni app/", () => {
    const hits = SCANNED_DIRS.flatMap((dir) => sourceFiles(join(ROOT, dir))).flatMap((file) => {
      const text = readFileSync(file, "utf8");
      return FORBIDDEN.filter((pattern) => pattern.test(text)).map((pattern) => `${relative(ROOT, file)} → ${pattern}`);
    });
    expect(hits).toEqual([]);
  });
});
