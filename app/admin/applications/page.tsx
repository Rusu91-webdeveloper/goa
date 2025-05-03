"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Search,
  Eye,
  Mail,
  CheckCircle,
  X,
  Download,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  coverLetter: string;
  resumeUrl: string;
  status: "new" | "reviewing" | "interview" | "rejected" | "accepted";
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [positions, setPositions] = useState<string[]>([]);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, searchTerm, statusFilter, positionFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/applications?page=${currentPage}&search=${searchTerm}&status=${statusFilter}&position=${positionFilter}`
      );
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications);
        setTotalPages(data.totalPages || 1);

        // Extract unique positions for filter
        if (data.positions && Array.isArray(data.positions)) {
          setPositions(data.positions);
        }
      } else {
        console.error("Failed to fetch applications:", data.message);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsViewDialogOpen(true);
  };

  const handleDeleteApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsDeleteDialogOpen(true);
  };

  const handleReplyApplication = (
    application: JobApplication,
    template: "interview" | "reject" | "accept"
  ) => {
    setSelectedApplication(application);

    let emailTemplate = "";

    switch (template) {
      case "interview":
        emailTemplate = `Sehr geehrte(r) ${application.name},\n\nVielen Dank für Ihre Bewerbung als ${application.position} bei GOA.\n\nWir waren beeindruckt von Ihren Qualifikationen und möchten Sie gerne zu einem Vorstellungsgespräch einladen. Bitte teilen Sie uns mit, welche der folgenden Termine für Sie am besten passen würde:\n\n- Datum 1, Uhrzeit\n- Datum 2, Uhrzeit\n- Datum 3, Uhrzeit\n\nDas Gespräch wird ca. 45-60 Minuten dauern und in unserem Büro in [Adresse] stattfinden.\n\nWir freuen uns auf Ihre Rückmeldung.\n\nMit freundlichen Grüßen,\nDas Recruiting-Team von GOA`;
        break;
      case "reject":
        emailTemplate = `Sehr geehrte(r) ${application.name},\n\nVielen Dank für Ihr Interesse an einer Tätigkeit bei GOA und für Ihre Bewerbung als ${application.position}.\n\nNach sorgfältiger Prüfung aller eingegangenen Bewerbungen müssen wir Ihnen leider mitteilen, dass wir uns für andere Kandidaten entschieden haben, deren Qualifikationen und Erfahrungen besser zu unseren aktuellen Anforderungen passen.\n\nWir danken Ihnen für Ihre Zeit und Ihr Interesse an unserem Unternehmen und wünschen Ihnen für Ihre berufliche Zukunft alles Gute.\n\nMit freundlichen Grüßen,\nDas Recruiting-Team von GOA`;
        break;
      case "accept":
        emailTemplate = `Sehr geehrte(r) ${application.name},\n\nEs freut uns sehr, Ihnen mitteilen zu können, dass wir Ihnen eine Stelle als ${application.position} bei GOA anbieten möchten.\n\nWir waren beeindruckt von Ihren Qualifikationen, Ihrer Erfahrung und Ihrem Engagement während des gesamten Bewerbungsprozesses und sind überzeugt, dass Sie eine wertvolle Ergänzung für unser Team sein werden.\n\nIn den nächsten Tagen werden wir Ihnen ein formelles Angebot mit allen Details zusenden. In der Zwischenzeit stehen wir für alle Fragen gerne zur Verfügung.\n\nWir freuen uns auf die Zusammenarbeit mit Ihnen!\n\nMit freundlichen Grüßen,\nDas Recruiting-Team von GOA`;
        break;
      default:
        emailTemplate = `Sehr geehrte(r) ${application.name},\n\nVielen Dank für Ihre Bewerbung bei GOA.\n\n\n\nMit freundlichen Grüßen,\nDas Recruiting-Team von GOA`;
    }

    setReplyText(emailTemplate);
    setIsReplyDialogOpen(true);
  };

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (selectedApplication) {
          setSelectedApplication({
            ...selectedApplication,
            status: newStatus as JobApplication["status"],
          });
        }
        fetchApplications();
      } else {
        console.error("Failed to update status:", data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(
        `/api/admin/applications/${selectedApplication._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsDeleteDialogOpen(false);
        fetchApplications();
      } else {
        console.error("Failed to delete application:", data.message);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(
        `/api/admin/applications/${selectedApplication._id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ replyText }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsReplyDialogOpen(false);
      } else {
        console.error("Failed to send reply:", data.message);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Neu</Badge>;
      case "reviewing":
        return <Badge variant="outline">In Prüfung</Badge>;
      case "interview":
        return <Badge variant="default">Interview</Badge>;
      case "rejected":
        return <Badge variant="destructive">Abgelehnt</Badge>;
      case "accepted":
        return <Badge className="bg-green-600 text-white">Angenommen</Badge>;
      default:
        return <Badge variant="secondary">Neu</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bewerbungen</h1>
        <p className="text-gray-500">Verwalten Sie eingehende Bewerbungen</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Suche nach Namen oder E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="new">Neu</SelectItem>
                  <SelectItem value="reviewing">In Prüfung</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                  <SelectItem value="accepted">Angenommen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={positionFilter}
                onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Position Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Positionen</SelectItem>
                  {positions.map((position) => (
                    <SelectItem
                      key={position}
                      value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bewerber</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10">
                    Laden...
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10">
                    Keine Bewerbungen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.name}</div>
                        <div className="text-sm text-gray-500">
                          {application.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{application.position}</TableCell>
                    <TableCell>{formatDate(application.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewApplication(application)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            window.open(application.resumeUrl, "_blank")
                          }>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteApplication(application)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* View Application Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bewerbungsdetails</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{selectedApplication.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">E-Mail</h3>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                  <p>{selectedApplication.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Position
                  </h3>
                  <p>{selectedApplication.position}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Datum</h3>
                  <p>{formatDate(selectedApplication.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    <Select
                      defaultValue={selectedApplication.status}
                      onValueChange={(value) =>
                        handleUpdateStatus(selectedApplication._id, value)
                      }>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Neu</SelectItem>
                        <SelectItem value="reviewing">In Prüfung</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="rejected">Abgelehnt</SelectItem>
                        <SelectItem value="accepted">Angenommen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Anschreiben
                </h3>
                <div className="mt-2 p-4 bg-gray-50 rounded-md whitespace-pre-line">
                  {selectedApplication.coverLetter}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Lebenslauf
                </h3>
                <div className="mt-2">
                  <Button
                    onClick={() =>
                      window.open(selectedApplication.resumeUrl, "_blank")
                    }>
                    <Download className="mr-2 h-4 w-4" />
                    Lebenslauf herunterladen
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="interview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="interview">
                    Zum Interview einladen
                  </TabsTrigger>
                  <TabsTrigger value="reject">Ablehnen</TabsTrigger>
                  <TabsTrigger value="accept">Anstellen</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="interview"
                  className="pt-4">
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleReplyApplication(selectedApplication, "interview");
                      handleUpdateStatus(selectedApplication._id, "interview");
                    }}>
                    <Mail className="mr-2 h-4 w-4" />
                    Intervieweinladung senden
                  </Button>
                </TabsContent>
                <TabsContent
                  value="reject"
                  className="pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleReplyApplication(selectedApplication, "reject");
                      handleUpdateStatus(selectedApplication._id, "rejected");
                    }}>
                    <X className="mr-2 h-4 w-4" />
                    Absage senden
                  </Button>
                </TabsContent>
                <TabsContent
                  value="accept"
                  className="pt-4">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleReplyApplication(selectedApplication, "accept");
                      handleUpdateStatus(selectedApplication._id, "accepted");
                    }}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Jobangebot senden
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}>
                  Schließen
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleDeleteApplication(selectedApplication);
                  }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog
        open={isReplyDialogOpen}
        onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>E-Mail an Bewerber senden</DialogTitle>
            <DialogDescription>
              Senden Sie eine E-Mail an {selectedApplication?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">An</h3>
              <p>{selectedApplication?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Betreff</h3>
              <Input
                value={`Ihre Bewerbung als ${selectedApplication?.position} bei GOA`}
                disabled
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nachricht</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full min-h-[300px] p-3 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReplyDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSendReply}>
              <Mail className="mr-2 h-4 w-4" />
              Senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bewerbung löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie die Bewerbung von {selectedApplication?.name} wirklich
              löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
