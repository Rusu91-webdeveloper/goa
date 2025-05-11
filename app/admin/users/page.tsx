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
import {
  Trash2,
  Edit,
  Search,
  MoreVertical,
  UserPlus,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
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
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    sendResetLink: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [userCreationResult, setUserCreationResult] = useState<{
    tempPassword?: string;
    resetLink?: string;
    emailSent: boolean;
    emailError: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      role: user.role,
      sendResetLink: true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
      sendResetLink: true,
    });
    setUserCreationResult(null);
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
        toast({
          title: t("admin.users.success") || "Success",
          description:
            t("admin.users.updateSuccess") || "User updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchUsers();
      } else {
        toast({
          title: t("admin.users.error") || "Error",
          description:
            data.message ||
            t("admin.users.updateError") ||
            "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: t("admin.users.error") || "Error",
        description: t("admin.users.updateError") || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleSaveCreate = async () => {
    try {
      setIsCreating(true);
      setUserCreationResult(null);

      const response = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store result info for possible display
        setUserCreationResult({
          tempPassword: data.tempPassword,
          resetLink: data.resetLink,
          emailSent: data.emailSent,
          emailError: data.emailError,
        });

        // Show toast based on email status
        if (data.emailSent) {
          toast({
            title: t("admin.users.success") || "Success",
            description: formData.sendResetLink
              ? t("admin.users.createSuccessWithResetLink") ||
                "User created and reset link sent"
              : t("admin.users.createSuccessWithTempPassword") ||
                "User created with temporary password",
          });
        } else {
          toast({
            title: t("admin.users.warning") || "Warning",
            description:
              t("admin.users.createSuccessEmailFailed") ||
              "User created but email failed to send. See credentials below.",
            variant: "destructive",
          });
        }

        // Only close dialog and refresh users if we didn't need to show credentials
        if (data.emailSent) {
          setIsCreateDialogOpen(false);
          fetchUsers();
        }
      } else {
        toast({
          title: t("admin.users.error") || "Error",
          description:
            data.message ||
            t("admin.users.createError") ||
            "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: t("admin.users.error") || "Error",
        description: t("admin.users.createError") || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
        toast({
          title: t("admin.users.success") || "Success",
          description:
            t("admin.users.deleteSuccess") || "User deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toast({
          title: t("admin.users.error") || "Error",
          description:
            data.message ||
            t("admin.users.deleteError") ||
            "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: t("admin.users.error") || "Error",
        description: t("admin.users.deleteError") || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: t("admin.users.copied") || "Copied!",
      description: t("admin.users.copiedToClipboard") || "Copied to clipboard",
    });
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setUserCreationResult(null);
    fetchUsers();
  };

  // Helper function to get full name from user object
  const getFullName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    }
    return "—";
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6 mt-12">
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
                              getFullName(user) || user.email
                            }`}
                            alt={getFullName(user) || user.email}
                          />
                          <AvatarFallback>
                            {(getFullName(user) || user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{getFullName(user)}</div>
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
                htmlFor="firstName"
                className="text-right">
                {t("admin.users.firstName") || "First Name"}
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="lastName"
                className="text-right">
                {t("admin.users.lastName") || "Last Name"}
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
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
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeCreateDialog();
          }
        }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {t("admin.users.createUser") || "Create User"}
            </DialogTitle>
            <DialogDescription>
              {t("admin.users.createUserDescription") ||
                "Add a new user to the system. You can send them a password reset link or create an account with a temporary password."}
            </DialogDescription>
          </DialogHeader>

          {/* Show credentials if we have them and email failed */}
          {userCreationResult && !userCreationResult.emailSent && (
            <Alert className="mt-4 border-amber-500 bg-amber-50">
              <AlertTitle className="text-amber-800">
                {t("admin.users.emailSendFailed") || "Email Failed to Send"}
              </AlertTitle>
              <AlertDescription className="mt-2 text-amber-800">
                <p className="mb-2">
                  {t("admin.users.shareCredentialsManually") ||
                    "Please share these credentials with the user manually:"}
                </p>

                {userCreationResult.tempPassword ? (
                  <Card className="bg-white border-amber-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {t("admin.users.tempPassword") || "Temporary Password"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                          {userCreationResult.tempPassword}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              userCreationResult.tempPassword || ""
                            )
                          }
                          className="ml-2">
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs mt-2 text-gray-500">
                        {t("admin.users.loginInstructions") ||
                          "User should login at"}{" "}
                        <a
                          href={`${window.location.origin}/login`}
                          target="_blank"
                          className="underline">
                          {window.location.origin}/login
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                ) : userCreationResult.resetLink ? (
                  <Card className="bg-white border-amber-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {t("admin.users.passwordResetLink") ||
                          "Password Reset Link"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm break-all">
                          {userCreationResult.resetLink}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(userCreationResult.resetLink || "")
                          }
                          className="ml-2 flex-shrink-0">
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {userCreationResult.emailError && (
                  <div className="mt-3 text-xs text-amber-700">
                    <p className="font-semibold">
                      {t("admin.users.emailErrorDetails") || "Error details:"}
                    </p>
                    <p className="mt-1">{userCreationResult.emailError}</p>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    onClick={closeCreateDialog}
                    variant="outline"
                    className="w-full">
                    {t("admin.users.gotIt") ||
                      "Got it, I've shared the credentials"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Only show the form if we don't have credentials to show or if email was sent successfully */}
          {(!userCreationResult || userCreationResult.emailSent) && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="create-firstName"
                    className="text-right">
                    {t("admin.users.firstName") || "First Name"}
                  </Label>
                  <Input
                    id="create-firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="create-lastName"
                    className="text-right">
                    {t("admin.users.lastName") || "Last Name"}
                  </Label>
                  <Input
                    id="create-lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
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
                    required
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    {t("admin.users.accountSetup") || "Account Setup"}
                  </Label>
                  <div className="col-span-3 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-reset-link"
                        checked={formData.sendResetLink}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            sendResetLink: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="send-reset-link">
                        {t("admin.users.sendResetLink") ||
                          "Send password setup link"}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formData.sendResetLink
                        ? t("admin.users.resetLinkInfo") ||
                          "User will receive an email with a link to set their own password"
                        : t("admin.users.tempPasswordInfo") ||
                          "User will receive an email with a temporary password"}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={closeCreateDialog}>
                  {t("admin.users.cancel") || "Cancel"}
                </Button>
                <Button
                  onClick={handleSaveCreate}
                  disabled={isCreating}>
                  {isCreating
                    ? t("admin.users.creating") || "Creating..."
                    : t("admin.users.create") || "Create"}
                </Button>
              </DialogFooter>
            </>
          )}
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
                <strong>
                  {getFullName(selectedUser) || selectedUser.email}
                </strong>
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
