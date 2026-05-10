import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface HostInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HostInquiryModal({ isOpen, onClose }: HostInquiryModalProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", content: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const createInquiryMutation = trpc.inquiries.create.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.content) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await createInquiryMutation.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        content: form.content,
      });
      toast.success("문의가 접수되었습니다!");
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setForm({ name: "", email: "", phone: "", content: "" });
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("문의 제출 오류:", error);
      toast.error("문의 제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-6"
          >
            <div className="border border-gold/15 [background:oklch(0.2_0.06_40_/_0.8)] backdrop-blur-sm p-8 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-ivory/40 hover:text-ivory transition-colors"
              >
                <X size={20} />
              </button>

              {!submitted ? (
                <>
                  <h2 className="text-2xl text-ivory mb-6" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                    호스트에게 문의하기
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        이름 <span className="text-gold/60">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="홍길동"
                        className="input-dark w-full"
                      />
                    </div>

                    <div>
                      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        이메일 <span className="text-gold/60">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="input-dark w-full"
                      />
                    </div>

                    <div>
                      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        연락처
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="010-0000-0000"
                        className="input-dark w-full"
                      />
                    </div>

                    <div>
                      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        문의 내용 <span className="text-gold/60">*</span>
                      </label>
                      <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        placeholder="문의하고 싶은 내용을 입력해주세요."
                        rows={4}
                        className="input-dark w-full resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-gold text-charcoal-deep text-sm tracking-[0.15em] uppercase hover:bg-gold-light transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        "문의 제출"
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 [background:oklch(0.75_0.18_49.77_/_0.1)] border border-gold/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check size={28} className="text-gold" />
                  </motion.div>
                  <h3 className="text-ivory text-xl mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                    문의가 접수되었습니다
                  </h3>
                  <p className="text-ivory/50 text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    빠른 시일 내에 답변드리겠습니다.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
