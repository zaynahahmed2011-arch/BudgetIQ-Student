import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:brightness-105 active:translate-y-[1px] active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:brightness-105",
        outline:
          "border-2 border-foreground/80 bg-transparent hover:bg-muted text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_3px_0_0_rgba(0,0,0,0.1)] hover:brightness-105",
        ghost: "rounded-xl hover:bg-muted text-foreground font-medium",
        link: "text-primary underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 px-4 text-xs has-[>svg]:px-3",
        lg: "h-14 px-7 text-base has-[>svg]:px-6",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
