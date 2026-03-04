/*
 * CultureSection — PNU Alliance (신규)
 * - Culture Code: 커뮤니티가 지향하는 가치와 행동 원칙
 * - 인터랙티브 카드 (호버 시 상세 설명)
 * - 뿌리문서 기반 콘텐츠
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const codes = [
  {
    number: "01",
    title: "진정성",
    subtitle: "Authenticity",
    short: "스펙이 아닌 사람으로 만난다",
    description: "PNU Alliance에서는 명함보다 사람이 먼저다. 현재의 직함이나 회사가 아니라, 어디서 왔고 어디로 가고 있는지가 중요하다. 허세 없이, 있는 그대로의 모습으로 만난다.",
    icon: "◇",
  },
  {
    number: "02",
    title: "기여",
    subtitle: "Contribution",
    short: "받기 전에 먼저 준다",
    description: "네트워크는 소비하는 것이 아니라 만들어가는 것이다. 내가 가진 것을 먼저 나눌 때, 커뮤니티 전체가 풍요로워진다. 연결을 요청하기 전에 먼저 연결을 만들어라.",
    icon: "△",
  },
  {
    number: "03",
    title: "밀도",
    subtitle: "Density",
    short: "넓게보다 깊게",
    description: "100명의 아는 사람보다 10명의 진짜 연결이 낫다. 우리는 규모보다 밀도를 추구한다. 작은 모임에서 깊은 대화를, 깊은 대화에서 진짜 기회를 만든다.",
    icon: "○",
  },
  {
    number: "04",
    title: "장기적 시각",
    subtitle: "Long-term View",
    short: "지금 당장의 이익보다 관계의 깊이",
    description: "단기적 거래가 아닌 장기적 관계를 추구한다. 오늘 도움이 되지 않더라도 5년 후에 함께할 수 있는 사람인지를 먼저 생각한다. 신뢰는 시간이 만든다.",
    icon: "□",
  },
  {
    number: "05",
    title: "뿌리",
    subtitle: "Roots",
    short: "같은 출발점이 주는 신뢰",
    description: "부산대라는 공통 경험은 단순한 학연이 아니다. 같은 캠퍼스를 걷고, 같은 고민을 했다는 사실이 만드는 암묵적 신뢰가 있다. 그 신뢰를 자원으로 삼는다.",
    icon: "✦",
  },
  {
    number: "06",
    title: "성장",
    subtitle: "Growth",
    short: "서로의 성장이 커뮤니티의 성장",
    description: "한 멤버의 성공은 커뮤니티 전체의 자산이다. 경쟁이 아닌 협력으로, 제로섬이 아닌 포지티브섬 게임을 한다. 네가 잘 되면 나도 잘 된다.",
    icon: "↑",
  },
];

export default function CultureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="culture" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal-deep">
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold/2 blur-[200px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-20 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span className="text-gold/70 text-xs tracking-[0.35em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Culture Code
            </span>
            <div className="w-16 h-px bg-gold/40" />
          </div>
          <h2
            className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            우리가 지키는
            <br />
            <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
              여섯 가지 약속
            </span>
          </h2>
          <p
            className="text-ivory/45 text-base leading-[1.9] max-w-lg mx-auto"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            PNU Alliance는 규칙이 아닌 문화로 운영된다. 카드를 호버하면 상세 내용을 볼 수 있다.
          </p>
        </motion.div>

        {/* Culture Code Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {codes.map((code, i) => (
            <motion.div
              key={code.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHovered(code.number)}
              onMouseLeave={() => setHovered(null)}
              className={`relative border cursor-default transition-all duration-400 group ${
                hovered === code.number
                  ? "border-gold/30 bg-gradient-to-b from-gold/8 to-charcoal"
                  : "border-gold/10 bg-charcoal"
              }`}
            >
              <div className="p-7">
                {/* Number & Icon */}
                <div className="flex items-start justify-between mb-5">
                  <span
                    className="text-gold/20 text-4xl leading-none"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                  >
                    {code.number}
                  </span>
                  <span
                    className={`text-xl transition-colors duration-300 ${
                      hovered === code.number ? "text-gold/60" : "text-ivory/15"
                    }`}
                  >
                    {code.icon}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={`text-xl mb-1 transition-colors duration-300 ${
                    hovered === code.number ? "text-gold" : "text-ivory"
                  }`}
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                >
                  {code.title}
                </h3>
                <p
                  className="text-ivory/30 text-xs tracking-[0.2em] uppercase mb-3"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  {code.subtitle}
                </p>

                {/* Short description (always visible) */}
                <p
                  className="text-ivory/50 text-sm mb-4"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  {code.short}
                </p>

                {/* Full description (hover) */}
                <motion.div
                  initial={false}
                  animate={{
                    height: hovered === code.number ? "auto" : 0,
                    opacity: hovered === code.number ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-gold/10">
                    <p
                      className="text-ivory/40 text-sm leading-[1.9]"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {code.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 text-center"
        >
          <p
            className="text-ivory/25 text-sm italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            "문화는 선언이 아니라 반복되는 행동에서 만들어진다."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
