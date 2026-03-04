/*
 * ScrollProgress — PNU Alliance
 * - 페이지 스크롤 진행 상황을 상단에 표시하는 진행 바
 * - Framer Motion 애니메이션
 */
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      style={{ scaleX }}
      className="scroll-progress"
    />
  );
}
