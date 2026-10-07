"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import { authClient } from "@/lib/auth-client";

const API_URL = "http://localhost:5000";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-BD").format(
    Number(price || 0)
  );
};

const formatDate = (date) => {
  if (!date) {
    return "Not selected";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const propertyId =
    searchParams.get("propertyId") || "";

  const moveInDate =
    searchParams.get("moveInDate") || "";

  const phone =
    searchParams.get("phone") || "";

  const additionalNotes =
    searchParams.get("additionalNotes") || "";

  const duration = Number(
    searchParams.get("duration") || 1
  );

  const [session, setSession] = useState(null);
  const [property, setProperty] = useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [propertyLoading, setPropertyLoading] =
    useState(true);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD USER SESSION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadSession = async () => {
      try {
        const result =
          await authClient.getSession();

        const currentSession =
          result?.data?.session;

        if (!currentSession) {
          router.replace(
            `/login?callbackUrl=${encodeURIComponent(
              `/payment?propertyId=${propertyId}`
            )}`
          );

          return;
        }

        if (
          currentSession.user?.role !==
          "tenant"
        ) {
          toast.error(
            "Only tenant accounts can make payments."
          );

          router.replace("/properties");

          return;
        }

        setSession(currentSession);
      } catch (sessionError) {
        console.error(
          "Payment session error:",
          sessionError
        );

        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    loadSession();
  }, [propertyId, router]);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROPERTY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadProperty = async () => {
      if (
        authLoading ||
        !session ||
        !propertyId
      ) {
        return;
      }

      try {
        setPropertyLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/properties/${propertyId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load property."
          );
        }

        if (!data?.property) {
          throw new Error(
            "Property information was not found."
          );
        }

        setProperty(data.property);
      } catch (propertyError) {
        console.error(
          "Payment property error:",
          propertyError
        );

        setError(
          propertyError.message ||
            "Failed to load property."
        );
      } finally {
        setPropertyLoading(false);
      }
    };

    loadProperty();
  }, [
    authLoading,
    session,
    propertyId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL AMOUNT
  |--------------------------------------------------------------------------
  */

  const totalAmount = useMemo(() => {
    if (!property) {
      return 0;
    }

    return (
      Number(property.rent || 0) *
      Number(duration || 1)
    );
  }, [property, duration]);

  /*
  |--------------------------------------------------------------------------
  | START STRIPE PAYMENT
  |--------------------------------------------------------------------------
  */

  const handlePayment = async () => {
    if (paymentLoading) {
      return;
    }

    if (!session?.user) {
      toast.error(
        "Please login before making payment."
      );

      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/payment?propertyId=${propertyId}`
        )}`
      );

      return;
    }

    if (!property) {
      toast.error(
        "Property information is unavailable."
      );

      return;
    }

    if (!propertyId) {
      toast.error(
        "Property ID is missing."
      );

      return;
    }

    if (!moveInDate) {
      toast.error(
        "Move-in date is missing."
      );

      return;
    }

    if (
      !duration ||
      Number(duration) < 1
    ) {
      toast.error(
        "Invalid booking duration."
      );

      return;
    }

    if (!phone.trim()) {
      toast.error(
        "Contact number is missing."
      );

      return;
    }

    try {
      setPaymentLoading(true);

      /*
      |--------------------------------------------------------------------------
      | GET JWT TOKEN
      |--------------------------------------------------------------------------
      */

      const tokenResponse =
        await authClient.token();

      const token =
        tokenResponse?.data?.token;

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE STRIPE CHECKOUT SESSION
      |--------------------------------------------------------------------------
      */

      const response = await fetch(
        `${API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            propertyId,

            propertyTitle:
              property.title,

            rent:
              Number(property.rent),

            rentType:
              property.rentType ||
              "Monthly",

            moveInDate,

            duration:
              Number(duration),

            phone:
              phone.trim(),

            additionalNotes:
              additionalNotes.trim(),
          }),
        }
      );

      /*
      |--------------------------------------------------------------------------
      | READ RESPONSE SAFELY
      |--------------------------------------------------------------------------
      */

      const responseText =
        await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {};
      }

      /*
      |--------------------------------------------------------------------------
      | BACKEND ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        console.error(
          "Payment API error:",
          {
            status: response.status,
            data,
            responseText,
          }
        );

        throw new Error(
          data?.message ||
            `Payment server error (${response.status}).`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK STRIPE URL
      |--------------------------------------------------------------------------
      */

      if (!data?.checkoutUrl) {
        console.error(
          "Stripe checkout URL missing:",
          data
        );

        throw new Error(
          "Stripe checkout URL was not returned by the server."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | REDIRECT TO STRIPE
      |--------------------------------------------------------------------------
      */

      window.location.assign(
        data.checkoutUrl
      );
    } catch (paymentError) {
      console.error(
        "Payment error:",
        paymentError
      );

      toast.error(
        paymentError?.message ||
          "Unable to start payment."
      );

      setPaymentLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (
    authLoading ||
    propertyLoading
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse">
            <div className="h-6 w-32 rounded bg-slate-200 dark:bg-zinc-800" />

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="h-[500px] rounded-3xl bg-slate-200 dark:bg-zinc-800" />

              <div className="space-y-4">
                <div className="h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800" />

                <div className="h-32 rounded-2xl bg-slate-200 dark:bg-zinc-800" />

                <div className="h-32 rounded-2xl bg-slate-200 dark:bg-zinc-800" />

                <div className="h-16 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error || !property) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <CreditCard className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
            Payment Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-zinc-400">
            {error ||
              "We could not load the property information required for payment."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                propertyId
                  ? `/property/${propertyId}`
                  : "/properties"
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAYMENT PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-slate-50 pb-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/property/${propertyId}`
            )
          }
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </button>

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Complete Your Payment
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Review your booking information
            before continuing to secure payment.
          </p>
        </div>

        {/* CONTENT */}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* LEFT */}

          <div className="space-y-6">
            {/* PROPERTY */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative h-72 w-full overflow-hidden sm:h-96">
                {property.images?.[0] ? (
                  <Image
                    src={property.images[0]}
                    alt={
                      property.title ||
                      "Property image"
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-zinc-800">
                    <CreditCard className="h-12 w-12" />
                  </div>
                )}

                <div className="absolute left-5 top-5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
                  Approved Property
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {property.type}
                </span>

                <h2 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">
                  {property.title}
                </h2>

                <div className="mt-4 flex items-start gap-2 text-sm text-slate-500 dark:text-zinc-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {property.location}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-zinc-800/70">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                    Rental Price
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-950 dark:text-white">
                      ৳
                      {formatPrice(
                        property.rent
                      )}
                    </span>

                    <span className="pb-1 text-sm text-slate-500 dark:text-zinc-400">
                      /{" "}
                      {property.rentType ||
                        "Monthly"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* USER */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                  <User className="h-5 w-5 text-slate-700 dark:text-zinc-300" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Tenant Information
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Information associated with
                    your account
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Name
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {session?.user?.name ||
                      "Tenant"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Email
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {session?.user?.email ||
                      "Email"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Contact Number
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {phone ||
                      "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Move-in Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(
                      moveInDate
                    )}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}

          <aside className="h-fit lg:sticky lg:top-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                  <CreditCard className="h-5 w-5 text-slate-700 dark:text-zinc-300" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    Payment Summary
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Review before payment
                  </p>
                </div>
              </div>

              {/* BOOKING DETAILS */}

              <div className="mt-7 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500 dark:text-zinc-400">
                    Rental Price
                  </span>

                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    ৳
                    {formatPrice(
                      property.rent
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500 dark:text-zinc-400">
                    Duration
                  </span>

                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {duration}{" "}
                    {(
                      property.rentType ||
                      "Monthly"
                    ).toLowerCase()}
                    {duration > 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500 dark:text-zinc-400">
                    Move-in Date
                  </span>

                  <span className="flex items-center gap-1 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {formatDate(
                      moveInDate
                    )}
                  </span>
                </div>
              </div>

              {/* TOTAL */}

              <div className="my-6 border-t border-slate-200 pt-6 dark:border-zinc-800">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
                    Total Amount
                  </span>

                  <span className="text-3xl font-bold text-slate-950 dark:text-white">
                    ৳
                    {formatPrice(
                      totalAmount
                    )}
                  </span>
                </div>

                <p className="mt-2 text-right text-xs text-slate-500 dark:text-zinc-500">
                  {formatPrice(
                    property.rent
                  )}{" "}
                  × {duration}
                </p>
              </div>

              {/* PAYMENT BUTTON */}

              <button
                type="button"
                onClick={handlePayment}
                disabled={paymentLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay ৳
                    {formatPrice(
                      totalAmount
                    )}
                  </>
                )}
              </button>

              {/* SECURITY */}

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                    Secure Payment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700 dark:text-emerald-400">
                    Your payment will be securely
                    processed by Stripe. We do not
                    store your card information.
                  </p>
                </div>
              </div>

              {/* CHECKLIST */}

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Property information verified
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Booking information received
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Secure Stripe checkout
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}