"use client";

import Link from "next/link";
import { FileText, Pencil } from "lucide-react";
import type { BookingStep } from "@/types/medical";
import { getComplaint } from "@/data/bodyZones";
import { doctors } from "@/data/doctors";
import { site } from "@/data/site";
import { MODALITY_LABEL } from "@/data/teleconsult";
import { NAME_LIMITS, formatAge, parseAge } from "@/lib/booking";
import { formatSlot } from "@/lib/slots";
import { cn } from "@/lib/utils";
import { FieldError, HINT, INPUT, LEGEND, type StepProps } from "@/components/booking/ui";

interface StepConfirmProps extends StepProps {
  onEdit: (step: BookingStep) => void;
}

function summaryRows({ draft }: StepProps): { label: string; value: string; step: BookingStep }[] {
  const age = parseAge(draft.age);
  const doctor = doctors.find((d) => d.slug === draft.doctorSlug);
  return [
    { label: "Paciente", value: age === null ? "—" : formatAge(age), step: 1 },
    { label: "Molestia", value: draft.complaint ? getComplaint(draft.complaint).label : "—", step: 1 },
    { label: "Modalidad", value: MODALITY_LABEL[draft.modality], step: 2 },
    { label: "Doctor/a", value: doctor?.name ?? "—", step: 2 },
    { label: "Día y hora", value: draft.slot ? formatSlot(draft.slot) : "—", step: 2 },
  ];
}

function Summary(props: StepConfirmProps) {
  return (
    <section aria-labelledby="resumen-cita" className="rounded-2xl border border-line bg-bg-alt/60 p-4">
      <h4 id="resumen-cita" className={LEGEND}>
        Tu teleconsulta
      </h4>
      <dl className="mt-2 divide-y divide-line">
        {summaryRows(props).map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0">
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd className="font-semibold text-heading">{row.value}</dd>
            </div>
            <button
              type="button"
              onClick={() => props.onEdit(row.step)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary hover:bg-teal-tint"
            >
              <Pencil aria-hidden strokeWidth={1.75} className="size-4" /> Editar
              <span className="sr-only"> {row.label.toLowerCase()}</span>
            </button>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ContactFields({ draft, errors, ids, onChange }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor={ids.field("fullName")} className={LEGEND}>
          Nombre del paciente
        </label>
        <input
          id={ids.field("fullName")}
          type="text"
          autoComplete={draft.forWhom === "mi" ? "name" : "off"}
          maxLength={NAME_LIMITS.max}
          value={draft.fullName}
          onChange={(e) => onChange({ ...draft, fullName: e.target.value })}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={ids.describedBy("fullName")}
          className={cn(INPUT, "mt-2")}
        />
        <FieldError id={ids.error("fullName")} message={errors.fullName} />
      </div>
      <div>
        <label htmlFor={ids.field("phone")} className={LEGEND}>
          Celular con WhatsApp
        </label>
        <input
          id={ids.field("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="987 654 321"
          value={draft.phone}
          onChange={(e) => onChange({ ...draft, phone: e.target.value })}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={ids.describedBy("phone")}
          className={cn(INPUT, "mt-2")}
        />
        <FieldError id={ids.error("phone")} message={errors.phone} />
      </div>
      <p className={cn(HINT, "sm:col-span-2")}>Por ahí te enviamos el enlace de la videollamada o te llamamos a la hora acordada.</p>
    </div>
  );
}

function Consent({ draft, errors, ids, onChange }: StepProps) {
  return (
    <div>
      <label className="flex items-start gap-3 text-[0.95rem] text-muted">
        <input
          id={ids.field("consent")}
          type="checkbox"
          checked={draft.consent}
          onChange={(e) => onChange({ ...draft, consent: e.target.checked })}
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={ids.describedBy("consent")}
          className="mt-0.5 size-5 shrink-0 accent-[var(--teal-strong)]"
        />
        <span>
          Acepto atenderme por teleconsulta según los{" "}
          <Link href="/terminos#telesalud" className="font-semibold text-link underline underline-offset-2">
            términos de telesalud
          </Link>{" "}
          (Ley N.° 30421) y autorizo a {site.name} a usar mis datos según la{" "}
          <Link href="/politica-de-privacidad" className="font-semibold text-link underline underline-offset-2">
            política de privacidad
          </Link>{" "}
          (Ley N.° 29733).
        </span>
      </label>
      <FieldError id={ids.error("consent")} message={errors.consent} />
    </div>
  );
}

/** Paso 3: datos de contacto, consentimiento de telemedicina y resumen editable. */
export function StepConfirm(props: StepConfirmProps) {
  return (
    <div className="space-y-6">
      <Summary {...props} />
      <ContactFields {...props} />
      <Consent {...props} />
      <p className="flex items-start gap-2 text-sm text-muted">
        <FileText aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primary" />
        Si corresponde, el médico te envía tu receta electrónica e indicaciones después de la consulta.
      </p>
    </div>
  );
}
