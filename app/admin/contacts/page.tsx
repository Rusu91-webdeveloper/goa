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
import { Trash2, Search, Eye, Mail, CheckCircle } from "lucide-react";
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

interface ContactRequest {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: "new" | "inProgress" | "completed";
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(
    null
  );
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/contacts?page=${currentPage}&search=${searchTerm}&status=${statusFilter}`
      );
      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Failed to fetch contacts:", data.message);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setIsViewDialogOpen(true);
  };

  const handleDeleteContact = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleReplyContact = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setReplyText(
      `Sehr geehrte(r) ${contact.name},\n\nVielen Dank für Ihre Anfrage.\n\n\n\nMit freundlichen Grüßen,\nDas GOA Team`
    );
    setIsReplyDialogOpen(true);
  };

  const handleUpdateStatus = async (contactId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchContacts();
      } else {
        console.error("Failed to update status:", data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedContact) return;

    try {
      const response = await fetch(
        `/api/admin/contacts/${selectedContact._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsDeleteDialogOpen(false);
        fetchContacts();
      } else {
        console.error("Failed to delete contact:", data.message);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedContact) return;

    try {
      const response = await fetch(
        `/api/admin/contacts/${selectedContact._id}/reply`,
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
        // Update status to completed after replying
        await handleUpdateStatus(selectedContact._id, "completed");
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
      case "inProgress":
        return <Badge variant="outline">In Bearbeitung</Badge>;
      case "completed":
        return <Badge variant="success">Abgeschlossen</Badge>;
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kontaktanfragen</h1>
        <p className="text-gray-500">
          Verwalten Sie eingehende Kontaktanfragen
        </p>
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
                  <SelectItem value="inProgress">In Bearbeitung</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Absender</TableHead>
                <TableHead>Nachricht</TableHead>
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
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10">
                    Keine Kontaktanfragen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-500">
                          {contact.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{truncateText(contact.message, 50)}</TableCell>
                    <TableCell>{formatDate(contact.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewContact(contact)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleReplyContact(contact)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteContact(contact)}>
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

      {/* View Contact Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Kontaktanfrage Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{selectedContact.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">E-Mail</h3>
                  <p>{selectedContact.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Datum</h3>
                  <p>{formatDate(selectedContact.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    <Select
                      defaultValue={selectedContact.status}
                      onValueChange={(value) =>
                        handleUpdateStatus(selectedContact._id, value)
                      }>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Neu</SelectItem>
                        <SelectItem value="inProgress">
                          In Bearbeitung
                        </SelectItem>
                        <SelectItem value="completed">Abgeschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nachricht</h3>
                <div className="mt-2 p-4 bg-gray-50 rounded-md whitespace-pre-line">
                  {selectedContact.message}
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}>
                  Schließen
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleReplyContact(selectedContact);
                    }}>
                    <Mail className="mr-2 h-4 w-4" />
                    Antworten
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      handleUpdateStatus(selectedContact._id, "completed");
                      setIsViewDialogOpen(false);
                    }}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Als erledigt markieren
                  </Button>
                </div>
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
            <DialogTitle>Antworten auf Kontaktanfrage</DialogTitle>
            <DialogDescription>
              Senden Sie eine Antwort auf die Anfrage von{" "}
              {selectedContact?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">An</h3>
              <p>{selectedContact?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Betreff</h3>
              <Input
                value="Antwort auf Ihre Anfrage bei GOA"
                disabled
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nachricht</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full min-h-[200px] p-3 border rounded-md"
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
            <DialogTitle>Kontaktanfrage löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie diese Kontaktanfrage wirklich löschen? Diese Aktion
              kann nicht rückgängig gemacht werden.
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
