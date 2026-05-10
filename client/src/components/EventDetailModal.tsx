import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  onRegisterClick?: () => void;
}

export default function EventDetailModal({
  isOpen,
  onClose,
  eventId,
  onRegisterClick,
}: EventDetailModalProps) {
  const { data: events = [], isLoading } = trpc.events.list.useQuery();
  const event = events.find((e) => e.id === eventId);

  if (!event && !isLoading) return null;
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-charcoal-medium border-gold/30">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isRecruiting = event?.status === "recruiting" && new Date(event.date) > new Date();
  const daysUntilEvent = event ? Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-charcoal-medium border-gold/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        {event ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-ivory text-2xl">
                {event.eventNumber}회차 - {event.title}
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* 배지 */}
              <div className="flex items-center gap-3">
                <span className="inline-block px-4 py-2 bg-gold text-charcoal-deep text-sm font-bold rounded-full">
                  {event.eventNumber}회차
                </span>
                {isRecruiting ? (
                  <span className="inline-block px-4 py-2 bg-green-500/30 text-green-300 text-sm font-semibold rounded-full">
                    모집중 (D-{daysUntilEvent})
                  </span>
                ) : (
                  <span className="inline-block px-4 py-2 bg-gray-500/30 text-gray-300 text-sm font-semibold rounded-full">
                    종료됨
                  </span>
                )}
              </div>

              {/* 주요 정보 */}
              <div className="grid grid-cols-2 gap-4 bg-charcoal-deep/50 rounded-lg p-6 border border-gold/20">
                <div>
                  <p className="text-ivory/60 text-sm mb-1">📅 일시</p>
                  <p className="text-ivory font-semibold">
                    {format(new Date(event.date), "PPP", { locale: ko })}
                  </p>
                </div>
                <div>
                  <p className="text-ivory/60 text-sm mb-1">📍 장소</p>
                  <p className="text-ivory font-semibold">{event.location}</p>
                </div>
                <div>
                  <p className="text-ivory/60 text-sm mb-1">🎯 테마</p>
                  <p className="text-ivory font-semibold">{event.theme}</p>
                </div>
                <div>
                  <p className="text-ivory/60 text-sm mb-1">👥 참가자</p>
                  <p className="text-ivory font-semibold">
                    {event.capacity ? `0 / ${event.capacity}` : "무제한"}
                  </p>
                </div>
              </div>

              {/* 상세 설명 */}
              <div>
                <h3 className="text-ivory font-semibold text-lg mb-3">행사 소개</h3>
                <p className="text-ivory/80 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* 참가 정보 */}
              {isRecruiting && (
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                  <p className="text-gold text-sm font-semibold mb-2">
                    ✓ 이 행사에 참가하고 싶으신가요?
                  </p>
                  <p className="text-ivory/70 text-sm">
                    아래 버튼을 클릭하여 참가 신청을 진행해주세요.
                  </p>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
                >
                  닫기
                </Button>
                {isRecruiting && (
                  <Button
                    onClick={() => {
                      onRegisterClick?.();
                      onClose();
                    }}
                    className="flex-1 bg-gold hover:bg-gold/90 text-charcoal-deep font-bold"
                  >
                    참가 신청하기
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
