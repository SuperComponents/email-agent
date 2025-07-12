import { Loader } from "@/components/loader/Loader";
import { Slot } from "@/components/slot/Slot";
import { Tooltip } from "@/components/tooltip/Tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  displayContent?: "items-first" | "items-last"; // used for children of component
  external?: boolean;
  href?: string;
  loading?: boolean;
  shape?: "base" | "square" | "circular";
  size?: "sm" | "md" | "lg" | "base";
  title?: string | React.ReactNode;
  toggled?: boolean;
  tooltip?: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "tertiary";
};

const ButtonComponent = ({
  as,
  children,
  className,
  disabled,
  displayContent = "items-last",
  external,
  href,
  loading,
  shape = "base",
  size = "base",
  title,
  toggled,
  variant = "secondary",
  ...props
}: ButtonProps) => {
  const MotionComponent = as === "a" ? motion.a : motion.button;
  const isMotionCompatible = !as || as === "a" || as === "button";

  const buttonClasses = cn(
    "btn add-focus group interactive flex w-max shrink-0 items-center font-medium select-none transition-all duration-300",
    {
      "btn-primary": variant === "primary",
      "btn-secondary": variant === "secondary",
      "btn-tertiary": variant === "tertiary",
      "btn-ghost": variant === "ghost",
      "btn-destructive": variant === "destructive",

      "add-size-sm gap-1": size === "sm",
      "add-size-md gap-1.5": size === "md",
      "add-size-base gap-2": size === "base",

      square: shape === "square",
      circular: shape === "circular",

      "flex-row-reverse": displayContent === "items-first",

      "add-disable": disabled,

      toggle: toggled,
    },
    className
  );

  const content = (
    <>
      {title}
      {loading ? (
        <span
          className={cn({
            "w-3": size === "sm",
            "w-3.5": size === "md",
            "w-4": size === "base",
            "ease-bounce transition-[width] duration-300 starting:w-0":
              !children,
          })}
        >
          <Loader size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
        </span>
      ) : (
        children
      )}
    </>
  );

  if (isMotionCompatible) {
    return (
      <MotionComponent
        className={buttonClasses}
        disabled={disabled}
        href={href}
        rel={external ? "noopener noreferrer" : undefined}
        target={external ? "_blank" : undefined}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {content}
      </MotionComponent>
    );
  }

  return (
    <Slot
      as={as ?? "button"}
      className={buttonClasses}
      disabled={disabled}
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
      {...props}
    >
      {content}
    </Slot>
  );
};

export const Button = ({ ...props }: ButtonProps) => {
  return props.tooltip ? (
    <Tooltip content={props.tooltip} className={props.className} id={props.id}>
      <ButtonComponent {...props} className={undefined} />
    </Tooltip>
  ) : (
    <ButtonComponent {...props} />
  );
};
