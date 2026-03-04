/*
 * GallerySection — PNU Alliance
 * Photo gallery / member highlights section
 * Masonry-style grid with hover reveals
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  src?: string;
  alt: string;
  caption: string;
  subcaption: string;
  span: string; // grid span class
  color?: string; // gradient color for placeholder
}

const galleryItems: GalleryItem[] = [
  {
    alt: "PNU Alliance networking event",
    caption: "Spring Gathering 2025",
    subcaption: "강남 루프탑에서의 첫 만남",
    span: "col-span-2 row-span-2",
    color: "from-gold/10 to-burgundy/10",
  },
  {
    alt: "Seoul night skyline",
    caption: "서울의 밤",
    subcaption: "우리의 무대, 서울",
    span: "col-span-1 row-span-1",
    color: "from-slate-blue/10 to-gold/10",
  },
  {
    alt: "Cosmos tier visual",
    caption: "Cosmos Night",
    subcaption: "최정상의 만남",
    span: "col-span-1 row-span-1",
    color: "from-burgundy/10 to-gold/15",
  },
  {
    alt: "Members club interior",
    caption: "Private Lounge",
    subcaption: "멤버 전용 공간",
    span: "col-span-1 row-span-1",
    color: "from-gold/10 to-slate-blue/10",
  },
  {
    alt: "Brand Identity",
    caption: "Brand Identity",
    subcaption: "PNU Alliance의 시그니처",
    span: "col-span-1 row-span-1",
    color: "from-slate-blue/15 to-burgundy/10",
  },
];

export default function GallerySection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-28 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-charcoal-deep" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        {/* Section Header */}
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
              Gallery
            </span>
          </div>
          <h2
            className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.1]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            우리의
            <br />
            <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
              순간들
            </span>
          </h2>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[180px] lg:auto-rows-[220px]">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`group relative overflow-hidden ${item.span}`}
            >
              {item.src ? (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${item.color || 'from-gold/10 to-gold/5'} border border-gold/20 flex items-center justify-center transition-transform duration-700 group-hover:scale-110`}>
                  <ImageIcon size={40} className="text-gold/30" />
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-charcoal-deep/0 group-hover:bg-charcoal-deep/70 transition-all duration-500 flex items-end">
                <div className="p-4 lg:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p
                    className="text-gold text-sm tracking-[0.1em]"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                  >
                    {item.caption}
                  </p>
                  <p
                    className="text-ivory/50 text-xs mt-1"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    {item.subcaption}
                  </p>
                </div>
              </div>
              {/* Gold border on hover */}
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/30 transition-all duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p
            className="text-ivory/30 text-sm italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            실제 모임 사진들이 곧 업로드될 예정입니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
