"use client";

import React, { useRef } from "react";
import { Row, Col, Typography } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ScreenshotCard, AnimatedCounter } from "./Animations";

const { Title, Paragraph, Text } = Typography;

export const ModuleBlock: React.FC<{
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  screenshot: string;
  bullets: string[];
  reverse?: boolean;
  index: number;
}> = ({ icon, color, title, description, screenshot, bullets, reverse, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <article
      ref={ref}
      style={{
        padding: "100px 0",
        borderBottom: "1px solid #f0f0f0",
        position: "relative",
      }}
    >
      {/* Decorative background element */}
      <motion.div
        style={{
          position: "absolute",
          top: "20%",
          [reverse ? "right" : "left"]: "-10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
          pointerEvents: "none",
          y,
        }}
      />

      <Row
        gutter={[80, 60]}
        align="middle"
        style={{ flexDirection: reverse ? "row-reverse" : "row" }}
      >
        {/* Text side */}
        <Col xs={24} md={11}>
          <motion.div
            initial={{ opacity: 0, x: reverse ? 60 : -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: `${color}15`,
                border: `1.5px solid ${color}40`,
                borderRadius: 12,
                padding: "8px 18px",
                marginBottom: 24,
              }}
            >
              <span style={{ color, fontSize: 20 }}>{icon}</span>
              <Text style={{ color, fontWeight: 700, fontSize: 14, letterSpacing: "0.5px" }}>
                Module {String(index + 1).padStart(2, "0")}
              </Text>
            </motion.div>

            <Title level={2} style={{ fontSize: 36, fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
              {title}
            </Title>
            <Paragraph style={{ fontSize: 17, color: "#666", lineHeight: 1.8, marginBottom: 32 }}>
              {description}
            </Paragraph>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  whileHover={{ x: 8, transition: { duration: 0.2 } }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <CheckCircleFilled style={{ color, fontSize: 18, marginTop: 2 }} />
                  <Text style={{ fontSize: 16, color: "#444", lineHeight: 1.6 }}>{b}</Text>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Col>

        {/* Screenshot side */}
        <Col xs={24} md={13}>
          <ScreenshotCard
            src={screenshot}
            label={title}
            delay={0.3}
            direction={reverse ? "left" : "right"}
          />
        </Col>
      </Row>
    </article>
  );
};

export const StatCard: React.FC<{ value: string; label: string; color: string; delay?: number }> = ({
  value,
  label,
  color,
  delay = 0,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      style={{
        textAlign: "center",
        padding: "40px 24px",
        borderRadius: 20,
        background: "#fff",
        boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
        border: `2px solid ${color}20`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated gradient background on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${color}05, ${color}15)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ fontSize: 44, fontWeight: 900, color, lineHeight: 1, position: "relative" }}>
        <AnimatedCounter value={value} delay={delay} />
      </div>
      <div style={{ fontSize: 15, color: "#888", marginTop: 12, fontWeight: 600, position: "relative" }}>
        {label}
      </div>
    </motion.div>
  );
};
