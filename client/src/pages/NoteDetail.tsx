/*
 * NoteDetail Page — 개별 글 상세
 * URL: /notes/:slug
 */
import { Link, useRoute, Redirect } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User } from "lucide-react";
import { findBySlug, NOTES, Note } from "@/data/notes";
import Footer from "@/components/Footer";

export default function NoteDetail() {
  const [, params] = useRoute("/notes/:slug");
  const slug = params?.slug;
  const note = slug ? findBySlug(slug) : undefined;

  if (!note) {
    return <Redirect to="/notes" />;
  }

  // 같은 카테고리의 다른 글 (최대 3개) — 하단 추천
  const related = NOTES.filter(
    (n) => n.slug !== note.slug && n.category === note.category
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-charcoal-deep text-ivory">
      <DetailHeader />

      {/* Article */}
      <article className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 noise-overlay opacity-50" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-ivory/40 hover:text-gold text-xs tracking-[0.2em] uppercase mb-12 transition-colors group"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
            Notes 전체
          </Link>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-6"
          >
            <span
              className="text-gold/70 text-[10px] tracking-[0.3em] uppercase px-2.5 py-1 border border-gold/25"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              {note.category}
            </span>
            <div className="flex items-center gap-1.5 text-ivory/35 text-xs" style={{ fontFamily: "var(--font-body)" }}>
              <Clock size={11} />
              {note.date}
            </div>
            {note.author && (
              <div className="flex items-center gap-1.5 text-ivory/35 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                <User size={11} />
                {note.author}
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl lg:text-5xl text-ivory leading-[1.15] mb-10"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {note.title}
          </motion.h1>

          {/* Cover image */}
          {note.coverImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12 -mx-6 lg:mx-0"
            >
              <img
                src={note.coverImage}
                alt={note.title}
                className="w-full h-64 lg:h-96 object-cover border-y lg:border border-gold/10"
              />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6 text-ivory/75 text-base lg:text-lg leading-[1.9]"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            {note.content.split(/\n\n+/).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </motion.div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-gold/10"
            >
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-gold/55 text-xs px-2.5 py-1 border border-gold/15"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  #{tag}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="relative py-16 lg:py-24 bg-charcoal border-t border-gold/8">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-px bg-gold/40" />
              <span
                className="text-gold/70 text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                같은 카테고리
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link key={r.slug} href={`/notes/${r.slug}`}>
                  <article className="group h-full p-5 border border-gold/10 bg-charcoal hover:border-gold/30 transition-colors cursor-pointer">
                    <span
                      className="text-ivory/30 text-[10px] tracking-[0.2em]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {r.date}
                    </span>
                    <h4
                      className="text-ivory text-base mt-2 mb-2 leading-tight group-hover:text-gold transition-colors"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                    >
                      {r.title}
                    </h4>
                    <p
                      className="text-ivory/40 text-sm leading-relaxed line-clamp-2"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {r.excerpt}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

function DetailHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-charcoal-deep/92 backdrop-blur-xl border-b border-gold/8">
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
