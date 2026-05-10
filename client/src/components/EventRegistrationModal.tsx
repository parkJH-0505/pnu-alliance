import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle?: string;
}

type RegistrationStep = "type" | "search" | "form" | "quick-registration" | "success";

export default function EventRegistrationModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: EventRegistrationModalProps) {
  const [step, setStep] = useState<RegistrationStep>("type");
  const [registrationType, setRegistrationType] = useState<"existing_member" | "new_participant">("new_participant");
  const [phone, setPhone] = useState("");
  const [memberData, setMemberData] = useState<any>(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    additionalInfo: "",
  });

  // tRPC 뮤테이션
  const searchMember = trpc.memberProfiles.searchByPhone.useQuery(
    { phone },
    { enabled: false }
  );

  const createRegistration = trpc.eventRegistrations.create.useMutation({
    onSuccess: () => {
      toast.success("참가 신청이 완료되었습니다!");
      setStep("success");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "참가 신청에 실패했습니다.");
    },
  });

  const resetForm = () => {
    setStep("type");
    setPhone("");
    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
      additionalInfo: "",
    });
    setMemberData(null);
  };

  const handleSearchMember = async () => {
    if (!phone) {
      toast.error("전화번호를 입력해주세요.");
      return;
    }
    try {
      const result = await searchMember.refetch();
      if (result.data && result.data !== null) {
        const memberData = result.data;
        setMemberData(memberData);
        setFormData((prev) => ({
          ...prev,
          name: memberData.name || "",
          company: memberData.company || "",
          phone: phone,
        }));
        setStep("form");
      } else {
        toast.error("해당 전화번호의 멤버를 찾을 수 없습니다.");
        setStep("quick-registration");
      }
    } catch (error) {
      toast.error("검색 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("필수 정보를 입력해주세요.");
      return;
    }

    createRegistration.mutate({
      eventId,
      memberId: memberData?.id || undefined,
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      email: formData.email,
      additionalInfo: formData.additionalInfo,
      registrationType: memberData ? "existing_member" : "new_participant",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-charcoal-medium border-gold/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-ivory text-2xl">
            {eventTitle} 참가 신청
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: 신청 유형 선택 */}
          {step === "type" && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <p className="text-ivory/80 text-sm">
                어떤 방식으로 신청하시겠습니까?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    setRegistrationType("existing_member");
                    setStep("search");
                  }}
                  className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/50 h-24 flex flex-col items-center justify-center rounded-lg"
                >
                  <span className="text-2xl mb-2">👤</span>
                  <span className="text-sm font-semibold">기존 멤버</span>
                  <span className="text-xs text-gold/70">빠른 신청</span>
                </Button>
                <Button
                  onClick={() => {
                    setRegistrationType("new_participant");
                    setStep("form");
                  }}
                  className="bg-ivory/10 hover:bg-ivory/20 text-ivory border border-ivory/30 h-24 flex flex-col items-center justify-center rounded-lg"
                >
                  <span className="text-2xl mb-2">✨</span>
                  <span className="text-sm font-semibold">신규 참가자</span>
                  <span className="text-xs text-ivory/70">정보 입력</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: 기존 멤버 검색 */}
          {step === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="text-ivory/80 text-sm font-semibold mb-2 block">
                  전화번호
                </label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-charcoal-deep border-gold/30 text-ivory placeholder:text-ivory/40"
                  />
                  <Button
                    onClick={handleSearchMember}
                    disabled={searchMember.isLoading}
                    className="bg-gold hover:bg-gold/90 text-charcoal-deep font-semibold px-6"
                  >
                    검색
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep("type")}
                  variant="outline"
                  className="flex-1 border-gold/30 text-gold"
                >
                  이전
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: 신청 폼 */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {memberData && (
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 mb-4">
                  <p className="text-gold text-sm font-semibold">
                    ✓ {memberData.name} 멤버로 신청합니다
                  </p>
                </div>
              )}

              <div>
                <label className="text-ivory/80 text-sm font-semibold mb-2 block">
                  이름 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={!!memberData}
                  className="bg-charcoal-deep border-gold/30 text-ivory"
                />
              </div>

              <div>
                <label className="text-ivory/80 text-sm font-semibold mb-2 block">
                  직장명
                </label>
                <Input
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, company: e.target.value }))
                  }
                  disabled={!!memberData}
                  className="bg-charcoal-deep border-gold/30 text-ivory"
                />
              </div>

              <div>
                <label className="text-ivory/80 text-sm font-semibold mb-2 block">
                  전화번호 *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  disabled={!!memberData}
                  className="bg-charcoal-deep border-gold/30 text-ivory"
                />
              </div>

              <div>
                <label className="text-ivory/80 text-sm font-semibold mb-2 block">
                  이메일
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="bg-charcoal-deep border-gold/30 text-ivory"
                />
              </div>

              <div>
                <label className="text-ivory/80 text-sm font-semibold mb-2 block">
                  추가 정보
                </label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalInfo: e.target.value,
                    }))
                  }
                  placeholder="특별한 요청사항이 있으신가요?"
                  className="bg-charcoal-deep border-gold/30 text-ivory resize-none h-24"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    if (memberData) {
                      setStep("search");
                      setMemberData(null);
                    } else {
                      setStep("type");
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-gold/30 text-gold"
                >
                  이전
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createRegistration.isPending}
                  className="flex-1 bg-gold hover:bg-gold/90 text-charcoal-deep font-semibold"
                >
                  {createRegistration.isPending ? "신청 중..." : "신청하기"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: 성공 */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-5xl mb-4"
              >
                ✨
              </motion.div>
              <h3 className="text-2xl font-bold text-ivory mb-2">
                신청이 완료되었습니다!
              </h3>
              <p className="text-ivory/70">
                곧 닫히며, 확인 메일이 발송됩니다.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
