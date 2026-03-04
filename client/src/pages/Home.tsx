/*
 * Home Page — PNU Alliance (고도화)
 * "The Members' Club" — Neo-Edwardian Luxury Design
 *
 * 섹션 순서:
 * 1. Hero — 핵심 메시지
 * 2. About — 왜 존재하는가
 * 3. TestimonialBand — 실제 멤버 인용
 * 4. Manifesto — 선언문 + 문화 헌법 + 선배 명언
 * 5. Culture — Culture Code (신규)
 * 6. Tiers — 우주 탐사 세계관 등급 시스템
 * 7. Journey — 실제 여정 타임라인
 * 8. Events — 다음 모임
 * 9. News — 호스트의 소식
 * 10. Network — 업계 분포
 * 11. Hosts — 호스트 소개 (신규)
 * 12. Join — 합류 신청 폼
 * 13. Contact — 연락처
 * 14. Footer
 */
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TestimonialBand from "@/components/TestimonialBand";
import ManifestoSection from "@/components/ManifestoSection";
import CultureSection from "@/components/CultureSection";
import TiersSection from "@/components/TiersSection";
import JourneySection from "@/components/JourneySection";
import EventsSection from "@/components/EventsSection";
import NewsSection from "@/components/NewsSection";
import NetworkSection from "@/components/NetworkSection";
import HostSection from "@/components/HostSection";
import JoinSection from "@/components/JoinSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-charcoal-deep text-ivory">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <TestimonialBand />
      <ManifestoSection />
      <CultureSection />
      <TiersSection />
      <JourneySection />
      <EventsSection />
      <NewsSection />
      <NetworkSection />
      <HostSection />
      <JoinSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
