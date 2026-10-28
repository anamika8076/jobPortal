import React from "react";
import Link from "next/link";
import { Briefcase, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                HireHeaven
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Connecting ambitious talent with world-class opportunities. Discover high-growth jobs or find top candidates with an intelligent, microservice-powered platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-primary transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Auth & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="hover:text-primary transition-colors">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {currentYear} HireHeaven. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Built with modern microservices & Next.js</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
}
