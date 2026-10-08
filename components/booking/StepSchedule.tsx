"use client";

import { useMemo, useState } from "react";
import { Clock, Phone, Video } from "lucide-react";
import type { Doctor } from "@/types/medical";
import { DoctorCardOption } from "@/components/shared/DoctorCard";
import { MODALITY_HINT, teleconsultSchedule } from "@/data/teleconsult";
import { describeBlock, doctorSlots, doctorsFor, withDoctor, withModality } from "@/lib/booking";
import { describeDays, formatTime, todayISO } from "@/lib/schedule";
import { dayChipLabel, nextBusinessDays } from "@/lib/slots";
import { cn } from "@/lib/utils";
import { Choice, FieldError, HINT, LEGEND, type StepProps } from "@/components/booking/ui";

const DAYS_TO_SHOW = 5;
const PILL =
  "flex cursor-pointer flex-col items-center justify-center rounded-xl border text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50";
const PILL_ON = "border-video-strong bg-video-strong text-on-video";
const PILL_OFF = "border-line-strong bg-card-solid text-heading hover:border-video";

function HoursBadge() {
  return (
    <p className="inline-flex flex-wrap items-center gap-2 rounded-full border border-video bg-video-tint px-4 py-2 font-display font-semibold text-video">
      <Clock aria-hidden strokeWidth={1.75} className="size-5" />
      {describeDays(teleconsultSchedule.days)} desde las {formatTime(teleconsultSchedule.opensAt)}
      <span className="font-sans text-sm font-normal">(hora de Lima)</span>
    </p>
  );
}

function ModalityToggle({ draft, onChange }: StepProps) {
  return (
    <fieldset>
      <legend className={LEGEND}>¿Cómo prefieres conectarte?</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Choice name="modality" value="videollamada" current={draft.modality} onChange={(m) => onChange(withModality(draft, m))} icon={<Video aria-hidden strokeWidth={1.75} />} title="Videollamada" hint={MODALITY_HINT.videollamada} tone="video" />
        <Choice name="modality" value="llamada" current={draft.modality} onChange={(m) => onChange(withModality(draft, m))} icon={<Phone aria-hidden strokeWidth={1.75} />} title="Llamada telefónica" hint={MODALITY_HINT.llamada} tone="video" />
      </div>
    </fieldset>
  );
}

interface DoctorPickerProps extends StepProps {
  candidates: readonly Doctor[];
  onPick: (doctor: Doctor) => void;
}

function DoctorPicker({ draft, errors, ids, candidates, onPick }: DoctorPickerProps) {
  return (
    <fieldset aria-describedby={ids.describedBy("doctor")}>
      <legend className={LEGEND}>Elige a tu doctor</legend>
      <p className={HINT}>Solo te mostramos a quienes atienden tu molestia por {draft.modality === "videollamada" ? "videollamada" : "llamada"}.</p>
      <div className="mt-3 grid gap-3">
        {candidates.map((doctor, index) => {
          const block = describeBlock(doctor.schedule[0]);
          return (
            <DoctorCardOption
              key={doctor.slug}
              id={index === 0 ? ids.field("doctor") : undefined}
              name="doctor"
              doctor={doctor}
              checked={draft.doctorSlug === doctor.slug}
              onSelect={() => onPick(doctor)}
              scheduleText={`${block.days} · ${block.hours}`}
            />
          );
        })}
      </div>
      <FieldError id={ids.error("doctor")} message={errors.doctor} />
    </fieldset>
  );
}

interface SlotPickerProps extends StepProps {
  doctor: Doctor | null;
  days: readonly string[];
  day: string | null;
  onDay: (day: string) => void;
  now: Date;
}

function SlotPicker({ draft, errors, ids, onChange, doctor, days, day, onDay, now }: SlotPickerProps) {
  const today = todayISO(teleconsultSchedule.timeZone, now);
  const slotsFor = (iso: string) => (doctor ? doctorSlots(doctor, iso, draft.modality, now) : []);
  const slots = day ? slotsFor(day) : [];
  return (
    <fieldset aria-describedby={ids.describedBy("slot")} className="space-y-4">
      <legend className={LEGEND}>Día y hora</legend>
      {!doctor ? <p className={HINT}>Primero elige a tu doctor para ver sus turnos.</p> : null}
      <div role="radiogroup" aria-label="Día" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {days.map((iso) => {
          const label = dayChipLabel(iso, today);
          const disabled = slotsFor(iso).length === 0;
          return (
            <label key={iso} className={cn(PILL, "min-h-16", day === iso ? PILL_ON : PILL_OFF)}>
              <input type="radio" name="day" value={iso} checked={day === iso} disabled={disabled} onChange={() => onDay(iso)} className="sr-only" />
              <span>{label.title}</span>
              <span className="text-xs font-normal">{disabled && doctor ? "Sin turnos" : label.subtitle}</span>
            </label>
          );
        })}
      </div>
      {day && slots.length > 0 ? (
        <div role="radiogroup" aria-label="Hora" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((minutes, index) => {
            const checked = draft.slot?.date === day && draft.slot.minutes === minutes;
            return (
              <label key={minutes} className={cn(PILL, "min-h-12", checked ? PILL_ON : PILL_OFF)}>
                <input id={index === 0 ? ids.field("slot") : undefined} type="radio" name="slot" checked={checked} onChange={() => onChange({ ...draft, slot: { date: day, minutes } })} className="sr-only" />
                {formatTime(minutes)}
              </label>
            );
          })}
        </div>
      ) : null}
      <FieldError id={ids.error("slot")} message={errors.slot} />
    </fieldset>
  );
}

/** Paso 2: modalidad, doctor filtrado por molestia y turno de los próximos días hábiles. */
export function StepSchedule(props: StepProps) {
  const { draft, onChange } = props;
  const [now] = useState(() => new Date());
  const days = useMemo(() => nextBusinessDays(teleconsultSchedule, DAYS_TO_SHOW, now), [now]);
  const candidates = doctorsFor(draft.complaint ?? "general", draft.modality);
  const doctor = candidates.find((d) => d.slug === draft.doctorSlug) ?? null;
  const [day, setDay] = useState<string | null>(draft.slot?.date ?? null);

  function pickDoctor(next: Doctor) {
    const firstDay = days.find((iso) => doctorSlots(next, iso, draft.modality, now).length > 0) ?? null;
    const keepDay = day && doctorSlots(next, day, draft.modality, now).length > 0 ? day : firstDay;
    setDay(keepDay);
    onChange(withDoctor(draft, next.slug));
  }

  return (
    <div className="space-y-7">
      <HoursBadge />
      <ModalityToggle {...props} />
      <DoctorPicker {...props} candidates={candidates} onPick={pickDoctor} />
      <SlotPicker {...props} doctor={doctor} days={days} day={day} onDay={setDay} now={now} />
    </div>
  );
}
