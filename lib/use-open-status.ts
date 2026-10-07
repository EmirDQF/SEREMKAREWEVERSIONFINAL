"use client";

import { useSyncExternalStore } from "react";
import { locationOpenStatus, primaryLocation } from "@/lib/locations";
import type { OpenStatus } from "@/lib/schedule";

const REFRESH_MS = 60_000;

let cached: OpenStatus | null = null;
let initialized = false;

function refresh(): void {
  cached = locationOpenStatus(primaryLocation());
  initialized = true;
}

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(() => {
    refresh();
    onChange();
  }, REFRESH_MS);
  return () => window.clearInterval(id);
}

function getSnapshot(): OpenStatus | null {
  if (!initialized) refresh();
  return cached;
}

const getServerSnapshot = (): OpenStatus | null => null;

/**
 * Estado "Abierto ahora / Cerrado" de la sede principal, en hora de Lima.
 * Devuelve null en el servidor, durante la hidratación y mientras el horario no esté confirmado.
 */
export function useOpenStatus(): OpenStatus | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
