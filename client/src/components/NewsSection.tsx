/*
 * NewsSection — PNU Alliance
 * Design: Editorial news feed
 * Copy: 뿌리문서 실제 여정 기반 — 호스트의 항해일지
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  featured: boolean;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "뿌리문서 v1.0 — 머릿속에 있던 것을 밖으로 꺼냈다",
    excerpt:
      "7명의 선배 미팅, 2회의 오프라인 모임, 그리고 수많은 파편 자료를 하나의 문서로 통합했다. 판단이 흔들릴 때 돌아오는 원점이자, 새로 합류한 운영진이 한 번 읽고 '아, 우리가 뭘 하는지' 이해할 수 있는 살아있는 문서.",
    date: "2026.03.02",
    category: "기록",
    featured: true,
  },
  {
    id: 2,
    title: "7번째 선배 미팅 — 김소연 선배 (Shield AI)",
    excerpt:
      "인더스트리 나잇, 펍 나잇, 영어 토킹 나잇 등 테마 아이디어가 폭발적으로 쏟아졌다. '마이너리티 티켓을 써라' — 지방대 출신이라는 위치를 역이용하라는 전략적 관점이 새로웠다.",
    date: "2026.02",
    category: "미팅",
    featured: false,
  },
  {
    id: 3,
    title: "2차 모임 — 1회는 우연, 2회는 패턴",
    excerpt:
      "30대 초중반 선배급 약 20명 대상으로 2차 모임을 열었다. 두 번 해보니까 이건 된다는 확신이 생겼다. 모으는 건 되는데, 유지가 진짜 전쟁이라는 것도 배웠다.",
    date: "2025.12",
    category: "모임",
    featured: false,
  },
  {
    id: 4,
    title: "1차 모임 — '이런 자리가 필요했다'",
    excerpt:
      "20대 중후반 주니어 약 20명, 케이터링+와인 네트워킹. 사람들을 연결하고 분위기를 만드는 게 에너지를 빼앗기는 게 아니라 충전시킨다는 걸 느꼈다.",
    date: "2025.11",
    category: "모임",
    featured: false,
  },
];

export default function NewsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const featured = newsItems.find((n) => n.featured);
  const others = newsItems.filter((n) => !n.featured);

  return (
    <section id="news" className="relative py-28 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-charcoal noise-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span
              className="text-gold/70 text-xs tracking-[0.35em] uppercase"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              Host's Log
            </span>
          </div>
          <h2
            className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.1]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            호스트의
            <br />
            <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
              항해일지
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="group border border-gold/10 bg-charcoal-light/30 p-8 lg:p-12 h-full transition-all duration-500 hover:border-gold/30 card-glow">
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="text-gold/60 text-[10px] tracking-[0.3em] uppercase px-3 py-1 border border-gold/20"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                  >
                    {featured.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-ivory/30">
                    <Clock size={12} />
                    <span
                      className="text-xs"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {featured.date}
                    </span>
                  </div>
                </div>

                <h3
                  className="text-2xl lg:text-3xl xl:text-4xl text-ivory leading-tight mb-6"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                >
                  {featured.title}
                </h3>

                <div className="gold-divider mb-6" />

                <p
                  className="text-ivory/50 text-base leading-[1.8] mb-8"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  {featured.excerpt}
                </p>

                <button
                  onClick={() => toast("상세 페이지가 곧 오픈됩니다.")}
                  className="inline-flex items-center gap-2 text-gold text-sm tracking-[0.1em] uppercase group-hover:gap-3 transition-all duration-300"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                >
                  자세히 보기
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          <div className="lg:col-span-5 space-y-6">
            {others.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
              >
                <button
                  onClick={() => toast("상세 페이지가 곧 오픈됩니다.")}
                  className="group w-full text-left border border-gold/10 bg-charcoal-light/20 p-6 transition-all duration-500 hover:border-gold/25 card-glow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-gold/50 text-[10px] tracking-[0.25em] uppercase"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                    >
                      {item.category}
                    </span>
                    <span className="text-ivory/20 text-[10px]">·</span>
                    <span
                      className="text-ivory/30 text-xs"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {item.date}
                    </span>
                  </div>
                  <h4
                    className="text-ivory text-lg mb-2 group-hover:text-gold transition-colors duration-300"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="text-ivory/40 text-sm leading-relaxed line-clamp-2"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    {item.excerpt}
                  </p>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
