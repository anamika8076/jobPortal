"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { authApi, userApi, getErrorMessage, multipartConfig } from "@/lib/api";
import { PageHeader, SectionCard } from "@/components/recruiter/DashboardUI";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, KeyRound, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, fetchUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [errors, setErrors] = useState<{ name?: string; phoneNumber?: string }>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const dirty = name !== user.name || phoneNumber !== (user.phone_number ?? "") || bio !== (user.bio ?? "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!/^[+\d][\d\s()-]{6,19}$/.test(phoneNumber.trim())) newErrors.phoneNumber = "Enter a valid phone number";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      await userApi.put("/update/profile", { name: name.trim(), phoneNumber: phoneNumber.trim(), bio: bio.trim() });
      await fetchUser();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save your profile"));
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploading) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      await userApi.put("/update/pic", formData, multipartConfig);
      await fetchUser();
      toast.success("Photo updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not upload the photo"));
    } finally {
      setUploading(false);
    }
  };

  // There is no change-password endpoint; the existing forgot/reset flow emails a link
  const sendResetLink = async () => {
    if (sendingReset) return;
    setSendingReset(true);
    try {
      await authApi.post("/forgot", { email: user.email });
      toast.success(`If email delivery is configured, a reset link is on its way to ${user.email}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not request a reset link"));
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your recruiter account." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Profile" className="xl:col-span-2">
          <form onSubmit={save} noValidate className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar src={user.profile_pic} fallbackText={user.name} size="xl" />
              <div className="space-y-1">
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()} isLoading={uploading}>
                  {!uploading && <Camera className="h-4 w-4" />}
                  Change photo
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} tabIndex={-1} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="settings-name" required>
                  Full name
                </Label>
                <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-phone" required>
                  Phone number
                </Label>
                <Input id="settings-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} error={errors.phoneNumber} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-bio">Bio</Label>
              <Textarea id="settings-bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <Button type="submit" variant="brand" isLoading={saving} disabled={!dirty}>
              Save changes
            </Button>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Account">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Email</dt>
                <dd className="font-medium break-all">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Role</dt>
                <dd>
                  <Badge variant="info">Recruiter</Badge>
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">Email address and role can&apos;t be changed.</p>
          </SectionCard>

          <SectionCard title="Password">
            <p className="text-sm text-muted-foreground mb-4">
              We&apos;ll email you a link to set a new password. It expires after 15 minutes.
            </p>
            <Button variant="outline" className="gap-2" onClick={sendResetLink} isLoading={sendingReset}>
              {!sendingReset && <KeyRound className="h-4 w-4" />}
              Send reset link
            </Button>
          </SectionCard>

          <SectionCard title="Session">
            <Button variant="destructive" className="gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
