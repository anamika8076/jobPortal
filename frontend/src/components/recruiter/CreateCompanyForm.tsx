"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { jobApi, getErrorMessage, multipartConfig } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface CompanyForm {
  name: string;
  description: string;
  website: string;
}

const emptyForm: CompanyForm = { name: "", description: "", website: "" };

export function CreateCompanyForm({ onCreated, onCancel }: { onCreated: () => void; onCancel?: () => void }) {
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyForm | "logo", string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof CompanyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      toast.error("Logo must be an image");
      return;
    }
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Company name is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    else if (form.description.trim().length < 20) newErrors.description = "Write at least 20 characters";
    if (!form.website.trim()) newErrors.website = "Website is required";
    else if (!/^https?:\/\/\S+\.\S+/.test(form.website.trim())) newErrors.website = "Use a full URL, e.g. https://acme.com";
    if (!logo) newErrors.logo = "Logo is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !validate() || !logo) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("website", form.website.trim());
    formData.append("file", logo);

    setSubmitting(true);
    try {
      await jobApi.post("/company/create", formData, multipartConfig);
      toast.success("Company created");
      setForm(emptyForm);
      setLogo(null);
      setLogoPreview(null);
      onCreated();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create company"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">New company</CardTitle>
        <CardDescription>Jobs are posted under a company. Name, website, description and logo are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="company-name" required>
              Name
            </Label>
            <Input id="company-name" value={form.name} onChange={update("name")} error={errors.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-website" required>
              Website
            </Label>
            <Input
              id="company-website"
              type="url"
              placeholder="https://"
              value={form.website}
              onChange={update("website")}
              error={errors.website}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company-description" required>
              Description
            </Label>
            <Textarea
              id="company-description"
              rows={4}
              value={form.description}
              onChange={update("description")}
              error={errors.description}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company-logo" required>
              Logo
            </Label>
            <label
              htmlFor="company-logo"
              className="flex items-center gap-3 rounded-lg border border-dashed border-input px-4 py-3 cursor-pointer hover:bg-accent/60 focus-within:ring-2 focus-within:ring-ring"
            >
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <Upload className="h-5 w-5 text-primary" />
              )}
              <span className="text-sm truncate">{logo ? logo.name : "Choose an image..."}</span>
              <input id="company-logo" type="file" accept="image/*" className="sr-only" onChange={handleLogo} />
            </label>
            {errors.logo && <p className="text-xs text-destructive">{errors.logo}</p>}
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" variant="brand" isLoading={submitting}>
              Create company
            </Button>
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
