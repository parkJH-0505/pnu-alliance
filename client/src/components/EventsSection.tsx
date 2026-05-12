/*
 * EventsSection — PNU Alliance (고도화)
 * - 구글 시트에서 동적으로 이벤트 로드
 * - 다음 모임 D-Day 카운트다운
 * - 필터 탭 (예정/지난 모임)
 * - 참석률 진행 바
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import EventRegisterModal from "./EventRegisterModal";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  description: string;
  type?: "upcoming" | "past";
  label?: string;
  subtitle?: string;
  theme?: string;
  tags?: string[];
  featured?: boolean;
  registerUrl?: string;
  coverImage?: string;
}

const FALLBACK_EVENTS: Event[] = [
  {
    id: "4",
    title: "4th Meetup — The Bridge",
    subtitle: "추천으로 잇는 부산대 동문 네트워크",
    theme: "The Bridge",
    date: "2026-05-29",
    time: "19:30",
    location: "강남 일대 (확정 시 안내)",
    capacity: 40,
    registered: 0,
    description:
      "기존 멤버가 신뢰하는 사람을 1명 데려오는 회차. Phase 1 학번 중심 딥톡에서 시작해 Phase 2 직무 중심 스탠딩 파티로 전환됩니다.",
    type: "upcoming",
    label: "Upcoming",
    featured: true,
    tags: ["The Bridge", "추천 기반", "참가비 5만"],
    coverImage: "",
  },
  {
    id: "3",
    title: "3rd Meetup — Rendezvous",
    subtitle: "두 궤도가 처음 도킹한 밤",
    theme: "Rendezvous",
    date: "2026-03-20",
    time: "19:30",
    location: "서울 잠원동",
    capacity: 31,
    registered: 31,
    description:
      "1·2회차 멤버가 처음 한 자리에 모인 통합 라운드. 31명, 학번 07~21 전 세대가 한 자리에. 주니어와 시니어가 처음으로 같은 좌표에 모인 변곡점.",
    type: "past",
    tags: ["Rendezvous", "통합", "31명"],
    coverImage: "/images/events/event-3.jpg",
  },
  {
    id: "2",
    title: "2nd Meetup — Rocket",
    subtitle: "30대 시니어들의 본격 추진",
    theme: "Rocket",
    date: "2026-01-29",
    time: "19:30",
    location: "서울 강남",
    capacity: 19,
    registered: 19,
    description:
      "30대 초중반 시니어 19명. AWS, 우아한형제들, 데이터브릭스, 토스증권, 삼일회계법인, 법무법인 등 다양한 분야. 행사 후 한 참석자의 자발적 링크드인 후기에 100+ 반응.",
    type: "past",
    tags: ["Rocket", "시니어", "19명"],
    coverImage: "/images/events/event-2.jpg",
  },
  {
    id: "1",
    title: "1st Meetup — Launcher",
    subtitle: "첫 점화, 19명이 모인 밤",
    theme: "Launcher",
    date: "2025-11-26",
    time: "19:30",
    location: "서울 강남",
    capacity: 19,
    registered: 19,
    description:
      "PNU Alliance의 첫 라운드. 20대 중후반 주니어 19명. 핑거푸드와 맥주, 자기소개 라운드 → 자유 네트워킹. '처음인데 어색하지 않다'는 후기가 많았던 밤.",
    type: "past",
    tags: ["Launcher", "주니어", "19명"],
    coverImage: "/images/events/event-1.jpg",
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

function EventCard({ event, index, onRegisterClick }: { event: Event; index: number; onRegisterClick?: (e: Event) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const countdown = useCountdown(event.date + "T" + event.time);
  const isPast = event.type === "past" || new Date(event.date) < new Date();
  const progress = (event.registered / event.capacity) * 100;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative border overflow-hidden ${
        event.featured
          ? "border-gold/30 bg-gradient-to-b from-gold/5 to-charcoal"
          : "border-gold/10 bg-charcoal"
      } group ${isPast ? "opacity-60" : ""}`}
    >
      {/* 배경 이미지 레이어 (시트의 coverImage 있을 때) */}
      {event.coverImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-12 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
            style={{ backgroundImage: `url(${event.coverImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/85 to-charcoal pointer-events-none" />
        </>
      )}
      {event.featured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent z-10" />
      )}
      <div className="relative z-10 p-6 lg:p-7">
        <div className="flex items-center justify-between mb-4">
          <span className="tag-gold">{event.label || (isPast ? "Past Event" : "Upcoming")}</span>
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
          {event.subtitle || `${event.date} · ${event.location}`}
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
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-ivory/60 text-sm">
              <item.icon size={14} className="text-gold/50" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        {!isPast && (
          <div className="mb-4">
            <div className="w-full h-1 bg-gold/10 overflow-hidden">
              <div className="h-full bg-gold/60 transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-ivory/40 text-xs mt-1">{Math.round(progress)}% 모집됨</p>
          </div>
        )}
        <p className="text-ivory/50 text-sm leading-[1.6] mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          {event.description}
        </p>
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {event.tags.map((tag, i) => (
              <span key={i} className="text-gold/50 text-xs px-2 py-1 border border-gold/20">
                #{tag}
              </span>
            ))}
          </div>
        )}
        {!isPast && event.featured && (
          event.registerUrl ? (
            <a
              href={event.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gold text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:bg-gold-light transition-all duration-300"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              신청하기
              <ArrowRight size={14} />
            </a>
          ) : (
            <button
              onClick={() => onRegisterClick?.(event)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gold text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:bg-gold-light transition-all duration-300"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              신청하기
              <ArrowRight size={14} />
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}

// 나선형 좌표 — 4개 카드 기준 (밖 → 안 시계방향)
const SPIRAL_POSITIONS = [
  { left: "10%", top: "0%", scale: 1.0, rotate: -3 },    // i=0 (3차)
  { left: "-6%", top: "22%", scale: 0.82, rotate: 7 },   // i=1 (2차)
  { left: "20%", top: "44%", scale: 0.66, rotate: -11 }, // i=2 (1차)
  { left: "5%", top: "66%", scale: 0.52, rotate: 14 },   // i=3 (5차+ 시점용)
];

function SpiralCard({
  event, position, index,
}: { event: Event; position: typeof SPIRAL_POSITIONS[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: position.scale, rotate: position.rotate }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.1, rotate: 0, zIndex: 30, transition: { duration: 0.3 } }}
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        zIndex: 20 - index,
        transformOrigin: "center",
      }}
      className="w-80 lg:w-96 cursor-default"
    >
      <div className="relative aspect-video border border-gold/25 bg-charcoal hover:border-gold/55 transition-colors shadow-2xl overflow-hidden">
        {event.coverImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url(${event.coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/40 pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-charcoal to-burgundy/5 pointer-events-none" />
        )}
        <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-gold/85 text-[11px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ fontFamily: "var(--font-body)" }}>
              {event.id}회차{event.theme ? ` · ${event.theme}` : ""}
            </span>
            <span className="text-ivory/45 text-[10px] whitespace-nowrap" style={{ fontFamily: "var(--font-body)" }}>
              {event.date}
            </span>
          </div>
          <div>
            <h4 className="text-ivory text-lg lg:text-xl mb-1 leading-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {event.title.replace(/^\d+\w+ Meetup\s*[—\-]\s*/, "")}
            </h4>
            {event.subtitle && (
              <p className="text-ivory/70 text-xs lg:text-sm leading-relaxed mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                {event.subtitle}
              </p>
            )}
            <div className="text-ivory/55 text-[11px] flex items-center gap-3" style={{ fontFamily: "var(--font-body)" }}>
              <span className="inline-flex items-center gap-1"><Users size={11} className="text-gold/60" />{event.registered}/{event.capacity}</span>
              <span className="inline-flex items-center gap-1 truncate"><MapPin size={11} className="text-gold/60" />{event.location.split(" ")[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function EventsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState<Event | null>(null);

  const [error, setError] = useState<string | null>(null);

  // 구글 시트에서 이벤트 로드
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          // ... (existing logic)
          setEvents(normalizedEvents);
        } else {
          setEvents(FALLBACK_EVENTS);
          console.warn("Using fallback events data.");
        }
      } catch (error) {
        console.error("Events API error:", error);
        setError("일정 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
        setEvents(FALLBACK_EVENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // featured: 모집중 1개 (큰 카드)
  const featured = events.find((e) => e.featured && e.type !== "past") || events.find((e) => e.type !== "past");
  // 지난 회차: 최근 4개 (나선형)
  const pastEvents = events
    .filter((e) => e.type === "past")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <section id="events" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal">
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gold/2 blur-[120px] pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-px bg-gold/40" />
            <span className="text-gold/70 text-xs tracking-[0.35em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Events
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05] mb-6" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            행사 일정
          </h2>
          <p className="text-ivory/50 text-lg max-w-2xl" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            두 달에 한 번, 부산대 출신들이 서울에서 만나는 자리
          </p>
        </motion.div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <span className="text-ivory/50 ml-3">행사 정보를 불러오는 중...</span>
          </div>
        )}

        {/* Desktop: featured 좌측 + 나선형 우측 */}
        {!loading && events.length > 0 && (
          <>
            <div className="hidden md:grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* 좌측: 모집중 큰 카드 */}
              <div className="relative">
                {featured ? (
                  <EventCard event={featured} index={0} onRegisterClick={setModalEvent} />
                ) : (
                  <div className="border border-gold/15 bg-charcoal p-8 min-h-[420px] flex flex-col items-center justify-center text-center">
                    <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "var(--font-body)" }}>Coming Soon</p>
                    <p className="text-ivory/60 text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>다음 회차 준비 중</p>
                    <p className="text-ivory/35 text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>곧 공개됩니다</p>
                  </div>
                )}
              </div>

              {/* 우측: 나선형 지난 회차들 */}
              <div className="relative min-h-[700px] lg:min-h-[800px]" style={{ overflow: "visible" }}>
                {pastEvents.length > 0 ? (
                  <>
                    {pastEvents.map((event, i) => (
                      <SpiralCard
                        key={event.id}
                        event={event}
                        position={SPIRAL_POSITIONS[Math.min(i, SPIRAL_POSITIONS.length - 1)]}
                        index={i}
                      />
                    ))}
                    {pastEvents.length >= 4 && (
                      <button
                        onClick={() => alert("전체 회차 페이지는 곧 공개됩니다")}
                        className="absolute bottom-0 right-0 text-ivory/40 hover:text-gold text-xs tracking-[0.15em] uppercase transition-colors"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                      >
                        전체 보기 →
                      </button>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-ivory/30 text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>지난 회차가 아직 없습니다</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: 단일 컬럼 grid */}
            <div className="md:hidden grid grid-cols-1 gap-6">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} onRegisterClick={setModalEvent} />
              ))}
            </div>
          </>
        )}

        {/* 이벤트 없음 */}
        {!loading && events.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ivory/40 text-lg" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              행사 정보가 없습니다.
            </p>
            <p className="text-ivory/20 text-sm mt-2">곧 새로운 행사가 준비될 예정입니다.</p>
          </div>
        )}
      </div>

      {/* 회차 참가 신청 모달 */}
      {modalEvent && (
        <EventRegisterModal
          isOpen={!!modalEvent}
          onClose={() => setModalEvent(null)}
          event={{
            id: modalEvent.id,
            title: modalEvent.title,
            date: modalEvent.date,
            time: modalEvent.time,
            location: modalEvent.location,
            capacity: modalEvent.capacity,
            description: modalEvent.description,
          }}
        />
      )}
    </section>
  );
}
