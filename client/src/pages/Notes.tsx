/*
 * Notes Page — PNU Notes
 * 별도 페이지로 분리한 글 모음. 회고·선배 미팅·기록·호스트 칼럼·소식.
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { NOTES, getFeatured, getOthers, Note } from "@/data/notes";
import Footer from "@/components/Footer";

export default function Notes() {
  const featured = getFeatured();
  const others = getOthers();

  return (
    <div className="min-h-screen bg-charcoal-deep text-ivory">
      <NotesHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/2 right-[-10%] w-[400px] h-[400px] rounded-full bg-gold/4 blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-px bg-gold/40" />
              <span
                className="text-gold/70 text-xs tracking-[0.35em] uppercase"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                PNU Notes
              </span>
            </div>
            <h1
              className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              기록, 만남,
              <br />
              <span className="text-gold-gradient italic" style={{ fontWeight: 300 }}>
                생각, 소식
              </span>
            </h1>
            <p
              className="text-ivory/55 text-base lg:text-lg leading-relaxed max-w-2xl"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              이 커뮤니티를 둘러싼 발자취. 지난 회차의 회고, 선배들과의 대화,
              운영하면서 쌓인 생각, 그리고 앞으로의 계획 — 모두 여기에 천천히 쌓아갑니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="relative pb-12">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <FeaturedCard note={featured} />
          </div>
        </section>
      )}

      {/* Grid */}
      {others.length > 0 && (
        <section className="relative pb-24 lg:pb-32">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map((note, i) => (
                <NoteCard key={note.slug} note={note} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

/* ---------- Sub-components ---------- */

function NotesHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-charcoal-deep/90 backdrop-blur-xl border-b border-gold/8">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 text-ivory/70 hover:text-gold transition-colors group">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span className="text-xs tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
              PNU Alliance
            </span>
          </Link>
          <Link
            href="/#join"
            className="px-5 py-2 border border-gold/50 text-gold text-xs tracking-[0.15em] uppercase hover:bg-gold hover:text-charcoal-deep transition-all duration-300"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          >
            합류하기
          </Link>
        </nav>
      </div>
    </header>
  );
}

function FeaturedCard({ note }: { note: Note }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <Link href={`/notes/${note.slug}`}>
        <article className="group relative border border-gold/15 bg-gradient-to-b from-gold/5 to-charcoal cursor-pointer overflow-hidden transition-all duration-500 hover:border-gold/35 hover:bg-gold/8">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          {note.coverImage && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-500"
                style={{ backgroundImage: `url(${note.coverImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 to-charcoal" />
            </>
          )}
          <div className="relative z-10 p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-5">
              <CategoryTag category={note.category} />
              <div className="flex items-center gap-1.5 text-ivory/30">
                <Clock size={11} />
                <span className="text-xs" style={{ fontFamily: "var(--font-body)" }}>
                  {note.date}
                </span>
              </div>
            </div>
            <h2
              className="text-2xl lg:text-3xl xl:text-4xl text-ivory leading-tight mb-5 group-hover:text-gold-light transition-colors duration-500"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              {note.title}
            </h2>
            <p
              className="text-ivory/55 text-base leading-[1.8] mb-6 max-w-3xl"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              {note.excerpt}
            </p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-gold/45 text-xs"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function NoteCard({ note, index }: { note: Note; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
    >
      <Link href={`/notes/${note.slug}`}>
        <article className="group relative border border-gold/10 bg-charcoal h-full p-6 cursor-pointer overflow-hidden transition-all duration-400 hover:border-gold/30 hover:bg-charcoal-light/40">
          {note.coverImage && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-8 group-hover:opacity-15 transition-opacity duration-400"
                style={{ backgroundImage: `url(${note.coverImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 to-charcoal" />
            </>
          )}
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <CategoryTag category={note.category} />
              <span className="text-ivory/25 text-[10px]" style={{ fontFamily: "var(--font-body)" }}>
                {note.date}
              </span>
            </div>
            <h3
              className="text-ivory text-base mb-2.5 leading-tight group-hover:text-gold transition-colors duration-300"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              {note.title}
            </h3>
            <p
              className="text-ivory/45 text-sm leading-relaxed flex-1"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              {note.excerpt.length > 110 ? note.excerpt.slice(0, 110) + "..." : note.excerpt}
            </p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gold/5">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-gold/40 text-[10px]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function CategoryTag({ category }: { category: string }) {
  return (
    <span
      className="text-gold/65 text-[10px] tracking-[0.25em] uppercase px-2 py-0.5 border border-gold/20"
      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
    >
      {category}
    </span>
  );
}
