import type { BookingStep } from "@/types/medical";
import { cn } from "@/lib/utils";

export const STEP_LABELS: Readonly<Record<BookingStep, string>> = {
  1: "Tú y tu molestia",
  2: "Doctor y horario",
  3: "Confirma",
};

const STEPS: readonly BookingStep[] = [1, 2, 3];

/** Barra de progreso del agendador: el paso activo va en azul de teleconsulta. */
export function BookingProgress({ step }: { step: BookingStep }) {
  return (
    <ol aria-label={`Paso ${step} de ${STEPS.length}`} className="grid grid-cols-3 gap-2">
      {STEPS.map((item) => {
        const state = item < step ? "done" : item === step ? "current" : "todo";
        return (
          <li key={item} aria-current={state === "current" ? "step" : undefined} className="min-w-0">
            <span
              aria-hidden
              className={cn(
                "block h-1.5 rounded-full transition-colors duration-500",
                state === "todo" ? "bg-line-strong" : "bg-video-strong",
              )}
            />
            <span
              className={cn(
                "mt-2 block truncate text-xs font-semibold sm:text-sm",
                state === "current" ? "text-video" : state === "done" ? "text-heading" : "text-subtle",
              )}
            >
              <span className="sr-only">{state === "done" ? "Completado: " : state === "todo" ? "Pendiente: " : "Actual: "}</span>
              {item}. {STEP_LABELS[item]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
