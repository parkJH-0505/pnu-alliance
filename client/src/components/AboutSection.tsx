/*
 * AboutSection — PNU Alliance (고도화)
 * - 개선된 에디토리얼 레이아웃
 * - 호스트 소개 강화
 * - 인용구 강조
 * - 이미지 호버 효과
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-28 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-charcoal-deep noise-overlay" />

      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-gold/8 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        {/* Section Header */}
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
              Why We Exist
            </span>
          </div>
          <h2
            className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            사람의 문제가 아니라
            <br />
            <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
              구조의 문제였다
            </span>
          </h2>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column — Text */}
          <div className="lg:col-span-5 space-y-8">
            <FadeIn>
              <p
                className="text-ivory/65 text-base lg:text-lg leading-[1.9]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                서울에 올라오니까 느꼈다. 외롭다. 실력의 문제가 아니라 연결의 부재.
                비슷한 수준의 사람들이 서로 모르고 각자 싸우고 있다.
                SKY 출신들은 이미 촘촘하게 연결되어 있고, 그 안에서 정보와 기회가 돈다.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p
                className="text-ivory/65 text-base lg:text-lg leading-[1.9]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                지방 거점국립대 출신들은 — 노드의 퀄리티는 절대 뒤지지 않는데 —
                노드 사이의 연결이 없다. 플랫폼이 없어서 그렇다. 자리가 없었다.
                PNU Alliance는 그 구조를 만들기 위해 시작되었다.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <blockquote className="border-l-2 border-gold/40 pl-5 py-1">
                <p
                  className="text-ivory/60 text-base italic leading-[1.8]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                >
                  "학교는 똑같은데, 다 분야가 달라요. 그래서 이 다양성이 참 귀하다."
                </p>
                <cite
                  className="text-gold/50 text-xs tracking-[0.2em] uppercase not-italic mt-2 block"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  — 이대한 선배, 한국핵안보전략포럼
                </cite>
              </blockquote>
            </FadeIn>

            {/* Host Info */}
            <FadeIn delay={0.2}>
              <div className="border border-gold/12 bg-charcoal/40 p-6 mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gold/40" />
                  <div>
                    <span
                      className="text-gold/60 text-[10px] tracking-[0.3em] uppercase block"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      Hosts
                    </span>
                    <h4
                      className="text-ivory text-lg"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                    >
                      박준홍 & 성현두
                    </h4>
                  </div>
                </div>
                <p
                  className="text-ivory/45 text-sm leading-[1.9]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  사람을 편하게 만드는 데 재능이 있고, 관계의 결을 읽는다.
                  콜드 컨택에 거부감이 없고, 기록하는 습관이 있고, 기획력이 있다.
                  구조적 문제의식과 개인적 야망 — 둘 다 진짜이고,
                  둘 다 이 프로젝트를 밀고 가는 연료다.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Right Column — Images */}
          <div className="lg:col-span-7 space-y-6">
            <FadeIn delay={0.2}>
              <div className="relative group overflow-hidden">
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-gold/10 to-burgundy/10 border border-gold/20 flex items-center justify-center rounded-sm">
                  <div className="text-center">
                    <ImageIcon size={48} className="text-gold/30 mx-auto mb-3" />
                    <p className="text-ivory/30 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                      1차 모임 사진
                    </p>
                    <p className="text-gold/40 text-xs mt-1" style={{ fontFamily: "var(--font-body)" }}>
                      First Gathering · 2025.11
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/70 to-transparent pointer-events-none" />
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 gap-6">
              <FadeIn delay={0.3}>
                <div className="relative group overflow-hidden">
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-slate-blue/10 to-gold/10 border border-gold/20 flex items-center justify-center rounded-sm">
                    <div className="text-center">
                      <ImageIcon size={40} className="text-gold/30 mx-auto mb-2" />
                      <p className="text-ivory/30 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                        서울의 밤
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/70 to-transparent pointer-events-none" />
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="relative bg-charcoal border border-gold/10 p-6 flex flex-col justify-center aspect-[3/4] rounded-sm">
                  <div className="space-y-5">
                    {[
                      { value: "7", label: "선배 1:1 미팅" },
                      { value: "3", label: "정기 모임" },
                      { value: "40+", label: "연결된 동문" },
                    ].map((item, i) => (
                      <div key={item.label}>
                        {i > 0 && <div className="gold-divider mb-5" />}
                        <span
                          className="text-gold text-4xl lg:text-5xl block"
                          style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                        >
                          {item.value}
                        </span>
                        <p
                          className="text-ivory/40 text-xs tracking-[0.2em] uppercase mt-1"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
