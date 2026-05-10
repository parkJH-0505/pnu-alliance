/*
 * HeroSection — PNU Alliance (고도화)
 * - 타이핑 효과 (히어로 타이틀)
 * - 패럴랙스 배경 이미지
 * - 스크롤 시 콘텐츠 페이드아웃
 * - 통계 수치 표시
 */
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const HERO_IMG = "/images/hero-space-background.jpg";

function useTypewriter(text: string, speed = 60, startDelay = 800) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
        else { setDone(true); clearInterval(interval); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const { displayed: line1, done: done1 } = useTypewriter("혼자 싸우지 않아도", 55, 600);
  const { displayed: line2 } = useTypewriter("되는 세상을 만든다", 55, done1 ? 100 : 99999);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      {/* Parallax Background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <img
          src={HERO_IMG}
          alt="PNU Alliance members club"
          className="w-full h-full object-cover scale-110"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-deep/65 via-charcoal-deep/45 to-charcoal-deep/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/55 via-transparent to-charcoal-deep/35" />
      </motion.div>

      {/* Decorative orbit rings */}
      <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] rounded-full border border-gold/4 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-[-5%] w-[400px] h-[400px] rounded-full border border-gold/6 -translate-y-1/2 pointer-events-none" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 h-full flex flex-col justify-end pb-20 lg:pb-28 px-6 lg:px-16 max-w-7xl mx-auto"
      >
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-12 h-px bg-gold/60" />
          <span
            className="text-gold/80 text-xs tracking-[0.35em] uppercase"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Trust-Based Network · Since 2025
          </span>
        </motion.div>

        {/* Main Title — Typewriter */}
        <div
          className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl text-ivory leading-[0.95] mb-6 min-h-[2.2em] lg:min-h-[2.8em]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          <div>{line1}</div>
          <div className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
            {line2}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-0.5 h-[0.75em] bg-gold/60 ml-1 align-middle"
            />
          </div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="text-ivory/50 text-base lg:text-lg max-w-xl leading-relaxed mb-8"
          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          서울에서 각자의 궤도를 그리는 부산대 출신들이
          서로를 발견하고, 연결되고, 함께 성장하는 신뢰 기반 네트워크.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="flex items-center gap-8 mb-10"
        >
          {[
            { value: "40+", label: "연결된 동문" },
            { value: "2회", label: "오프라인 모임" },
            { value: "7회", label: "선배 미팅" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="text-gold text-xl lg:text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}>
                {stat.value}
              </span>
              <span className="text-ivory/30 text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#about"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold text-charcoal-deep text-sm tracking-[0.15em] uppercase hover:bg-gold-light transition-all duration-300 group"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
          >
            우리의 이야기
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="#join"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-ivory/25 text-ivory/70 text-sm tracking-[0.15em] uppercase hover:border-gold hover:text-gold transition-all duration-300"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            합류하기
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span
          className="text-ivory/25 text-[10px] tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-gold/35" />
        </motion.div>
      </motion.div>
    </section>
  );
}
