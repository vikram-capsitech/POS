"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "antd";
import { motion, useInView, useSpring, useMotionValue } from "framer-motion";

// ─── Enhanced scroll-aware section wrapper ────────────────────────────────────
export const FadeInSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
  stagger?: boolean;
}> = ({ children, delay = 0, direction = "up", stagger = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const initial =
    direction === "up"
      ? { opacity: 0, y: 80 }
      : direction === "left"
        ? { opacity: 0, x: -80 }
        : { opacity: 0, x: 80 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
        type: "spring",
        stiffness: 80,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  );
};

// ─── Magnetic Button Component ────────────────────────────────────────────────
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  type?: "primary" | "default";
  size?: "large" | "middle";
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  href?: string;
}> = ({ children, onClick, type = "default", size = "large", icon, style, href }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        type={type}
        size={size}
        icon={icon}
        onClick={onClick}
        href={href}
        style={style}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// ─── Floating screenshot with 3D tilt effect ──────────────────────────────────
export const ScreenshotCard: React.FC<{
  src: string;
  label: string;
  delay?: number;
  direction?: "left" | "right";
}> = ({ src, label, delay = 0, direction = "right" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x, y });
  };

  const rotateX = useSpring(isHovering ? mousePosition.y * -10 : 0, { stiffness: 100, damping: 15 });
  const rotateY = useSpring(isHovering ? mousePosition.x * 10 : 0, { stiffness: 100, damping: 15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: direction === "right" ? 100 : -100, y: 30 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 30px 100px rgba(88,56,255,0.2), 0 10px 40px rgba(0,0,0,0.15)",
            border: "1px solid rgba(88,56,255,0.2)",
            background: "#fff",
            position: "relative",
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: "absolute",
              inset: -2,
              background: "linear-gradient(135deg, rgba(88,56,255,0.3), rgba(168,85,247,0.3))",
              borderRadius: 20,
              opacity: isHovering ? 1 : 0,
              transition: "opacity 0.3s",
              filter: "blur(20px)",
              zIndex: -1,
            }}
          />
          <Image
            src={src}
            alt={label}
            width={1200}
            height={750}
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 20 }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          />
        </div>
      </motion.div>
      <motion.div
        animate={{ y: isHovering ? -8 : 0 }}
        style={{
          position: "absolute",
          bottom: -16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#5838ff,#a855f7)",
          color: "#fff",
          borderRadius: 24,
          padding: "6px 22px",
          fontSize: 13,
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(88,56,255,0.4)",
        }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
};

// ─── Animated Number Counter ──────────────────────────────────────────────────
export const AnimatedCounter: React.FC<{ value: string; delay?: number }> = ({ value, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      if (value.includes("+")) {
        const num = parseInt(value);
        let current = 0;
        const increment = Math.ceil(num / 30);
        const interval = setInterval(() => {
          current += increment;
          if (current >= num) {
            setDisplayValue(value);
            clearInterval(interval);
          } else {
            setDisplayValue(current + "+");
          }
        }, 40);
      } else {
        setDisplayValue(value);
      }
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  return <span ref={ref}>{displayValue}</span>;
};
