import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ManifestoSection from "@/components/ManifestoSection";
import TiersSection from "@/components/TiersSection";
import NetworkSection from "@/components/NetworkSection";
import JourneySection from "@/components/JourneySection";
import EventsSectionSpiral from "@/components/EventsSectionSpiral";
import EventDetailModal from "@/components/EventDetailModal";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import GallerySection from "@/components/GallerySection";
import HostSection from "@/components/HostSection";
import JoinSection from "@/components/JoinSection";
import TestimonialBand from "@/components/TestimonialBand";
import NewsSection from "@/components/NewsSection";

export default function Home() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationEventTitle, setRegistrationEventTitle] = useState("");

  const handleEventSelect = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsDetailModalOpen(true);
  };

  const handleRegistrationClick = (eventId: number, eventTitle?: string) => {
    setSelectedEventId(eventId);
    setRegistrationEventTitle(eventTitle || "");
    setIsRegistrationModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-charcoal-deep text-ivory">
      <HeroSection />
      <AboutSection />
      <ManifestoSection />
      <TiersSection />
      <NetworkSection />
      <JourneySection />
      <TestimonialBand />
      <EventsSectionSpiral 
        onEventSelect={handleEventSelect}
        onRegistrationClick={handleRegistrationClick}
      />
      <NewsSection />
      <GallerySection />
      <HostSection />
      <JoinSection />

      {/* 모달 */}
      {selectedEventId && (
        <>
          <EventDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            eventId={selectedEventId}
            onRegisterClick={() => handleRegistrationClick(selectedEventId, registrationEventTitle)}
          />
          <EventRegistrationModal
            isOpen={isRegistrationModalOpen}
            onClose={() => setIsRegistrationModalOpen(false)}
            eventId={selectedEventId}
            eventTitle={registrationEventTitle}
          />
        </>
      )}
    </div>
  );
}
