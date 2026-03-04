"use client";

import { useState, useEffect } from "react";
import { StatCard } from "./stat-card";
import { ChartCard } from "./chart-card";
import { PeopleTable } from "./people-table";
import { RecentDocuments } from "./recent-documents";
import { useDashboardStore } from "@/store/dashboard-store";

export function DashboardContent() {
  const [stats, setStats] = useState([
    { id: 1, title: "Всего клиентов", value: "-", trend: "", icon: "users" },
    { id: 2, title: "Новые заказы", value: "-", trend: "", icon: "clipboard" },
    { id: 3, title: "Записи на анализы", value: "-", trend: "", icon: "invoice" },
    { id: 4, title: "Общая выручка", value: "-", trend: "", icon: "wallet" },
  ]);

  const { setChartData, setRecentOrders, setRecentAnalysis, setPeople } = useDashboardStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/stats/');
        if (res.ok) {
          const data = await res.json();
          setStats([
            { id: 1, title: "Всего клиентов", value: data.users_count?.toString() || "0", trend: data.trends?.users, icon: "users" },
            { id: 2, title: "Новые заказы", value: data.pending_orders?.toString() || "0", trend: data.trends?.orders, icon: "clipboard" },
            { id: 3, title: "Записи на анализы", value: data.pending_analysis?.toString() || "0", trend: data.trends?.analysis, icon: "invoice" },
            { id: 4, title: "Общая выручка", value: (data.revenue || 0).toLocaleString() + " сум", trend: data.trends?.revenue, icon: "wallet" },
          ]);

          if (data.chart_data && setChartData) setChartData(data.chart_data);
          if (data.recent_orders && setRecentOrders) setRecentOrders(data.recent_orders);
          if (data.recent_analysis && setRecentAnalysis) setRecentAnalysis(data.recent_analysis);
          if (data.recent_users && setPeople) setPeople(data.recent_users);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, [setChartData, setRecentOrders, setRecentAnalysis, setPeople]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={stat.icon as "users" | "clipboard" | "wallet" | "invoice"}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard />
          <RecentDocuments />
        </div>

        <PeopleTable />
      </div>
    </div>
  );
}
