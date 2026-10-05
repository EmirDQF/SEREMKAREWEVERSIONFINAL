import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Lógica pura de la teleconsulta (agendador, turnos, estado en vivo, mensajes y JSON-LD).
      include: ["lib/booking.ts", "lib/slots.ts", "lib/schedule.ts", "lib/whatsapp.ts", "lib/schema.ts"],
      reporter: ["text"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
