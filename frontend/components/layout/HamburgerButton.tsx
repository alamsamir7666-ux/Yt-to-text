"use client";

import { motion } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerButton({ isOpen, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <motion.span
        className="block h-0.5 w-5 bg-white origin-center"
        animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="block h-0.5 w-5 bg-white"
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className="block h-0.5 w-5 bg-white origin-center"
        animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.2 }}
      />
    </button>
  );
}
