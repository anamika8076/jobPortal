"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";

interface FooterLink {
  href: string;
  label: string;
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const explore: FooterLink[] =
    user?.role === "recruiter"
      ? [
          { href: "/", label: "Home" },
          { href: "/dashboard/post-job", label: "Post a Job" },
          { href: "/dashboard/applicants", label: "Applicants" },
          { href: "/about", label: "About Us" },
        ]
      : [
          { href: "/", label: "Home" },
          { href: "/jobs", label: "Browse Jobs" },
          { href: "/about", label: "About Us" },
        ];

  const account: FooterLink[] = !user
    ? [
        { href: "/login", label: "Sign In" },
        { href: "/register", label: "Create Account" },
        { href: "/forgot-password", label: "Forgot Password" },
      ]
    : user.role === "recruiter"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/settings", label: "Settings" },
        ]
      : [
          { href: "/profile", label: "My Profile" },
          { href: "/applications", label: "My Applications" },
        ];

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex rounded-md" aria-label="Hirely home">
              <Logo markClassName="h-8 w-8" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              {user?.role === "recruiter"
                ? "Post roles, review applicants and keep candidates updated, all from one dashboard."
                : "Hirely is a job board for people looking for work and the companies hiring them. Search roles, apply with your resume, and track every application."}
            </p>
          </div>
          <FooterColumn title="Explore" links={explore} />
          <FooterColumn title="Account" links={account} />
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-xs text-muted-foreground">
          <p>© {currentYear} Hirely. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
