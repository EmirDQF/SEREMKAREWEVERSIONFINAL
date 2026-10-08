import Image from "next/image";
import Link from "next/link";
import { Award, GraduationCap, ShieldCheck } from "lucide-react";
import type { Doctor } from "@/types/medical";
import { DoctorAvailabilityDialog } from "@/components/shared/DoctorAvailabilityDialog";
import { cn } from "@/lib/utils";

interface DoctorCardProps {
  doctor: Doctor;
}

interface DoctorCardOptionProps {
  doctor: Doctor;
  name: string;
  checked: boolean;
  onSelect: () => void;
  /** Resumen del horario ("Lunes, miércoles y viernes · 7:00 p.m. – 10:00 p.m."). */
  scheduleText: string;
  id?: string;
  describedBy?: string;
}

/** Variante compacta y seleccionable (radio) para el agendador; conserva el diálogo de disponibilidad. */
export function DoctorCardOption({ doctor, name, checked, onSelect, scheduleText, id, describedBy }: DoctorCardOptionProps) {
  return (
    <article
      className={cn(
        "rounded-[1.5rem] border bg-card-solid p-4 shadow-soft transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring",
        checked ? "border-video bg-video-tint" : "border-line hover:border-video",
      )}
    >
      <label className="flex cursor-pointer items-start gap-4">
        <input id={id} type="radio" name={name} checked={checked} onChange={onSelect} aria-describedby={describedBy} className="sr-only" />
        <Image src={doctor.photo} alt="" width={64} height={64} className="size-16 shrink-0 rounded-2xl object-cover object-top" />
        <span className="min-w-0 flex-1">
          <span className="block font-display font-semibold text-heading">{doctor.name}</span>
          <span className="block text-sm font-medium text-primary">{doctor.specialty}</span>
          <span className="mt-1 block text-sm text-muted">{scheduleText}</span>
        </span>
        <span
          aria-hidden
          className={cn(
            "mt-1 grid size-6 shrink-0 place-items-center rounded-full border-2",
            checked ? "border-video bg-video-strong" : "border-line-strong",
          )}
        >
          {checked ? <span className="size-2 rounded-full bg-on-video" /> : null}
        </span>
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-2 sm:pl-20">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
          <ShieldCheck aria-hidden strokeWidth={1.75} className="size-4 text-primary" />
          CMP {doctor.cmp} · RNE {doctor.rne}
        </span>
        <DoctorAvailabilityDialog doctor={doctor} triggerVariant="ghost" triggerClassName="min-h-11 px-3 text-sm" />
      </div>
    </article>
  );
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-card-solid shadow-soft transition-shadow duration-300 hover:shadow-lift">
      <div className="relative aspect-[4/4.4] overflow-hidden bg-bg-alt">
        <Image
          src={doctor.photo}
          alt={doctor.photoAlt}
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 92vw"
          className="scale-[1.06] object-cover object-top transition-[scale,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [translate:calc(var(--tilt-x,0)*-10px)_calc(var(--tilt-y,0)*-10px)] group-hover:scale-[1.1]"
        />
        <span className="glass absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-heading">
          <Award aria-hidden strokeWidth={1.75} className="size-4 text-primary" />
          {doctor.yearsOfExperience} años de experiencia
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-h3">
          <Link href={`/staff/${doctor.slug}`} className="hover:text-primary">
            {doctor.name}
          </Link>
        </h3>
        <p className="mt-1 font-medium text-primary">{doctor.specialty}</p>
        <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-bg-alt px-3 py-1 text-sm font-medium text-muted shadow-[inset_0_1px_0_rgb(255_255_255/0.9),inset_0_-1px_2px_rgb(15_23_42/0.08),0_1px_2px_rgb(15_23_42/0.06)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-1px_2px_rgb(0_0_0/0.4)]">
          <ShieldCheck aria-hidden strokeWidth={1.75} className="size-4 text-primary" />
          CMP {doctor.cmp} · RNE {doctor.rne}
        </p>
        <p className="mt-4 flex items-start gap-2 text-[0.95rem] text-muted">
          <GraduationCap aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-primary" />
          {doctor.education[1] ?? doctor.education[0]}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Enfoque clínico">
          {doctor.focus.slice(0, 3).map((item) => (
            <li key={item} className="rounded-full bg-bg-alt px-3 py-1 text-sm text-fg">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">
          <DoctorAvailabilityDialog doctor={doctor} triggerClassName="w-full" />
        </div>
      </div>
    </article>
  );
}
