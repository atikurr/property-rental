"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Star,
  Quote,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/reviews?limit=4`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        const reviewList = Array.isArray(data)
          ? data
          : data.reviews || data.data || [];

        setReviews(reviewList.slice(0, 4));
      } catch (error) {
        console.error("Review fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length]);

  const nextReview = () => {
    if (!reviews.length) return;

    setActive((prev) => (prev + 1) % reviews.length);
  };

  const previousReview = () => {
    if (!reviews.length) return;

    setActive(
      (prev) => (prev - 1 + reviews.length) % reviews.length
    );
  };

  const getUserName = (review) => {
    return (
      review?.user?.name ||
      review?.tenant?.name ||
      review?.userName ||
      review?.name ||
      "Happy Tenant"
    );
  };

  const getUserImage = (review) => {
    return (
      review?.user?.image ||
      review?.user?.photo ||
      review?.tenant?.image ||
      review?.tenant?.photo ||
      review?.userImage ||
      "/assets/default-avatar.png"
    );
  };

  const getRating = (review) => {
    return Number(review?.rating || review?.stars || 5);
  };

  const getReviewText = (review) => {
    return (
      review?.comment ||
      review?.review ||
      review?.message ||
      review?.text ||
      "RentNest made my rental experience simple and convenient. Finding the right property was much easier than I expected."
    );
  };

  const getPropertyName = (review) => {
    return (
      review?.property?.title ||
      review?.property?.name ||
      review?.propertyName ||
      "Rental Property"
    );
  };

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-orange-100/50 blur-3xl" />

        <div className="absolute -right-40 bottom-10 h-80 w-80 rounded-full bg-orange-50 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,247,237,0.55),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-500"
          >
            <Sparkles size={15} />
            Tenant Stories
          </motion.div>

          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            What Our{" "}
            <span className="text-orange-500">
              Tenants
            </span>{" "}
            Say
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Real experiences from people who found their next place
            through RentNest.
          </p>
        </motion.div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-[360px] rounded-[2rem] border border-slate-200 bg-slate-100" />
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {!loading && reviews.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mx-auto max-w-2xl rounded-[2rem] border border-orange-100 bg-orange-50/60 p-10 text-center"
          >
            <Quote
              size={35}
              className="mx-auto text-orange-400"
            />

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Tenant reviews are coming soon
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Once tenants start sharing their experiences,
              their reviews will appear here.
            </p>
          </motion.div>
        )}

        {/* =====================================================
            REVIEWS
        ====================================================== */}

        {!loading && reviews.length > 0 && (
          <div className="mx-auto max-w-5xl">

            {/* Main card */}

            <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/40">

              {/* Orange side decoration */}

              <div className="absolute left-0 top-0 h-full w-1.5 bg-orange-500" />

              <div className="grid min-h-[390px] lg:grid-cols-[0.8fr_1.2fr]">

                {/* =================================================
                    LEFT PROFILE
                ================================================== */}

                <div className="relative flex flex-col justify-between overflow-hidden bg-orange-50/70 p-8 sm:p-10">

                  <div>
                    <Quote
                      size={48}
                      strokeWidth={1.5}
                      className="text-orange-300"
                    />

                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
                      Verified Tenant
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -15,
                      }}
                      transition={{
                        duration: 0.35,
                      }}
                        className="mt-8"
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                        <Image
                          src={getUserImage(reviews[active])}
                          alt={getUserName(reviews[active])}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <h3 className="mt-4 text-xl font-bold text-slate-900">
                        {getUserName(reviews[active])}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Tenant · {getPropertyName(reviews[active])}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* =================================================
                    RIGHT REVIEW
                ================================================== */}

                <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{
                        opacity: 0,
                        x: 25,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -25,
                      }}
                      transition={{
                        duration: 0.4,
                      }}
                    >
                      {/* Stars */}

                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map(
                          (_, index) => (
                            <Star
                              key={index}
                              size={18}
                              fill={
                                index <
                                getRating(reviews[active])
                                  ? "currentColor"
                                  : "none"
                              }
                              className={
                                index <
                                getRating(reviews[active])
                                  ? "text-orange-400"
                                  : "text-slate-200"
                              }
                            />
                          )
                        )}
                      </div>

                      {/* Review */}

                      <p className="mt-7 max-w-2xl text-2xl font-semibold leading-relaxed text-slate-800 sm:text-3xl">
                        “{getReviewText(reviews[active])}”
                      </p>

                      <div className="mt-7 h-px w-full bg-slate-100" />

                      <div className="mt-5 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                          Tenant experience
                        </p>

                        <p className="text-sm font-semibold text-orange-500">
                          {String(active + 1).padStart(2, "0")} /{" "}
                          {String(reviews.length).padStart(2, "0")}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Controls */}

                  <div className="mt-8 flex items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={previousReview}
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500"
                      aria-label="Previous review"
                    >
                      <ArrowLeft size={18} />
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={nextReview}
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600"
                      aria-label="Next review"
                    >
                      <ArrowRight size={18} />
                    </motion.button>

                    {/* Dots */}

                    <div className="ml-3 flex items-center gap-1.5">
                      {reviews.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setActive(index)}
                          className="p-1"
                          aria-label={`Go to review ${index + 1}`}
                        >
                          <motion.span
                            animate={{
                              width:
                                active === index ? 26 : 7,
                              opacity:
                                active === index ? 1 : 0.35,
                            }}
                            className="block h-1.5 rounded-full bg-orange-500"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            BOTTOM TRUST
        ====================================================== */}

        {!loading && reviews.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="mx-auto mt-7 flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <Star size={14} fill="currentColor" />
              </span>

              Trusted tenant experiences
            </div>

            <div className="hidden h-4 w-px bg-slate-200 sm:block" />

            <div>
              Real feedback from RentNest users
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}