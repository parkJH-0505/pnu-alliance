/*
 * Footer — PNU Alliance
 * Design: Minimal elegant footer with gold accents
 * Copy: 뿌리문서 — 핵심 태그라인
 */

export default function Footer() {
  return (
    <footer className="relative border-t border-gold/10 bg-charcoal-deep">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-gold/40 flex items-center justify-center">
                <span
                  className="text-gold text-xs tracking-[0.2em] font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  P
                </span>
              </div>
              <span
                className="text-ivory/80 text-base tracking-[0.15em]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                PNU ALLIANCE
              </span>
            </div>
            <p
              className="text-ivory/30 text-sm leading-relaxed max-w-xs"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              부산대 출신이 서울에서 혼자 싸우지 않아도 되는 세상.
              같은 뿌리에서 시작된 신뢰 기반 네트워크.
            </p>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h4
              className="text-ivory/50 text-xs tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              Navigate
            </h4>
            <ul className="space-y-2">
              {[
                { label: "About", href: "#about" },
                { label: "Manifesto", href: "#manifesto" },
                { label: "Tiers", href: "#tiers" },
                { label: "Journey", href: "#journey" },
                { label: "Events", href: "#events" },
                { label: "Network", href: "#network" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-ivory/30 text-sm hover:text-gold transition-colors duration-300"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Orbit System */}
          <div className="lg:col-span-3">
            <h4
              className="text-ivory/50 text-xs tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              Orbit System
            </h4>
            <ul className="space-y-2">
              {[
                "Ground Crew",
                "Launcher",
                "Rocket",
                "Orbiter",
                "Galaxy",
                "Cosmos",
              ].map((tier) => (
                <li key={tier}>
                  <span
                    className="text-ivory/30 text-sm"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    {tier}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4
              className="text-ivory/50 text-xs tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              Connect
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@pnualliance.com"
                  className="text-ivory/30 text-sm hover:text-gold transition-colors duration-300"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  hello@pnualliance.com
                </a>
              </li>
              <li>
                <span
                  className="text-ivory/30 text-sm"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  Instagram @pnu_alliance
                </span>
              </li>
              <li>
                <span
                  className="text-ivory/30 text-sm"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  KakaoTalk 오픈채팅
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="gold-divider mt-12 mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-ivory/20 text-xs"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            &copy; 2026 PNU Alliance. All rights reserved.
          </p>
          <p
            className="text-ivory/20 text-xs italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            "혼자 싸우지 않아도 되는 세상을 만든다"
          </p>
        </div>
      </div>
    </footer>
  );
}
