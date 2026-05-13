/*
 * Home Page — PNU Alliance (고도화)
 * "The Members' Club" — Neo-Edwardian Luxury Design
 *
 * 섹션 순서:
 * 1. Hero — 핵심 메시지
 * 2. About — 왜 존재하는가
 * 3. TestimonialBand — 실제 멤버 인용
 * 4. ValuesSection — 문화 헌법(4원칙) + 행동 코드(6가지) + 선배 명언 (통합)
 * 5. Tiers — 우주 탐사 세계관 등급 시스템
 * 6. Journey — 실제 여정 타임라인
 * 7. Events — 다음 모임
 * 8. Network — 업계 분포
 * 9. Hosts — 호스트 소개
 * 10. Join — 합류 신청 폼 + 연락처
 * 11. Footer
 */
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TestimonialBand from "@/components/TestimonialBand";
import ValuesSection from "@/components/ValuesSection";
import TiersSection from "@/components/TiersSection";
import JourneySection from "@/components/JourneySection";
import EventsSection from "@/components/EventsSection";
import NetworkSection from "@/components/NetworkSection";
import HostSection from "@/components/HostSection";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-charcoal-deep text-ivory">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <TestimonialBand />
      <ValuesSection />
      <TiersSection />
      <JourneySection />
      <EventsSection />
      <NetworkSection />
      <HostSection />
      <JoinSection />
      <Footer />
    </div>
  );
}
