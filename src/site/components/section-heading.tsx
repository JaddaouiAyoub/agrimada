import { cn } from "@/lib/utils";
import { StarMark } from "@/site/components/icons";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  tone = "dark",
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "eyebrow inline-flex items-center gap-2.5",
          tone === "light" ? "text-saffron" : "text-olive",
        )}
      >
        <StarMark className="size-3 text-saffron" />
        {eyebrow}
      </p>
      <h2
        className={cn(
          "display mt-4 text-[2.4rem] sm:text-5xl lg:text-[3.6rem]",
          tone === "light" ? "text-ivory" : "text-forest",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-5 text-[1.05rem] leading-relaxed",
            tone === "light" ? "text-ivory/70" : "text-stone",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
