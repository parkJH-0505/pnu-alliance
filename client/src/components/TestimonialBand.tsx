/*
 * TestimonialBand — PNU Alliance (고도화)
 * - CSS animation 기반 마퀴 (더 부드럽고 성능 좋음)
 * - 호버 시 일시정지
 * - 개선된 타이포그래피
 */
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

const quotes = [
  { text: "사람이 깡통이다. 무조건 사람 먼저 모아라.", author: "이대한", company: "한국핵안보전략포럼" },
  { text: "부산대학교로 신뢰 담보를 깔고 가는 거잖아요.", author: "박재혁", company: "삼성SDS" },
  { text: "처음에 눈덩이를 뭉치면 시럽고 힘들다. 그것만 잘하면 커진다.", author: "강경록", company: "크리에이팁" },
  { text: "말하지 마. 들어.", author: "강경록", company: "크리에이팁" },
  { text: "모으는 건 어렵지 않다. 유지하는 게 어렵다.", author: "노주현", company: "현대자동차" },
  { text: "바로 해내야 됩니다.", author: "이창렬", company: "아마존" },
  { text: "고생은 이제 저까지만 하고 후배들부터는 조금 편하게 했으면.", author: "이대한", company: "한국핵안보전략포럼" },
  { text: "30대 중반 안에 인생 전체의 씨앗을 만들어야.", author: "이윤규", company: "변호사" },
  { text: "지금은 스카이가 롤모델이지만, 나중에는 후배님이 만든 게 롤모델이 되는 거예요.", author: "이대한", company: "한국핵안보전략포럼" },
];

const allQuotes = [...quotes, ...quotes, ...quotes];

export default function TestimonialBand() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
      className="relative py-10 overflow-hidden border-y border-gold/8 bg-charcoal-deep"
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-charcoal-deep to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-charcoal-deep to-transparent z-10 pointer-events-none" />

      <div className="marquee-track">
        {allQuotes.map((q, i) => (
          <div key={i} className="flex items-center gap-5 shrink-0 px-6">
            <div className="w-1.5 h-1.5 bg-gold/35 rotate-45 shrink-0" />
            <p
              className="text-ivory/35 text-sm italic whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              &ldquo;{q.text}&rdquo;
            </p>
            <span
              className="text-gold/30 text-xs tracking-[0.15em] whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              — {q.author} · {q.company}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
