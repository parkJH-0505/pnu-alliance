/*
 * TiersSection — PNU Alliance (고도화)
 * - 우주 탐사 세계관 (Ground Crew → Launcher → Rocket → Orbiter → Galaxy → Cosmos)
 * - 클릭 시 상세 정보 확장 패널
 * - 개선된 카드 디자인 + 배경 이미지
 * - 호버 효과 강화
 */
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, Zap, Rocket, Globe, Star, Crown } from "lucide-react";

const tiers = [
  {
    id: "ground-crew",
    icon: Zap,
    name: "Ground Crew",
    korean: "지상 승무원",
    tagline: "발사 전 연료를 채우는 시간",
    description: "재학생, 취준생, 서울 이주를 준비하는 부산대 출신. 네트워크의 시작점이자 미래의 주인공.",
    criteria: ["부산대 재학생 또는 졸업예정자", "취업 준비 중인 동문", "서울 이주 예정자"],
    benefits: ["월간 모임 참석 가능", "멤버 디렉토리 열람", "뉴스레터 구독", "선배 멘토링 신청"],
    color: "from-slate-blue/20 to-transparent",
    borderColor: "border-slate-blue/25",
    accentColor: "text-slate-blue",
    badgeColor: "bg-slate-blue/10 border-slate-blue/30 text-slate-blue/80",
    backgroundImage: "/images/tier-ground-crew.jpg",
  },
  {
    id: "launcher",
    icon: Rocket,
    name: "Launcher",
    korean: "점화자",
    tagline: "첫 점화, 궤도에 오르려는 중",
    description: "사회 초년생, 첫 직장에서 배우고 있는 단계. 선배와 동료의 연결이 가장 필요한 시기.",
    criteria: ["사회 초년생 (입사 1~3년)", "Ground Crew 이상", "현재 서울 직장인"],
    benefits: ["모든 Ground Crew 혜택", "소규모 마스터클래스 참여", "1:1 멘토링 매칭", "프라이빗 채널 접근"],
    color: "from-gold/15 to-transparent",
    borderColor: "border-gold/30",
    accentColor: "text-gold",
    badgeColor: "bg-gold/10 border-gold/30 text-gold/80",
    backgroundImage: "/images/tier-launcher.jpg",
    featured: true,
  },
  {
    id: "rocket",
    icon: Rocket,
    name: "Rocket",
    korean: "로켓",
    tagline: "본격적인 궤도 돌파",
    description: "30대 실무 리더, 팀을 이끌고 성과를 만드는 단계. 커뮤니티의 중추를 담당하는 멤버.",
    criteria: ["업계 5년+ 경력", "팀 리더급 이상", "Launcher 1년 이상", "운영진 추천"],
    benefits: ["모든 Launcher 혜택", "연간 리트릿 참가", "외부 연사 초청 권한", "커뮤니티 운영 참여"],
    color: "from-burgundy/20 to-transparent",
    borderColor: "border-burgundy/30",
    accentColor: "text-burgundy-light",
    badgeColor: "bg-burgundy/10 border-burgundy/30 text-burgundy-light/80",
    backgroundImage: "/images/tier-rocket.jpg",
  },
  {
    id: "orbiter",
    icon: Globe,
    name: "Orbiter",
    korean: "궤도 비행사",
    tagline: "안정적인 비행 궤도 진입",
    description: "팀장~본부장급, 조직에서 의사결정을 하는 단계. 후배들의 길을 보여주는 멘토.",
    criteria: ["팀장급 이상 (5년+ 리더십)", "Rocket 1년 이상", "업계 영향력 있는 인물", "운영진 추천"],
    benefits: ["모든 Rocket 혜택", "운영 의사결정 참여", "외부 파트너십 대표", "커뮤니티 공동 운영"],
    color: "from-slate-blue/15 to-transparent",
    borderColor: "border-slate-blue/25",
    accentColor: "text-slate-blue",
    badgeColor: "bg-slate-blue/10 border-slate-blue/30 text-slate-blue/80",
    backgroundImage: "/images/tier-orbiter.jpg",
  },
  {
    id: "galaxy",
    icon: Star,
    name: "Galaxy",
    korean: "은하의 중심",
    tagline: "사람을 연결하고 영감을 주는 존재",
    description: "C-level 임원진, 업계에서 인정받은 리더. 커뮤니티의 영감과 방향을 제시하는 역할.",
    criteria: ["C-level (CEO, CTO, CFO 등)", "Orbiter 이상", "업계 영향력 있는 리더", "창립진 추천"],
    benefits: ["모든 혜택 포함", "전략 의사결정 참여", "연간 리트릿 주최권", "커뮤니티 비전 설정"],
    color: "from-gold/20 to-burgundy/10",
    borderColor: "border-gold/35",
    accentColor: "text-gold",
    badgeColor: "bg-gold/15 border-gold/35 text-gold/90",
    backgroundImage: "/images/tier-galaxy.jpg",
  },
  {
    id: "cosmos",
    icon: Crown,
    name: "Cosmos",
    korean: "우주의 설계자",
    tagline: "산업 생태계를 설계하고 세대를 잇는 존재",
    description: "명예 단계, 여러 세대를 거쳐 온 거장. PNU Alliance의 철학과 미래를 함께 설계하는 최고 멤버.",
    criteria: ["Galaxy 이상", "장기 기여 의지", "창립진 만장일치 추천", "세대를 잇는 비전"],
    benefits: ["모든 혜택 포함", "최고 의사결정 참여", "커뮤니티 공동 소유자", "세대 간 연결 주도"],
    color: "from-gold/25 to-burgundy/15",
    borderColor: "border-gold/40",
    accentColor: "text-gold",
    badgeColor: "bg-gold/15 border-gold/40 text-gold",
    backgroundImage: "/images/tier-cosmos.jpg",
    special: true,
  },
];

function TierCard({ tier, index }: { tier: typeof tiers[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = tier.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative border ${tier.borderColor} cursor-pointer group transition-all duration-400 overflow-hidden ${tier.featured ? "ring-1 ring-gold/20" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Background Image */}
      {tier.backgroundImage && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
          <img
            src={tier.backgroundImage}
            alt={tier.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${tier.color} bg-charcoal`} />

      {/* Top Border Accent */}
      {tier.featured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      )}

      {/* Featured Badge */}
      {tier.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-charcoal-deep text-[10px] tracking-[0.25em] uppercase z-10" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
          Most Common
        </div>
      )}
      {tier.special && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-gold to-gold-light text-charcoal-deep text-[10px] tracking-[0.25em] uppercase z-10" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
          By Invitation
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 lg:p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 border ${tier.borderColor} flex items-center justify-center group-hover:bg-gold/5 transition-colors duration-300`}>
              <Icon size={18} className={tier.accentColor} />
            </div>
            <div>
              <h3
                className={`text-lg ${tier.accentColor}`}
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                {tier.name}
              </h3>
              <span
                className="text-ivory/35 text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                {tier.korean}
              </span>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-ivory/30 transition-transform duration-300 mt-1 ${expanded ? "rotate-180" : ""}`}
          />
        </div>

        {/* Tagline */}
        <p
          className="text-ivory/40 text-xs tracking-[0.2em] uppercase mb-3"
          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          {tier.tagline}
        </p>

        {/* Description */}
        <p
          className="text-ivory/60 text-sm leading-[1.8]"
          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          {tier.description}
        </p>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-gold/10 space-y-4">
                <div>
                  <p className="text-gold/60 text-[10px] tracking-[0.25em] uppercase mb-2" style={{ fontFamily: "var(--font-body)" }}>
                    자격 조건
                  </p>
                  <ul className="space-y-1.5">
                    {tier.criteria.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-ivory/50 text-xs" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        <div className="w-1 h-1 bg-gold/40 rotate-45 mt-1.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-gold/60 text-[10px] tracking-[0.25em] uppercase mb-2" style={{ fontFamily: "var(--font-body)" }}>
                    혜택
                  </p>
                  <ul className="space-y-1.5">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-ivory/50 text-xs" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        <div className="w-1 h-1 bg-gold/40 rotate-45 mt-1.5 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function TiersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="tiers" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal-deep">
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span className="text-gold/70 text-xs tracking-[0.35em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Orbital Stages
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            <h2
              className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              당신의 궤도는
              <br />
              <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
                어느 단계인가
              </span>
            </h2>
            <p
              className="text-ivory/50 text-base leading-[1.9] lg:max-w-sm"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              PNU Alliance는 단순한 모임이 아니다. 각자의 성장 단계에 맞는 연결과 기회를 제공하는 구조화된 네트워크다.
              카드를 클릭하면 상세 정보를 볼 수 있다.
            </p>
          </div>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p
            className="text-ivory/30 text-sm italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            "위계가 아닌 서로 다른 궤도를 비행하는 탐사자들. 모두 같은 뿌리에서 출발했다."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
