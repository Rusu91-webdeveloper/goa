"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="pt-24 bg-gradient-to-r from-violet-700 to-violet-500 text-white py-20 dark:from-violet-900 dark:to-violet-700">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-xl mb-8">{t("hero.subtitle")}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="#services"
              className="bg-white text-violet-700 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:text-violet-400 dark:hover:bg-gray-700">
              {t("hero.services")}
            </Link>
            <Link
              href="#contact"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-violet-700 transition-colors dark:hover:bg-gray-800 dark:hover:text-violet-400">
              {t("hero.contact")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
