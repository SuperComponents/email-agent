import { cn } from "@/lib/utils";

type ToggleProps = {
  onClick: () => void;
  size?: "sm" | "base" | "lg";
  toggled: boolean;
};

export const Toggle = ({ onClick, size = "base", toggled }: ToggleProps) => {
  return (
    <button
      type="button"
      className={cn(
        "toggle ob-focus interactive cursor-pointer rounded-full border border-transparent p-1 transition-all duration-300",
        {
          "h-5.5 w-8.5": size === "sm",
          "h-6.5 w-10.5": size === "base",
          "h-7.5 w-12.5": size === "lg",
          "toggled": toggled,
        }
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "aspect-square h-full rounded-full bg-white transition-all",
          {
            "translate-x-full": toggled,
          }
        )}
      />
    </button>
  );
};
