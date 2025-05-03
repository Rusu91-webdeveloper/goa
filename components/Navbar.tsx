"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import LanguageSwitcher from "./language-switcher";
import ThemeSwitcher from "./theme-switcher";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAuthenticated, isAdmin, logout, refreshAuth } = useAuth();

  // Refresh auth status when path changes
  useEffect(() => {
    refreshAuth();
  }, [pathname, refreshAuth]);

  // Handle scroll events for navbar appearance and active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      // Update navbar appearance based on scroll position
      setScrolled(window.scrollY > 20);

      // Update active section based on scroll position
      const sections = ["leitbild", "about", "services", "jobs", "contact"];
      let currentSection = "";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section is in view (with some buffer for better UX)
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = section;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Check if we're on the home page
  const isHomePage = pathname === "/";

  // Navigation items
  const navItems = [
    {
      href: isHomePage ? "#leitbild" : "/#leitbild",
      label: t("nav.leitbild"),
      id: "leitbild",
    },
    {
      href: isHomePage ? "#about" : "/#about",
      label: t("nav.about"),
      id: "about",
    },
    {
      href: isHomePage ? "#services" : "/#services",
      label: t("nav.services"),
      id: "services",
    },
    { href: isHomePage ? "#jobs" : "/#jobs", label: t("nav.jobs"), id: "jobs" },
    {
      href: isHomePage ? "#contact" : "/#contact",
      label: t("nav.contact"),
      id: "contact",
    },
  ];

  if (isLoading) {
    return (
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md py-2"
        )}>
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
            <div className="hidden md:flex space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-20 h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md py-2"
          : "bg-transparent py-4",
        !isHomePage && "bg-white dark:bg-gray-900 shadow-md py-2"
      )}>
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center space-x-2 text-2xl font-bold transition-colors",
              scrolled || !isHomePage
                ? "text-violet-900 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300"
                : "text-white hover:text-gray-200"
            )}
            aria-label="GOA Erwachsenenbildung">
            <span className="inline-block">
              <span className="sr-only">GOA Erwachsenenbildung</span>
              <svg
                viewBox="0 0 40 40"
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 5C11.716 5 5 11.716 5 20C5 28.284 11.716 35 20 35C28.284 35 35 28.284 35 20C35 11.716 28.284 5 20 5Z"
                  className={cn(
                    "stroke-2",
                    scrolled || !isHomePage
                      ? "stroke-violet-700 dark:stroke-violet-400"
                      : "stroke-white"
                  )}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M25 15H15V25H25V20H20"
                  className={cn(
                    "stroke-2",
                    scrolled || !isHomePage
                      ? "stroke-violet-700 dark:stroke-violet-400"
                      : "stroke-white"
                  )}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="hidden sm:inline">GOA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors relative group",
                  activeSection === item.id || pathname === item.href
                    ? scrolled || !isHomePage
                      ? "text-violet-700 dark:text-violet-400"
                      : "text-white font-semibold"
                    : scrolled || !isHomePage
                    ? "text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400"
                    : "text-white hover:text-gray-200"
                )}>
                {item.label}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 w-full h-0.5 transform origin-left transition-transform duration-300",
                    activeSection === item.id || pathname === item.href
                      ? "scale-x-100 bg-violet-500"
                      : "scale-x-0 group-hover:scale-x-100",
                    !scrolled && isHomePage ? "bg-white" : "bg-violet-500"
                  )}></span>
              </Link>
            ))}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium transition-colors",
                      scrolled || !isHomePage
                        ? "text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400"
                        : "text-white hover:text-gray-200"
                    )}>
                    {t("nav.admin")}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors",
                    scrolled || !isHomePage
                      ? "text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400"
                      : "text-white hover:text-gray-200"
                  )}>
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors",
                    scrolled || !isHomePage
                      ? "text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400"
                      : "text-white hover:text-gray-200"
                  )}>
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={logout}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                    scrolled || !isHomePage
                      ? "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600"
                      : "bg-white text-violet-700 hover:bg-gray-100"
                  )}>
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors",
                    scrolled || !isHomePage
                      ? "text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400"
                      : "text-white hover:text-gray-200"
                  )}>
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                    scrolled || !isHomePage
                      ? "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600"
                      : "bg-white text-violet-700 hover:bg-gray-100"
                  )}>
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <button
              className={cn(
                "p-2 rounded-md focus:outline-none transition-colors",
                scrolled || !isHomePage
                  ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white hover:bg-white/20"
              )}
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <Link
              href="/"
              className="text-2xl font-bold text-violet-700 dark:text-violet-400"
              onClick={closeMenu}>
              GOA
            </Link>
            <button
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              onClick={toggleMenu}
              aria-label="Close menu">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium transition-colors",
                    activeSection === item.id || pathname === item.href
                      ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-violet-600 dark:hover:text-violet-400"
                  )}
                  onClick={closeMenu}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="block w-full px-4 py-2 text-center rounded-md text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={closeMenu}>
                    {t("nav.admin")}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="block w-full px-4 py-2 text-center rounded-md bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
                  onClick={closeMenu}>
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/profile"
                  className="block w-full px-4 py-2 text-center rounded-md bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
                  onClick={closeMenu}>
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="block w-full px-4 py-2 text-center rounded-md bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 transition-colors">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block w-full px-4 py-2 text-center rounded-md text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={closeMenu}>
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-4 py-2 text-center rounded-md bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
                  onClick={closeMenu}>
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          aria-hidden="true"
          onClick={closeMenu}></div>
      )}
    </header>
  );
}
