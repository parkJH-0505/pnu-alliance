import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { trpc } from "@/lib/trpc";

const galleryItems = [
  {
    src: "/images/tier-cosmos.jpg",
    alt: "PNU Alliance networking event",
    caption: "Spring Gathering 2025",
    subcaption: "강남 루프탑에서의 첫 만남",
    span: "col-span-2 row-span-2",
    color: "from-gold/10 to-burgundy/10",
  },
  {
    src: "/images/hero-space-background.jpg",
    alt: "Seoul night skyline",
    caption: "서울의 밤",
    subcaption: "우리의 무대, 서울",
    span: "col-span-1 row-span-1",
    color: "from-slate-blue/10 to-gold/10",
  },
  {
    src: "/images/tier-galaxy.jpg",
    alt: "Cosmos tier visual",
    caption: "Cosmos Night",
    subcaption: "최정상의 만남",
    span: "col-span-1 row-span-1",
    color: "from-burgundy/10 to-gold/15",
  },
  {
    src: "/images/tier-launcher.jpg",
    alt: "Members club interior",
    caption: "Private Lounge",
    subcaption: "멤버 전용 공간",
    span: "col-span-1 row-span-1",
    color: "from-gold/10 to-slate-blue/10",
  },
  {
    src: "/images/tier-orbiter.jpg",
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
  const { data: images = [] } = trpc.gallery.list.useQuery();
  
  const displayImages = images.length > 0 
    ? images.map((img: any) => ({
        src: img.imageUrl,
        alt: img.title || "Gallery Image",
        caption: img.title || "Gallery",
        subcaption: img.description || "",
        span: "col-span-1 row-span-1",
        color: "from-gold/10 to-charcoal/10"
      }))
    : galleryItems;

  return (
    <section className="relative py-28 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-charcoal-deep" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-px bg-gold/40" />
            <span className="text-gold/70 text-xs tracking-[0.35em] uppercase">
              Gallery
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.1] font-display">
            우리의<br />
            <span className="text-gold-gradient italic font-light">순간들</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[180px] lg:auto-rows-[220px]">
          {displayImages.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative group overflow-hidden rounded-sm ${item.span}`}
            >
              {item.src ? (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${item.color}`} />
              )}
              <div className="absolute inset-0 bg-charcoal-deep/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                <p className="text-gold font-display text-lg mb-1">{item.caption}</p>
                <p className="text-ivory/70 text-xs tracking-wider">{item.subcaption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
