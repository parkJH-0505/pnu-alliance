/*
 * ManifestoSection — PNU Alliance
 * Design: Full-width editorial manifesto with culture code
 * Copy: 뿌리문서 3번 — 철학과 금기, 행동규칙, 실제 선배 명언
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const principles = [
  {
    number: "01",
    title: "여정의 존중",
    subtitle: "Respect Every Journey",
    description:
      "모든 사람은 각자의 여정 위에 있다. 직급이 낮든, 이직 중이든, 아직 뭘 할지 모르는 상태든. 지금의 스펙이 아니라 이 사람의 방향과 태도를 본다.",
    quote: "초년생들 너무 엄격하게 자르지 마시고. 어떤 서프라이즈를 할지 몰라요.",
    quoteAuthor: "이대한 선배",
  },
  {
    number: "02",
    title: "질문하는 문화",
    subtitle: "Ask, Don't Tell",
    description:
      "아는 척하며 떠드는 자리가 아니라, 궁금해하고 물어보고 배우는 자리. 자랑 대신 질문. '어떻게 그 결정을 하셨어요?'가 '저는 이런 걸 했는데요'보다 낫다.",
    quote: "내가 너무 많이 말하기보단 서로의 말을 들어주다 보면, 좋은 상황이 자연스럽게 만들어질거에요",
    quoteAuthor: "이윤규 선배",
  },
  {
    number: "03",
    title: "선순환의 생태계",
    subtitle: "Give & Circulate",
    description:
      "받은 만큼 돌려준다. 선배가 후배에게, 경험이 기회로 순환하는 구조. 후배가 누군가의 선배가 됐을 때 '나도 해줘야지'라는 마음이 자연스럽게 이어지는 것.",
    quote: "고생은 이제 저까지만 하고 후배들부터는 조금 편하게 했으면.",
    quoteAuthor: "이대한 선배",
  },
  {
    number: "04",
    title: "심리적 안전",
    subtitle: "Psychological Safety",
    description:
      "프라이빗하고 신뢰할 수 있는 공간. 여기서 한 이야기가 밖으로 새나가지 않는다는 확신. 성공담만 늘어놓는 자리가 아니라, 고민을 먼저 꺼내는 사람이 가장 용기 있는 사람이다.",
    quote: "클로즈 세션이면 NDA 부담 없이 솔직한 이야기가 가능하다.",
    quoteAuthor: "노주현 선배",
  },
];

const seniorQuotes = [
  {
    quote: "사람이 깡통이다. 무조건 사람 먼저 모아라.",
    author: "이대한",
    field: "BAE Systems · 핵안보포럼",
  },
  {
    quote: "부산대학교로 신뢰 담보를 깔고 가는 거잖아요.",
    author: "박재혁",
    field: "삼성SDS",
  },
  {
    quote: "처음에 눈덩이를 뭉치면 시럽고 힘들다. 그것만 잘하면 커진다.",
    author: "강경록",
    field: "크리에이팁 부사장",
  },
  {
    quote: "욕심을 내면 좋겠어요. 명확하게 이거 해달라 그냥.",
    author: "이윤규",
    field: "변호사 · 교육사업",
  },
  {
    quote: "모으는 건 어렵지 않다. 유지하는 게 어렵다.",
    author: "노주현",
    field: "현대자동차",
  },
  {
    quote: "지금은 스카이가 롤모델이지만, 나중에는 후배님이 만든 게 롤모델이 되는 거예요.",
    author: "이대한",
    field: "BAE Systems · 핵안보포럼",
  },
];

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ManifestoSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="manifesto" className="relative py-28 lg:py-40 overflow-hidden monogram-bg">
      <div className="absolute inset-0 bg-charcoal" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20 lg:mb-28"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span
              className="text-gold/70 text-xs tracking-[0.35em] uppercase"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              Culture Constitution
            </span>
          </div>
          <div className="max-w-3xl">
            <h2
              className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              우리가 믿는 것,
              <br />
              <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
                우리가 지키는 것
              </span>
            </h2>
            <p
              className="text-ivory/45 text-base lg:text-lg leading-relaxed"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              이 파트는 운영 규칙이 아니라 문화 헌법입니다.
              규칙은 바꿀 수 있지만, 문화의 뿌리는 함부로 바꾸면 안 됩니다.
            </p>
          </div>
        </motion.div>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gold/10 mb-24 lg:mb-32">
          {principles.map((p, i) => (
            <FadeIn key={p.number} delay={i * 0.1}>
              <div className="bg-charcoal p-8 lg:p-12 group hover:bg-charcoal-light/50 transition-colors duration-500 h-full">
                <div className="flex items-start gap-6">
                  <span
                    className="text-gold/25 text-5xl lg:text-6xl leading-none shrink-0 group-hover:text-gold/45 transition-colors duration-500"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                  >
                    {p.number}
                  </span>
                  <div>
                    <h3
                      className="text-ivory text-xl lg:text-2xl mb-1"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                    >
                      {p.title}
                    </h3>
                    <span
                      className="text-gold/50 text-xs tracking-[0.2em] uppercase block mb-4"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {p.subtitle}
                    </span>
                    <p
                      className="text-ivory/45 text-sm leading-[1.8] mb-5"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {p.description}
                    </p>
                    {/* Inline senior quote */}
                    <div className="border-l border-gold/25 pl-4">
                      <p
                        className="text-ivory/55 text-sm italic leading-relaxed"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                      >
                        "{p.quote}"
                      </p>
                      <span
                        className="text-gold/40 text-xs mt-1 block"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      >
                        — {p.quoteAuthor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Senior Quotes — Voices that shaped this network */}
        <div>
          <FadeIn className="mb-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-8 h-px bg-gold/30" />
              <span
                className="text-gold/60 text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                Words from Seniors
              </span>
            </div>
            <h3
              className="text-2xl lg:text-3xl text-ivory"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              이 네트워크를 만든{" "}
              <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
                목소리들
              </span>
            </h3>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seniorQuotes.map((q, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="border border-gold/10 bg-charcoal-deep/50 p-8 lg:p-10 h-full flex flex-col justify-between hover:border-gold/25 transition-all duration-500">
                  <div>
                    <div className="text-gold/20 text-5xl leading-none mb-4" style={{ fontFamily: "var(--font-display)" }}>
                      &ldquo;
                    </div>
                    <p
                      className="text-ivory/60 text-base lg:text-lg italic leading-[1.7] mb-8"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                    >
                      {q.quote}
                    </p>
                  </div>
                  <div>
                    <div className="w-8 h-px bg-gold/20 mb-4" />
                    <p
                      className="text-gold/60 text-sm"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                    >
                      {q.author}
                    </p>
                    <p
                      className="text-ivory/30 text-xs mt-0.5"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {q.field}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
