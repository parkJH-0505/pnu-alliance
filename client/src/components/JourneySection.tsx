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
    subtitle: "선배 1:1 미팅 시작",
    description:
      "이대한, 박재혁, 노주현, 이창렬, 이윤규, 강경록, 김소연 — 7명의 선배와 1:1 미팅. 총 600분의 대화에서 하나의 확신을 얻었다 — 이건 해야 한다.",
    tags: ["7회 선배 미팅", "아이디어 검증", "방향 설정"],
    status: "done",
  },
  {
    phase: "Phase 1",
    date: "2025.11",
    title: "Launcher",
    subtitle: "첫 점화, 1차 오프라인 모임",
    description:
      "서울 강남에서 열린 첫 라운드. 20대 중후반 주니어 19명이 모였다. 콜드 컨택과 레퍼럴만으로 모집했고, 모두가 같은 말을 했다 — '이런 자리가 필요했다.'",
    tags: ["19명 참석", "주니어 라운드", "첫 연결"],
    status: "done",
  },
  {
    phase: "Phase 2",
    date: "2026.01",
    title: "Rocket",
    subtitle: "2차 모임, 1회는 우연 2회는 패턴",
    description:
      "30대 초중반 시니어 19명. AWS, 우아한형제들, 데이터브릭스, 토스증권, 삼일회계법인, 법무법인 등 다양한 분야. 한 참석자가 자발적으로 쓴 링크드인 후기에 100+ 반응.",
    tags: ["19명 참석", "시니어 라운드", "패턴 검증"],
    status: "done",
  },
  {
    phase: "Phase 3",
    date: "2026.03",
    title: "Rendezvous",
    subtitle: "3차 모임, 두 궤도가 처음 도킹하다",
    description:
      "1·2회차 멤버가 처음 한 자리에 모인 통합 라운드. 31명, 학번 07~21 전 세대 도킹. '부산대에 이렇게 다양한 사람들이 있었어?' — 이날 분위기를 그대로 담은 한 마디.",
    tags: ["31명 참석", "첫 통합", "두 세대 도킹"],
    status: "done",
  },
  {
    phase: "Phase 4",
    date: "2026.05",
    title: "The Bridge",
    subtitle: "4차 모임, 추천으로 잇는 확장",
    description:
      "기존 멤버가 신뢰하는 사람을 1명씩 데려오는 회차. 학번 중심 딥톡에서 시작해 직무 중심 스탠딩 파티로 전환. 동반 참석 두 분께는 다음 날 애프터 커피챗 지원금.",
    tags: ["30~40명 모집 중", "추천 기반", "맞팔로 LTV"],
    status: "current",
  },
  {
    phase: "Phase 5",
    date: "2027+",
    title: "거점국립대 연합",
    subtitle: "판을 바꾸다",
    description:
      "PNU Alliance를 모델로, 전국 거점국립대 동문 네트워크 연합 구축. 서울에서 각자의 궤도를 그리는 모든 이들을 위한 플랫폼.",
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
          <p
            className="text-ivory/50 text-lg max-w-2xl mx-auto mt-6"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            PNU Alliance가 지난 몇 개월간 만들어온 이야기입니다.
          </p>
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

        {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 lg:mt-20 text-center"
        >
          <p
            className="text-ivory/40 text-sm italic mb-6"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            "이 여정은 아직 끝나지 않았다."
          </p>
          <a
            href="#events"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold/30 text-gold/70 text-xs tracking-[0.2em] uppercase hover:bg-gold/5 hover:text-gold transition-all duration-300"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          >
            다음 회차 보기 →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
