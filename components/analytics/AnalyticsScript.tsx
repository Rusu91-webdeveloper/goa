"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function AnalyticsScript() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

        await fetch("/api/analytics/pageview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: url,
            referrer: document.referrer,
          }),
        })
      } catch (error) {
        console.error("Error tracking page view:", error)
      }
    }

    trackPageView()
  }, [pathname, searchParams])

  // Function to track events
  const trackEvent = async (
    eventType: string,
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number,
  ) => {
    try {
      await fetch("/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          eventCategory,
          eventAction,
          eventLabel,
          eventValue,
          path: pathname,
        }),
      })
    } catch (error) {
      console.error("Error tracking event:", error)
    }
  }

  // Expose trackEvent to window for global access
  useEffect(() => {
    // @ts-ignore
    window.trackEvent = trackEvent
  }, [])

  return null
}
