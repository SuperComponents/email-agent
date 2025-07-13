import { motion } from "framer-motion";

export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full"
          animate={{
            y: ["0%", "-50%", "0%"],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};