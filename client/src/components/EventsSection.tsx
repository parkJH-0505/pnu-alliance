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
  tags?: string[];
  featured?: boolean;
}

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

function EventCard({ event, index }: { event: Event; index: number }) {
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
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, i) => (
              <span key={i} className="text-gold/50 text-xs px-2 py-1 border border-gold/20">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function EventsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  // 구글 시트에서 이벤트 로드
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events");
        const data = await response.json();

        if (data.events && Array.isArray(data.events)) {
          // 이벤트 데이터 정규화
          const normalizedEvents = data.events.map((event: any) => {
            const eventDate = new Date(event.date);
            const now = new Date();
            const isPast = eventDate < now;

            return {
              ...event,
              id: event.id || event.title,
              type: isPast ? "past" : "upcoming",
              label: isPast ? "Past Event" : "Upcoming",
              subtitle: `${event.date} · ${event.location}`,
              tags: ["행사"],
              featured: !isPast && event.id === "1", // 첫 번째 이벤트를 featured로
            };
          });

          setEvents(normalizedEvents);
          console.log("✅ 이벤트 로드 완료:", normalizedEvents.length);
        } else {
          console.warn("⚠️  이벤트 데이터 형식 오류");
          setEvents([]);
        }
      } catch (error) {
        console.error("❌ 이벤트 로드 오류:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 필터링된 이벤트
  const filteredEvents = events.filter((event) => {
    if (filter === "upcoming") return event.type === "upcoming";
    if (filter === "past") return event.type === "past";
    return true;
  });

  const upcomingCount = events.filter((e) => e.type === "upcoming").length;
  const pastCount = events.filter((e) => e.type === "past").length;

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
            PNU Alliance의 다양한 행사에 참여하세요
          </p>
        </motion.div>

        {/* 필터 탭 */}
        <div className="flex gap-3 mb-12">
          {[
            { key: "all", label: "전체", count: events.length },
            { key: "upcoming", label: "예정", count: upcomingCount },
            { key: "past", label: "지난 행사", count: pastCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 text-sm tracking-[0.1em] transition-all duration-300 ${
                filter === tab.key
                  ? "bg-gold text-charcoal-deep"
                  : "border border-gold/20 text-ivory/60 hover:border-gold/40"
              }`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <span className="text-ivory/50 ml-3">행사 정보를 불러오는 중...</span>
          </div>
        )}

        {/* 이벤트 목록 */}
        {!loading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}

        {/* 이벤트 없음 */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ivory/40 text-lg" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              {filter === "upcoming" && "현재 모집 중인 행사가 없습니다."}
              {filter === "past" && "지난 행사가 없습니다."}
              {filter === "all" && "행사 정보가 없습니다."}
            </p>
            <p className="text-ivory/20 text-sm mt-2">곧 새로운 행사가 준비될 예정입니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
