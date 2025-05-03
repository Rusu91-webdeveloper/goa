import clientPromise from "./db"

export interface PageView {
  path: string
  referrer: string
  userAgent: string
  ip: string
  timestamp: Date
}

export interface EventData {
  eventType: string
  eventCategory: string
  eventAction: string
  eventLabel?: string
  eventValue?: number
  path: string
  userAgent: string
  ip: string
  timestamp: Date
}

export async function trackPageView(pageView: Omit<PageView, "timestamp">): Promise<void> {
  try {
    const client = await clientPromise
    const db = client.db()

    await db.collection("pageViews").insertOne({
      ...pageView,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Error tracking page view:", error)
  }
}

export async function trackEvent(eventData: Omit<EventData, "timestamp">): Promise<void> {
  try {
    const client = await clientPromise
    const db = client.db()

    await db.collection("events").insertOne({
      ...eventData,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Error tracking event:", error)
  }
}

export async function getPageViewStats(days = 30): Promise<any> {
  try {
    const client = await clientPromise
    const db = client.db()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await db
      .collection("pageViews")
      .aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
            },
            count: { $sum: 1 },
            uniqueIPs: { $addToSet: "$ip" },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
            views: "$count",
            visitors: { $size: "$uniqueIPs" },
          },
        },
        {
          $sort: { date: 1 },
        },
      ])
      .toArray()

    return result
  } catch (error) {
    console.error("Error getting page view stats:", error)
    return []
  }
}

export async function getTopPages(days = 30): Promise<any> {
  try {
    const client = await clientPromise
    const db = client.db()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await db
      .collection("pageViews")
      .aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$path",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            path: "$_id",
            views: "$count",
          },
        },
        {
          $sort: { views: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .toArray()

    return result
  } catch (error) {
    console.error("Error getting top pages:", error)
    return []
  }
}

export async function getEventStats(days = 30): Promise<any> {
  try {
    const client = await clientPromise
    const db = client.db()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await db
      .collection("events")
      .aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$eventCategory",
            count: { $sum: 1 },
            events: {
              $push: {
                type: "$eventType",
                action: "$eventAction",
                label: "$eventLabel",
                value: "$eventValue",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            count: 1,
            events: { $slice: ["$events", 10] },
          },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .toArray()

    return result
  } catch (error) {
    console.error("Error getting event stats:", error)
    return []
  }
}
