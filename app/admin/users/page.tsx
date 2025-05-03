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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Search, MoreVertical, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useI18n } from "@/lib/i18n/i18n-context";

interface User {
  _id: string;
  name?: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/users?page=${currentPage}&search=${searchTerm}`
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
    });
    setIsCreateDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditDialogOpen(false);
        fetchUsers();
      } else {
        console.error("Failed to update user:", data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleSaveCreate = async () => {
    try {
      const response = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsCreateDialogOpen(false);
        fetchUsers();
      } else {
        console.error("Failed to create user:", data.message);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        console.error("Failed to delete user:", data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.users.title") || "User Management"}
          </h1>
          <p className="text-gray-500">
            {t("admin.users.subtitle") || "Manage all user accounts"}
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("admin.users.newUser") || "New User"}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={
                t("admin.users.searchPlaceholder") || "Search for users..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.users.user") || "User"}</TableHead>
                <TableHead>{t("admin.users.role") || "Role"}</TableHead>
                <TableHead>
                  {t("admin.users.emailStatus") || "Email Status"}
                </TableHead>
                <TableHead>
                  {t("admin.users.registered") || "Registered"}
                </TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions") || "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10">
                    {t("admin.loading") || "Loading..."}
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10">
                    {t("admin.users.noUsersFound") || "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                              user.name || user.email
                            }`}
                            alt={user.name || user.email}
                          />
                          <AvatarFallback>
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || "—"}</div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "default"
                            : user.role === "teacher"
                            ? "outline"
                            : "secondary"
                        }>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isEmailVerified ? (
                        <Badge className="bg-green-600 text-white">
                          {t("admin.users.verified") || "Verified"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {t("admin.users.unverified") || "Unverified"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="h-9 w-9 p-0">
                  <span className="sr-only">
                    {t("admin.users.previous") || "Previous"}
                  </span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 p-0">
                  <span className="sr-only">
                    {t("admin.users.next") || "Next"}
                  </span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.users.editUser") || "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {t("admin.users.editUserDescription") ||
                "Make changes to the user here. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="name"
                className="text-right">
                {t("admin.users.name") || "Name"}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="email"
                className="text-right">
                {t("admin.users.email") || "Email"}
              </Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="role"
                className="text-right">
                {t("admin.users.role") || "Role"}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    {t("admin.users.roleUser") || "User"}
                  </SelectItem>
                  <SelectItem value="teacher">
                    {t("admin.users.roleTeacher") || "Teacher"}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t("admin.users.roleAdmin") || "Admin"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}>
              {t("admin.users.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleSaveEdit}>
              {t("admin.users.save") || "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.users.createUser") || "Create User"}
            </DialogTitle>
            <DialogDescription>
              {t("admin.users.createUserDescription") ||
                "Add a new user to the system. A temporary password will be generated."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="create-name"
                className="text-right">
                {t("admin.users.name") || "Name"}
              </Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="create-email"
                className="text-right">
                {t("admin.users.email") || "Email"}
              </Label>
              <Input
                id="create-email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="create-role"
                className="text-right">
                {t("admin.users.role") || "Role"}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    {t("admin.users.roleUser") || "User"}
                  </SelectItem>
                  <SelectItem value="teacher">
                    {t("admin.users.roleTeacher") || "Teacher"}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t("admin.users.roleAdmin") || "Admin"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}>
              {t("admin.users.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleSaveCreate}>
              {t("admin.users.create") || "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.users.deleteUser") || "Delete User"}
            </DialogTitle>
            <DialogDescription>
              {t("admin.users.deleteUserDescription") ||
                "Are you sure you want to delete this user? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <p>
                {t("admin.users.deleteUserConfirm") ||
                  "You are about to delete:"}{" "}
                <strong>{selectedUser.name || selectedUser.email}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              {t("admin.users.cancel") || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}>
              {t("admin.users.delete") || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
