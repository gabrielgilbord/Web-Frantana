"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import clsx from "clsx";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  parallax?: boolean;
  /** CSS object-position — use "top" / "50% 10%" for full-body portraits */
  objectPosition?: string;
};

export function MediaReveal({
  src,
  alt,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, 70vw",
  parallax = false,
  objectPosition = "50% 12%",
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], parallax && !reduce ? ["-4%", "4%"] : ["0%", "0%"]);

  return (
    <motion.div
      ref={ref}
      className={clsx(
        "overflow-hidden bg-stage",
        !className?.includes("absolute") && "relative",
        className
      )}
      initial={reduce ? false : { clipPath: "inset(8% 8% 8% 8%)", opacity: 0.6 }}
      whileInView={reduce ? undefined : { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div style={{ y }} className="absolute inset-0 scale-[1.04]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition }}
        />
      </motion.div>
    </motion.div>
  );
}
