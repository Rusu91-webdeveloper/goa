"use client";

import { CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function JobOffers() {
  const { t } = useI18n();

  return (
    <section
      id="jobs"
      className="scroll-mt-20 py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          {t("jobs.title")}
        </h2>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="md:flex">
            <div className="md:w-1/2 p-6 bg-violet-50 dark:bg-violet-900/20">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {t("jobs.profile")}
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.profile.degree")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.profile.german")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.profile.bamf")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.profile.daf")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.profile.professional")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.profile.alpha")}</span>
                </li>
              </ul>
            </div>

            <div className="md:w-1/2 p-6 dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {t("jobs.offer")}
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.offer.appreciation")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.offer.pay")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.offer.travel")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.offer.accommodation")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.offer.security")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.offer.atmosphere")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{t("jobs.offer.hierarchy")}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-700 dark:text-gray-300">
              {t("jobs.apply")}{" "}
              <a
                href="mailto:info@goa-erwachsenenbildung.de"
                className="text-violet-600 hover:underline dark:text-violet-400">
                {t("jobs.apply.email")}
              </a>{" "}
              {t("jobs.apply.end")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
