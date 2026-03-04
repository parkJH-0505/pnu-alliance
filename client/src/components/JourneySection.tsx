/*
 * JourneySection — PNU Alliance (고도화)
 * - 스크롤 연동 타임라인 진행 애니메이션
 * - 각 마일스톤 상세 정보
 * - 미래 마일스톤 시각적 구분
 */
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const milestones = [
  {
    phase: "Phase 0",
    date: "2025.09",
    title: "씨앗을 심다",
    subtitle: "선배 미팅 시작",
    description: "이대한, 박재혁, 강경록, 노주현, 이창렬, 이윤규, 이찬호 선배와 1:1 미팅. 7번의 대화에서 하나의 확신을 얻었다 — 이건 해야 한다.",
    tags: ["7회 선배 미팅", "아이디어 검증", "방향 설정"],
    status: "done",
  },
  {
    phase: "Phase 1",
    date: "2025.11",
    title: "첫 불꽃",
    subtitle: "1차 오프라인 모임",
    description: "서울 강남에서 열린 첫 번째 오프라인 모임. 20명이 모였고, 모두가 같은 말을 했다 — '이런 자리가 필요했다.'",
    tags: ["20명 참석", "강남 오프라인", "첫 연결"],
    status: "done",
  },
  {
    phase: "Phase 2",
    date: "2025.12",
    title: "구조를 세우다",
    subtitle: "2차 모임 & 멤버십 설계",
    description: "2차 모임과 함께 멤버십 티어 시스템, 온보딩 프로세스, 커뮤니케이션 채널을 정비했다. 40명이 넘는 멤버가 연결되었다.",
    tags: ["40+ 멤버", "티어 시스템", "채널 정비"],
    status: "done",
  },
  {
    phase: "Phase 3",
    date: "2026.Q1",
    title: "궤도에 오르다",
    subtitle: "정기 모임 체계화",
    description: "월간 정기 모임, 분기별 마스터클래스, 업계별 소모임 운영. 멤버 100명 달성을 목표로 한다.",
    tags: ["월간 정기 모임", "마스터클래스", "100명 목표"],
    status: "current",
  },
  {
    phase: "Phase 4",
    date: "2026.Q3",
    title: "네트워크를 확장하다",
    subtitle: "외부 파트너십 & 리트릿",
    description: "타 대학 동문 네트워크와의 교류, 첫 번째 연간 리트릿, 기업 파트너십을 통한 멤버 혜택 확대.",
    tags: ["타교 교류", "연간 리트릿", "기업 파트너십"],
    status: "future",
  },
  {
    phase: "Phase 5",
    date: "2027+",
    title: "판을 바꾸다",
    subtitle: "지방 거점국립대 연합",
    description: "PNU Alliance를 모델로, 전국 거점국립대 동문 네트워크 연합 구축. 서울에서 각자의 궤도를 그리는 모든 이들을 위한 플랫폼.",
    tags: ["전국 확장", "거점국립대 연합", "플랫폼화"],
    status: "future",
  },
];

function MilestoneItem({ milestone, index }: { milestone: typeof milestones[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const isLeft = index % 2 === 0;
  const isDone = milestone.status === "done";
  const isCurrent = milestone.status === "current";
  const isFuture = milestone.status === "future";

  const StatusIcon = isDone ? CheckCircle2 : isCurrent ? Clock : Circle;
  const iconColor = isDone ? "text-gold" : isCurrent ? "text-gold/70" : "text-ivory/20";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-8 items-start ${isFuture ? "opacity-50" : ""}`}
    >
      {/* Left content (desktop: even) */}
      <div className={`lg:text-right ${isLeft ? "block" : "lg:invisible"}`}>
        {isLeft && (
          <div className="lg:flex lg:flex-col lg:items-end">
            <span className="text-gold/50 text-[10px] tracking-[0.3em] uppercase mb-1 block" style={{ fontFamily: "var(--font-body)" }}>
              {milestone.phase} · {milestone.date}
            </span>
            <h3 className="text-ivory text-xl lg:text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {milestone.title}
            </h3>
            <p className="text-gold/60 text-sm mb-3" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              {milestone.subtitle}
            </p>
            <p className="text-ivory/45 text-sm leading-[1.8] max-w-xs lg:ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              {milestone.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-3 lg:justify-end">
              {milestone.tags.map((tag) => (
                <span key={tag} className="tag-gold">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center dot */}
      <div className="hidden lg:flex flex-col items-center">
        <div className={`w-px flex-1 max-h-4 ${isDone ? "bg-gold/40" : "bg-gold/10"}`} />
        <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
          isDone ? "border-gold/50 bg-gold/5" : isCurrent ? "border-gold/30 bg-gold/3" : "border-ivory/10"
        }`}>
          <StatusIcon size={16} className={iconColor} />
        </div>
        <div className={`w-px flex-1 ${isDone ? "bg-gold/40" : "bg-gold/10"}`} />
      </div>

      {/* Right content (desktop: odd) */}
      <div className={`${!isLeft ? "block" : "lg:invisible"}`}>
        {!isLeft && (
          <div>
            <span className="text-gold/50 text-[10px] tracking-[0.3em] uppercase mb-1 block" style={{ fontFamily: "var(--font-body)" }}>
              {milestone.phase} · {milestone.date}
            </span>
            <h3 className="text-ivory text-xl lg:text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {milestone.title}
            </h3>
            <p className="text-gold/60 text-sm mb-3" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              {milestone.subtitle}
            </p>
            <p className="text-ivory/45 text-sm leading-[1.8] max-w-xs" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              {milestone.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {milestone.tags.map((tag) => (
                <span key={tag} className="tag-gold">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: always show content */}
      <div className="lg:hidden col-span-1 flex gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
            isDone ? "border-gold/50 bg-gold/5" : isCurrent ? "border-gold/30" : "border-ivory/10"
          }`}>
            <StatusIcon size={14} className={iconColor} />
          </div>
          <div className={`w-px flex-1 mt-2 ${isDone ? "bg-gold/30" : "bg-gold/8"}`} />
        </div>
        <div className="pb-8">
          <span className="text-gold/50 text-[10px] tracking-[0.3em] uppercase mb-1 block" style={{ fontFamily: "var(--font-body)" }}>
            {milestone.phase} · {milestone.date}
          </span>
          <h3 className="text-ivory text-xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            {milestone.title}
          </h3>
          <p className="text-gold/60 text-sm mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            {milestone.subtitle}
          </p>
          <p className="text-ivory/45 text-sm leading-[1.8]" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            {milestone.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {milestone.tags.map((tag) => (
              <span key={tag} className="tag-gold">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function JourneySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="journey" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal">
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-24 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span className="text-gold/70 text-xs tracking-[0.35em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Our Journey
            </span>
            <div className="w-16 h-px bg-gold/40" />
          </div>
          <h2
            className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            씨앗에서
            <br />
            <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
              숲이 되기까지
            </span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="hidden lg:block space-y-0">
          {milestones.map((m, i) => (
            <MilestoneItem key={m.phase} milestone={m} index={i} />
          ))}
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden">
          {milestones.map((m, i) => (
            <MilestoneItem key={m.phase} milestone={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
