'use client';

import { LogoutButton } from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/auth/context';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const smoothScrollTo =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
      }
    };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Global Grid Pattern Background */}
      <div
        className="pointer-events-none fixed inset-0 [background-size:40px_40px] select-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)',
        }}
      />

      {/* Floating Pill-Shaped Navbar */}
      <motion.nav
        className="fixed top-6 left-6 right-6 z-50"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div
          className="border border-white/20 rounded-2xl px-8 py-2 shadow-xl backdrop-blur-md relative"
          style={{ backgroundColor: 'rgba(9, 9, 11, 0.5)' }}
        >
          {/* Logo Section - Absolute positioned left */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-600 group-hover:ring-white transition-all duration-200">
                <Image
                  src="/assets/images/timeline-target-logo.svg"
                  alt="Timeline Target Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-gray-200 transition-colors duration-200">
                Timeline Target
              </span>
            </Link>
          </div>

          {/* Center Navigation Links - Truly centered */}
          <div className="flex justify-center items-center py-2">
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                // Authenticated user navigation
                <>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-gray-300 px-4 py-2 text-base font-medium transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-white hover:text-gray-300 px-4 py-2 text-base font-medium transition-colors duration-200"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                // Unauthenticated user navigation
                <>
                  <a
                    href="#features"
                    onClick={smoothScrollTo('features')}
                    className="cursor-pointer text-white hover:text-gray-300 px-4 py-2 text-base font-medium transition-colors duration-200"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={smoothScrollTo('how-it-works')}
                    className="cursor-pointer text-white hover:text-gray-300 px-4 py-2 text-base font-medium transition-colors duration-200"
                  >
                    How It Works
                  </a>
                  <a
                    href="#use-cases"
                    onClick={smoothScrollTo('use-cases')}
                    className="cursor-pointer text-white hover:text-gray-300 px-4 py-2 text-base font-medium transition-colors duration-200"
                  >
                    Use Cases
                  </a>
                  <a
                    href="#pricing"
                    onClick={smoothScrollTo('pricing')}
                    className="cursor-pointer text-white hover:text-gray-300 px-4 py-2 text-base font-medium transition-colors duration-200"
                  >
                    Pricing
                  </a>
                  <a
                    href="#faq"
                    onClick={smoothScrollTo('faq')}
                    className="cursor-pointer text-white hover:text-gray-300 px-4 py-2 text-base font-medium transition-colors duration-200"
                  >
                    FAQ
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Right Actions - Absolute positioned right */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
            {user ? (
              // Authenticated user actions
              <LogoutButton
                variant="ghost"
                size="sm"
                className="text-black bg-white/90 rounded-xl px-4 py-2 transition-all duration-200"
              >
                Sign Out
              </LogoutButton>
            ) : (
              // Unauthenticated user actions
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-gray-300 px-4 py-2 transition-colors duration-200"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-white/90 text-gray-900 hover:bg-gray-200 rounded-full px-6 py-2 font-semibold transition-all duration-200 shadow-md"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-gray-200 hover:bg-gray-800 rounded-full p-2 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-24 left-1/2 transform -translate-x-1/2 z-40 w-80">
          <div
            className="border border-white/20 rounded-2xl px-6 py-4 shadow-xl backdrop-blur-md"
            style={{ backgroundColor: 'rgba(9, 9, 11, 0.5)' }}
          >
            {loading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : user ? (
              // Authenticated mobile navigation
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/search"
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Search
                </Link>
                <Link
                  href="/watchlist"
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Watchlist
                </Link>
                <Link
                  href="/profile"
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="pt-3 mt-3 border-t border-gray-700">
                  <LogoutButton
                    variant="ghost"
                    size="sm"
                    className="w-full text-black bg-white rounded-xl py-3 transition-all duration-200"
                  >
                    Sign Out
                  </LogoutButton>
                </div>
              </div>
            ) : (
              // Unauthenticated mobile navigation
              <div className="space-y-1">
                <a
                  href="#features"
                  onClick={smoothScrollTo('features')}
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={smoothScrollTo('how-it-works')}
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                >
                  How It Works
                </a>
                <a
                  href="#use-cases"
                  onClick={smoothScrollTo('use-cases')}
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                >
                  Use Cases
                </a>
                <a
                  href="#pricing"
                  onClick={smoothScrollTo('pricing')}
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                >
                  Pricing
                </a>
                <a
                  href="#faq"
                  onClick={smoothScrollTo('faq')}
                  className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-medium transition-colors duration-200"
                >
                  FAQ
                </a>
                <div className="pt-3 mt-3 border-t border-gray-700 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-white hover:text-gray-300 py-3 transition-colors duration-200"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-white text-gray-900 hover:bg-gray-200 rounded-xl py-3 font-semibold transition-all duration-200"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 relative z-10">
        <div className="bg-black/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src="/assets/images/timeline-target-logo.svg"
                      alt="Timeline Target Logo"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xl font-bold text-white">
                    Timeline Target
                  </span>
                </div>
                <p className="text-gray-300 text-sm max-w-md">
                  Search across all your favorite streaming platforms in one
                  place. Find movies, TV shows, and documentaries from Netflix,
                  Hulu, Amazon Prime, and more.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                  Product
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                  Support
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/help"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Timeline Target. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>{' '}
        {/* Close bg-black/95 wrapper */}
      </footer>
    </div>
  );
}
