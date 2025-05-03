"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useI18n } from "@/lib/i18n/i18n-context";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export default function AnalyticsChart() {
  const { t } = useI18n();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Translations
  const chartTitle = t("admin.analytics.title") || "Website Analytics";
  const pageViewsLabel = t("admin.analytics.pageViews") || "Page Views";
  const visitorsLabel = t("admin.analytics.visitors") || "Visitors";

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard/analytics");
        const result = await response.json();

        if (result.success) {
          setChartData(result.analytics);
        } else {
          setError(result.message || "Failed to fetch analytics data");
        }
      } catch (err) {
        setError("An error occurred while fetching analytics data");
        console.error("Error fetching analytics data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (chartRef.current && chartData) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Map the generic dataset labels to translated labels
        const mappedDatasets = chartData.datasets.map((dataset, index) => {
          return {
            label: index === 0 ? pageViewsLabel : visitorsLabel,
            data: dataset.data,
            borderColor:
              index === 0 ? "rgb(16, 185, 129)" : "rgb(59, 130, 246)",
            backgroundColor:
              index === 0
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(59, 130, 246, 0.1)",
            tension: 0.3,
          };
        });

        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: chartData.labels,
            datasets: mappedDatasets,
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: chartTitle,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, pageViewsLabel, visitorsLabel, chartTitle]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        {chartTitle}
      </h3>
      {isLoading ? (
        <div className="aspect-[16/9] flex items-center justify-center">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            {t("admin.loading") || "Loading..."}
          </div>
        </div>
      ) : error ? (
        <div className="aspect-[16/9] flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      ) : (
        <div className="aspect-[16/9]">
          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  );
}
