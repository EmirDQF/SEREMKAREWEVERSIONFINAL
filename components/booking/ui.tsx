import type { ReactNode } from "react";
import type { BookingDraft, BookingErrors, BookingField } from "@/types/medical";
import { cn } from "@/lib/utils";

/** Alto mínimo de cada paso: el skeleton de carga ocupa lo mismo (sin salto de layout). */
export const STEP_MIN_HEIGHT = "min-h-[30rem]";

export const INPUT =
  "min-h-12 w-full rounded-2xl border border-line-strong bg-card-solid px-4 text-fg placeholder:text-subtle transition-colors focus:border-primary focus:outline-none aria-[invalid=true]:border-alert";

export const LEGEND = "font-display font-semibold text-heading";
export const HINT = "mt-1 text-sm text-muted";

/** Ids accesibles de un campo y de su error. */
export interface FieldIds {
  field: (name: BookingField) => string;
  error: (name: BookingField) => string;
  describedBy: (name: BookingField) => string | undefined;
}

export interface StepProps {
  draft: BookingDraft;
  errors: BookingErrors;
  ids: FieldIds;
  onChange: (next: BookingDraft) => void;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-alert">
      {message}
    </p>
  );
}

interface ChoiceProps<T extends string> {
  name: string;
  value: T;
  current: T | null;
  onChange: (value: T) => void;
  icon?: ReactNode;
  title: string;
  hint?: string;
  id?: string;
  describedBy?: string;
  /** "video" para la modalidad (azul de teleconsulta); "pain" para la molestia (ámbar). */
  tone?: "primary" | "video" | "pain";
}

const TONE: Record<NonNullable<ChoiceProps<string>["tone"]>, { on: string; icon: string }> = {
  primary: { on: "border-primary bg-teal-tint", icon: "bg-primary text-on-primary" },
  video: { on: "border-video bg-video-tint", icon: "bg-video-strong text-on-video" },
  pain: { on: "border-pain bg-pain-tint", icon: "bg-pain text-navy" },
};

/** Opción de radio grande (≥ 64 px) con ícono, operable con teclado. */
export function Choice<T extends string>(props: ChoiceProps<T>) {
  const { name, value, current, onChange, icon, title, hint, id, describedBy, tone = "primary" } = props;
  const checked = value === current;
  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring",
        checked ? TONE[tone].on : "border-line-strong bg-card-solid hover:border-primary",
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        aria-describedby={describedBy}
        className="sr-only"
      />
      {icon ? (
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5", checked ? TONE[tone].icon : "bg-bg-alt text-primary")}>
          {icon}
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block font-display font-semibold text-heading">{title}</span>
        {hint ? <span className="block text-sm text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Esqueleto con la misma altura que un paso mientras se descarga su código. */
export function StepSkeleton() {
  return (
    <div aria-hidden className={cn(STEP_MIN_HEIGHT, "animate-pulse space-y-4")}>
      <div className="h-16 rounded-2xl bg-bg-alt" />
      <div className="h-28 rounded-2xl bg-bg-alt" />
      <div className="h-28 rounded-2xl bg-bg-alt" />
      <div className="h-12 rounded-2xl bg-bg-alt" />
    </div>
  );
}
