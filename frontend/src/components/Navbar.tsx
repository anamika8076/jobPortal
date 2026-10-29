"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Signed-in users manage everything from their dashboard; guests can browse jobs
  const dashboardHref = user?.role === "recruiter" ? "/dashboard" : "/account";
  const navLinks = user
    ? [
        { href: "/", label: "Home" },
        { href: dashboardHref, label: "Dashboard" },
        { href: "/about", label: "About" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/jobs", label: "Jobs" },
        { href: "/about", label: "About" },
      ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Hirely home">
          <Logo />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Theme Toggle & Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />

          {loading ? (
            <div className="h-9 w-20 bg-muted/60 rounded-md animate-pulse" />
          ) : user ? (
            /* Logged In: Avatar Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 rounded-full p-1 pl-2 pr-3 hover:bg-accent transition-colors border border-border/60 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-expanded={userDropdownOpen}
              >
                <Avatar
                  src={user.profile_pic}
                  fallbackText={user.name}
                  size="sm"
                />
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-border/60 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="mt-2">
                      <Badge variant={user.role === "recruiter" ? "info" : "success"}>
                        {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                      </Badge>
                    </div>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent text-foreground hover:text-accent-foreground transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out Buttons */
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="gradient" size="sm" className="gap-1.5">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-3">
                  <Avatar src={user.profile_pic} fallbackText={user.name} size="md" />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <Badge
                      variant={user.role === "recruiter" ? "info" : "success"}
                      className="mt-1"
                    >
                      {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                    </Badge>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-foreground"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Dashboard</span>
                </Link>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={logout}
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="gradient" className="w-full gap-1.5">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
