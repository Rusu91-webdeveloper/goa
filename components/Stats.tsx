"use client";

import { useI18n } from "@/lib/i18n/i18n-context";

export default function Stats() {
  const { t } = useI18n();

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-lg">
            <h3 className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
              500+
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("stats.students")}
            </p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-lg">
            <h3 className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
              15+
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("stats.instructors")}
            </p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-lg">
            <h3 className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
              25+
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("stats.courses")}
            </p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-lg">
            <h3 className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
              95%
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("stats.success")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
