import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/20 bg-white text-black",
        secondary: "border-white/10 bg-neutral-800 text-neutral-200",
        outline: "border-white/20 bg-transparent text-neutral-200",
        pending: "border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
        processing: "border-blue-500/30 bg-blue-500/15 text-blue-400",
        shipped: "border-purple-500/30 bg-purple-500/15 text-purple-400",
        delivered: "border-green-500/30 bg-green-500/15 text-green-400",
        cancelled: "border-red-500/30 bg-red-500/15 text-red-400",
        success: "border-green-500/30 bg-green-500/15 text-green-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
