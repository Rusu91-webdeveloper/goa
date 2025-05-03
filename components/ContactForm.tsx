"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function ContactForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    company: "",
    lastName: "",
    firstName: "",
    address: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Track successful form submission
        // @ts-ignore
        if (window.trackEvent) {
          // @ts-ignore
          window.trackEvent("form", "contact", "submit", "success");
        }

        setSubmitStatus("success");
        setStatusMessage(
          "Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns in Kürze bei Ihnen melden."
        );
        setFormData({
          company: "",
          lastName: "",
          firstName: "",
          address: "",
          email: "",
          phone: "",
          service: "",
          message: "",
        });
      } else {
        // Track failed form submission
        // @ts-ignore
        if (window.trackEvent) {
          // @ts-ignore
          window.trackEvent("form", "contact", "submit", "error", data.message);
        }

        setSubmitStatus("error");
        setStatusMessage(
          data.message ||
            "Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      // Track error
      // @ts-ignore
      if (window.trackEvent) {
        // @ts-ignore
        window.trackEvent("form", "contact", "submit", "error", "network");
      }

      setSubmitStatus("error");
      setStatusMessage(
        "Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsSubmitting(false);

      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }
  };

  return (
    <section
      id="contact"
      className="scroll-mt-20 py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-300">
          {t("contact.title")}
        </h2>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 bg-violet-700 text-white p-8">
                <h3 className="text-xl font-semibold mb-6">
                  {t("contact.info")}
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t("contact.email")}
                      </p>
                      <a
                        href="mailto:info@goa-erwachsenenbildung.de"
                        className="hover:underline">
                        info@goa-erwachsenenbildung.de
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-6 w-6 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t("contact.phone")} / {t("contact.whatsapp")}
                      </p>
                      <a
                        href="tel:+4917685436390"
                        className="hover:underline">
                        +49 176 8543 6390
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MessageSquare className="h-6 w-6 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t("contact.available")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        9:00 - 17:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3 p-8">
                {submitStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
                    {statusMessage}
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                    {statusMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.company")}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.lastname")}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.firstname")}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.address")}
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.email.address")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.phone.number")}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="service"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.service")}
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <option value="">{t("contact.service.select")}</option>
                        <option value="bamf">{t("services.bamf")}</option>
                        <option value="dtz">{t("services.dtz")}</option>
                        <option value="telc-b1">{t("services.telc-b1")}</option>
                        <option value="telc-b2">{t("services.telc-b2")}</option>
                        <option value="coaching-b2">
                          {t("services.coaching-b2")}
                        </option>
                        <option value="coaching-b1">
                          {t("services.coaching-b1")}
                        </option>
                        <option value="group-b2">
                          {t("services.group-b2")}
                        </option>
                        <option value="group-b1">
                          {t("services.group-b1")}
                        </option>
                        <option value="business">
                          {t("services.business")}
                        </option>
                        <option value="online">{t("services.online")}</option>
                        <option value="coaching">
                          {t("services.coaching")}
                        </option>
                        <option value="it">{t("services.it")}</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.message")}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-violet-600 text-white py-3 px-6 rounded-md font-medium hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50">
                      {isSubmitting ? t("contact.sending") : t("contact.send")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
