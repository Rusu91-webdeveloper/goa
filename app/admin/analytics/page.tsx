"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

interface AnalyticsData {
  visitors: {
    daily: VisitorData[];
    weekly: VisitorData[];
    monthly: VisitorData[];
  };
  pageViews: {
    topPages: PageViewData[];
    byDevice: DeviceData[];
  };
  interactions: {
    contactForms: InteractionData[];
    applications: InteractionData[];
  };
}

interface VisitorData {
  name: string;
  value: number;
  unique: number;
}

interface PageViewData {
  name: string;
  views: number;
}

interface DeviceData {
  name: string;
  value: number;
}

interface InteractionData {
  name: string;
  value: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/analytics?timeRange=${timeRange}`
      );
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        console.error("Failed to fetch analytics:", data.message);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for development/preview
  const placeholderData: AnalyticsData = {
    visitors: {
      daily: Array.from({ length: 7 }, (_, i) => ({
        name: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(
          "de-DE",
          { weekday: "short" }
        ),
        value: Math.floor(Math.random() * 500 + 500),
        unique: Math.floor(Math.random() * 300 + 200),
      })),
      weekly: Array.from({ length: 4 }, (_, i) => ({
        name: `Woche ${i + 1}`,
        value: Math.floor(Math.random() * 2000 + 3000),
        unique: Math.floor(Math.random() * 1000 + 1500),
      })),
      monthly: Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 5 + i);
        return {
          name: date.toLocaleDateString("de-DE", { month: "short" }),
          value: Math.floor(Math.random() * 8000 + 6000),
          unique: Math.floor(Math.random() * 4000 + 3000),
        };
      }),
    },
    pageViews: {
      topPages: [
        { name: "Startseite", views: 4253 },
        { name: "Über Uns", views: 2164 },
        { name: "Karriere", views: 1879 },
        { name: "Dienstleistungen", views: 1563 },
        { name: "Kontakt", views: 986 },
      ],
      byDevice: [
        { name: "Desktop", value: 58 },
        { name: "Mobile", value: 34 },
        { name: "Tablet", value: 8 },
      ],
    },
    interactions: {
      contactForms: [
        { name: "Jan", value: 12 },
        { name: "Feb", value: 19 },
        { name: "Mär", value: 15 },
        { name: "Apr", value: 21 },
        { name: "Mai", value: 25 },
        { name: "Jun", value: 18 },
      ],
      applications: [
        { name: "Jan", value: 5 },
        { name: "Feb", value: 8 },
        { name: "Mär", value: 6 },
        { name: "Apr", value: 9 },
        { name: "Mai", value: 12 },
        { name: "Jun", value: 7 },
      ],
    },
  };

  const data = analytics || placeholderData;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6 mt-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Webseiten-Analytik
          </h1>
          <p className="text-gray-500">
            Übersicht über Besucher, Seitenaufrufe und Interaktionen
          </p>
        </div>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Letzte 7 Tage</SelectItem>
            <SelectItem value="30d">Letzte 30 Tage</SelectItem>
            <SelectItem value="90d">Letzte 90 Tage</SelectItem>
            <SelectItem value="6m">Letzte 6 Monate</SelectItem>
            <SelectItem value="12m">Letzte 12 Monate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Besucher</CardTitle>
            <CardDescription>
              Übersicht über Webseitenbesucher im Zeitverlauf
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="daily"
              className="space-y-4">
              <TabsList>
                <TabsTrigger value="daily">Täglich</TabsTrigger>
                <TabsTrigger value="weekly">Wöchentlich</TabsTrigger>
                <TabsTrigger value="monthly">Monatlich</TabsTrigger>
              </TabsList>

              <TabsContent
                value="daily"
                className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%">
                    <BarChart
                      data={data.visitors.daily}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Gesamtbesuche"
                        fill="#8884d8"
                      />
                      <Bar
                        dataKey="unique"
                        name="Einzigartige Besucher"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent
                value="weekly"
                className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%">
                    <BarChart
                      data={data.visitors.weekly}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Gesamtbesuche"
                        fill="#8884d8"
                      />
                      <Bar
                        dataKey="unique"
                        name="Einzigartige Besucher"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent
                value="monthly"
                className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%">
                    <BarChart
                      data={data.visitors.monthly}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Gesamtbesuche"
                        fill="#8884d8"
                      />
                      <Bar
                        dataKey="unique"
                        name="Einzigartige Besucher"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Beliebteste Seiten</CardTitle>
            <CardDescription>Am häufigsten aufgerufene Seiten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <BarChart
                  layout="vertical"
                  data={data.pageViews.topPages}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="views"
                    name="Seitenaufrufe"
                    fill="#0088FE"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geräteverteilung</CardTitle>
            <CardDescription>
              Verteilung der Besucher nach Gerätetyp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <PieChart>
                  <Pie
                    data={data.pageViews.byDevice}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {data.pageViews.byDevice.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kontaktanfragen</CardTitle>
            <CardDescription>
              Anzahl der Kontaktanfragen über die Zeit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <LineChart
                  data={data.interactions.contactForms}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Kontaktanfragen"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bewerbungen</CardTitle>
            <CardDescription>
              Anzahl der Bewerbungen über die Zeit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <LineChart
                  data={data.interactions.applications}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Bewerbungen"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
