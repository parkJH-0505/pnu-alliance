/*
 * Navigation — PNU Alliance (고도화)
 * - 스크롤 진행 표시기 (상단 골드 바)
 * - 스크롤 시 배경 변화 (투명 → 반투명 블러)
 * - 활성 섹션 하이라이트
 * - 슬라이드 인 모바일 메뉴
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#about",     label: "About" },
  { href: "#manifesto", label: "Manifesto" },
  { href: "#culture",   label: "Culture" },
  { href: "#tiers",     label: "Tiers" },
  { href: "#journey",   label: "Journey" },
  { href: "#events",    label: "Events" },
  { href: "#news",      label: "News" },
  { href: "#network",   label: "Network" },
  { href: "#hosts",     label: "Hosts" },
];

export default function Navigation() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const detectActiveSection = useCallback(() => {
    const ids = navLinks.map((l) => l.href.replace("#", ""));
    for (const id of [...ids].reverse()) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) {
        setActiveSection(id);
        return;
      }
    }
    setActiveSection("");
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", detectActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", detectActiveSection);
  }, [detectActiveSection]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div className="scroll-progress" style={{ scaleX }} />

      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-charcoal-deep/92 backdrop-blur-xl border-b border-gold/8 shadow-[0_4px_30px_rgba(0,0,0,0.35)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center gap-3 group"
            >
              <div className="w-8 h-8 border border-gold/50 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:bg-gold/5">
                <span className="text-gold text-xs tracking-[0.15em] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  P
                </span>
              </div>
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-ivory/90 text-sm tracking-[0.2em] uppercase group-hover:text-ivory transition-colors duration-300" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  PNU Alliance
                </span>
                <span className="text-gold/40 text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  Trust-Based Network
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                    className={`relative px-3 py-2 text-xs tracking-[0.12em] uppercase transition-colors duration-300 group ${
                      isActive ? "text-gold" : "text-ivory/55 hover:text-ivory/90"
                    }`}
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-3 right-3 h-px bg-gold transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
                  </a>
                );
              })}
              <a
                href="#join"
                onClick={(e) => { e.preventDefault(); handleNavClick("#join"); }}
                className="ml-4 px-5 py-2 border border-gold/50 text-gold text-xs tracking-[0.15em] uppercase hover:bg-gold hover:text-charcoal-deep transition-all duration-300"
                style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
              >
                합류하기
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-ivory/70 hover:text-gold transition-colors duration-300 p-1"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-charcoal-deep/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-charcoal-deep border-l border-gold/10 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gold/10">
                <span className="text-gold/60 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  Navigation
                </span>
                <button onClick={() => setMobileOpen(false)} className="text-ivory/50 hover:text-gold transition-colors duration-300">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center px-8 gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="py-3 text-ivory/60 text-xl tracking-[0.1em] uppercase hover:text-gold transition-colors duration-300 border-b border-gold/5"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <div className="p-8 border-t border-gold/10">
                <motion.a
                  href="#join"
                  onClick={(e) => { e.preventDefault(); handleNavClick("#join"); }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="block w-full text-center py-3.5 bg-gold text-charcoal-deep text-sm tracking-[0.2em] uppercase hover:bg-gold-light transition-all duration-300"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  합류하기
                </motion.a>
                <p className="text-center text-ivory/20 text-xs mt-4 italic" style={{ fontFamily: "var(--font-display)" }}>
                  "혼자 싸우지 않아도 되는 세상"
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
