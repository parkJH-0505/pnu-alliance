/*
 * EventsSection — PNU Alliance (고도화)
 * - 개선된 이벤트 카드 레이아웃
 * - 다음 모임 D-Day 카운트다운
 * - 필터 탭 (예정/지난 모임)
 * - 참석률 진행 바
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

const events = [
  {
    id: 1,
    type: "upcoming",
    label: "Next Gathering",
    title: "3차 정기 모임",
    subtitle: "서울 강남 · 2026년 3월",
    date: "2026-03-20",
    time: "19:00",
    location: "강남구 역삼동 (장소 추후 공지)",
    capacity: 30,
    registered: 18,
    description: "3차 정기 모임에서는 각자의 근황 공유와 함께, 업계별 소모임 구성을 논의합니다. 처음 오시는 분들도 환영합니다.",
    tags: ["정기 모임", "네트워킹", "소모임 구성"],
    featured: true,
  },
  {
    id: 2,
    type: "past",
    label: "Past Event",
    title: "2차 정기 모임",
    subtitle: "서울 강남 · 2025년 12월",
    date: "2025-12-14",
    time: "19:00",
    location: "강남구 역삼동",
    capacity: 25,
    registered: 25,
    description: "멤버십 티어 시스템 발표와 함께 40명이 넘는 멤버가 연결되는 자리였습니다.",
    tags: ["정기 모임", "티어 발표", "40명 연결"],
    featured: false,
  },
  {
    id: 3,
    type: "past",
    label: "Past Event",
    title: "1차 정기 모임",
    subtitle: "서울 강남 · 2025년 11월",
    date: "2025-11-09",
    time: "19:00",
    location: "강남구 역삼동",
    capacity: 20,
    registered: 20,
    description: "PNU Alliance의 첫 번째 오프라인 모임. 20명이 모여 서로의 이야기를 나눴습니다.",
    tags: ["첫 모임", "20명 참석", "역사적 순간"],
    featured: false,
  },
];

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function EventCard({ event, index }: { event: typeof events[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const countdown = useCountdown(event.date + "T" + event.time);
  const isPast = event.type === "past";
  const progress = (event.registered / event.capacity) * 100;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative border ${
        event.featured
          ? "border-gold/30 bg-gradient-to-b from-gold/5 to-charcoal"
          : "border-gold/10 bg-charcoal"
      } group ${isPast ? "opacity-60" : ""}`}
    >
      {event.featured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      )}
      <div className="p-6 lg:p-7">
        <div className="flex items-center justify-between mb-4">
          <span className="tag-gold">{event.label}</span>
          {!isPast && event.featured && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold/70 text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
                모집 중
              </span>
            </div>
          )}
          {isPast && (
            <span className="text-ivory/20 text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
              종료
            </span>
          )}
        </div>

        <h3 className="text-ivory text-xl lg:text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {event.title}
        </h3>
        <p className="text-gold/60 text-sm mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          {event.subtitle}
        </p>

        {!isPast && event.featured && (
          <div className="flex items-center gap-4 mb-5 p-3 bg-gold/5 border border-gold/10">
            {[
              { value: countdown.days, label: "일" },
              { value: countdown.hours, label: "시간" },
              { value: countdown.minutes, label: "분" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <span className="text-gold text-2xl block" style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}>
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-ivory/30 text-[9px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
                  {item.label}
                </span>
              </div>
            ))}
            <span className="text-ivory/40 text-xs ml-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              남았습니다
            </span>
          </div>
        )}

        <div className="space-y-2 mb-4">
          {[
            { icon: Calendar, text: `${event.date} ${event.time}` },
            { icon: MapPin, text: event.location },
            { icon: Users, text: `${event.registered}/${event.capacity}명 참석` },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-ivory/40 text-xs" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              <Icon size={12} className="text-gold/40 shrink-0" />
              {text}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="h-px bg-gold/8 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${progress}%` } : {}}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute inset-y-0 left-0 bg-gold/40"
            />
          </div>
          <p className="text-ivory/25 text-[10px] mt-1" style={{ fontFamily: "var(--font-body)" }}>
            {Math.round(progress)}% 참석 확정
          </p>
        </div>

        <p className="text-ivory/45 text-sm leading-[1.8] mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          {event.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {event.tags.map((tag) => (
            <span key={tag} className="tag-gold opacity-70">{tag}</span>
          ))}
        </div>

        {!isPast && (
          <a
            href="#join"
            className="flex items-center gap-2 text-gold/70 text-xs tracking-[0.15em] uppercase hover:text-gold transition-colors duration-300 group"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          >
            참석 신청하기
            <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function EventsSection() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const filtered = events.filter((e) => filter === "all" || e.type === filter);

  return (
    <section id="events" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal-deep">
      <div className="absolute inset-0 noise-overlay" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-12 lg:mb-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span className="text-gold/70 text-xs tracking-[0.35em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Gatherings
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2
              className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              함께 모이는
              <br />
              <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
                시간과 공간
              </span>
            </h2>
            <div className="flex gap-1">
              {(["all", "upcoming", "past"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
                    filter === f
                      ? "bg-gold/10 border border-gold/30 text-gold"
                      : "border border-transparent text-ivory/40 hover:text-ivory/70"
                  }`}
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  {f === "all" ? "전체" : f === "upcoming" ? "예정" : "지난 모임"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-ivory/25 text-sm italic" style={{ fontFamily: "var(--font-display)" }}>
            "2시간 투자해도 충분하겠다는 생각만 줘도 사람들은 와요." — 이윤규 선배
          </p>
        </motion.div>
      </div>
    </section>
  );
}
