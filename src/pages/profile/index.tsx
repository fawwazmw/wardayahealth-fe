import React, { useState, useEffect } from "react";
import { useGetIdentity } from "@refinedev/core";
import { App } from "antd";
import { User, Lock, Save, Shield, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { axiosInstance } from "@/providers/authProvider";

interface UserIdentity {
  id?: number;
  fullName?: string;
  email?: string;
  role?: string;
}

export const ProfileSettings: React.FC = () => {
  const { message } = App.useApp();
  const { data: user } = useGetIdentity<UserIdentity>();

  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
  }, [user?.fullName]);

  const handleUpdateName = async () => {
    if (!fullName.trim()) {
      message.error("Name cannot be empty.");
      return;
    }
    setSavingName(true);
    try {
      await axiosInstance.put("/account/profile", { fullName: fullName.trim() });
      // Update localStorage user
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.fullName = fullName.trim();
        localStorage.setItem("user", JSON.stringify(parsed));
      }
      message.success("Name updated successfully.");
    } catch {
      message.error("Failed to update name. The server may not support this yet.");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      message.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      message.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await axiosInstance.put("/account/password", {
        currentPassword,
        newPassword,
        newPasswordConfirmation: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      message.success("Password changed successfully.");
    } catch {
      message.error("Failed to change password. Please check your current password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const roleLabel = (role?: string) => {
    switch (role) {
      case "admin": return "Administrator";
      case "physician": return "Physician";
      case "lab_technician": return "Lab Technician";
      case "viewer": return "Viewer";
      default: return role || "Unknown";
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
          Profile Settings
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Account Info */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            Account Information
          </CardTitle>
          <CardDescription>Your basic account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-[hsl(var(--primary))] text-white text-lg font-bold">
              {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[hsl(var(--foreground))]">
                {user?.fullName || "User"}
              </p>
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </div>
              <Badge variant="secondary" className="mt-1">
                <Shield className="h-3 w-3 mr-1" />
                {roleLabel(user?.role)}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs text-[hsl(var(--muted-foreground))]">
              Full Name
            </Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="flex-1"
              />
              <Button
                onClick={handleUpdateName}
                disabled={savingName || fullName === user?.fullName}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {savingName ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-xs text-[hsl(var(--muted-foreground))]">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs text-[hsl(var(--muted-foreground))]">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs text-[hsl(var(--muted-foreground))]">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={savingPassword || !currentPassword || !newPassword}
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            {savingPassword ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
