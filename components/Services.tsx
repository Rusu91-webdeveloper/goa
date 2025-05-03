"use client";

import type React from "react";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Globe,
  Users,
  Briefcase,
  Code,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

interface ServiceItem {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  descriptionKey: string;
  detailsKeys: string[];
  isOpen: boolean;
}

export default function Services() {
  const { t } = useI18n();

  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "bamf",
      titleKey: "services.bamf",
      icon: <BookOpen className="h-6 w-6 text-emerald-600" />,
      descriptionKey: "services.bamf.desc",
      detailsKeys: [
        "services.bamf.detail1",
        "services.bamf.detail2",
        "services.bamf.detail3",
        "services.bamf.detail4",
        "services.bamf.detail5",
      ],
      isOpen: false,
    },
    {
      id: "online",
      titleKey: "services.online",
      icon: <Globe className="h-6 w-6 text-emerald-600" />,
      descriptionKey: "services.online.desc",
      detailsKeys: [
        "services.dtz",
        "services.telc-b1",
        "services.telc-b2",
        "services.online.detail1",
        "services.online.detail2",
        "services.online.detail3",
        "services.online.detail4",
      ],
      isOpen: false,
    },
    {
      id: "coaching",
      titleKey: "services.coaching",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      descriptionKey: "services.coaching.desc",
      detailsKeys: [
        "services.coaching-b2",
        "services.coaching-b1",
        "services.group-b2",
        "services.group-b1",
        "services.coaching.detail1",
        "services.coaching.detail2",
        "services.coaching.detail3",
        "services.coaching.detail4",
        "services.coaching.detail5",
        "services.coaching.detail6",
      ],
      isOpen: false,
    },
    {
      id: "business",
      titleKey: "services.business",
      icon: <Briefcase className="h-6 w-6 text-emerald-600" />,
      descriptionKey: "services.business.desc",
      detailsKeys: [
        "services.business.detail1",
        "services.business.detail2",
        "services.business.detail3",
        "services.business.detail4",
      ],
      isOpen: false,
    },
    {
      id: "it",
      titleKey: "services.it",
      icon: <Code className="h-6 w-6 text-emerald-600" />,
      descriptionKey: "services.it.desc",
      detailsKeys: [
        "services.it.detail1",
        "services.it.detail2",
        "services.it.detail3",
        "services.it.detail4",
        "services.it.detail5",
        "services.it.detail6",
      ],
      isOpen: false,
    },
  ]);

  const toggleService = (id: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, isOpen: !service.isOpen } : service
      )
    );
  };

  return (
    <section
      id="services"
      className="scroll-mt-20 py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          {t("services.title")}
        </h2>

        <div className="max-w-4xl mx-auto space-y-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toggleService(service.id)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                aria-expanded={service.isOpen}>
                <div className="flex items-center">
                  {service.icon}
                  <h3 className="ml-3 text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {t(service.titleKey)}
                  </h3>
                </div>
                {service.isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>

              {service.isOpen && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t(service.descriptionKey)}
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    {service.detailsKeys.map((detailKey, index) => (
                      <li key={index}>{t(detailKey)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
