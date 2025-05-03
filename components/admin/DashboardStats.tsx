import type React from "react";
import {
  ArrowUp,
  ArrowDown,
  Users,
  MessageSquare,
  Briefcase,
  Eye,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="bg-violet-100 p-3 rounded-full">{icon}</div>
      </div>
      <div className="flex items-center mt-4">
        <div
          className={`flex items-center ${
            isPositive ? "text-violet-600" : "text-red-600"
          }`}>
          {isPositive ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
        <span className="text-sm text-gray-500 ml-2">seit letztem Monat</span>
      </div>
    </div>
  );
}

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Benutzer"
        value="1,248"
        change={12}
        icon={<Users className="h-6 w-6 text-violet-600" />}
      />
      <StatCard
        title="Kontaktanfragen"
        value="64"
        change={-2}
        icon={<MessageSquare className="h-6 w-6 text-violet-600" />}
      />
      <StatCard
        title="Bewerbungen"
        value="24"
        change={8}
        icon={<Briefcase className="h-6 w-6 text-violet-600" />}
      />
      <StatCard
        title="Seitenaufrufe"
        value="9,821"
        change={24}
        icon={<Eye className="h-6 w-6 text-violet-600" />}
      />
    </div>
  );
}
