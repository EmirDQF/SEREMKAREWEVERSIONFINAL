"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Clock, FileText, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import type { BookingStep } from "@/types/medical";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { StepPatient } from "@/components/booking/StepPatient";
import { STEP_MIN_HEIGHT, StepSkeleton, type StepProps } from "@/components/booking/ui";
import { useBookingWizard } from "@/components/booking/useBookingWizard";
import { site } from "@/data/site";
import { EMERGENCY, TELECONSULT_HOURS_LABEL } from "@/data/teleconsult";
import { useOpenStatus } from "@/lib/use-open-status";
import { cn } from "@/lib/utils";

// Pasos 2 y 3 en chunks aparte: no suman al JS inicial de la Home y se precargan al interactuar con el paso 1.
const StepSchedule = dynamic(() => import("@/components/booking/StepSchedule").then((m) => m.StepSchedule), {
  ssr: false,
  loading: () => <StepSkeleton />,
});
const StepConfirm = dynamic(() => import("@/components/booking/StepConfirm").then((m) => m.StepConfirm), {
  ssr: false,
  loading: () => <StepSkeleton />,
});

function preloadNextSteps(): void {
  void import("@/components/booking/StepSchedule");
  void import("@/components/booking/StepConfirm");
}

const STEP_COPY: Readonly<Record<BookingStep, { title: string; why: string }>> = {
  1: { title: "¿Quién consulta y qué sientes?", why: "Con la edad y la molestia te mostramos al doctor adecuado." },
  2: { title: "Modalidad, doctor y horario", why: "Elige cómo conectarte, con quién y cuándo." },
  3: { title: "Confirma tu teleconsulta", why: "Solo tu nombre y tu celular para enviarte el enlace." },
};

function BookingIntro() {
  const status = useOpenStatus();
  return (
    <div>
      <SectionHeading
        id="agendar-title"
        align="left"
        eyebrow="Agenda en 3 pasos"
        title="Agenda tu teleconsulta"
        description="Dinos tu edad y qué te molesta, elige doctor y horario, y confirma por WhatsApp. Sin salir de casa."
      />
      <ul className="mt-8 space-y-4">
        <li className="flex gap-3">
          <Clock aria-hidden strokeWidth={1.75} className="mt-0.5 size-6 shrink-0 text-primary" />
          <span>
            <strong className="block font-display text-heading">{TELECONSULT_HOURS_LABEL}</strong>
            <span className="flex items-center gap-2 text-muted" aria-live="polite">
              {status ? <span aria-hidden className={status.isOpen ? "online-dot" : "offline-dot"} /> : null}
              {status ? status.label : "Hora de Lima"}
            </span>
          </span>
        </li>
        <li className="flex gap-3">
          <Video aria-hidden strokeWidth={1.75} className="mt-0.5 size-6 shrink-0 text-video" />
          <span>
            <strong className="block font-display text-heading">{site.anchors.online}</strong>
            <span className="text-muted">Desde tu celular o tu computadora.</span>
          </span>
        </li>
        <li className="flex gap-3">
          <FileText aria-hidden strokeWidth={1.75} className="mt-0.5 size-6 shrink-0 text-primary" />
          <span>
            <strong className="block font-display text-heading">{site.anchors.prescription}</strong>
            <span className="text-muted">Por WhatsApp o correo, si el médico lo indica.</span>
          </span>
        </li>
        <li className="flex gap-3">
          <ShieldCheck aria-hidden strokeWidth={1.75} className="mt-0.5 size-6 shrink-0 text-primary" />
          <span>
            <strong className="block font-display text-heading">Tus datos están protegidos</strong>
            <span className="text-muted">Solo los usamos para coordinar tu atención (Ley N.° 29733).</span>
          </span>
        </li>
      </ul>
    </div>
  );
}

interface StepNavProps {
  step: BookingStep;
  onBack: () => void;
  onNext: () => void;
}

function StepNav({ step, onBack, onNext }: StepNavProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {step > 1 ? (
        <button type="button" onClick={onBack} className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft aria-hidden strokeWidth={1.75} /> Atrás
        </button>
      ) : (
        <span />
      )}
      {step < 3 ? (
        <button
          type="button"
          onClick={onNext}
          onFocus={preloadNextSteps}
          onPointerEnter={preloadNextSteps}
          onTouchStart={preloadNextSteps}
          className={cn(buttonVariants({ variant: "primary", size: "lg" }), "sm:min-w-48")}
        >
          Siguiente <ArrowRight aria-hidden strokeWidth={1.75} />
        </button>
      ) : (
        <button type="submit" className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }), "sm:min-w-64")}>
          <WhatsAppIcon /> Agendar mi teleconsulta
        </button>
      )}
    </div>
  );
}

function CurrentStep({ step, props, onEdit }: { step: BookingStep; props: StepProps; onEdit: (s: BookingStep) => void }) {
  if (step === 1) return <StepPatient {...props} />;
  if (step === 2) return <StepSchedule {...props} />;
  return <StepConfirm {...props} onEdit={onEdit} />;
}

/** Agendador de teleconsulta en 3 pasos, sin backend: arma el mensaje y abre WhatsApp. */
export function AppointmentForm() {
  const { step, draft, errors, ids, setDraft, goTo, sentMessage, reset, submit, next, headingRef } = useBookingWizard();
  const stepProps: StepProps = { draft, errors, ids, onChange: setDraft };

  return (
    <section id="agendar" aria-labelledby="agendar-title" className="section-y bg-bg-alt">
      <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <BookingIntro />
        <div className="rounded-[2rem] border border-line bg-card-solid p-6 shadow-lift sm:p-8">
          {sentMessage ? (
            <BookingSuccess message={sentMessage} onReset={reset} />
          ) : (
            <form onSubmit={submit} noValidate className="space-y-7">
              <BookingProgress step={step} />
              <div>
                <h3 ref={headingRef} tabIndex={-1} className="text-h3 focus:outline-none focus-visible:outline-3">
                  {STEP_COPY[step].title}
                </h3>
                <p className="mt-1 text-muted">{STEP_COPY[step].why}</p>
              </div>
              <div className={STEP_MIN_HEIGHT}>
                <CurrentStep step={step} props={stepProps} onEdit={goTo} />
              </div>
              <StepNav step={step} onBack={() => goTo((step - 1) as BookingStep)} onNext={next} />
              <p className="flex items-start gap-2 border-t border-line pt-4 text-sm text-muted">
                <ShieldAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-alert" />
                <span>
                  <strong className="font-semibold text-heading">{EMERGENCY.notice}</strong> {EMERGENCY.action}
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
