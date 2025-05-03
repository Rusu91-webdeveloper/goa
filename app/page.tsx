import Hero from "@/components/Hero"
import About from "@/components/About"
import Services from "@/components/Services"
import JobOffers from "@/components/JobOffers"
import ContactForm from "@/components/ContactForm"
import CoreValues from "@/components/CoreValues"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <CoreValues />
      <Services />
      <JobOffers />
      <ContactForm />
    </main>
  )
}
