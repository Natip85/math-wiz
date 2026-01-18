"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: [
          "bg-primary",
          "text-primary-foreground",
          "shadow-sm",
          "hover:enabled:bg-primary/90",
          "active:bg-primary/80",
        ],
        secondary: [
          "bg-secondary",
          "text-secondary-foreground",
          "shadow-sm",
          "hover:enabled:bg-secondary/80",
          "active:bg-secondary/70",
        ],
        outline: [
          "border",
          "border-input",
          "bg-background",
          "shadow-xs",
          "hover:enabled:bg-accent",
          "hover:enabled:text-accent-foreground",
          "dark:bg-input/30",
          "dark:border-input",
          "dark:hover:enabled:bg-input/50",
          "active:bg-accent/80",
        ],
        destructive: [
          "bg-destructive",
          "text-destructive-foreground",
          "shadow-sm",
          "hover:enabled:bg-destructive/90",
          "focus-visible:ring-destructive/20",
          "dark:focus-visible:ring-destructive/40",
          "dark:bg-destructive/60",
          "active:bg-destructive/80",
        ],
        ghost: [
          "hover:enabled:bg-accent",
          "hover:enabled:text-accent-foreground",
          "dark:hover:enabled:bg-accent/50",
          "active:bg-accent/80",
        ],
        link: ["text-primary", "underline-offset-4", "hover:underline"],
      },
      size: {
        sm: ["text-xs", "py-1", "px-2", "h-9", "rounded-[8px]"],
        default: ["text-base", "py-2", "px-4", "h-11", "rounded-[9px]"],
        lg: ["text-lg", "py-3", "px-6", "h-14", "rounded-[11px]"],
        icon: ["size-11", "rounded-[9px]", "p-0"],
        "icon-sm": ["size-9", "rounded-[8px]", "p-0"],
        "icon-lg": ["size-14", "rounded-[11px]", "p-0"],
      },
      fullWidth: {
        true: "w-full",
      },
    },
    compoundVariants: [
      {
        variant: ["default", "secondary", "destructive"],
        size: "default",
        // className: "uppercase",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends HTMLMotionProps<"button">, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  fullWidth,
  children,
  loading = false,
  disabled,
  asChild = false,
  ...props
}) => {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

  // When asChild is true, use Slot to pass props to the child element
  // Wrap in motion.span to preserve animations
  if (asChild) {
    return (
      <motion.span
        className="inline-block"
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Slot className={classes} data-slot="button" data-variant={variant} data-size={size}>
          {children}
        </Slot>
      </motion.span>
    );
  }

  return (
    <motion.button
      className={classes}
      disabled={disabled || loading}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      {...props}
    >
      {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
      <motion.span
        className="inline-flex items-center gap-2"
        initial={{ opacity: 1 }}
        animate={{ opacity: loading ? 0.7 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

export { Button, buttonVariants };
