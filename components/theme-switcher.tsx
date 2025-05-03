"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
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

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
        aria-label={
          theme === "light"
            ? t("theme.light")
            : theme === "dark"
            ? t("theme.dark")
            : t("theme.system")
        }
        aria-expanded={isOpen}>
        {theme === "light" ? (
          <Sun className="h-5 w-5" />
        ) : theme === "dark" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Laptop className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => changeTheme("light")}
            className={cn(
              "flex items-center w-full px-4 py-2 text-sm text-left",
              theme === "light"
                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
            <Sun className="h-4 w-4 mr-2" />
            <span className="flex-1">{t("theme.light")}</span>
            {theme === "light" && <Check className="h-4 w-4 ml-2" />}
          </button>

          <button
            onClick={() => changeTheme("dark")}
            className={cn(
              "flex items-center w-full px-4 py-2 text-sm text-left",
              theme === "dark"
                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
            <Moon className="h-4 w-4 mr-2" />
            <span className="flex-1">{t("theme.dark")}</span>
            {theme === "dark" && <Check className="h-4 w-4 ml-2" />}
          </button>

          <button
            onClick={() => changeTheme("system")}
            className={cn(
              "flex items-center w-full px-4 py-2 text-sm text-left",
              theme === "system"
                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
            <Laptop className="h-4 w-4 mr-2" />
            <span className="flex-1">{t("theme.system")}</span>
            {theme === "system" && <Check className="h-4 w-4 ml-2" />}
          </button>
        </div>
      )}
    </div>
  );
}
