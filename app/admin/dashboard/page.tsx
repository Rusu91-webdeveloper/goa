import AdminLayout from "@/components/admin/AdminLayout"
import DashboardStats from "@/components/admin/DashboardStats"
import RecentContacts from "@/components/admin/RecentContacts"
import RecentApplications from "@/components/admin/RecentApplications"
import AnalyticsChart from "@/components/admin/AnalyticsChart"

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Übersicht über alle wichtigen Kennzahlen und Aktivitäten</p>
      </div>

      <DashboardStats />

      <div className="mt-8">
        <AnalyticsChart />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentContacts />
        <RecentApplications />
      </div>
    </AdminLayout>
  )
}
