"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Home,
  Building2,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await authClient.getSession();

        if (!mounted) return;

        if (error) {
          setUser(null);
        } else {
          setUser(data?.user || null);
        }
      } catch (error) {
        console.error("Session error:", error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const getDashboardPath = () => {
    const role = user?.role?.toLowerCase();

    if (role === "admin") return "/dashboard/admin";
    if (role === "owner") return "/dashboard/owner";

    return "/dashboard/tenant";
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();

      setUser(null);
      setProfileOpen(false);
      setMobileOpen(false);

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="rounded-[24px] border border-white/70 bg-white/75 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150">

          <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-7">

            {/* LOGO */}
            <Link
              href="/"
              className="shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            >
              <Image
                src="/assets/logo.png"
                alt="RentNest"
                width={190}
                height={60}
                priority
                className="h-auto w-[145px] object-contain sm:w-[165px]"
              />
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden items-center gap-2 lg:flex">

              {/* Home */}
              <Link
                href="/"
                className="group relative flex items-center gap-2 rounded-full bg-orange-50 px-5 py-2.5 text-sm font-bold text-orange-500"
              >
                <Home size={16} />

                <span>Home</span>

                <span className="absolute bottom-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-orange-500" />
              </Link>

              {/* All Properties */}
              <Link
                href="/properties"
                className="group relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-white/80 hover:text-orange-500"
              >
                <Building2
                  size={16}
                  className="transition-colors group-hover:text-orange-500"
                />

                <span>All Properties</span>

                <span className="absolute bottom-1.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-orange-500 transition-all duration-300 group-hover:w-5" />
              </Link>

            </nav>

            {/* RIGHT SIDE */}
            <div className="hidden items-center gap-2 lg:flex">

              {loading ? (
                <div className="h-10 w-28 animate-pulse rounded-xl bg-white/60" />
              ) : user ? (
                <>
                  {/* Dashboard */}
                  <Link
                    href={getDashboardPath()}
                    className="flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-orange-500"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  {/* Profile */}
                  <div className="relative">

                    <button
                      type="button"
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
                    >
                      <span className="max-w-[110px] truncate">
                        {user?.name || "Account"}
                      </span>

                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-300 ${
                          profileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-[calc(100%+10px)] w-60 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-2xl backdrop-blur-xl">

                        <div className="border-b border-slate-100 px-3 py-3">

                          <p className="truncate text-sm font-bold text-slate-900">
                            {user?.name || "User"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {user?.email}
                          </p>

                          {user?.role && (
                            <span className="mt-2 inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase text-orange-500">
                              {user.role}
                            </span>
                          )}

                        </div>

                        <Link
                          href={getDashboardPath()}
                          onClick={() => setProfileOpen(false)}
                          className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>

                      </div>
                    )}

                  </div>
                </>
              ) : (
                <>
                  {/* Login */}
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white/80 hover:text-orange-500"
                  >
                    <LogIn size={16} />

                    Login
                  </Link>

                  {/* Register */}
                  <Link
                    href="/register"
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(249,115,22,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600"
                  >
                    <UserPlus size={16} />

                    Register
                  </Link>
                </>
              )}

            </div>

            {/* MOBILE BUTTON */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-slate-700 transition hover:bg-white lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

          </div>

          {/* MOBILE MENU */}
          {mobileOpen && (
            <div className="border-t border-white/60 bg-white/90 px-4 pb-4 backdrop-blur-2xl lg:hidden">

              <div className="space-y-1 pt-3">

                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3 text-sm font-bold text-orange-500"
                >
                  <Home size={18} />
                  Home
                </Link>

                <Link
                  href="/properties"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Building2 size={18} />
                  All Properties
                </Link>

                <div className="my-2 border-t border-slate-100" />

                {user ? (
                  <>
                    <Link
                      href={getDashboardPath()}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <LogIn size={18} />
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white"
                    >
                      <UserPlus size={18} />
                      Register
                    </Link>
                  </>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}