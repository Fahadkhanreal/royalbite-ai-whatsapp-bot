import { Navbar } from "@/components/common/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedDishes } from "@/components/sections/featured-dishes"
import { AboutUs } from "@/components/sections/about-us"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { MenuPreview } from "@/components/sections/menu-preview"
import { Gallery } from "@/components/sections/gallery"
import { Testimonials } from "@/components/sections/testimonials"
import { Reservation } from "@/components/sections/reservation"
import { ContactSection } from "@/components/sections/contact-section"
import { Footer } from "@/components/common/footer"
import { FloatingWhatsAppButton } from "@/components/common/floating-whatsapp-button"

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <HeroSection />
      <FeaturedDishes />
      <AboutUs />
      <WhyChooseUs />
      <MenuPreview />
      <Gallery />
      <Testimonials />
      <Reservation />
      <ContactSection />
      <Footer />
      <FloatingWhatsAppButton />
    </main>
  )
}
