import Link from "next/link";

interface Contact {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
  status: "new" | "in-progress" | "completed";
}

const contacts: Contact[] = [
  {
    id: "1",
    name: "Max Mustermann",
    email: "max@example.com",
    service: "Deutschkurs Fit für B2",
    date: "2023-06-15",
    status: "new",
  },
  {
    id: "2",
    name: "Anna Schmidt",
    email: "anna@example.com",
    service: "BAMF-Lehrkräfte",
    date: "2023-06-14",
    status: "in-progress",
  },
  {
    id: "3",
    name: "Thomas Weber",
    email: "thomas@example.com",
    service: "Sprachkurse für Unternehmen",
    date: "2023-06-12",
    status: "completed",
  },
  {
    id: "4",
    name: "Laura Müller",
    email: "laura@example.com",
    service: "Einzelcoaching Ziel B1",
    date: "2023-06-10",
    status: "new",
  },
  {
    id: "5",
    name: "Michael Becker",
    email: "michael@example.com",
    service: "Gruppencoaching Ziel B2",
    date: "2023-06-08",
    status: "in-progress",
  },
];

export default function RecentContacts() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Neueste Kontaktanfragen
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
                Dienstleistung
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
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {contact.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{contact.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{contact.service}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{contact.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contact.status === "new"
                        ? "bg-green-100 text-green-800"
                        : contact.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                    {contact.status === "new"
                      ? "Neu"
                      : contact.status === "in-progress"
                      ? "In Bearbeitung"
                      : "Abgeschlossen"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <Link
          href="/admin/contacts"
          className="text-sm font-medium text-violet-600 hover:text-violet-500">
          Alle Kontaktanfragen anzeigen
        </Link>
      </div>
    </div>
  );
}
