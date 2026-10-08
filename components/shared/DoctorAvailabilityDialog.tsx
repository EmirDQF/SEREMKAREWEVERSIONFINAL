"use client";

import Link from "next/link";
import { CalendarClock, Phone, Video } from "lucide-react";
import type { Doctor } from "@/types/medical";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { buttonVariants, type ButtonVariant } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { describeBlock } from "@/lib/booking";
import { clinicWhatsApp, messageForDoctor } from "@/lib/whatsapp";
import { credentialsLabel } from "@/lib/doctor";
import { cn } from "@/lib/utils";

interface DoctorAvailabilityDialogProps {
  doctor: Doctor;
  triggerClassName?: string;
  /** Variante del botón que abre el diálogo (en el agendador es secundario). */
  triggerVariant?: ButtonVariant;
}

/** "Dra. Valeria Quintana Ríos" → "Dra. Valeria" */
function shortName(name: string): string {
  return name.split(" ").slice(0, 2).join(" ");
}

export function DoctorAvailabilityDialog({ doctor, triggerClassName, triggerVariant = "primary" }: DoctorAvailabilityDialogProps) {
  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: triggerVariant }), triggerClassName)}>
        <CalendarClock aria-hidden strokeWidth={1.75} />
        Ver disponibilidad
        <span className="sr-only">de {doctor.name}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{doctor.name}</DialogTitle>
        <DialogDescription>
          {doctor.title} · {credentialsLabel(doctor)}
        </DialogDescription>

        <ul className="mt-6 space-y-3">
          {doctor.schedule.map((block) => {
            const text = describeBlock(block);
            return (
              <li key={text.key} className="rounded-2xl border border-line bg-bg p-4">
                <p className="font-display font-semibold text-heading">{text.days}</p>
                <p className="text-muted">{text.hours}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-tint px-3 py-1 text-sm font-medium text-primary">
                  {block.modalities.includes("videollamada") ? (
                    <Video aria-hidden strokeWidth={1.75} className="size-4" />
                  ) : (
                    <Phone aria-hidden strokeWidth={1.75} className="size-4" />
                  )}
                  {text.modalities}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-[0.95rem] text-muted">
          Te confirmamos el horario exacto por WhatsApp. Atendemos con cita previa.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={clinicWhatsApp(messageForDoctor(doctor.name))}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "whatsapp" }), "flex-1")}
          >
            <WhatsAppIcon />
            Agendar con {shortName(doctor.name)}
          </a>
          <Link href={`/staff/${doctor.slug}`} className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
            Ver perfil
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
