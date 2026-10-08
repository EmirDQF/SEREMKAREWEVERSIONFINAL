import Image from "next/image";
import type { Doctor } from "@/types/medical";
import { cn } from "@/lib/utils";

type PortraitDoctor = Pick<Doctor, "name" | "photo" | "photoAlt" | "initials">;

interface DoctorPortraitProps {
  doctor: PortraitDoctor;
  /** Clases del contenedor (tamaño, radio). Con `fill`, el padre debe ser `relative`. */
  className?: string;
  /** Llena el contenedor padre (como next/image `fill`). */
  fill?: boolean;
  /** Tamaño en px cuando no se usa `fill`. */
  size?: number;
  sizes?: string;
  /** Solo en la imagen LCP (hero). */
  priority?: boolean;
  /** "" si la imagen es decorativa (el nombre ya está al lado). */
  alt?: string;
}

/**
 * Retrato del médico. Mientras no haya foto real (`photo: null`) muestra un retrato de marca
 * con las iniciales, del mismo tamaño, para que no haya saltos de layout al cambiarla.
 */
export function DoctorPortrait({
  doctor,
  className,
  fill = false,
  size = 64,
  sizes,
  priority = false,
  alt,
}: DoctorPortraitProps) {
  const label = alt ?? doctor.photoAlt;

  if (doctor.photo) {
    return fill ? (
      <Image
        src={doctor.photo}
        alt={label}
        fill
        sizes={sizes ?? "100vw"}
        preload={priority}
        className={cn("object-cover object-top", className)}
      />
    ) : (
      <Image
        src={doctor.photo}
        alt={label}
        width={size}
        height={size}
        preload={priority}
        className={cn("object-cover object-top", className)}
      />
    );
  }

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      style={fill ? undefined : { width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        "portrait-placeholder grid shrink-0 place-items-center overflow-hidden font-display font-semibold tracking-wide text-white",
        fill && "absolute inset-0 text-[clamp(2.5rem,9vw,5.5rem)]",
        className,
      )}
    >
      <span aria-hidden>{doctor.initials}</span>
    </span>
  );
}
