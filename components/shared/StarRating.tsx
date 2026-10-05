import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_STARS = 5;

interface StarRatingProps {
  rating: number;
  className?: string;
}

export function StarRating({ rating, className }: StarRatingProps) {
  return (
    <span role="img" aria-label={`${rating} de ${MAX_STARS} estrellas`} className={cn("inline-flex gap-0.5", className)}>
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          strokeWidth={1.5}
          className={cn("size-4", i < Math.round(rating) ? "fill-rating text-rating" : "text-line-strong")}
        />
      ))}
    </span>
  );
}
