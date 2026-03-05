/*
 * NetworkSection — PNU Alliance
 * Design: Data-driven editorial layout with animated counters
 * Copy: 뿌리문서 — 실제 업계 분포 (방산, 금융, AI, 무역물류, 언론, 법조, 의료 등)
 * "노드의 퀄리티는 이미 충분했다. 부족했던 건 이들을 잇는 구조였다."
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Shield,
  Code,
  TrendingUp,
  Ship,
  Newspaper,
  Scale,
  Stethoscope,
  Briefcase,
} from "lucide-react";

const SEOUL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663106122854/geKm9UWf6wUBp2hktfGtxf/seoul-night-8ubjjUtRfLbRXv8np5CQdR.webp";

interface Industry {
  name: string;
  nameKr: string;
  icon: React.ReactNode;
}

const industries: Industry[] = [
  { name: "Defense & Aerospace", nameKr: "방산", icon: <Shield size={18} /> },
  { name: "Finance & Consulting", nameKr: "금융/컨설팅", icon: <TrendingUp size={18} /> },
  { name: "AI & Tech", nameKr: "AI/테크", icon: <Code size={18} /> },
  { name: "Trade & Logistics", nameKr: "무역/물류", icon: <Ship size={18} /> },
  { name: "Media & Press", nameKr: "언론/미디어", icon: <Newspaper size={18} /> },
  { name: "Law & Public", nameKr: "법조/공공", icon: <Scale size={18} /> },
  { name: "Medical & Bio", nameKr: "의료/바이오", icon: <Stethoscope size={18} /> },
  { name: "Business & Startup", nameKr: "경영/스타트업", icon: <Briefcase size={18} /> },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function NetworkSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="network" className="relative py-28 lg:py-40 overflow-hidden">
      <div className="absolute inset-0">
        <img src={SEOUL_IMG} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-charcoal-deep/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span
              className="text-gold/70 text-xs tracking-[0.35em] uppercase"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              Our Network
            </span>
          </div>
          <div className="max-w-3xl">
            <h2
              className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              서울 곳곳에서
              <br />
              <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
                각자의 궤도를 그리는 사람들
              </span>
            </h2>
            <p
              className="text-ivory/45 text-base leading-relaxed"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              노드의 퀄리티는 이미 충분했다. 방산, 금융, AI, 무역물류, 언론, 법조, 의료 —
              부산대 출신들은 서울 곳곳에서 자신만의 커리어를 만들어가고 있었다.
              부족했던 건 이들을 잇는 구조였다.
            </p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {[
            { label: "연결된 동문", value: 40, suffix: "+" },
            { label: "업계 분포", value: 8, suffix: "+" },
            { label: "오프라인 모임", value: 2, suffix: "회" },
            { label: "선배 1:1 미팅", value: 7, suffix: "회" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-gold/10 bg-charcoal/30 backdrop-blur-sm p-6 lg:p-8 text-center"
            >
              <span
                className="text-gold text-3xl lg:text-4xl xl:text-5xl block mb-2"
                style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </span>
              <span
                className="text-ivory/40 text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Industry Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3
            className="text-2xl text-ivory mb-2"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            우리가 속한 업계
          </h3>
          <p
            className="text-ivory/35 text-sm mb-8"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            "학교는 똑같은데, 다 분야가 달라요. 그래서 이 다양성이 참 귀하다." — 이대한 선배 (한국핵안보전략포럼)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {industries.map((industry, i) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.06 }}
                className="group border border-gold/8 bg-charcoal/20 p-5 hover:border-gold/25 transition-all duration-400 text-center"
              >
                <div className="text-gold/50 group-hover:text-gold/80 transition-colors duration-300 flex justify-center mb-3">
                  {industry.icon}
                </div>
                <p
                  className="text-ivory/70 text-sm mb-0.5"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                >
                  {industry.nameKr}
                </p>
                <p
                  className="text-ivory/25 text-[11px]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  {industry.name}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
