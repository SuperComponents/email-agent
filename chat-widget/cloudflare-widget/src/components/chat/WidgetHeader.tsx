import { motion } from "framer-motion";
import { Button } from "@/components/button/Button";
import {
  Moon,
  Sun,
  Trash,
  X,
} from "@phosphor-icons/react";

interface WidgetHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function WidgetHeader({
  theme,
  onToggleTheme,
  onClear,
  onClose,
}: WidgetHeaderProps) {
  return (
    <div className="widget-header px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3" role="banner">
      <motion.div 
        className="flex items-center justify-center h-8 w-8 relative"
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <img
          src="/favicon-32x32.png"
          alt="OpenSupport"
          width="28"
          height="28"
          className="rounded-sm"
        />
        {/* Sparkle effects */}
        <span className="sparkle" style={{ top: '-2px', left: '20px', animationDelay: '0s' }}></span>
        <span className="sparkle" style={{ top: '10px', right: '-2px', animationDelay: '0.5s' }}></span>
        <span className="sparkle" style={{ bottom: '-2px', left: '10px', animationDelay: '1s' }}></span>
      </motion.div>

      <div className="flex-1">
        <h2 className="font-semibold text-sm sm:text-base gradient-text">OpenSupport</h2>
      </div>



      <Button
        variant="ghost"
        size="md"
        shape="square"
        className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:scale-110 transition-transform"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        onClick={onToggleTheme}
      >
        {theme === "dark" ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-600" />}
      </Button>

      <Button
        variant="ghost"
        size="md"
        shape="square"
        className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:text-red-500 hover:scale-110 transition-all"
        aria-label="Clear chat history"
        onClick={onClear}
      >
        <Trash size={20} />
      </Button>

      <Button
        variant="ghost"
        size="md"
        shape="square"
        className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:rotate-90 transition-all duration-300"
        aria-label="Close chat widget"
        onClick={onClose}
      >
        <X size={20} />
      </Button>
    </div>
  );
}
