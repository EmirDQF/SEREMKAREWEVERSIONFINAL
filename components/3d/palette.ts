import type { Theme } from "@/lib/theme";

/**
 * Colores de marca para WebGL: espejo de los tokens de app/globals.css ("Teal clínico × Azul digital").
 * three no lee variables CSS; si cambias un token, cámbialo también aquí.
 */
export const PALETTE = {
  teal: "#00a896", // --teal (claro)
  tealLight: "#2dd4bf", // --teal (oscuro)
  coral: "#f97362", // --coral (claro)
  coralLight: "#fb8a7b", // --coral (oscuro)
  sky: "#0284c7", // --ring (claro)
  skyLight: "#7dd3fc", // --video (oscuro) / --video-glow
  video: "#0369a1", // --video (claro)
  videoStrong: "#38bdf8", // --video-strong (oscuro)
  pain: "#f59e0b", // --pain (claro)
  painLight: "#fbbf24", // --pain (oscuro)
  online: "#10b981", // --online-dot (claro)
  cyan: "#67e8f9",
  navy: "#0b192c", // --navy
  navy2: "#1e3e62", // --navy-2
} as const;

export interface ThemeColors {
  bone: string;
  boneSheen: string;
  glassTint: string;
  /** Teal "sano" que mejor contrasta con el fondo de cada tema. */
  health: string;
  /** Coral "inflamación" de cada tema. */
  inflammation: string;
}

const LIGHT: ThemeColors = {
  bone: "#e9e2d6",
  boneSheen: "#cdeee8",
  glassTint: "#e6fbf7",
  health: PALETTE.teal,
  inflammation: PALETTE.coral,
};

const DARK: ThemeColors = {
  bone: "#c9d6e3",
  boneSheen: "#7dd3fc",
  glassTint: "#bfeee7",
  health: PALETTE.tealLight,
  inflammation: PALETTE.coralLight,
};

export function themeColors(theme: Theme): ThemeColors {
  return theme === "dark" ? DARK : LIGHT;
}
