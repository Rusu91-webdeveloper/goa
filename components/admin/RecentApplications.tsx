import Link from "next/link";

interface Application {
  id: string;
  name: string;
  email: string;
  position: string;
  date: string;
  status: "new" | "reviewing" | "interviewed" | "hired" | "rejected";
}

const applications: Application[] = [
  {
    id: "1",
    name: "Julia Wagner",
    email: "julia@example.com",
    position: "BAMF-Lehrkraft",
    date: "2023-06-16",
    status: "new",
  },
  {
    id: "2",
    name: "Stefan Hoffmann",
    email: "stefan@example.com",
    position: "BAMF-Lehrkraft",
    date: "2023-06-15",
    status: "reviewing",
  },
  {
    id: "3",
    name: "Claudia Meyer",
    email: "claudia@example.com",
    position: "BAMF-Lehrkraft",
    date: "2023-06-14",
    status: "interviewed",
  },
  {
    id: "4",
    name: "Daniel Fischer",
    email: "daniel@example.com",
    position: "BAMF-Lehrkraft",
    date: "2023-06-12",
    status: "hired",
  },
  {
    id: "5",
    name: "Sarah Schneider",
    email: "sarah@example.com",
    position: "BAMF-Lehrkraft",
    date: "2023-06-10",
    status: "rejected",
  },
];

export default function RecentApplications() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Neueste Bewerbungen
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-Mail
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr
                key={application.id}
                className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {application.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {application.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {application.position}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {application.date}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      application.status === "new"
                        ? "bg-green-100 text-green-800"
                        : application.status === "reviewing"
                        ? "bg-yellow-100 text-yellow-800"
                        : application.status === "interviewed"
                        ? "bg-blue-100 text-blue-800"
                        : application.status === "hired"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {application.status === "new"
                      ? "Neu"
                      : application.status === "reviewing"
                      ? "Prüfung"
                      : application.status === "interviewed"
                      ? "Interviewt"
                      : application.status === "hired"
                      ? "Eingestellt"
                      : "Abgelehnt"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <Link
          href="/admin/applications"
          className="text-sm font-medium text-violet-600 hover:text-violet-500">
          Alle Bewerbungen anzeigen
        </Link>
      </div>
    </div>
  );
}
