import { Phone, Siren } from "lucide-react";
import { EMERGENCY } from "@/data/teleconsult";

interface EmergencyNoticeProps {
  acknowledged: boolean;
  onAcknowledge: (value: boolean) => void;
  checkboxId: string;
  errorId: string;
  error?: string;
}

/** Aviso que aparece al marcar una señal de alarma. No bloquea: pide confirmar que no es una emergencia. */
export function EmergencyNotice({ acknowledged, onAcknowledge, checkboxId, errorId, error }: EmergencyNoticeProps) {
  return (
    <div className="rounded-2xl border border-alert bg-alert-tint p-4 text-alert-strong">
      <p role="alert" className="flex items-start gap-2 font-display font-semibold">
        <Siren aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-alert" />
        <span>
          {EMERGENCY.notice} {EMERGENCY.action}
        </span>
      </p>
      <a
        href={`tel:${EMERGENCY.phone}`}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-alert px-4 font-semibold hover:bg-alert-tint"
      >
        <Phone aria-hidden strokeWidth={1.75} className="size-4" /> Llamar al SAMU {EMERGENCY.phone}
      </a>
      <label className="mt-4 flex min-h-11 items-start gap-3 text-[0.95rem] text-fg">
        <input
          id={checkboxId}
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => onAcknowledge(e.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 size-5 shrink-0 accent-[var(--alert)]"
        />
        <span>{EMERGENCY.acknowledge}</span>
      </label>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}
