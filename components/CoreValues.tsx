"use client";

import { Shield, Award, Users, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function CoreValues() {
  const { t } = useI18n();

  return (
    <section
      id="leitbild"
      className="scroll-mt-20 py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          {t("corevalues.title")}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-violet-50 dark:bg-violet-900/20 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Shield className="h-10 w-10 text-violet-600 dark:text-violet-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {t("corevalues.trust")}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {t("corevalues.trust.desc")}
            </p>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Award className="h-10 w-10 text-violet-600 dark:text-violet-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {t("corevalues.quality")}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {t("corevalues.quality.desc")}
            </p>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Users className="h-10 w-10 text-violet-600 dark:text-violet-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {t("corevalues.fairpay")}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {t("corevalues.fairpay.desc")}
            </p>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow md:col-start-2">
            <div className="flex items-center mb-4">
              <Zap className="h-10 w-10 text-violet-600 dark:text-violet-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {t("corevalues.efficiency")}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {t("corevalues.efficiency.desc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
