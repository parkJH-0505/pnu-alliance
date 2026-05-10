import { useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function NewsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: newsList = [] } = trpc.news.list.useQuery();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "UPDATE":
        return "bg-blue-500/20 border-blue-500/40 text-blue-300";
      case "INTERVIEW":
        return "bg-purple-500/20 border-purple-500/40 text-purple-300";
      case "RECAP":
        return "bg-green-500/20 border-green-500/40 text-green-300";
      default:
        return "bg-gold/20 border-gold/40 text-gold";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "UPDATE":
        return "업데이트";
      case "INTERVIEW":
        return "인터뷰";
      case "RECAP":
        return "회고";
      default:
        return type;
    }
  };

  return (
    <section id="news" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal-deep">
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full [background:radial-gradient(circle,oklch(0.75_0.18_49.77_/_0.02),transparent)] blur-[120px] pointer-events-none" />

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
              News & Updates
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            커뮤니티의<br />
            <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>소식들</span>
          </h2>
        </motion.div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {newsList.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-ivory/40 text-sm">아직 소식이 없습니다.</p>
            </div>
          ) : (
            newsList.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="group relative border border-gold/15 [background:oklch(0.2_0.06_40_/_0.3)] hover:[background:oklch(0.2_0.06_40_/_0.5)] transition-all duration-300 overflow-hidden p-6 lg:p-8 flex flex-col"
              >
                {/* Type Badge */}
                <div className={`inline-flex w-fit px-3 py-1 mb-4 border text-[10px] tracking-[0.2em] uppercase ${getTypeColor(item.type)}`} style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                  {getTypeLabel(item.type)}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 mb-3 text-ivory/40 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                  <Calendar size={12} />
                  <span>{new Date(item.publishedAt).toLocaleDateString("ko-KR")}</span>
                </div>

                {/* Title */}
                <h3 className="text-ivory text-lg mb-3 leading-[1.4] flex-grow" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                  {item.title}
                </h3>

                {/* Excerpt */}
                {item.excerpt && (
                  <p className="text-ivory/50 text-sm mb-4 leading-[1.6]" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    {item.excerpt}
                  </p>
                )}

                {/* Read More Link */}
                <div className="flex items-center gap-2 text-gold text-xs tracking-[0.15em] uppercase group-hover:gap-3 transition-all duration-300" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                  <span>더 보기</span>
                  <ArrowRight size={12} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
