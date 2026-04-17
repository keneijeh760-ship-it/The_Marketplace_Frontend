import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black shadow-sm hover:bg-neutral-200 active:scale-[0.99]",
        secondary:
          "border border-white/15 bg-neutral-900 text-neutral-100 hover:bg-neutral-800 hover:border-white/25",
        ghost:
          "bg-transparent text-neutral-300 hover:bg-white/10 hover:text-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        buy:
          "bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.99] shadow-lg shadow-blue-600/25",
        outline:
          "border border-white/20 bg-transparent text-white hover:bg-white/5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
