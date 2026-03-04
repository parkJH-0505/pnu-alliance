/*
 * HostSection — PNU Alliance (신규)
 * - 호스트 소개 (박준홍, 성현두)
 * - 배경과 PNU Alliance를 만든 이유
 * - 인터뷰 형식 인용구
 * - 호스트 프로필 이미지
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Linkedin, Mail } from "lucide-react";

const hosts = [
  {
    id: "junhong",
    name: "박준홍",
    role: "Co-Host",
    title: "PNU Alliance 창립자 및 호스트",
    background: "부산대학교 졸업 후 서울에서 커리어를 시작. 부산에서 서울로 올라와 혼자 싸우던 시절의 외로움과 정보의 비대칭성을 경험했다. 같은 뿌리를 가진 사람들이 서로를 알아보고 연결될 때 일어나는 변화를 직접 목격하고 싶어 PNU Alliance를 만들었다.",
    quote: "부산대 출신이 서울에서 혼자 싸우지 않아도 되는 세상을 만들고 싶었습니다. 지방 거점국립대 출신의 구조적 불균형을 깨는 것이 출발점입니다.",
    tags: ["커뮤니티 빌더", "신뢰 기반 네트워크", "세대를 잇는 구조"],
    image: "/images/host-junhong.png",
  },
  {
    id: "hyundu",
    name: "성현두",
    role: "Co-Host",
    title: "PNU Alliance 공동 호스트",
    background: "부산대학교 기계공학과 17학번 졸업. 서울에서 스타트업 생태계에서 활동 중. PNU Alliance의 운영과 멤버 온보딩을 함께 주도하며, 커뮤니티의 지속가능한 성장을 위해 노력하고 있다.",
    quote: "같은 캠퍼스를 걷고, 같은 고민을 했던 사람들이 서울에서 만날 때 생기는 에너지가 있어요. 그 에너지를 구조화하고 지속시키는 것이 우리의 역할입니다.",
    tags: ["기계공학", "스타트업", "커뮤니티 운영"],
    image: "/images/host-hyundu.png", // 추후 업로드 예정
  },
];

export default function HostSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="hosts" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal">
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full bg-burgundy/5 blur-[150px] pointer-events-none" />

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
              The Hosts
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            <h2
              className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              이 판을 만든
              <br />
              <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
                두 사람
              </span>
            </h2>
            <p
              className="text-ivory/50 text-base leading-[1.9] lg:max-w-sm"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              PNU Alliance는 거창한 기획에서 시작하지 않았다. 서울에서 혼자였던 두 사람의 대화에서 시작되었다.
            </p>
          </div>
        </motion.div>

        {/* Host Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {hosts.map((host, i) => (
            <motion.div
              key={host.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative border border-gold/15 bg-gradient-to-b from-gold/3 to-transparent group overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 lg:p-10">
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: i * 0.15 + 0.1 }}
                  className="relative overflow-hidden"
                >
                  {host.image && (
                    <img
                      src={host.image}
                      alt={host.name}
                      className="w-full aspect-[3/4] object-cover rounded-sm border border-gold/20 transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  {!host.image && (
                    <div className="w-full aspect-[3/4] bg-gold/8 border border-gold/20 flex items-center justify-center rounded-sm">
                      <span
                        className="text-gold/40 text-6xl"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                      >
                        {host.name[0]}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Info */}
                <div className="flex flex-col justify-between">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3
                        className="text-ivory text-2xl"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                      >
                        {host.name}
                      </h3>
                      <span
                        className="tag-gold"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      >
                        {host.role}
                      </span>
                    </div>
                    <p
                      className="text-gold/50 text-sm mb-5"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {host.title}
                    </p>

                    {/* Background */}
                    <p
                      className="text-ivory/50 text-sm leading-[1.8] mb-5"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {host.background}
                    </p>

                    {/* Quote */}
                    <blockquote className="border-l-2 border-gold/25 pl-4 mb-5">
                      <p
                        className="text-ivory/60 text-sm italic leading-[1.8]"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                      >
                        "{host.quote}"
                      </p>
                    </blockquote>
                  </div>

                  {/* Tags & Links */}
                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {host.tags.map((tag) => (
                        <span key={tag} className="tag-gold opacity-60">{tag}</span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gold/8">
                      <a
                        href="#contact"
                        className="flex items-center gap-1.5 text-ivory/30 text-xs hover:text-gold/60 transition-colors duration-300"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      >
                        <Mail size={12} />
                        연락하기
                      </a>
                      <span className="text-ivory/15">·</span>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-ivory/30 text-xs hover:text-gold/60 transition-colors duration-300"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      >
                        <Linkedin size={12} />
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <p
            className="text-ivory/30 text-sm italic mb-6"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            "처음엔 그냥 밥 한번 먹자고 했을 뿐이에요. 근데 지금은 이렇게 됐어요."
          </p>
          <a
            href="#join"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold/30 text-gold/70 text-xs tracking-[0.2em] uppercase hover:bg-gold/5 hover:text-gold transition-all duration-300"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          >
            함께하기
          </a>
        </motion.div>
      </div>
    </section>
  );
}
