/*
 * ContactSection — PNU Alliance
 * Design: Editorial CTA + contact info
 * Copy: 뿌리문서 — 연결의 시작, 호스트에게 닿는 방법
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, MessageCircle, Instagram, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const PATTERN_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663106122854/geKm9UWf6wUBp2hktfGtxf/abstract-pattern-Tr7NppRJwPxCvrSGiAXMtp.webp";

export default function ContactSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="relative py-28 lg:py-40 overflow-hidden">
      <div className="absolute inset-0">
        <img src={PATTERN_IMG} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-charcoal/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left — CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-px bg-gold/40" />
              <span
                className="text-gold/70 text-xs tracking-[0.35em] uppercase"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                Connect with Us
              </span>
            </div>

            <h2
              className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.1] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              당신의 궤도가
              <br />
              <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
                여기서 시작됩니다
              </span>
            </h2>

            <p
              className="text-ivory/50 text-base leading-[1.8] mb-4 max-w-md"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              부산대학교 출신이라면 누구나 PNU Alliance의 문을 두드릴 수 있습니다.
              호스트에게 연락하시면 다음 모임에 초대해 드립니다.
            </p>
            <p
              className="text-ivory/35 text-sm leading-[1.8] mb-8 max-w-md"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              "처음에 눈덩이를 뭉치면 시럽고 힘들다. 그것만 잘하면 커진다."
              <br />
              지금 이 순간, 당신이 그 눈덩이의 일부가 될 수 있습니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => toast("가입 신청 기능이 곧 오픈됩니다.")}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold text-charcoal-deep text-sm tracking-[0.15em] uppercase hover:bg-gold-light transition-all duration-300"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                합류 신청
                <ArrowUpRight size={16} />
              </button>
              <button
                onClick={() => toast("문의 기능이 곧 오픈됩니다.")}
                className="inline-flex items-center justify-center px-8 py-3.5 border border-ivory/20 text-ivory/70 text-sm tracking-[0.15em] uppercase hover:border-gold hover:text-gold transition-all duration-300"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                호스트에게 문의
              </button>
            </div>
          </motion.div>

          {/* Right — Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h3
              className="text-xl text-ivory mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              호스트에게 닿는 법
            </h3>

            <div className="space-y-6">
              {[
                {
                  icon: <Mail size={18} />,
                  label: "Email",
                  value: "hello@pnualliance.com",
                  href: "mailto:hello@pnualliance.com",
                },
                {
                  icon: <Instagram size={18} />,
                  label: "Instagram",
                  value: "@pnu_alliance",
                  href: "#",
                },
                {
                  icon: <MessageCircle size={18} />,
                  label: "KakaoTalk",
                  value: "PNU Alliance 오픈채팅",
                  href: "#",
                },
              ].map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  onClick={(e) => {
                    if (contact.href === "#") {
                      e.preventDefault();
                      toast("링크가 곧 연결됩니다.");
                    }
                  }}
                  className="group flex items-center gap-4 p-4 border border-gold/8 hover:border-gold/25 transition-all duration-400"
                >
                  <div className="text-gold/50 group-hover:text-gold transition-colors duration-300">
                    {contact.icon}
                  </div>
                  <div>
                    <span
                      className="text-ivory/30 text-[10px] tracking-[0.25em] uppercase block"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {contact.label}
                    </span>
                    <span
                      className="text-ivory/70 text-sm group-hover:text-gold transition-colors duration-300"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                    >
                      {contact.value}
                    </span>
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="ml-auto text-ivory/20 group-hover:text-gold/60 transition-colors duration-300"
                  />
                </a>
              ))}
            </div>

            {/* Host note */}
            <div className="mt-10 border-t border-gold/10 pt-8">
              <p
                className="text-ivory/25 text-sm italic leading-relaxed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                "사람을 연결하고 분위기를 만드는 게 에너지를 빼앗기는 게 아니라 충전시킨다는 걸 느꼈다."
              </p>
              <span
                className="text-gold/30 text-xs mt-2 block"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                — 호스트 박준홍
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
