import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function EventsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const { data: events = [] } = trpc.events.list.useQuery();

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) > now);
  const past = events.filter(e => new Date(e.date) <= now);

  const displayEvents = filter === "upcoming" ? upcoming : filter === "past" ? past : events;

  const getDDay = (date: Date) => {
    const diff = Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return null;
    if (diff === 0) return "D-Day";
    return `D-${diff}`;
  };

  return (
    <section id="events" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal-deep">
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full [background:radial-gradient(circle,oklch(0.75_0.18_49.77_/_0.02),transparent)] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span className="text-gold/70 text-xs tracking-[0.35em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Events & Gatherings
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            함께하는<br />
            <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>모임들</span>
          </h2>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex gap-4 mb-12"
        >
          {(["all", "upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
                filter === f
                  ? "bg-gold text-charcoal-deep"
                  : "border border-gold/25 text-ivory/60 hover:border-gold hover:text-ivory"
              }`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              {f === "all" ? "전체" : f === "upcoming" ? "예정" : "지난"}
            </button>
          ))}
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {displayEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-ivory/40 text-sm">등록된 이벤트가 없습니다.</p>
            </div>
          ) : (
            displayEvents.map((event, idx) => {
              const dday = getDDay(new Date(event.date));
              const isUpcoming = new Date(event.date) > now;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className="group relative border border-gold/15 [background:oklch(0.2_0.06_40_/_0.3)] hover:[background:oklch(0.2_0.06_40_/_0.5)] transition-all duration-300 overflow-hidden"
                >
                  {/* D-Day Badge */}
                  {dday && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-3 py-1 [background:oklch(0.75_0.18_49.77_/_0.2)] border border-gold/40 text-gold text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                        {dday}
                      </div>
                    </div>
                  )}

                  <div className="p-6 lg:p-8">
                    {/* Label */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gold/50 text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        {isUpcoming ? "Upcoming" : "Past"}
                      </span>
                      <div className="flex-1 h-px bg-gold/10" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl lg:text-2xl text-ivory mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                      {event.title}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p className="text-ivory/50 text-sm leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        {event.description}
                      </p>
                    )}

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-ivory/60 text-sm">
                        <Calendar size={16} className="text-gold/50" />
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                          {new Date(event.date).toLocaleDateString("ko-KR", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-3 text-ivory/60 text-sm">
                          <MapPin size={16} className="text-gold/50" />
                          <span style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{event.location}</span>
                        </div>
                      )}
                      {event.capacity && (
                        <div className="flex items-center gap-3 text-ivory/60 text-sm">
                          <Users size={16} className="text-gold/50" />
                          <span style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                            {0 || 0} / {event.capacity}명
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {event.capacity && (
                      <div className="mb-6">
                        <div className="h-1 bg-gold/10 overflow-hidden">
                          <div
                            className="h-full [background:linear-gradient(90deg,oklch(0.75_0.18_49.77),oklch(0.8_0.2_50))]"
                            style={{ width: `${((0 || 0) / event.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-gold/70 group-hover:text-gold transition-colors duration-300">
                      <span className="text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                        상세보기
                      </span>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
