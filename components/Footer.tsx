"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">
              GOA Erwachsenenbildung
            </h3>
            <p className="text-gray-300">{t("hero.subtitle")}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">
              {t("footer.quicklinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#leitbild"
                  className="text-gray-300 hover:text-white transition-colors">
                  {t("nav.leitbild")}
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-gray-300 hover:text-white transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="text-gray-300 hover:text-white transition-colors">
                  {t("nav.services")}
                </Link>
              </li>
              <li>
                <Link
                  href="#jobs"
                  className="text-gray-300 hover:text-white transition-colors">
                  {t("nav.jobs")}
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-gray-300 hover:text-white transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">{t("contact.title")}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@goa-erwachsenenbildung.de</li>
              <li>{t("contact.phone")}: +49 176 8543 6390</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {currentYear} GOA Erwachsenenbildung GmbH.{" "}
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
