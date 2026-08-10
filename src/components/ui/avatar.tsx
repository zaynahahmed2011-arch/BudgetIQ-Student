import { cn } from "@/lib/utils";

function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn("size-9 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground",
        className
      )}
    >
      {initials}
    </div>
  );
}

export { Avatar };
