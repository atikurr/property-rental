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
  Plus,
  TrendingUp,
  Users,
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

/*
|--------------------------------------------------------------------------
| BUTTON STYLES
|--------------------------------------------------------------------------
*/

const primaryButton =
  "group inline-flex h-11 w-auto min-w-[150px] shrink-0 flex-row flex-nowrap items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold leading-none text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] no-underline transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] active:translate-y-0 active:scale-[0.98]";

const outlineButton =
  "group inline-flex h-11 w-auto min-w-fit shrink-0 flex-row flex-nowrap items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium leading-none text-zinc-700 no-underline shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-md active:translate-y-0 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white";

const ghostButton =
  "group inline-flex h-9 w-auto min-w-fit shrink-0 flex-row flex-nowrap items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium leading-none text-zinc-600 no-underline transition-all duration-200 ease-out hover:bg-zinc-100 hover:text-zinc-950 active:scale-[0.97] dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white";

/*
|--------------------------------------------------------------------------
| BUTTON ICONS
|--------------------------------------------------------------------------
*/

const plusIcon =
  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-90";

const arrowIcon =
  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

const smallArrowIcon =
  "h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <Card className="border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {title}
            </p>

            <p className="mt-2 truncate text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              {value}
            </p>

            <div className="mt-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

              <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {description}
              </span>
            </div>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Icon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }) {
  if (status === "Approved") {
    return (
      <Badge
        variant="outline"
        className="inline-flex items-center whitespace-nowrap rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
      >
        <CheckCircle2 className="mr-1.5 h-3 w-3 shrink-0" />
        Approved
      </Badge>
    );
  }

  if (status === "Pending") {
    return (
      <Badge
        variant="outline"
        className="inline-flex items-center whitespace-nowrap rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400"
      >
        <Clock3 className="mr-1.5 h-3 w-3 shrink-0" />
        Pending
      </Badge>
    );
  }

  if (status === "Rejected") {
    return (
      <Badge
        variant="outline"
        className="inline-flex items-center whitespace-nowrap rounded-full border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
      >
        <span className="mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
        Rejected
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="whitespace-nowrap rounded-full px-2.5 py-1"
    >
      {status || "Unknown"}
    </Badge>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING SKELETON
|--------------------------------------------------------------------------
*/

function DashboardSkeleton() {
  return (
    <div className="min-h-full bg-zinc-100/70 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="animate-pulse">
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-3 h-8 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-2 h-4 w-96 max-w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[132px] animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[430px] animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />

          <div className="h-[430px] animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
        </div>

        <div className="mt-6 h-[330px] animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| OWNER DASHBOARD
|--------------------------------------------------------------------------
*/

export default function OwnerDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | LOAD ANALYTICS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const tokenResponse = await authClient.token();

        const token =
          tokenResponse?.data?.token;

        if (!token) {
          throw new Error(
            "Authentication token is missing."
          );
        }

        const response = await fetch(
          "http://localhost:5000/api/owner/analytics",
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
            data?.message ||
              "Failed to load owner analytics."
          );
        }

        if (cancelled) {
          return;
        }

        setAnalytics(
          data?.analytics || null
        );
      } catch (error) {
        console.error(
          "Owner analytics loading error:",
          error
        );

        if (!cancelled) {
          toast.error(
            error.message ||
              "Failed to load dashboard data."
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

  /*
  |--------------------------------------------------------------------------
  | CURRENT MONTH
  |--------------------------------------------------------------------------
  */

  const currentMonthName = useMemo(() => {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "long",
      }
    ).format(new Date());
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CURRENT DATE
  |--------------------------------------------------------------------------
  */

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    ).format(new Date());
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FORMAT CURRENCY
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (amount) => {
    return `৳${Number(
      amount || 0
    ).toLocaleString("en-BD")}`;
  };

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const totalEarnings =
    analytics?.totalEarnings || 0;

  const totalProperties =
    analytics?.totalProperties || 0;

  const totalBookings =
    analytics?.totalBookings || 0;

  const activeTenants =
    analytics?.activeTenants || 0;

  const pendingRequests =
    analytics?.pendingRequests || 0;

  const monthlyEarnings =
    analytics?.monthlyEarnings || [];

  const recentProperties =
    analytics?.recentProperties || [];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
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

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-full bg-zinc-100/70 dark:bg-zinc-950">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =========================================================
            WELCOME
        ========================================================= */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {currentDate}
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              Welcome back, Owner
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Here&apos;s what&apos;s happening
              with your properties today.
            </p>
          </div>

          {/* =====================================================
              TOP ADD PROPERTY BUTTON
          ===================================================== */}

          <Link
            href="/dashboard/owner/add-property"
            className={primaryButton}
          >
            <Plus className={plusIcon} />

            <span className="whitespace-nowrap">
              Add Property
            </span>
          </Link>
        </div>

        {/* =========================================================
            STATS
        ========================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(
              totalEarnings
            )}
            description="Successful payments"
            icon={DollarSign}
          />

          <StatCard
            title="Total Properties"
            value={totalProperties.toLocaleString()}
            description="Your property listings"
            icon={Building2}
          />

          <StatCard
            title="Total Bookings"
            value={totalBookings.toLocaleString()}
            description="Approved & completed"
            icon={CalendarCheck}
          />

          <StatCard
            title="Active Tenants"
            value={activeTenants.toLocaleString()}
            description="Confirmed tenants"
            icon={Users}
          />
        </div>

        {/* =========================================================
            MAIN ANALYTICS
        ========================================================= */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* =====================================================
              EARNINGS
          ===================================================== */}

          <Card className="border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Earnings Overview
                </CardTitle>

                <CardDescription className="mt-1">
                  Your monthly earnings for the last 12 months
                </CardDescription>
              </div>

              <Badge
                variant="outline"
                className="inline-flex w-fit items-center whitespace-nowrap rounded-full px-3 py-1"
              >
                Last 12 months
              </Badge>
            </CardHeader>

            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
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
                        id="earningsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopOpacity={0.2}
                        />

                        <stop
                          offset="100%"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                      className="stroke-zinc-200 dark:stroke-zinc-800"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      className="text-xs"
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tickFormatter={(value) =>
                        `৳${Number(
                          value
                        ) / 1000}k`
                      }
                      className="text-xs"
                    />

                    <Tooltip
                      cursor={{
                        strokeDasharray:
                          "4 4",
                      }}
                      formatter={(value) => [
                        formatCurrency(
                          value
                        ),
                        "Earnings",
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border:
                          "1px solid #e4e4e7",
                        background:
                          "#ffffff",
                        boxShadow:
                          "0 10px 30px rgba(0,0,0,0.08)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="earnings"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="text-zinc-900 dark:text-white"
                      fill="url(#earningsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* =====================================================
              PERFORMANCE
          ===================================================== */}

          <Card className="border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base">
                Performance Summary
              </CardTitle>

              <CardDescription>
                Your property business at a glance
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">

              {/* PENDING */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                    <Clock3 className="h-4 w-4 text-amber-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      Pending Requests
                    </p>

                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      Need your attention
                    </p>
                  </div>
                </div>

                <span className="shrink-0 font-semibold">
                  {pendingRequests}
                </span>
              </div>

              <Separator />

              {/* PROPERTIES */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Building2 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      Total Properties
                    </p>

                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      Your listings
                    </p>
                  </div>
                </div>

                <span className="shrink-0 font-semibold">
                  {totalProperties}
                </span>
              </div>

              {/* BOOKINGS */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <CalendarCheck className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      Confirmed Bookings
                    </p>

                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      Approved & completed
                    </p>
                  </div>
                </div>

                <span className="shrink-0 font-semibold">
                  {totalBookings}
                </span>
              </div>

              {/* THIS MONTH */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <DollarSign className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      This Month
                    </p>

                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {currentMonthName} earnings
                    </p>
                  </div>
                </div>

                <span className="shrink-0 font-semibold">
                  {formatCurrency(
                    monthlyEarnings[
                      monthlyEarnings.length - 1
                    ]?.earnings || 0
                  )}
                </span>
              </div>

              {/* ANALYTICS */}

              <Link
                href="/dashboard/owner/analytics"
                className={`${outlineButton} w-full`}
              >
                <span className="whitespace-nowrap">
                  View Detailed Analytics
                </span>

                <ArrowUpRight
                  className={arrowIcon}
                />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* =========================================================
            RECENT PROPERTIES
        ========================================================= */}

        <Card className="mt-6 border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">
                Recent Properties
              </CardTitle>

              <CardDescription>
                Your latest property listings
              </CardDescription>
            </div>

            <Link
              href="/dashboard/owner/properties"
              className={outlineButton}
            >
              <span className="whitespace-nowrap">
                View All
              </span>

              <ArrowUpRight
                className={smallArrowIcon}
              />
            </Link>
          </CardHeader>

          <CardContent>
            {recentProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <Building2 className="h-6 w-6 text-zinc-500" />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  No properties yet
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  Add your first property to start receiving booking requests.
                </p>

                {/* EMPTY STATE ADD PROPERTY */}

                <Link
                  href="/dashboard/owner/add-property"
                  className={`${primaryButton} mt-5`}
                >
                  <Plus className={plusIcon} />

                  <span className="whitespace-nowrap">
                    Add Property
                  </span>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentProperties.map(
                  (property, index) => (
                    <div
                      key={property.id}
                    >
                      <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <Building2 className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {property.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {property.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-5">

                          {/* RENT */}

                          <div className="hidden text-right md:block">
                            <p className="text-sm font-semibold">
                              {formatCurrency(
                                property.rent
                              )}
                            </p>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {property.rentType ||
                                "Monthly"}
                            </p>
                          </div>

                          {/* BOOKINGS */}

                          <div className="hidden text-right lg:block">
                            <p className="text-sm font-semibold">
                              {property.bookings}
                            </p>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Bookings
                            </p>
                          </div>

                          {/* STATUS */}

                          <StatusBadge
                            status={
                              property.status
                            }
                          />

                          {/* VIEW */}

                          <Link
                            href={`/dashboard/owner/properties/${property.id}/edit`}
                            className={ghostButton}
                          >
                            <span className="whitespace-nowrap">
                              View
                            </span>

                            <ArrowUpRight
                              className={
                                smallArrowIcon
                              }
                            />
                          </Link>
                        </div>
                      </div>

                      {index <
                        recentProperties.length -
                          1 && (
                        <Separator />
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* =========================================================
            BOTTOM CTA
        ========================================================= */}

        <div className="mt-6 overflow-hidden rounded-2xl bg-zinc-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                Grow your rental business
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                Add another property today.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                List your property and connect with potential tenants through RentSpace.
              </p>
            </div>

            {/* BOTTOM ADD PROPERTY */}

            <Link
              href="/dashboard/owner/add-property"
              className="group inline-flex h-11 min-w-[150px] shrink-0 flex-row flex-nowrap items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold leading-none text-zinc-950 no-underline shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            >
              <Plus className={plusIcon} />

              <span className="whitespace-nowrap">
                Add Property
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}