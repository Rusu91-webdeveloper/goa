"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

type Language = "de" | "en";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
        aria-label={t("language")}
        aria-expanded={isOpen}>
        <Globe className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => changeLanguage("de")}
            className={cn(
              "flex items-center w-full px-4 py-2 text-sm text-left",
              language === "de"
                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
            <span className="flex-1">{t("language.de")}</span>
            {language === "de" && <Check className="h-4 w-4 ml-2" />}
          </button>

          <button
            onClick={() => changeLanguage("en")}
            className={cn(
              "flex items-center w-full px-4 py-2 text-sm text-left",
              language === "en"
                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
            <span className="flex-1">{t("language.en")}</span>
            {language === "en" && <Check className="h-4 w-4 ml-2" />}
          </button>
        </div>
      )}
    </div>
  );
}
