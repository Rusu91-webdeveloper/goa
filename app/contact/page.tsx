import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - GOA Erwachsenenbildung",
  description:
    "Get in touch with GOA for language courses, professional training and integration services.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ContactForm />
    </main>
  );
}
