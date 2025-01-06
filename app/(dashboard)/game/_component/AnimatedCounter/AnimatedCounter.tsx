import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  from: number;
  to: number;
  className?: string;
}

export default function AnimatedCounter({
  from,
  to,
  className = "",
}: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest: any) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, {
      duration: 2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, to]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
