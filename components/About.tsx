"use client";

import { useI18n } from "@/lib/i18n/i18n-context";

export default function About() {
  const { t } = useI18n();

  return (
    <section
      id="about"
      className="scroll-mt-20 py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            {t("about.title")}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-6">
            <p className="leading-relaxed">{t("about.p1")}</p>
            <p className="leading-relaxed">{t("about.p2")}</p>
            <p className="leading-relaxed">{t("about.p3")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
