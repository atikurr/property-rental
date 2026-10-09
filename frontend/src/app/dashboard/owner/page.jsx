"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  DollarSign,
  Moon,
  Plus,
  Sun,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { authClient } from "@/lib/auth-client";

const ORANGE = "#f97316";

const primaryButton =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600";

const outlineButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

const ghostButton =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 dark:text-zinc-400 dark:hover:bg-zinc-800";

const cardClass =
  "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900";

const titleClass =
  "text-slate-900 dark:text-zinc-100";

const mutedClass =
  "text-slate-500 dark:text-zinc-400";

const dividerClass =
  "bg-slate-100 dark:bg-zinc-800";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "orange",
}) {
  const iconStyles = {
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    purple: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  };

  return (
    <Card
      className={`${cardClass} group hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg dark:hover:border-orange-500/40`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-sm font-medium ${mutedClass}`}>
              {title}
            </p>

            <p
              className={`mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl ${titleClass}`}
            >
              {value}
            </p>

            <div className="mt-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span className={`truncate text-xs ${mutedClass}`}>
                {description}
              </span>
            </div>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${iconStyles[accent] || iconStyles.orange}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
    Pending:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
    Rejected:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ||
        "border-slate-200 bg-slate-50 text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {status === "Approved" && (
        <CheckCircle2 className="mr-1.5 h-3 w-3" />
      )}

      {status === "Pending" && (
        <Clock3 className="mr-1.5 h-3 w-3" />
      )}

      {status || "Unknown"}
    </Badge>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f7f5ef] p-4 dark:bg-[#09090b] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-zinc-800" />
        <div className="mt-4 h-9 w-72 max-w-full rounded bg-slate-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-zinc-800" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[400px] rounded-2xl bg-white dark:bg-zinc-900" />
          <div className="h-[400px] rounded-2xl bg-white dark:bg-zinc-900" />
        </div>

        <div className="mt-6 h-72 rounded-2xl bg-white dark:bg-zinc-900" />
      </div>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Restore saved theme
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("rentnest-theme");
    const initialTheme = savedTheme || "light";

    setTheme(initialTheme);

    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark"
    );

    setThemeLoaded(true);
  }, []);

  // Toggle and save theme
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    window.localStorage.setItem("rentnest-theme", nextTheme);

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );
  };

  // Load owner analytics
  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const tokenResponse = await authClient.token();
        const token = tokenResponse?.data?.token;

        if (!token) {
          throw new Error("Authentication token is missing.");
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000";

        const response = await fetch(
          `${API_URL}/api/owner/analytics`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load owner analytics."
          );
        }

        if (!cancelled) {
          setAnalytics(data?.analytics || null);
        }
      } catch (error) {
        console.error("Owner analytics loading error:", error);

        if (!cancelled) {
          toast.error(
            error.message || "Failed to load dashboard data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentMonthName = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
      }).format(new Date()),
    []
  );

  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const formatCurrency = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  const totalEarnings = analytics?.totalEarnings || 0;
  const totalProperties = analytics?.totalProperties || 0;
  const totalBookings = analytics?.totalBookings || 0;
  const activeTenants = analytics?.activeTenants || 0;
  const pendingRequests = analytics?.pendingRequests || 0;
  const monthlyEarnings = analytics?.monthlyEarnings || [];
  const recentProperties = analytics?.recentProperties || [];

  if (loading || !themeLoaded) {
    return (
      <>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-slate-900 transition-colors duration-300 dark:bg-[#09090b] dark:text-zinc-100">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={theme}
      />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Welcome section */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
              Owner Dashboard
            </div>

            <p className={`mb-2 text-sm font-medium ${mutedClass}`}>
              {currentDate}
            </p>

            <h1
              className={`text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl ${titleClass}`}
            >
              Welcome back, Owner
            </h1>

            <p className={`mt-2 max-w-2xl text-sm leading-6 ${mutedClass}`}>
              Heres what is happening with your properties today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-amber-400 dark:hover:bg-zinc-800"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/dashboard/owner/add-property"
              className={primaryButton}
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Add Property
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(totalEarnings)}
            description="Successful payments"
            icon={DollarSign}
            accent="orange"
          />

          <StatCard
            title="Total Properties"
            value={totalProperties.toLocaleString()}
            description="Your property listings"
            icon={Building2}
            accent="blue"
          />

          <StatCard
            title="Total Bookings"
            value={totalBookings.toLocaleString()}
            description="Approved & completed"
            icon={CalendarCheck}
            accent="purple"
          />

          <StatCard
            title="Active Tenants"
            value={activeTenants.toLocaleString()}
            description="Confirmed tenants"
            icon={Users}
            accent="green"
          />
        </div>

        {/* Analytics */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Earnings chart */}
          <Card className={cardClass}>
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className={`text-base font-semibold ${titleClass}`}>
                  Earnings Overview
                </CardTitle>

                <CardDescription className={`mt-1 ${mutedClass}`}>
                  Your monthly earnings for the last 12 months
                </CardDescription>
              </div>

              <Badge
                variant="outline"
                className="w-fit rounded-full border-orange-200 bg-orange-50 px-3 py-1 text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400"
              >
                Last 12 months
              </Badge>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyEarnings}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 5,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="rentNestEarningsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={ORANGE}
                          stopOpacity={0.28}
                        />
                        <stop
                          offset="100%"
                          stopColor={ORANGE}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                      stroke={theme === "dark" ? "#27272a" : "#e2e8f0"}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{
                        fill: theme === "dark" ? "#a1a1aa" : "#64748b",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{
                        fill: theme === "dark" ? "#a1a1aa" : "#64748b",
                        fontSize: 12,
                      }}
                      tickFormatter={(value) =>
                        `৳${Number(value) / 1000}k`
                      }
                    />

                    <Tooltip
                      cursor={{
                        strokeDasharray: "4 4",
                        stroke: theme === "dark" ? "#52525b" : "#cbd5e1",
                      }}
                      formatter={(value) => [
                        formatCurrency(value),
                        "Earnings",
                      ]}
                      contentStyle={{
                        borderRadius: "14px",
                        border:
                          theme === "dark"
                            ? "1px solid #3f3f46"
                            : "1px solid #e2e8f0",
                        background: theme === "dark" ? "#18181b" : "#ffffff",
                        color: theme === "dark" ? "#f4f4f5" : "#0f172a",
                        boxShadow: "0 12px 30px rgba(15,23,42,0.10)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke={ORANGE}
                      strokeWidth={3}
                      fill="url(#rentNestEarningsGradient)"
                      activeDot={{
                        r: 5,
                        fill: ORANGE,
                        stroke: theme === "dark" ? "#18181b" : "#ffffff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance summary */}
          <Card className={cardClass}>
            <CardHeader className="border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className={`text-base ${titleClass}`}>
                Performance Summary
              </CardTitle>

              <CardDescription className={mutedClass}>
                Your property business at a glance
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
                    <Clock3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>

                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${titleClass}`}>
                      Pending Requests
                    </p>
                    <p className={`truncate text-xs ${mutedClass}`}>
                      Need your attention
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  {pendingRequests}
                </span>
              </div>

              <Separator className={dividerClass} />

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${titleClass}`}>
                      Total Properties
                    </p>
                    <p className={`truncate text-xs ${mutedClass}`}>
                      Your listings
                    </p>
                  </div>
                </div>

                <span className={`shrink-0 font-semibold ${titleClass}`}>
                  {totalProperties}
                </span>
              </div>

              <Separator className={dividerClass} />

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40">
                    <CalendarCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>

                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${titleClass}`}>
                      Confirmed Bookings
                    </p>
                    <p className={`truncate text-xs ${mutedClass}`}>
                      Approved & completed
                    </p>
                  </div>
                </div>

                <span className={`shrink-0 font-semibold ${titleClass}`}>
                  {totalBookings}
                </span>
              </div>

              <Separator className={dividerClass} />

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40">
                    <WalletCards className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>

                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${titleClass}`}>
                      This Month
                    </p>
                    <p className={`truncate text-xs ${mutedClass}`}>
                      {currentMonthName} earnings
                    </p>
                  </div>
                </div>

                <span className={`shrink-0 font-semibold ${titleClass}`}>
                  {formatCurrency(
                    monthlyEarnings[monthlyEarnings.length - 1]?.earnings || 0
                  )}
                </span>
              </div>

              <Link
                href="/dashboard/owner/analytics"
                className={`${outlineButton} mt-2 w-full`}
              >
                View Detailed Analytics
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent properties */}
        <Card className={`${cardClass} mt-6`}>
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className={`text-base ${titleClass}`}>
                Recent Properties
              </CardTitle>

              <CardDescription className={mutedClass}>
                Your latest property listings
              </CardDescription>
            </div>

            <Link
              href="/dashboard/owner/properties"
              className={outlineButton}
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>

          <CardContent>
            {recentProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/40">
                  <Building2 className="h-6 w-6 text-orange-500" />
                </div>

                <h3 className={`mt-4 text-sm font-semibold ${titleClass}`}>
                  No properties yet
                </h3>

                <p className={`mt-1 max-w-sm text-xs leading-5 ${mutedClass}`}>
                  Add your first property to start receiving booking requests.
                </p>

                <Link
                  href="/dashboard/owner/add-property"
                  className={`${primaryButton} mt-5`}
                >
                  <Plus className="h-4 w-4" />
                  Add Property
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentProperties.map((property, index) => (
                  <div key={property.id}>
                    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40">
                          <Building2 className="h-5 w-5 text-orange-500" />
                        </div>

                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${titleClass}`}>
                            {property.name}
                          </p>

                          <p className={`mt-1 truncate text-xs ${mutedClass}`}>
                            {property.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-5">
                        <div className="hidden text-right md:block">
                          <p className={`text-sm font-semibold ${titleClass}`}>
                            {formatCurrency(property.rent)}
                          </p>

                          <p className={`text-xs ${mutedClass}`}>
                            {property.rentType || "Monthly"}
                          </p>
                        </div>

                        <div className="hidden text-right lg:block">
                          <p className={`text-sm font-semibold ${titleClass}`}>
                            {property.bookings}
                          </p>

                          <p className={`text-xs ${mutedClass}`}>
                            Bookings
                          </p>
                        </div>

                        <StatusBadge status={property.status} />

                        <Link
                          href={`/dashboard/owner/properties/${property.id}/edit`}
                          className={ghostButton}
                        >
                          View
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {index < recentProperties.length - 1 && (
                      <Separator className={dividerClass} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 p-6 text-white shadow-xl shadow-orange-500/15 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white">
                <Building2 className="mr-1.5 h-3.5 w-3.5" />
                Grow your rental business
              </div>

              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Add another property today.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-orange-50">
                List your property and connect with potential tenants through RentNest.
              </p>
            </div>

            <Link
              href="/dashboard/owner/add-property"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-orange-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}