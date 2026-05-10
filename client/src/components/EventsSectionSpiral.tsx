import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface EventsSectionSpiralProps {
  onEventSelect?: (eventId: number) => void;
  onRegistrationClick?: (eventId: number, eventTitle?: string) => void;
}

export default function EventsSectionSpiral({
  onEventSelect,
  onRegistrationClick,
}: EventsSectionSpiralProps) {
  const { data: events = [] } = trpc.events.list.useQuery();
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);

  // 모집중 회차와 지난 회차 분리
  const { currentEvent, pastEvents } = useMemo(() => {
    const now = new Date();
    const recruiting = events.filter((e) => e.status === "recruiting");
    const past = events
      .filter((e) => e.status !== "recruiting" && new Date(e.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      currentEvent: recruiting[0] || null,
      pastEvents: past,
    };
  }, [events]);

  // 나선형 배치 계산
  const spiralPositions = useMemo(() => {
    return pastEvents.map((_, index) => {
      const angle = (index * 45) * (Math.PI / 180); // 45도씩 회전
      const radius = 100 + index * 60; // 점점 커지는 반경
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const scale = 1 - index * 0.08; // 점점 작아지는 크기

      return { x, y, scale, rotation: angle * (180 / Math.PI) };
    });
  }, [pastEvents]);

  const isEventRecruiting = (event: any) => {
    return event.status === "recruiting" && new Date(event.date) > new Date();
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-charcoal-deep via-charcoal-deep to-charcoal-deep py-20 px-4 relative overflow-hidden">
      {/* 배경 그래디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 제목 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-ivory mb-4">
            행사 일정
          </h2>
          <p className="text-gold text-lg">
            PNU Alliance의 다양한 행사에 참여하세요
          </p>
        </motion.div>

        {/* 메인 레이아웃: 모집중 회차 (왼쪽) + 지난 회차 (오른쪽 나선형) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* 왼쪽: 모집중 회차 (크게) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {currentEvent ? (
              <Card className="bg-charcoal-medium border-gold/30 overflow-hidden hover:border-gold/60 transition-all duration-300 shadow-2xl">
                {/* 배경 이미지 또는 그래디언트 */}
                <div className="h-64 bg-gradient-to-br from-gold/20 via-charcoal-deep to-charcoal-deep relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-transparent to-transparent" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </div>

                {/* 콘텐츠 */}
                <div className="p-8">
                  {/* 배지 */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block px-3 py-1 bg-gold text-charcoal-deep text-sm font-bold rounded-full">
                      {currentEvent.eventNumber}회차
                    </span>
                    <span className="inline-block px-3 py-1 bg-green-500/30 text-green-300 text-sm font-semibold rounded-full">
                      모집중
                    </span>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-3xl font-bold text-ivory mb-4">
                    {currentEvent.title}
                  </h3>

                  {/* 정보 */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gold">
                      <span className="text-lg">📅</span>
                      <span>
                        {format(new Date(currentEvent.date), "PPP", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gold">
                      <span className="text-lg">📍</span>
                      <span>{currentEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gold">
                      <span className="text-lg">🎯</span>
                      <span>{currentEvent.theme}</span>
                    </div>
                  </div>

                  {/* 설명 */}
                  <p className="text-ivory/80 mb-6 line-clamp-3">
                    {currentEvent.description}
                  </p>

                  {/* 참가자 수 */}
                  {currentEvent.capacity && (
                    <div className="mb-6 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                      <p className="text-sm text-ivory/70">참가자 현황</p>
                      <p className="text-lg font-bold text-gold">0 / {currentEvent.capacity}명</p>
                    </div>
                  )}

                  {/* 버튼 */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => onRegistrationClick?.(currentEvent.id, currentEvent.title)}
                      className="flex-1 bg-gold hover:bg-gold/90 text-charcoal-deep font-bold py-3 rounded-lg transition-all duration-300"
                    >
                      참가 신청하기
                    </Button>
                    <Button
                      onClick={() => onEventSelect?.(currentEvent.id)}
                      variant="outline"
                      className="flex-1 border-gold/50 text-gold hover:bg-gold/10 py-3 rounded-lg transition-all duration-300"
                    >
                      자세히 보기
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-charcoal-medium border-gold/30 p-12 text-center">
                <p className="text-ivory/60 text-lg">
                  현재 모집중인 행사가 없습니다.
                </p>
              </Card>
            )}
          </motion.div>

          {/* 오른쪽: 지난 회차 (나선형 배치) */}
          <div className="relative h-[600px] flex items-center justify-center">
            {pastEvents.length > 0 ? (
              <>
                {pastEvents.map((event, index) => {
                  const pos = spiralPositions[index];
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                      }}
                      className="absolute"
                      style={{
                        transform: `translate(${pos.x}px, ${pos.y}px)`,
                      }}
                      onMouseEnter={() => setHoveredEventId(event.id)}
                      onMouseLeave={() => setHoveredEventId(null)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="cursor-pointer"
                      >
                        <Card
                          className={`bg-charcoal-medium border-gold/30 overflow-hidden transition-all duration-300 ${
                            hoveredEventId === event.id
                              ? "border-gold/80 shadow-lg shadow-gold/20"
                              : "border-gold/20"
                          }`}
                          style={{
                            width: `${200 * pos.scale}px`,
                          }}
                        >
                          <div className="p-4">
                            <div className="text-sm font-bold text-gold mb-2">
                              {event.eventNumber}회차
                            </div>
                            <h4 className="text-sm font-semibold text-ivory line-clamp-2 mb-2">
                              {event.title}
                            </h4>

                            {hoveredEventId === event.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-ivory/70 space-y-2"
                              >
                                <p>
                                  {format(new Date(event.date), "MMM d", {
                                    locale: ko,
                                  })}
                                </p>
                                <p>{event.location}</p>
                                <p className="text-gold/80">{event.theme}</p>
                                {event.capacity && (
                                  <p className="text-gold/60 text-xs">0 / {event.capacity}</p>
                                )}
                                <Button
                                  disabled
                                  className="w-full mt-2 bg-gray-500/30 text-gray-400 text-xs py-1 h-auto cursor-not-allowed"
                                >
                                  신청 불가
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* 전체 보기 버튼 */}
                {pastEvents.length > 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                  >
                    <Button
                      variant="outline"
                      className="border-gold/50 text-gold hover:bg-gold/10"
                    >
                      지난 회차 전체 보기
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <p className="text-ivory/60 text-center">
                지난 행사가 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
